'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Calendar, MapPin, DollarSign, MessageSquare, Clock, Reply } from 'lucide-react'
import { toast } from 'sonner'

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
}

interface IncomingLeadsProps {
  profileId: number
}

export function IncomingLeadsDashboard({ profileId }: IncomingLeadsProps) {
  const [leads, setLeads] = useState<InquiryRecipient[]>([])
  const [loading, setLoading] = useState(true)
  const [respondingTo, setRespondingTo] = useState<InquiryRecipient | null>(null)
  const [responseForm, setResponseForm] = useState({
    response_message: '',
    quote_amount: ''
  })

  useEffect(() => {
    fetchIncomingLeads()
  }, [profileId])

  const fetchIncomingLeads = async () => {
    try {
      const { data, error } = await supabase
        .from('inquiry_recipients')
        .select(`
          *,
          inquiries (
            *,
            profiles:creator_id (
              first_name,
              last_name,
              username
            )
          )
        `)
        .in('studio_id', await getMyStudioIds())
        .order('created_at', { ascending: false })

      if (error) throw error

      setLeads(data || [])
    } catch (error) {
      console.error('Error fetching incoming leads:', error)
      toast.error('Failed to load incoming leads')
    } finally {
      setLoading(false)
    }
  }

  const getMyStudioIds = async () => {
    const { data, error } = await supabase
      .from('studios')
      .select('id')
      .eq('owner_id', profileId)

    if (error) {
      console.error('Error fetching studio IDs:', error)
      return []
    }

    return data.map(studio => studio.id)
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

      // Create conversation with initial message
      let conversationMessage = responseForm.response_message
      if (responseForm.quote_amount) {
        conversationMessage += `\n\nQuote: $${responseForm.quote_amount}`
      }
      
      const { error: conversationError } = await supabase.rpc('create_conversation_from_inquiry', {
        inquiry_id_param: respondingTo.inquiry_id,
        studio_id_param: respondingTo.studio_id,
        initial_message: conversationMessage
      })

      if (conversationError) {
        console.error('Error creating conversation:', conversationError)
        // Don't fail the entire operation if conversation creation fails
        toast.success('Response sent successfully! Note: Conversation creation may have failed.')
      } else {
        toast.success('Response sent and conversation created!')
      }

      setRespondingTo(null)
      setResponseForm({ response_message: '', quote_amount: '' })
      fetchIncomingLeads()
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
      fetchIncomingLeads()
    } catch (error) {
      console.error('Error declining inquiry:', error)
      toast.error('Failed to decline inquiry')
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

  const getLeadsByStatus = (status: string) => {
    return leads.filter(lead => lead.status === status)
  }

  if (loading) {
    return <div className="flex items-center justify-center p-8">Loading leads...</div>
  }

  return (
    <div className="space-y-6">
      <Tabs defaultValue="pending" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="pending">
            New Inquiries ({getLeadsByStatus('pending').length})
          </TabsTrigger>
          <TabsTrigger value="responded">
            Responded ({getLeadsByStatus('responded').length})
          </TabsTrigger>
          <TabsTrigger value="all">
            All Leads ({leads.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="space-y-4">
          {getLeadsByStatus('pending').length === 0 ? (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center space-y-4">
                  <MessageSquare className="h-12 w-12 mx-auto opacity-50" />
                  <div>
                    <h3 className="text-lg font-medium">No new inquiries</h3>
                    <p className="text-sm text-muted-foreground">
                      New client inquiries will appear here
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {getLeadsByStatus('pending').map((lead) => (
                <Card key={`${lead.inquiry_id}-${lead.studio_id}`} className="border-l-4 border-l-blue-500">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <CardTitle className="flex items-center gap-2">
                          {getProjectTypeLabel(lead.inquiries.project_type)}
                          {lead.inquiries.genre && (
                            <Badge variant="outline">{lead.inquiries.genre}</Badge>
                          )}
                        </CardTitle>
                        <CardDescription className="flex items-center gap-4 text-sm">
                          <span>
                            From: {lead.inquiries.profiles.first_name} {lead.inquiries.profiles.last_name} 
                            (@{lead.inquiries.profiles.username})
                          </span>
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {new Date(lead.created_at).toLocaleDateString()}
                          </div>
                        </CardDescription>
                      </div>
                      <div className="flex gap-2">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button 
                              size="sm"
                              onClick={() => setRespondingTo(lead)}
                            >
                              <Reply className="h-4 w-4 mr-2" />
                              Respond
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Respond to Inquiry</DialogTitle>
                              <DialogDescription>
                                Send your quote and message to the client
                              </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4">
                              <div className="space-y-2">
                                <Label htmlFor="quote_amount">Quote Amount ($)</Label>
                                <Input
                                  id="quote_amount"
                                  type="number"
                                  placeholder="Enter your quote"
                                  value={responseForm.quote_amount}
                                  onChange={(e) => setResponseForm(prev => ({ 
                                    ...prev, 
                                    quote_amount: e.target.value 
                                  }))}
                                />
                              </div>
                              <div className="space-y-2">
                                <Label htmlFor="response_message">Message</Label>
                                <Textarea
                                  id="response_message"
                                  placeholder="Tell the client about your availability, process, or ask any questions..."
                                  value={responseForm.response_message}
                                  onChange={(e) => setResponseForm(prev => ({ 
                                    ...prev, 
                                    response_message: e.target.value 
                                  }))}
                                  rows={4}
                                />
                              </div>
                              <div className="flex gap-2">
                                <Button onClick={handleRespond} className="flex-1">
                                  Send Response
                                </Button>
                                <Button 
                                  variant="outline" 
                                  onClick={() => setRespondingTo(null)}
                                >
                                  Cancel
                                </Button>
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleDecline(lead)}
                        >
                          Decline
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center gap-6 text-sm text-muted-foreground">
                        {lead.inquiries.budget_range && (
                          <div className="flex items-center gap-1">
                            <DollarSign className="h-3 w-3" />
                            {getBudgetRangeLabel(lead.inquiries.budget_range)}
                          </div>
                        )}
                        {lead.inquiries.preferred_dates && (
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {lead.inquiries.preferred_dates}
                          </div>
                        )}
                        {lead.inquiries.location_preference && (
                          <div className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {lead.inquiries.location_preference}
                          </div>
                        )}
                      </div>
                      
                      {lead.inquiries.custom_message && (
                        <div className="p-3 bg-muted rounded-md">
                          <p className="text-sm">{lead.inquiries.custom_message}</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="responded">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Project</TableHead>
                <TableHead>Client</TableHead>
                <TableHead>Quote</TableHead>
                <TableHead>Responded</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {getLeadsByStatus('responded').map((lead) => (
                <TableRow key={`${lead.inquiry_id}-${lead.studio_id}`}>
                  <TableCell>
                    <div>
                      <div className="font-medium">
                        {getProjectTypeLabel(lead.inquiries.project_type)}
                      </div>
                      {lead.inquiries.genre && (
                        <div className="text-sm text-muted-foreground">
                          {lead.inquiries.genre}
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    {lead.inquiries.profiles.first_name} {lead.inquiries.profiles.last_name}
                  </TableCell>
                  <TableCell>
                    {lead.quote_amount ? `$${lead.quote_amount}` : 'No quote'}
                  </TableCell>
                  <TableCell>
                    {new Date(lead.responded_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    {getStatusBadge(lead.status)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TabsContent>

        <TabsContent value="all">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Project</TableHead>
                <TableHead>Client</TableHead>
                <TableHead>Budget</TableHead>
                <TableHead>Received</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {leads.map((lead) => (
                <TableRow key={`${lead.inquiry_id}-${lead.studio_id}`}>
                  <TableCell>
                    <div>
                      <div className="font-medium">
                        {getProjectTypeLabel(lead.inquiries.project_type)}
                      </div>
                      {lead.inquiries.genre && (
                        <div className="text-sm text-muted-foreground">
                          {lead.inquiries.genre}
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    {lead.inquiries.profiles.first_name} {lead.inquiries.profiles.last_name}
                  </TableCell>
                  <TableCell>
                    {lead.inquiries.budget_range ? 
                      getBudgetRangeLabel(lead.inquiries.budget_range) : 
                      'Not specified'
                    }
                  </TableCell>
                  <TableCell>
                    {new Date(lead.created_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    {getStatusBadge(lead.status)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TabsContent>
      </Tabs>
    </div>
  )
} 