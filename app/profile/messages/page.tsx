'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { ConversationList } from '@/components/conversation-list'
import { ChatInterface } from '@/components/chat-interface'
import { Card, CardContent } from '@/components/ui/card'
import { MessageSquare, Users } from 'lucide-react'

interface Conversation {
  id: number
  inquiry_id: number
  customer_id: number
  studio_owner_id: number
  studio_id: number
  status: string
  last_message_at: string
  created_at: string
  inquiries: {
    project_type: string
    genre: string
    budget_range: string
    preferred_dates: string
    location_preference: string
    custom_message: string
  }
  studios: {
    name: string
    location: string
    hourly_rate: number
  }
  customer_profile: {
    first_name: string
    last_name: string
    username: string
    user_id: string
  }
  studio_owner_profile: {
    first_name: string
    last_name: string
    username: string
    user_id: string
  }
  unread_count: number
  last_message_content: string
}

export default function MessagesPage() {
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null)
  const [currentProfileId, setCurrentProfileId] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)
  const searchParams = useSearchParams()

  useEffect(() => {
    fetchCurrentProfile()
  }, [])

  useEffect(() => {
    if (currentProfileId) {
      fetchConversations()
      setupRealtimeSubscription()
    }
  }, [currentProfileId])

  // Handle conversation query parameter
  useEffect(() => {
    const conversationId = searchParams.get('conversation')
    if (conversationId && conversations.length > 0) {
      const targetConversation = conversations.find(c => c.id === parseInt(conversationId))
      if (targetConversation) {
        setSelectedConversation(targetConversation)
      }
    }
  }, [searchParams, conversations])

  const fetchCurrentProfile = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        setLoading(false)
        return
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('id')
        .eq('user_id', session.user.id)
        .single()

      if (profile) {
        setCurrentProfileId(profile.id)
      }
    } catch (error) {
      console.error('Error fetching profile:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchConversations = async () => {
    if (!currentProfileId) return

    try {
      const { data, error } = await supabase
        .from('conversations')
        .select(`
          *,
          customer_profile:profiles!conversations_customer_id_fkey(id, first_name, last_name, username),
          studio_owner_profile:profiles!conversations_studio_owner_id_fkey(id, first_name, last_name, username),
          studios(id, name),
          inquiries(id, project_type, genre)
        `)
        .or(`customer_id.eq.${currentProfileId},studio_owner_id.eq.${currentProfileId}`)
        .order('last_message_at', { ascending: false, nullsFirst: false })

      if (error) throw error

      // Process conversations to add last message info and unread counts
      const processedConversations = await Promise.all(
        (data || []).map(async (conversation) => {
          // Get the actual last message
          const { data: lastMessage } = await supabase
            .from('messages')
            .select('content, message_type, quote_amount')
            .eq('conversation_id', conversation.id)
            .order('created_at', { ascending: false })
            .limit(1)
            .single()

          // Get unread count (messages where sender is not current user)
          const { count: unreadCount } = await supabase
            .from('messages')
            .select('*', { count: 'exact', head: true })
            .eq('conversation_id', conversation.id)
            .neq('sender_id', currentProfileId)
            .gt('created_at', conversation.last_read_at || '1970-01-01')

          return {
            ...conversation,
            last_message_content: lastMessage?.content || '',
            unread_count: unreadCount || 0
          }
        })
      )

      setConversations(processedConversations)
    } catch (error) {
      console.error('Error fetching conversations:', error)
    }
  }

  const setupRealtimeSubscription = () => {
    if (!currentProfileId) return

    const channel = supabase
      .channel('user_conversations')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'conversations',
        filter: `or(customer_id.eq.${currentProfileId},studio_owner_id.eq.${currentProfileId})`
      }, () => {
        fetchConversations()
      })
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'messages'
      }, () => {
        fetchConversations()
      })
      .subscribe()

    return () => supabase.removeChannel(channel)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px] p-6">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading messages...</p>
        </div>
      </div>
    )
  }

  if (!currentProfileId) {
    return (
      <div className="flex items-center justify-center min-h-[400px] p-6">
        <div className="text-center space-y-4">
          <MessageSquare className="h-12 w-12 mx-auto text-muted-foreground" />
          <div>
            <h3 className="text-lg font-medium">Authentication Required</h3>
            <p className="text-sm text-muted-foreground">
              Please log in to access your messages
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold flex items-center">
          <MessageSquare className="h-8 w-8 mr-3" />
          Messages
        </h1>
        <p className="text-muted-foreground mt-2">
          Communicate with clients and studio owners about your projects
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-200px)]">
        {/* Conversation List */}
        <div className="lg:col-span-1">
          <Card className="h-full">
            <CardContent className="p-0 h-full">
              <div className="border-b p-4">
                <h2 className="font-medium flex items-center">
                  <Users className="h-4 w-4 mr-2" />
                  Conversations
                </h2>
              </div>
              <div className="overflow-y-auto h-[calc(100%-60px)]">
                <ConversationList
                  conversations={conversations}
                  onSelectConversation={setSelectedConversation}
                  selectedConversationId={selectedConversation?.id}
                  currentProfileId={currentProfileId}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Chat Interface */}
        <div className="lg:col-span-2">
          <Card className="h-full">
            <CardContent className="p-0 h-full">
              {selectedConversation ? (
                <ChatInterface
                  conversation={selectedConversation}
                  currentProfileId={currentProfileId}
                />
              ) : (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center space-y-4">
                    <MessageSquare className="h-12 w-12 mx-auto text-muted-foreground" />
                    <div>
                      <h3 className="text-lg font-medium">Select a conversation</h3>
                      <p className="text-sm text-muted-foreground">
                        Choose a conversation from the list to start chatting
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
} 