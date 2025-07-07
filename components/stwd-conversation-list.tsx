'use client'

import { createClient } from '@/lib/supabase/client'
import { useCallback, useEffect, useState } from 'react'
import { cn } from '@/lib/utils'
import { MessageCircle, User } from 'lucide-react'

interface ConversationWithDetails {
  id: number
  studio_id?: number | null
  customer_id?: number | null
  studio_owner_id?: number | null
  status: 'active' | 'archived' | 'closed'
  created_at: string
  updated_at: string
  last_message_at?: string | null
  inquiry_id?: number | null
  studios?: {
    id: number
    name: string
    owner_id: number
  } | null
  customer_profile?: {
    id: number
    username: string
    first_name?: string | null
    last_name?: string | null
    avatar_url?: string | null
  } | null
  studio_owner_profile?: {
    id: number
    username: string
    first_name?: string | null
    last_name?: string | null
    avatar_url?: string | null
  } | null
  last_message?: {
    content: string
    created_at: string
    message_type: string
  } | null
}

interface STWDConversationListProps {
  currentUserId: number
  selectedConversationId?: number | null
  onSelectConversation: (conversation: ConversationWithDetails) => void
  className?: string
}

export function STWDConversationList({
  currentUserId,
  selectedConversationId,
  onSelectConversation,
  className
}: STWDConversationListProps) {
  const [conversations, setConversations] = useState<ConversationWithDetails[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()

  const fetchConversations = useCallback(async () => {
    try {
      setIsLoading(true)

             // Fetch conversations where the user is either customer or studio owner
       const { data: conversationsData, error } = await supabase
         .from('conversations')
         .select(`
           *,
           studios(
             id,
             name,
             owner_id
           ),
           customer_profile:profiles!conversations_customer_id_fkey(
             id,
             username,
             first_name,
             last_name,
             avatar_url
           ),
           studio_owner_profile:profiles!conversations_studio_owner_id_fkey(
             id,
             username,
             first_name,
             last_name,
             avatar_url
           )
         `)
         .or(`customer_id.eq.${currentUserId},studio_owner_id.eq.${currentUserId}`)
         .order('last_message_at', { ascending: false, nullsFirst: false })

      if (error) {
        console.error('Error fetching conversations:', error)
        return
      }

      // Fetch last message for each conversation
      const conversationsWithLastMessage = await Promise.all(
        (conversationsData || []).map(async (conversation: any) => {
          const { data: lastMessage } = await supabase
            .from('messages')
            .select('content, created_at, message_type')
            .eq('conversation_id', conversation.id)
            .order('created_at', { ascending: false })
            .limit(1)
            .single()

          return {
            ...conversation,
            last_message: lastMessage || null
          }
        })
      )

      setConversations(conversationsWithLastMessage)
    } catch (error) {
      console.error('Error fetching conversations:', error)
    } finally {
      setIsLoading(false)
    }
  }, [currentUserId, supabase])

  useEffect(() => {
    fetchConversations()

    // Set up realtime subscription for conversation updates
    const channel = supabase
      .channel('conversations_list')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'conversations',
        },
        () => {
          fetchConversations() // Refetch when conversations change
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
        },
        () => {
          fetchConversations() // Refetch when new messages are added
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [fetchConversations, supabase])

  const getOtherParticipantName = (conversation: ConversationWithDetails) => {
    if (conversation.customer_id === currentUserId) {
      // Current user is customer, show studio owner
      return conversation.studio_owner_profile?.first_name && conversation.studio_owner_profile?.last_name
        ? `${conversation.studio_owner_profile.first_name} ${conversation.studio_owner_profile.last_name}`
        : conversation.studio_owner_profile?.username || 'Studio Owner'
    } else {
      // Current user is studio owner, show customer
      return conversation.customer_profile?.first_name && conversation.customer_profile?.last_name
        ? `${conversation.customer_profile.first_name} ${conversation.customer_profile.last_name}`
        : conversation.customer_profile?.username || 'Customer'
    }
  }

  const getConversationTitle = (conversation: ConversationWithDetails) => {
    const otherParticipant = getOtherParticipantName(conversation)
    const studioName = conversation.studios?.name
    
    if (conversation.customer_id === currentUserId) {
      return `${studioName} (${otherParticipant})`
    } else {
      return `${otherParticipant}${studioName ? ` - ${studioName}` : ''}`
    }
  }

  const formatLastMessagePreview = (message: ConversationWithDetails['last_message']) => {
    if (!message) return 'No messages yet'
    
    switch (message.message_type) {
      case 'quote':
        return '💰 Quote sent'
      case 'file':
        return '📎 File attached'
      case 'system':
        return '🔔 System message'
      default:
        return message.content.length > 50 ? `${message.content.substring(0, 50)}...` : message.content
    }
  }

  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60)
    
    if (diffInHours < 24) {
      return date.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: true 
      })
    } else if (diffInHours < 168) { // 7 days
      return date.toLocaleDateString('en-US', { weekday: 'short' })
    } else {
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric' 
      })
    }
  }

  if (isLoading) {
    return (
      <div className={cn("flex flex-col space-y-2 p-4", className)}>
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-16 bg-muted animate-pulse rounded-lg" />
        ))}
      </div>
    )
  }

  if (conversations.length === 0) {
    return (
      <div className={cn("flex flex-col items-center justify-center p-8 text-center", className)}>
        <MessageCircle className="h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="font-medium text-foreground mb-2">No conversations yet</h3>
        <p className="text-sm text-muted-foreground">
          Your conversations will appear here when you start chatting with studios or customers.
        </p>
      </div>
    )
  }

  return (
    <div className={cn("flex flex-col space-y-4 px-4 py-4 overflow-y-auto", className)}>
      {conversations.map((conversation) => (
        <div
          key={conversation.id}
          className={cn(
            "flex items-start space-x-3 p-4 h-auto text-left w-full shrink-0 min-h-[80px] rounded-lg transition-all duration-200 cursor-pointer",
            "border border-transparent hover:border-border/50 hover:bg-muted/50",
            selectedConversationId === conversation.id && "bg-muted border-border"
          )}
          onClick={() => onSelectConversation(conversation)}
        >
          <div className="flex-shrink-0 pt-1">
            <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
              <User className="h-5 w-5 text-primary" />
            </div>
          </div>
          
          <div className="flex-1 min-w-0 space-y-1.5">
            <div className="flex items-center justify-between">
              <p className="font-medium text-sm truncate">
                {getConversationTitle(conversation)}
              </p>
              {conversation.last_message && (
                <span className="text-xs text-muted-foreground flex-shrink-0 ml-2">
                  {formatTime(conversation.last_message.created_at)}
                </span>
              )}
            </div>
            
            <p className="text-xs text-muted-foreground truncate">
              {formatLastMessagePreview(conversation.last_message)}
            </p>
          </div>
        </div>
      ))}
    </div>
  )
} 