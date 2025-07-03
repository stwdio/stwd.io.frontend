'use client'

import { createClient } from '@/lib/supabase/client'
import { useCallback, useEffect, useState } from 'react'

interface UseSTWDRealtimeChatProps {
  conversationId: number
  currentUserId: number
}

export interface STWDMessage {
  id: number
  conversation_id: number
  sender_id: number
  content: string
  message_type: 'text' | 'file' | 'quote' | 'system'
  file_url?: string | null
  file_name?: string | null
  file_size?: number | null
  quote_amount?: number | null
  created_at: string
  read_at?: string | null
  updated_at: string
  sender_profile?: {
    id: number
    username: string
    first_name?: string | null
    last_name?: string | null
    avatar_url?: string | null
  }
}

export interface STWDConversation {
  id: number
  studio_id?: number | null
  customer_id?: number | null
  studio_owner_id?: number | null
  status: 'active' | 'archived' | 'closed'
  created_at: string
  updated_at: string
  last_message_at?: string | null
  inquiry_id?: number | null
}

export function useSTWDRealtimeChat({ conversationId, currentUserId }: UseSTWDRealtimeChatProps) {
  const [messages, setMessages] = useState<STWDMessage[]>([])
  const [conversation, setConversation] = useState<STWDConversation | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  // Fetch initial messages and conversation data
  const fetchInitialData = useCallback(async () => {
    try {
      setIsLoading(true)
      
      // Fetch conversation details
      const { data: conversationData, error: conversationError } = await createClient()
        .from('conversations')
        .select('*')
        .eq('id', conversationId)
        .single()

      if (conversationError) {
        console.error('Error fetching conversation:', conversationError)
        return
      }

      setConversation(conversationData)

      // Fetch messages with sender profiles
      const { data: messagesData, error: messagesError } = await createClient()
        .from('messages')
        .select(`
          *,
          sender_profile:profiles(
            id,
            username,
            first_name,
            last_name,
            avatar_url
          )
        `)
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true })

      if (messagesError) {
        console.error('Error fetching messages:', messagesError)
        return
      }

      setMessages(messagesData || [])
    } catch (error) {
      console.error('Error fetching initial data:', error)
    } finally {
      setIsLoading(false)
    }
  }, [conversationId, createClient])

  // Set up realtime subscription
  useEffect(() => {
    if (!conversationId || !currentUserId) return
    
    fetchInitialData()

    const channel = createClient()
      .channel(`conversation_${conversationId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${conversationId}`,
        },
        async (payload: any) => {
          console.log('New message received:', payload)
          
          // Fetch the complete message with sender profile
          const { data: newMessage, error } = await createClient()
            .from('messages')
            .select(`
              *,
              sender_profile:profiles(
                id,
                username,
                first_name,
                last_name,
                avatar_url
              )
            `)
            .eq('id', payload.new.id)
            .single()

          if (!error && newMessage) {
            setMessages(current => {
              // Avoid duplicates
              const exists = current.some(msg => msg.id === newMessage.id)
              if (exists) return current
              
              return [...current, newMessage]
            })
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${conversationId}`,
        },
        async (payload: any) => {
          console.log('Message updated:', payload)
          
          // Fetch updated message with sender profile
          const { data: updatedMessage, error } = await createClient()
            .from('messages')
            .select(`
              *,
              sender_profile:profiles(
                id,
                username,
                first_name,
                last_name,
                avatar_url
              )
            `)
            .eq('id', payload.new.id)
            .single()

          if (!error && updatedMessage) {
            setMessages(current =>
              current.map(msg =>
                msg.id === updatedMessage.id ? updatedMessage : msg
              )
            )
          }
        }
      )
      .subscribe(async (status: any) => {
        console.log('Realtime subscription status:', status)
        if (status === 'SUBSCRIBED') {
          setIsConnected(true)
        }
      })

    return () => {
      createClient().removeChannel(channel)
    }
  }, [conversationId, createClient, fetchInitialData])

  // Send a new message
  const sendMessage = useCallback(
    async (content: string, messageType: 'text' | 'file' | 'quote' | 'system' = 'text', additionalData?: {
      fileUrl?: string
      fileName?: string
      fileSize?: number
      quoteAmount?: number
    }) => {
      if (!content.trim() || !isConnected || !conversation) return

      try {
        const messageData = {
          conversation_id: conversationId,
          sender_id: currentUserId,
          content: content.trim(),
          message_type: messageType,
          file_url: additionalData?.fileUrl || null,
          file_name: additionalData?.fileName || null,
          file_size: additionalData?.fileSize || null,
          quote_amount: additionalData?.quoteAmount || null,
        }

        const { data, error } = await createClient()
          .from('messages')
          .insert(messageData)
          .select(`
            *,
            sender_profile:profiles(
              id,
              username,
              first_name,
              last_name,
              avatar_url
            )
          `)
          .single()

        if (error) {
          console.error('Error sending message:', error)
          return
        }

        // Update conversation's last_message_at
        await createClient()
          .from('conversations')
          .update({ last_message_at: new Date().toISOString() })
          .eq('id', conversationId)

        console.log('Message sent successfully:', data)
      } catch (error) {
        console.error('Error sending message:', error)
      }
    },
    [conversationId, currentUserId, isConnected, conversation, createClient]
  )

  return {
    messages,
    conversation,
    sendMessage,
    isConnected,
    isLoading,
    refetch: fetchInitialData,
  }
} 