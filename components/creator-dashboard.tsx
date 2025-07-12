'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/lib/auth/auth-context'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { DashboardSkeleton } from '@/components/skeletons'
import { toast } from 'sonner'
import { 
  IconMessage, 
  IconCalendar, 
  IconMapPin, 
  IconCurrencyDollar, 
  IconClock, 
  IconEye,
  IconSend,
  IconBuilding
} from '@tabler/icons-react'
import { MobileInquiryCard, MobileResponseCard, MobileBookingCard } from '@/components/mobile-creator-cards'

interface Inquiry {
  id: number
  project_type: string
  genre: string
  budget_range: string
  preferred_dates: string
  location_preference: string
  custom_message: string
  created_at: string
  updated_at: string
}

interface InquiryRecipient {
  inquiry_id: number
  studio_id: number
  status: string
  response_message: string
  quote_amount: number
  responded_at: string
  created_at: string
  studios: {
    id: number
    name: string
    location: string
    hourly_rate: number
    profiles: {
      first_name: string
      last_name: string
      username: string
    }
  }
}

interface Booking {
  id: number
  start_time: string
  end_time: string
  status: string
  total_paid: number
  created_at: string
  studios: {
    name: string
    location: string
  }
}

interface Profile {
  id: number
  user_id: string
  role: string
}

export function CreatorDashboard() {
  const { user, profile, loading: authLoading } = useAuth()
  const [inquiries, setInquiries] = useState<Inquiry[]>([])
  const [inquiryResponses, setInquiryResponses] = useState<InquiryRecipient[]>([])
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedInquiry, setSelectedInquiry] = useState<Inquiry | null>(null)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    if (!authLoading && profile) {
      fetchCreatorData()
    } else if (!authLoading && !profile) {
      setLoading(false)
    }
  }, [authLoading, profile])

  const fetchCreatorData = async () => {
    try {
      if (!profile) {
        setLoading(false)
        return
      }

      // Fetch creator's inquiries
      const { data: inquiriesData } = await supabase
        .from('inquiries')
        .select('*')
        .eq('creator_id', profile.id)
        .order('created_at', { ascending: false })

      setInquiries(inquiriesData || [])

      // Get inquiry IDs for fetching responses
      const inquiryIds = inquiriesData?.map((inquiry: any) => inquiry.id) || []

      if (inquiryIds.length > 0) {
        // Fetch inquiry responses
        const { data: responsesData } = await supabase
          .from('inquiry_recipients')
          .select(`
            *,
            studios (
              id,
              name,
              location,
              hourly_rate,
              profiles:owner_id (
                first_name,
                last_name,
                username
              )
            )
          `)
          .in('inquiry_id', inquiryIds)
          .order('created_at', { ascending: false })

        setInquiryResponses(responsesData || [])
      }

      // Fetch creator's bookings
      const { data: bookingsData } = await supabase
        .from('bookings')
        .select(`
          *,
          studios (
            name,
            location
          )
        `)
        .eq('creator_id', profile.id)
        .order('created_at', { ascending: false })

      setBookings(bookingsData || [])
    } catch (error) {
      console.error('Error fetching creator data:', error)
      toast.error('Failed to load dashboard data')
    } finally {
      setLoading(false)
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

  const getStudioOwnerName = (profiles: any) => {
    if (!profiles) return 'Unknown'
    const { first_name, last_name, username } = profiles
    if (first_name && last_name) return `${first_name} ${last_name}`
    return username || 'Unknown'
  }

  const getResponsesForInquiry = (inquiryId: number) => {
    return inquiryResponses.filter(response => response.inquiry_id === inquiryId)
  }

  const getActiveInquiries = () => {
    return inquiries.filter(inquiry => {
      const responses = getResponsesForInquiry(inquiry.id)
      return responses.some(response => response.status === 'pending' || response.status === 'viewed')
    })
  }

  const getRespondedInquiries = () => {
    return inquiries.filter(inquiry => {
      const responses = getResponsesForInquiry(inquiry.id)
      return responses.some(response => response.status === 'responded')
    })
  }

  const handleViewConversation = async (inquiryId: number, studioId: number) => {
    try {
      // Find the conversation for this inquiry and studio
      const { data: conversation, error } = await supabase
        .from('conversations')
        .select('id')
        .eq('inquiry_id', inquiryId)
        .eq('studio_id', studioId)
        .single()

      if (error) {
        console.error('Error finding conversation:', error)
        toast.error('Could not find conversation')
        return
      }

      if (!conversation) {
        toast.error('Conversation not found')
        return
      }

      // Navigate to messages page - the conversation will be auto-selected based on URL or we can use a state
      router.push(`/profile/messages?conversation=${conversation.id}`)
    } catch (error) {
      console.error('Error navigating to conversation:', error)
      toast.error('Failed to open conversation')
    }
  }

  if (authLoading || loading) {
    return <DashboardSkeleton variant="creator" />
  }

  return (
    <div className="space-y-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Creator Dashboard</h1>
        <p className="text-muted-foreground">
          Track your studio inquiries, responses, and bookings
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Inquiries</CardTitle>
            <IconSend className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{getActiveInquiries().length}</div>
            <p className="text-xs text-muted-foreground">
              Waiting for responses
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Responses Received</CardTitle>
            <IconMessage className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {inquiryResponses.filter(r => r.status === 'responded').length}
            </div>
            <p className="text-xs text-muted-foreground">
              Studios have responded
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Confirmed Bookings</CardTitle>
            <IconCalendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {bookings.filter(b => b.status === 'confirmed').length}
            </div>
            <p className="text-xs text-muted-foreground">
              Upcoming sessions
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Spent</CardTitle>
            <IconCurrencyDollar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${bookings.reduce((sum, b) => sum + (b.total_paid || 0), 0).toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">
              On completed bookings
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="inquiries" className="space-y-4">
        <TabsList>
          <TabsTrigger value="inquiries">My Inquiries ({inquiries.length})</TabsTrigger>
          <TabsTrigger value="responses">Responses ({inquiryResponses.filter(r => r.status === 'responded').length})</TabsTrigger>
          <TabsTrigger value="bookings">Bookings ({bookings.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="inquiries">
          <Card>
            <CardHeader>
              <CardTitle>My Inquiries</CardTitle>
              <CardDescription>
                View all your submitted studio inquiries
              </CardDescription>
            </CardHeader>
            <CardContent>
              {/* Mobile Card View */}
              <div className="md:hidden space-y-4">
                {inquiries.map((inquiry) => {
                  const responses = getResponsesForInquiry(inquiry.id)
                  return (
                    <MobileInquiryCard
                      key={inquiry.id}
                      inquiry={inquiry}
                      responseCount={responses.length}
                      onView={(inquiry) => setSelectedInquiry(inquiry)}
                      getProjectTypeLabel={getProjectTypeLabel}
                    />
                  )
                })}
                {inquiries.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    <IconSend className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No inquiries yet. Submit your first inquiry to get started!</p>
                  </div>
                )}
              </div>

              {/* Desktop Table View */}
              <div className="hidden md:block">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Project Type</TableHead>
                      <TableHead>Genre</TableHead>
                      <TableHead>Budget</TableHead>
                      <TableHead>Preferred Dates</TableHead>
                      <TableHead>Studios Contacted</TableHead>
                      <TableHead>Submitted</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {inquiries.map((inquiry) => {
                      const responses = getResponsesForInquiry(inquiry.id)
                      return (
                        <TableRow key={inquiry.id}>
                          <TableCell>
                            <div className="font-medium">
                              {getProjectTypeLabel(inquiry.project_type)}
                            </div>
                          </TableCell>
                          <TableCell>{inquiry.genre || 'Not specified'}</TableCell>
                          <TableCell>{inquiry.budget_range || 'Not specified'}</TableCell>
                          <TableCell>{inquiry.preferred_dates || 'Flexible'}</TableCell>
                          <TableCell>
                            <div className="text-sm">
                              {responses.length} studio{responses.length !== 1 ? 's' : ''}
                            </div>
                          </TableCell>
                          <TableCell>
                            {new Date(inquiry.created_at).toLocaleDateString()}
                          </TableCell>
                          <TableCell>
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => setSelectedInquiry(inquiry)}
                                >
                                  <IconEye className="h-4 w-4 mr-1" />
                                  View
                                </Button>
                              </DialogTrigger>
                              <DialogContent>
                                <DialogHeader>
                                  <DialogTitle>Inquiry Details</DialogTitle>
                                  <DialogDescription>
                                    Details for your {getProjectTypeLabel(inquiry.project_type).toLowerCase()} inquiry
                                  </DialogDescription>
                                </DialogHeader>
                                <div className="space-y-4">
                                  <div>
                                    <label className="text-sm font-medium">Project Type</label>
                                    <p className="text-sm text-muted-foreground">{getProjectTypeLabel(inquiry.project_type)}</p>
                                  </div>
                                  <div>
                                    <label className="text-sm font-medium">Genre</label>
                                    <p className="text-sm text-muted-foreground">{inquiry.genre || 'Not specified'}</p>
                                  </div>
                                  <div>
                                    <label className="text-sm font-medium">Budget Range</label>
                                    <p className="text-sm text-muted-foreground">{inquiry.budget_range || 'Not specified'}</p>
                                  </div>
                                  <div>
                                    <label className="text-sm font-medium">Preferred Dates</label>
                                    <p className="text-sm text-muted-foreground">{inquiry.preferred_dates || 'Flexible'}</p>
                                  </div>
                                  <div>
                                    <label className="text-sm font-medium">Location Preference</label>
                                    <p className="text-sm text-muted-foreground">{inquiry.location_preference || 'No preference'}</p>
                                  </div>
                                  <div>
                                    <label className="text-sm font-medium">Custom Message</label>
                                    <p className="text-sm text-muted-foreground">{inquiry.custom_message || 'No additional message'}</p>
                                  </div>
                                </div>
                              </DialogContent>
                            </Dialog>
                          </TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="responses">
          <Card>
            <CardHeader>
              <CardTitle>Studio Responses</CardTitle>
              <CardDescription>
                View responses and quotes from studios
              </CardDescription>
            </CardHeader>
            <CardContent>
              {/* Mobile Card View */}
              <div className="md:hidden space-y-4">
                {inquiryResponses.map((response) => {
                  const inquiry = inquiries.find(i => i.id === response.inquiry_id)
                  return (
                    <MobileResponseCard
                      key={`${response.inquiry_id}-${response.studio_id}`}
                      response={response}
                      inquiry={inquiry}
                      onViewConversation={handleViewConversation}
                      getProjectTypeLabel={getProjectTypeLabel}
                      getStatusBadge={getStatusBadge}
                      getStudioOwnerName={getStudioOwnerName}
                    />
                  )
                })}
                {inquiryResponses.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    <IconMessage className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No responses yet. Studios will respond to your inquiries here!</p>
                  </div>
                )}
              </div>

              {/* Desktop Table View */}
              <div className="hidden md:block">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Studio</TableHead>
                      <TableHead>Owner</TableHead>
                      <TableHead>Project Type</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Quote</TableHead>
                      <TableHead>Responded</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {inquiryResponses.map((response) => {
                      const inquiry = inquiries.find(i => i.id === response.inquiry_id)
                      return (
                        <TableRow key={`${response.inquiry_id}-${response.studio_id}`}>
                          <TableCell>
                            <div className="font-medium">
                              {response.studios.name}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {response.studios.location}
                            </div>
                          </TableCell>
                          <TableCell>
                            {getStudioOwnerName(response.studios.profiles)}
                          </TableCell>
                          <TableCell>
                            {getProjectTypeLabel(inquiry!.project_type)}
                          </TableCell>
                          <TableCell>{getStatusBadge(response.status)}</TableCell>
                          <TableCell>
                            {response.quote_amount ? `$${response.quote_amount.toFixed(2)}` : 'No quote'}
                          </TableCell>
                          <TableCell>
                            {response.responded_at ? new Date(response.responded_at).toLocaleDateString() : 'Not responded'}
                          </TableCell>
                          <TableCell>
                            {response.status === 'responded' && (
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => handleViewConversation(response.inquiry_id, response.studio_id)}
                              >
                                <IconMessage className="h-4 w-4 mr-1" />
                                View Conversation
                              </Button>
                            )}
                          </TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="bookings">
          <Card>
            <CardHeader>
              <CardTitle>My Bookings</CardTitle>
              <CardDescription>
                View and manage your studio bookings
              </CardDescription>
            </CardHeader>
            <CardContent>
              {/* Mobile Card View */}
              <div className="md:hidden space-y-4">
                {bookings.map((booking) => (
                  <MobileBookingCard
                    key={booking.id}
                    booking={booking}
                    getStatusBadge={getStatusBadge}
                  />
                ))}
                {bookings.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    <IconBuilding className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No bookings yet. Book your first studio session!</p>
                  </div>
                )}
              </div>

              {/* Desktop Table View */}
              <div className="hidden md:block">
                <Table>
                  <TableHeader>
                    <TableRow>
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
                            {booking.studios.name}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {booking.studios.location}
                          </div>
                        </TableCell>
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
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
} 