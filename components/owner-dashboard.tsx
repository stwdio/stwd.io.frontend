'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { toast } from 'sonner'
import { 
  IconBuilding, 
  IconCalendar, 
  IconMapPin, 
  IconCurrencyDollar, 
  IconMessage, 
  IconClock, 
  IconPlus,
  IconEye,
  IconEdit,
  IconCheck,
  IconX
} from '@tabler/icons-react'

interface Studio {
  id: number
  name: string
  description: string
  location: string
  hourly_rate: number
  published: boolean
  verification_status: string
  created_at: string
}

interface InquiryRecipient {
  inquiry_id: number
  studio_id: number
  status: string
  response_message: string
  quote_amount: number
  responded_at: string
  created_at: string
  inquiries: {
    id: number
    project_type: string
    genre: string
    budget_range: string
    preferred_dates: string
    location_preference: string
    custom_message: string
    created_at: string
    profiles: {
      first_name: string
      last_name: string
      username: string
    }
  }
  studios: {
    name: string
  }
}

interface Booking {
  id: number
  start_time: string
  end_time: string
  status: string
  total_paid: number
  created_at: string
  profiles: {
    first_name: string
    last_name: string
    username: string
  }
  studios: {
    name: string
  }
}

interface Profile {
  id: number
  user_id: string
  role: string
}

export function OwnerDashboard() {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [studios, setStudios] = useState<Studio[]>([])
  const [incomingLeads, setIncomingLeads] = useState<InquiryRecipient[]>([])
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [respondingTo, setRespondingTo] = useState<InquiryRecipient | null>(null)
  const [responseForm, setResponseForm] = useState({
    response_message: '',
    quote_amount: ''
  })
  const router = useRouter()

  useEffect(() => {
    fetchOwnerData()
  }, [])

  const fetchOwnerData = async () => {
    try {
      // Get current user profile
      const { data: { session } } = await supabase.auth.getSession()
      if (!session?.user) return

      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', session.user.id)
        .single()

      if (!profileData) return
      setProfile(profileData)

      // Fetch owner's studios
      const { data: studiosData } = await supabase
        .from('studios')
        .select('*')
        .eq('owner_id', profileData.id)
        .order('created_at', { ascending: false })

      setStudios(studiosData || [])

      // Get studio IDs for fetching leads and bookings
      const studioIds = studiosData?.map(studio => studio.id) || []

      if (studioIds.length > 0) {
        // Fetch incoming leads using RPC function for proper access control
        const { data: leadsData, error: leadsError } = await supabase
          .rpc('get_studio_inquiries', { studio_ids: studioIds })

        if (leadsError) {
          console.error('Error fetching leads:', leadsError)
          toast.error('Failed to load inquiries')
          setIncomingLeads([])
        } else {
          setIncomingLeads(leadsData || [])
        }

        // Fetch bookings
        const { data: bookingsData } = await supabase
          .from('bookings')
          .select(`
            *,
            profiles:creator_id (
              first_name,
              last_name,
              username
            ),
            studios (
              name
            )
          `)
          .in('studio_id', studioIds)
          .order('created_at', { ascending: false })

        setBookings(bookingsData || [])
      }
    } catch (error) {
      console.error('Error fetching owner data:', error)
      toast.error('Failed to load dashboard data')
    } finally {
      setLoading(false)
    }
  }

  const handleRespond = async () => {
    if (!respondingTo) return

    try {
      const updateData: any = {
        status: 'responded',
        response_message: responseForm.response_message,
        responded_at: new Date().toISOString()
      }

      if (responseForm.quote_amount) {
        updateData.quote_amount = parseFloat(responseForm.quote_amount)
      }

      const { error } = await supabase
        .from('inquiry_recipients')
        .update(updateData)
        .eq('inquiry_id', respondingTo.inquiry_id)
        .eq('studio_id', respondingTo.studio_id)

      if (error) throw error

      toast.success('Response sent successfully!')
      setRespondingTo(null)
      setResponseForm({ response_message: '', quote_amount: '' })
      fetchOwnerData()
    } catch (error) {
      console.error('Error sending response:', error)
      toast.error('Failed to send response')
    }
  }

  const handleDecline = async (lead: InquiryRecipient) => {
    try {
      const { error } = await supabase
        .from('inquiry_recipients')
        .update({
          status: 'declined',
          responded_at: new Date().toISOString()
        })
        .eq('inquiry_id', lead.inquiry_id)
        .eq('studio_id', lead.studio_id)

      if (error) throw error

      toast.success('Inquiry declined')
      fetchOwnerData()
    } catch (error) {
      console.error('Error declining inquiry:', error)
      toast.error('Failed to decline inquiry')
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline">Pending</Badge>
      case 'viewed':
        return <Badge variant="secondary">Viewed</Badge>
      case 'responded':
        return <Badge variant="default">Responded</Badge>
      case 'declined':
        return <Badge variant="destructive">Declined</Badge>
      case 'confirmed':
        return <Badge className="bg-green-100 text-green-800">Confirmed</Badge>
      case 'completed':
        return <Badge className="bg-blue-100 text-blue-800">Completed</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const getProjectTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      'record': 'Recording Session',
      'mix': 'Mixing',
      'master': 'Mastering',
      'rehearsal': 'Rehearsal',
      'other': 'Other'
    }
    return labels[type] || type
  }

  const getVerificationBadge = (status: string) => {
    switch (status) {
      case 'verified':
        return <Badge className="bg-green-100 text-green-800">Verified</Badge>
      case 'pending_claim_verification':
        return <Badge className="bg-yellow-100 text-yellow-800">Pending Verification</Badge>
      case 'rejected':
        return <Badge className="bg-red-100 text-red-800">Rejected</Badge>
      default:
        return <Badge variant="outline">Unverified</Badge>
    }
  }

  const getCreatorName = (profiles: any) => {
    if (!profiles) return 'Unknown'
    const { first_name, last_name, username } = profiles
    if (first_name && last_name) return `${first_name} ${last_name}`
    return username || 'Unknown'
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-32">
        <div className="w-6 h-6 border-2 border-foreground border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Owner Dashboard</h1>
          <p className="text-muted-foreground">
            Manage your studios, leads, and bookings
          </p>
        </div>
        <Button onClick={() => router.push('/dashboard/studios/new')}>
          <IconPlus className="h-4 w-4 mr-2" />
          Add Studio
        </Button>
      </div>

      {/* Overview Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Studios</CardTitle>
            <IconBuilding className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{studios.length}</div>
            <p className="text-xs text-muted-foreground">
              {studios.filter(s => s.published).length} published
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Leads</CardTitle>
            <IconMessage className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {incomingLeads.filter(l => l.status === 'pending').length}
            </div>
            <p className="text-xs text-muted-foreground">
              Awaiting response
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Bookings</CardTitle>
            <IconCalendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {bookings.filter(b => b.status === 'confirmed').length}
            </div>
            <p className="text-xs text-muted-foreground">
              Confirmed sessions
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <IconCurrencyDollar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${bookings.reduce((sum, b) => sum + (b.total_paid || 0), 0).toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">
              From completed bookings
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="leads" className="space-y-4">
        <TabsList>
          <TabsTrigger value="leads">Incoming Leads ({incomingLeads.filter(l => l.status === 'pending').length})</TabsTrigger>
          <TabsTrigger value="bookings">Bookings ({bookings.length})</TabsTrigger>
          <TabsTrigger value="studios">My Studios ({studios.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="leads">
          <Card>
            <CardHeader>
              <CardTitle>Incoming Leads</CardTitle>
              <CardDescription>
                Respond to inquiries from potential clients
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Client</TableHead>
                    <TableHead>Studio</TableHead>
                    <TableHead>Project Type</TableHead>
                    <TableHead>Budget</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {incomingLeads.map((lead) => (
                    <TableRow key={`${lead.inquiry_id}-${lead.studio_id}`}>
                      <TableCell>
                        <div className="font-medium">
                          {getCreatorName(lead.inquiries.profiles)}
                        </div>
                      </TableCell>
                      <TableCell>{lead.studios.name}</TableCell>
                      <TableCell>{getProjectTypeLabel(lead.inquiries.project_type)}</TableCell>
                      <TableCell>{lead.inquiries.budget_range}</TableCell>
                      <TableCell>{getStatusBadge(lead.status)}</TableCell>
                      <TableCell>
                        {new Date(lead.created_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          {lead.status === 'pending' && (
                            <>
                              <Dialog>
                                <DialogTrigger asChild>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setRespondingTo(lead)}
                                  >
                                    <IconMessage className="h-4 w-4 mr-1" />
                                    Respond
                                  </Button>
                                </DialogTrigger>
                                <DialogContent>
                                  <DialogHeader>
                                    <DialogTitle>Respond to Inquiry</DialogTitle>
                                    <DialogDescription>
                                      Send a response and quote to {getCreatorName(lead.inquiries.profiles)}
                                    </DialogDescription>
                                  </DialogHeader>
                                  
                                  <div className="space-y-4">
                                    <div>
                                      <Label htmlFor="response_message">Response Message</Label>
                                      <Textarea
                                        id="response_message"
                                        value={responseForm.response_message}
                                        onChange={(e) => setResponseForm({ ...responseForm, response_message: e.target.value })}
                                        placeholder="Hi! I'd be happy to help with your project..."
                                        rows={4}
                                      />
                                    </div>
                                    
                                    <div>
                                      <Label htmlFor="quote_amount">Quote Amount ($)</Label>
                                      <Input
                                        id="quote_amount"
                                        type="number"
                                        value={responseForm.quote_amount}
                                        onChange={(e) => setResponseForm({ ...responseForm, quote_amount: e.target.value })}
                                        placeholder="Enter your quote"
                                      />
                                    </div>
                                  </div>
                                  
                                  <div className="flex justify-end gap-2 mt-6">
                                    <Button variant="outline" onClick={() => setRespondingTo(null)}>
                                      Cancel
                                    </Button>
                                    <Button onClick={handleRespond}>
                                      Send Response
                                    </Button>
                                  </div>
                                </DialogContent>
                              </Dialog>
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => handleDecline(lead)}
                              >
                                <IconX className="h-4 w-4 mr-1" />
                                Decline
                              </Button>
                            </>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="bookings">
          <Card>
            <CardHeader>
              <CardTitle>Recent Bookings</CardTitle>
              <CardDescription>
                View and manage your studio bookings
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Client</TableHead>
                    <TableHead>Studio</TableHead>
                    <TableHead>Date & Time</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Booked</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {bookings.map((booking) => (
                    <TableRow key={booking.id}>
                      <TableCell>
                        <div className="font-medium">
                          {getCreatorName(booking.profiles)}
                        </div>
                      </TableCell>
                      <TableCell>{booking.studios.name}</TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">
                            {new Date(booking.start_time).toLocaleDateString()}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {new Date(booking.start_time).toLocaleTimeString()} - {new Date(booking.end_time).toLocaleTimeString()}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{getStatusBadge(booking.status)}</TableCell>
                      <TableCell>
                        {booking.total_paid ? `$${booking.total_paid.toFixed(2)}` : 'Pending'}
                      </TableCell>
                      <TableCell>
                        {new Date(booking.created_at).toLocaleDateString()}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="studios">
          <Card>
            <CardHeader>
              <CardTitle>My Studios</CardTitle>
              <CardDescription>
                Manage your studio listings
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Studio</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Rate/Hour</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Verification</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {studios.map((studio) => (
                    <TableRow key={studio.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{studio.name}</div>
                          <div className="text-sm text-muted-foreground truncate max-w-[200px]">
                            {studio.description}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{studio.location}</TableCell>
                      <TableCell>${studio.hourly_rate}</TableCell>
                      <TableCell>
                        <Badge variant={studio.published ? "default" : "secondary"}>
                          {studio.published ? "Published" : "Draft"}
                        </Badge>
                      </TableCell>
                      <TableCell>{getVerificationBadge(studio.verification_status)}</TableCell>
                      <TableCell>
                        {new Date(studio.created_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => window.open(`/studios/${studio.id}`, '_blank')}
                          >
                            <IconEye className="h-4 w-4 mr-1" />
                            View
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => router.push(`/dashboard/studios/${studio.id}/edit`)}
                          >
                            <IconEdit className="h-4 w-4 mr-1" />
                            Edit
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
} 