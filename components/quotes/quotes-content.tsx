'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/lib/auth/auth-context'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { FileText, MessageSquare, Clock, CheckCircle, XCircle } from 'lucide-react'
import Link from 'next/link'
import { formatDistanceToNow } from 'date-fns'

interface Quote {
  id: string
  created_at: string
  status: 'pending' | 'responded' | 'declined'
  project_type: string
  budget_range?: string
  custom_message?: string
  studio: {
    id: number
    name: string
    location: string
    photo_urls?: string[]
  }
  response?: {
    id: string
    price?: number
    message: string
    created_at: string
  }
  conversation_id?: string
}

export function QuotesContent() {
  const { profile } = useAuth()
  const [quotes, setQuotes] = useState<Quote[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'all' | 'pending' | 'responded'>('all')

  useEffect(() => {
    if (profile?.id) {
      loadQuotes()
    }
  }, [profile?.id])

  const loadQuotes = async () => {
    try {
      const supabase = createClient()
      
      // For creators: get their sent inquiries
      if (profile?.system_role === 'creator') {
        const { data, error } = await supabase
          .from('inquiry_recipients')
          .select(`
            id,
            created_at,
            status,
            inquiry:inquiries!inner (
              project_type,
              budget_range,
              custom_message
            ),
            studio:studios!inner (
              id,
              name,
              location,
              photo_urls
            ),
            response:inquiry_responses (
              id,
              price,
              message,
              created_at
            ),
            conversation:conversations!inquiry_recipients_conversation_id_fkey (
              id
            )
          `)
          .eq('inquiry.creator_id', profile.id)
          .order('created_at', { ascending: false })

        if (error) throw error

        const formattedQuotes = data?.map(item => ({
          id: item.id,
          created_at: item.created_at,
          status: item.status as 'pending' | 'responded' | 'declined',
          project_type: item.inquiry.project_type,
          budget_range: item.inquiry.budget_range,
          custom_message: item.inquiry.custom_message,
          studio: item.studio,
          response: item.response?.[0],
          conversation_id: item.conversation?.id
        })) || []

        setQuotes(formattedQuotes)
      }
      
      // For studio owners: get received inquiries
      else if (profile?.system_role === 'owner') {
        const { data: studioData } = await supabase
          .from('studios')
          .select('id')
          .eq('owner_id', profile.id)
          .single()

        if (studioData) {
          const { data, error } = await supabase
            .from('inquiry_recipients')
            .select(`
              id,
              created_at,
              status,
              inquiry:inquiries!inner (
                project_type,
                budget_range,
                custom_message,
                creator:profiles!inquiries_creator_id_fkey (
                  id,
                  first_name,
                  last_name,
                  username,
                  avatar_url
                )
              ),
              response:inquiry_responses (
                id,
                price,
                message,
                created_at
              ),
              conversation:conversations!inquiry_recipients_conversation_id_fkey (
                id
              )
            `)
            .eq('studio_id', studioData.id)
            .order('created_at', { ascending: false })

          if (error) throw error

          // Map to quote format for consistency
          const formattedQuotes = data?.map(item => ({
            id: item.id,
            created_at: item.created_at,
            status: item.status as 'pending' | 'responded' | 'declined',
            project_type: item.inquiry.project_type,
            budget_range: item.inquiry.budget_range,
            custom_message: item.inquiry.custom_message,
            studio: {
              id: studioData.id,
              name: item.inquiry.creator.first_name + ' ' + item.inquiry.creator.last_name,
              location: '', // Creator location not stored
              photo_urls: item.inquiry.creator.avatar_url ? [item.inquiry.creator.avatar_url] : []
            },
            response: item.response?.[0],
            conversation_id: item.conversation?.id
          })) || []

          setQuotes(formattedQuotes)
        }
      }
    } catch (error) {
      console.error('Error loading quotes:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredQuotes = quotes.filter(quote => {
    if (activeTab === 'all') return true
    if (activeTab === 'pending') return quote.status === 'pending'
    if (activeTab === 'responded') return quote.status === 'responded'
    return true
  })

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-4 w-4" />
      case 'responded':
        return <CheckCircle className="h-4 w-4" />
      case 'declined':
        return <XCircle className="h-4 w-4" />
      default:
        return null
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'secondary'
      case 'responded':
        return 'default'
      case 'declined':
        return 'destructive'
      default:
        return 'secondary'
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col flex-1 px-4 py-3 sm:px-6 sm:py-4">
        <div className="animate-pulse space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-32 bg-muted rounded-lg" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col flex-1 px-4 py-3 sm:px-6 sm:py-4">
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2">Quote Requests</h1>
        <p className="text-muted-foreground">
          {profile?.system_role === 'creator' 
            ? 'Track your quote requests and studio responses'
            : 'Manage incoming quote requests from creators'
          }
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="mb-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="all">
            All ({quotes.length})
          </TabsTrigger>
          <TabsTrigger value="pending">
            Pending ({quotes.filter(q => q.status === 'pending').length})
          </TabsTrigger>
          <TabsTrigger value="responded">
            Responded ({quotes.filter(q => q.status === 'responded').length})
          </TabsTrigger>
        </TabsList>
      </Tabs>

      {filteredQuotes.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No quotes yet</h3>
              <p className="text-muted-foreground mb-4">
                {activeTab === 'pending' 
                  ? 'No pending quote requests'
                  : activeTab === 'responded'
                  ? 'No responded quotes'
                  : profile?.system_role === 'creator'
                  ? 'Start by browsing studios and adding them to your quote basket'
                  : 'You\'ll see incoming quote requests here'
                }
              </p>
              {profile?.system_role === 'creator' && activeTab === 'all' && (
                <Button asChild>
                  <Link href="/discover/studios">Browse Studios</Link>
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredQuotes.map((quote) => (
            <Card key={quote.id} className="overflow-hidden">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    {quote.studio.photo_urls?.[0] && (
                      <img 
                        src={quote.studio.photo_urls[0]} 
                        alt={quote.studio.name}
                        className="h-16 w-16 rounded-lg object-cover"
                      />
                    )}
                    <div>
                      <CardTitle className="text-lg">{quote.studio.name}</CardTitle>
                      {quote.studio.location && (
                        <p className="text-sm text-muted-foreground">{quote.studio.location}</p>
                      )}
                    </div>
                  </div>
                  <Badge variant={getStatusColor(quote.status)} className="flex items-center gap-1">
                    {getStatusIcon(quote.status)}
                    {quote.status.charAt(0).toUpperCase() + quote.status.slice(1)}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm font-medium mb-1">Project Type</p>
                    <p className="text-sm text-muted-foreground">{quote.project_type}</p>
                  </div>
                  
                  {quote.budget_range && (
                    <div>
                      <p className="text-sm font-medium mb-1">Budget Range</p>
                      <p className="text-sm text-muted-foreground">{quote.budget_range}</p>
                    </div>
                  )}
                  
                  {quote.custom_message && (
                    <div>
                      <p className="text-sm font-medium mb-1">Message</p>
                      <p className="text-sm text-muted-foreground line-clamp-2">{quote.custom_message}</p>
                    </div>
                  )}
                  
                  {quote.response && (
                    <div className="border-t pt-3">
                      <p className="text-sm font-medium mb-1">Studio Response</p>
                      {quote.response.price && (
                        <p className="text-lg font-semibold mb-1">${quote.response.price}/hour</p>
                      )}
                      <p className="text-sm text-muted-foreground line-clamp-2">{quote.response.message}</p>
                    </div>
                  )}
                  
                  <div className="flex items-center justify-between pt-2">
                    <p className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(quote.created_at), { addSuffix: true })}
                    </p>
                    
                    {quote.conversation_id ? (
                      <Button size="sm" asChild>
                        <Link href={`/connect/chat?conversation=${quote.conversation_id}`}>
                          <MessageSquare className="h-4 w-4 mr-2" />
                          View Conversation
                        </Link>
                      </Button>
                    ) : quote.status === 'responded' && (
                      <Button size="sm" disabled>
                        Conversation Starting...
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}