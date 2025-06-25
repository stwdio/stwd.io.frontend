'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Calendar, MapPin, DollarSign, MessageSquare, Clock } from 'lucide-react'
import { toast } from 'sonner'
import Link from 'next/link'

interface Inquiry {
  id: number
  project_type: string
  genre: string
  budget_range: string
  preferred_dates: string
  location_preference: string
  custom_message: string
  created_at: string
  inquiry_recipients: InquiryRecipient[]
}

interface InquiryRecipient {
  studio_id: number
  status: string
  response_message: string
  quote_amount: number
  responded_at: string
  studios: {
    id: number
    name: string
    location: string
    hourly_rate: number
  }
}

export function MyInquiriesDashboard() {
  const [inquiries, setInquiries] = useState<Inquiry[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchInquiries()
  }, [])

  const fetchInquiries = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data: profile } = await supabase
        .from('profiles')
        .select('id')
        .eq('user_id', user.id)
        .single()

      if (!profile) return

      const { data, error } = await supabase
        .from('inquiries')
        .select(`
          *,
          inquiry_recipients (
            studio_id,
            status,
            response_message,
            quote_amount,
            responded_at,
            studios (
              id,
              name,
              location,
              hourly_rate
            )
          )
        `)
        .eq('creator_id', profile.id)
        .order('created_at', { ascending: false })

      if (error) throw error

      setInquiries(data || [])
    } catch (error) {
      console.error('Error fetching inquiries:', error)
      toast.error('Failed to load inquiries')
    } finally {
      setLoading(false)
    }
  }

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
      'pending': 'outline',
      'viewed': 'secondary',
      'responded': 'default',
      'declined': 'destructive'
    }
    
    return <Badge variant={variants[status] || 'outline'}>{status}</Badge>
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

  const getBudgetRangeLabel = (range: string) => {
    const labels: Record<string, string> = {
      '$': '$ - Under $500',
      '$$': '$$ - $500 - $1,500',
      '$$$': '$$$ - $1,500 - $5,000',
      '$$$$': '$$$$ - Over $5,000'
    }
    return labels[range] || range
  }

  const getInquiryStats = (inquiry: Inquiry) => {
    const total = inquiry.inquiry_recipients.length
    const responded = inquiry.inquiry_recipients.filter(r => r.status === 'responded').length
    const pending = inquiry.inquiry_recipients.filter(r => r.status === 'pending').length
    const declined = inquiry.inquiry_recipients.filter(r => r.status === 'declined').length
    
    return { total, responded, pending, declined }
  }

  if (loading) {
    return <div className="flex items-center justify-center p-8">Loading...</div>
  }

  return (
    <div className="space-y-6">
      {inquiries.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <div className="text-muted-foreground">
                <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <h3 className="text-lg font-medium">No inquiries yet</h3>
                <p className="text-sm">Start by browsing studios and adding them to your quote basket</p>
              </div>
              <Button asChild>
                <Link href="/browse">Browse Studios</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {inquiries.map((inquiry) => {
            const stats = getInquiryStats(inquiry)
            
            return (
              <Card key={inquiry.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <CardTitle className="flex items-center gap-2">
                        {getProjectTypeLabel(inquiry.project_type)}
                        {inquiry.genre && (
                          <Badge variant="outline">{inquiry.genre}</Badge>
                        )}
                      </CardTitle>
                      <CardDescription className="flex items-center gap-4 text-sm">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {new Date(inquiry.created_at).toLocaleDateString()}
                        </div>
                        {inquiry.budget_range && (
                          <div className="flex items-center gap-1">
                            <DollarSign className="h-3 w-3" />
                            {getBudgetRangeLabel(inquiry.budget_range)}
                          </div>
                        )}
                        {inquiry.location_preference && (
                          <div className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {inquiry.location_preference}
                          </div>
                        )}
                      </CardDescription>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <span>{stats.responded} responded</span>
                      <span>•</span>
                      <span>{stats.pending} pending</span>
                      <span>•</span>
                      <span>{stats.total} total</span>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent>
                  {inquiry.custom_message && (
                    <div className="mb-4 p-3 bg-muted rounded-md">
                      <p className="text-sm">{inquiry.custom_message}</p>
                    </div>
                  )}
                  
                  <Tabs defaultValue="responses" className="w-full">
                    <TabsList>
                      <TabsTrigger value="responses">Studio Responses ({stats.responded})</TabsTrigger>
                      <TabsTrigger value="pending">Pending ({stats.pending})</TabsTrigger>
                      <TabsTrigger value="all">All Studios ({stats.total})</TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="responses" className="space-y-4">
                      {inquiry.inquiry_recipients.filter(r => r.status === 'responded').length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">
                          <Clock className="h-8 w-8 mx-auto mb-2 opacity-50" />
                          <p>No responses yet</p>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {inquiry.inquiry_recipients
                            .filter(r => r.status === 'responded')
                            .map((recipient) => (
                              <Card key={recipient.studio_id} className="bg-muted/50">
                                <CardContent className="pt-4">
                                  <div className="flex items-start justify-between">
                                    <div className="space-y-2">
                                      <h4 className="font-medium">{recipient.studios.name}</h4>
                                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                        <div className="flex items-center gap-1">
                                          <MapPin className="h-3 w-3" />
                                          {recipient.studios.location}
                                        </div>
                                        <div className="flex items-center gap-1">
                                          <DollarSign className="h-3 w-3" />
                                          ${recipient.studios.hourly_rate}/hr
                                        </div>
                                      </div>
                                      {recipient.response_message && (
                                        <p className="text-sm">{recipient.response_message}</p>
                                      )}
                                    </div>
                                    <div className="text-right space-y-1">
                                      {recipient.quote_amount && (
                                        <div className="text-lg font-bold">
                                          ${recipient.quote_amount}
                                        </div>
                                      )}
                                      <div className="text-xs text-muted-foreground">
                                        {new Date(recipient.responded_at).toLocaleDateString()}
                                      </div>
                                      <Button size="sm" asChild>
                                        <Link href={`/studios/${recipient.studio_id}`}>
                                          View Studio
                                        </Link>
                                      </Button>
                                    </div>
                                  </div>
                                </CardContent>
                              </Card>
                            ))}
                        </div>
                      )}
                    </TabsContent>
                    
                    <TabsContent value="pending">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Studio</TableHead>
                            <TableHead>Location</TableHead>
                            <TableHead>Rate</TableHead>
                            <TableHead>Status</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {inquiry.inquiry_recipients
                            .filter(r => r.status === 'pending')
                            .map((recipient) => (
                              <TableRow key={recipient.studio_id}>
                                <TableCell className="font-medium">
                                  {recipient.studios.name}
                                </TableCell>
                                <TableCell>{recipient.studios.location}</TableCell>
                                <TableCell>${recipient.studios.hourly_rate}/hr</TableCell>
                                <TableCell>{getStatusBadge(recipient.status)}</TableCell>
                              </TableRow>
                            ))}
                        </TableBody>
                      </Table>
                    </TabsContent>
                    
                    <TabsContent value="all">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Studio</TableHead>
                            <TableHead>Location</TableHead>
                            <TableHead>Rate</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Response</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {inquiry.inquiry_recipients.map((recipient) => (
                            <TableRow key={recipient.studio_id}>
                              <TableCell className="font-medium">
                                <Link 
                                  href={`/studios/${recipient.studio_id}`}
                                  className="hover:underline"
                                >
                                  {recipient.studios.name}
                                </Link>
                              </TableCell>
                              <TableCell>{recipient.studios.location}</TableCell>
                              <TableCell>${recipient.studios.hourly_rate}/hr</TableCell>
                              <TableCell>{getStatusBadge(recipient.status)}</TableCell>
                              <TableCell>
                                {recipient.status === 'responded' && recipient.quote_amount && (
                                  <span className="font-medium">${recipient.quote_amount}</span>
                                )}
                                {recipient.status === 'declined' && (
                                  <span className="text-muted-foreground">Declined</span>
                                )}
                                {recipient.status === 'pending' && (
                                  <span className="text-muted-foreground">Waiting...</span>
                                )}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
} 