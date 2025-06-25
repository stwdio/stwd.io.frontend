'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { MessageSquare, Clock, User } from 'lucide-react'
import { generateIdenticon } from '@/lib/identicon'
import { toast } from 'sonner'

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

interface ConversationListProps {
  onSelectConversation: (conversation: Conversation) => void
  selectedConversationId?: number
}

export function ConversationList({ onSelectConversation, selectedConversationId }: ConversationListProps) {
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [loading, setLoading] = useState(true)
  const [currentProfileId, setCurrentProfileId] = useState<number | null>(null)

  useEffect(() => {
    fetchCurrentProfile()
  }, [])

  useEffect(() => {
    if (currentProfileId) {
      fetchConversations()
    }
  }, [currentProfileId])

  const fetchCurrentProfile = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) return

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
    }
  }

  const fetchConversations = async () => {
    try {
      const { data, error } = await supabase
        .from('conversations')
        .select(`
          *,
          inquiries (
            project_type,
            genre
          ),
          studios (
            name
          ),
          customer_profile:customer_id (
            first_name,
            last_name,
            username,
            user_id
          ),
          studio_owner_profile:studio_owner_id (
            first_name,
            last_name,
            username,
            user_id
          )
        `)
        .or(`customer_id.eq.${currentProfileId},studio_owner_id.eq.${currentProfileId}`)
        .order('last_message_at', { ascending: false })

      if (error) throw error

      // Fetch unread count and last message for each conversation
      const conversationsWithCounts = await Promise.all(
        (data || []).map(async (conv) => {
          // Get unread count (messages from other participants that haven't been read)
          const { count: unreadCount } = await supabase
            .from('messages')
            .select('*', { count: 'exact', head: true })
            .eq('conversation_id', conv.id)
            .neq('sender_id', currentProfileId)
            .is('read_at', null)

          // Get last message content
          const { data: lastMessage } = await supabase
            .from('messages')
            .select('content')
            .eq('conversation_id', conv.id)
            .order('created_at', { ascending: false })
            .limit(1)
            .single()

          return {
            ...conv,
            unread_count: unreadCount || 0,
            last_message_content: lastMessage?.content || 'No messages yet'
          }
        })
      )

      setConversations(conversationsWithCounts)
    } catch (error) {
      console.error('Error fetching conversations:', error)
      toast.error('Failed to load conversations')
    } finally {
      setLoading(false)
    }
  }

  const getOtherParticipant = (conversation: Conversation) => {
    return conversation.customer_id === currentProfileId 
      ? conversation.studio_owner_profile 
      : conversation.customer_profile
  }

  const getConversationTitle = (conversation: Conversation) => {
    const otherParticipant = getOtherParticipant(conversation)
    const isCustomer = conversation.customer_id === currentProfileId
    
    if (isCustomer) {
      return `${conversation.studios.name}`
    } else {
      return `${otherParticipant.first_name} ${otherParticipant.last_name}`
    }
  }

  const getConversationSubtitle = (conversation: Conversation) => {
    const projectType = conversation.inquiries.project_type
    const genre = conversation.inquiries.genre
    
    return `${projectType}${genre ? ` • ${genre}` : ''}`
  }

  const formatLastMessageTime = (timestamp: string) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60)
    
    if (diffInHours < 1) {
      return 'Just now'
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)}h ago`
    } else {
      return date.toLocaleDateString()
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center space-y-2">
          <MessageSquare className="h-8 w-8 mx-auto opacity-50" />
          <p className="text-sm text-muted-foreground">Loading conversations...</p>
        </div>
      </div>
    )
  }

  if (conversations.length === 0) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center space-y-4">
          <MessageSquare className="h-12 w-12 mx-auto opacity-50" />
          <div>
            <h3 className="text-lg font-medium">No conversations yet</h3>
            <p className="text-sm text-muted-foreground">
              Conversations will appear here when you respond to inquiries or receive responses
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {conversations.map((conversation) => {
        const otherParticipant = getOtherParticipant(conversation)
        const isSelected = selectedConversationId === conversation.id
        
        return (
          <Card 
            key={conversation.id}
            className={`cursor-pointer transition-colors hover:bg-muted/50 ${
              isSelected ? 'border-primary bg-muted/50' : ''
            }`}
            onClick={() => onSelectConversation(conversation)}
          >
            <CardContent className="p-4">
              <div className="flex items-start space-x-3">
                <Avatar className="h-10 w-10">
                  <AvatarImage 
                    src={generateIdenticon(otherParticipant.user_id) || "/placeholder.svg"} 
                    alt={`${otherParticipant.first_name} ${otherParticipant.last_name}`}
                  />
                  <AvatarFallback>
                    <User className="h-5 w-5" />
                  </AvatarFallback>
                </Avatar>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium truncate">
                      {getConversationTitle(conversation)}
                    </h4>
                    <div className="flex items-center space-x-2">
                      {conversation.unread_count > 0 && (
                        <Badge variant="default" className="h-5 w-5 p-0 flex items-center justify-center text-xs">
                          {conversation.unread_count}
                        </Badge>
                      )}
                      <div className="flex items-center text-xs text-muted-foreground">
                        <Clock className="h-3 w-3 mr-1" />
                        {formatLastMessageTime(conversation.last_message_at)}
                      </div>
                    </div>
                  </div>
                  
                  <p className="text-sm text-muted-foreground mb-1">
                    {getConversationSubtitle(conversation)}
                  </p>
                  
                  <p className="text-sm text-muted-foreground truncate">
                    {conversation.last_message_content}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
} 