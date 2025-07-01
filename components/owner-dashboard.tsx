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
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
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
  IconTrash,
  IconDots
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
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [studioToDelete, setStudioToDelete] = useState<Studio | null>(null)
  const [deleteConfirmationName, setDeleteConfirmationName] = useState('')
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
      // Call the new backend function that creates conversation and message
      const { data, error } = await supabase.rpc('handle_inquiry_response', {
        inquiry_id_param: respondingTo.inquiry_id,
        studio_id_param: respondingTo.studio_id,
        response_message_param: responseForm.response_message,
        quote_amount_param: responseForm.quote_amount ? parseFloat(responseForm.quote_amount) : null
      })

      if (error) throw error

      toast.success('Response sent and conversation started!')
      setRespondingTo(null)
      setResponseForm({ response_message: '', quote_amount: '' })
      fetchOwnerData()
    } catch (error) {
      console.error('Error sending response:', error)
      toast.error('Failed to send response')
    }
  }



  const handleDeleteStudio = async () => {
    if (!studioToDelete || deleteConfirmationName !== studioToDelete.name) {
      return
    }

    try {
      const { data, error } = await supabase.rpc('delete_studio_safely', {
        studio_id_param: studioToDelete.id
      })

      if (error) throw error

      if (data.success) {
        const stats = data.cleanup_stats
        toast.success(
          `Studio deleted successfully! Cleaned up ${stats.conversations_deleted} conversations, ${stats.bookings_deleted} bookings, and ${stats.messages_deleted} messages.`
        )
        setDeleteDialogOpen(false)
        setStudioToDelete(null)
        setDeleteConfirmationName('')
        fetchOwnerData()
      } else {
        throw new Error(data.error || 'Failed to delete studio')
      }
    } catch (error: any) {
      console.error('Error deleting studio:', error)
      toast.error(`Failed to delete studio: ${error.message}`)
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
        {studios.length > 0 && (
          <Button onClick={() => router.push('/dashboard/studios/new')}>
            <IconPlus className="h-4 w-4 mr-2" />
            Add Studio
          </Button>
        )}
      </div>

      {/* Show onboarding message if no studios */}
      {studios.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="rounded-full bg-muted p-8 mb-6">
            <IconBuilding className="h-12 w-12 text-muted-foreground" />
          </div>
          <h2 className="text-2xl font-semibold mb-2">Welcome to your studio dashboard!</h2>
          <p className="text-muted-foreground mb-6 max-w-md">
            Get started by creating your first studio listing. Once you have a studio, you'll be able to receive inquiries and manage bookings from potential clients.
          </p>
          <Button onClick={() => router.push('/dashboard/studios/new')} size="lg">
            <IconPlus className="h-4 w-4 mr-2" />
            Create Your First Studio
          </Button>
        </div>
      ) : (
        <>
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

          <Tabs defaultValue="studios" className="space-y-4">
            <TabsList>
              <TabsTrigger value="studios">My Studios ({studios.length})</TabsTrigger>
              <TabsTrigger value="leads">Incoming Leads ({incomingLeads.filter(l => l.status === 'pending').length})</TabsTrigger>
              <TabsTrigger value="bookings">Bookings ({bookings.length})</TabsTrigger>
            </TabsList>

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
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="h-8 w-8 p-0">
                                  <IconDots className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => window.open(`/studios/${studio.id}`, '_blank')}>
                                  <IconEye className="mr-2 h-4 w-4" />
                                  View Studio
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => router.push(`/dashboard/studios/${studio.id}/edit`)}>
                                  <IconEdit className="mr-2 h-4 w-4" />
                                  Edit
                                </DropdownMenuItem>
                                <DropdownMenuItem 
                                  onClick={() => {
                                    setStudioToDelete(studio)
                                    setDeleteDialogOpen(true)
                                  }}
                                  className="text-red-600"
                                >
                                  <IconTrash className="mr-2 h-4 w-4" />
                                  Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>

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
                                          Send a response and quote to {getCreatorName(lead.inquiries.profiles)}. This will start a conversation where you can discuss the project details.
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
          </Tabs>
        </>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Delete Studio</DialogTitle>
            <DialogDescription>
              This action cannot be undone. This will permanently delete your studio and remove all associated data.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="text-sm text-red-800">
                <strong>Warning:</strong> This process is irreversible. All studio data, bookings, and inquiries will be permanently deleted.
              </div>
            </div>
            
            <div>
              <Label htmlFor="studio-name-confirmation">
                Type the studio name "{studioToDelete?.name}" to confirm deletion:
              </Label>
              <Input
                id="studio-name-confirmation"
                value={deleteConfirmationName}
                onChange={(e) => setDeleteConfirmationName(e.target.value)}
                placeholder={studioToDelete?.name}
                className="mt-2"
              />
            </div>
          </div>
          
          <div className="flex justify-end gap-2 mt-6">
            <Button 
              variant="outline" 
              onClick={() => {
                setDeleteDialogOpen(false)
                setStudioToDelete(null)
                setDeleteConfirmationName('')
              }}
            >
              Cancel
            </Button>
            <Button 
              variant="destructive"
              onClick={handleDeleteStudio}
              disabled={deleteConfirmationName !== studioToDelete?.name}
            >
              <IconTrash className="h-4 w-4 mr-2" />
              Delete Studio
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
} 