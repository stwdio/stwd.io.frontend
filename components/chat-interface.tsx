'use client'

import { useState, useEffect, useRef } from 'react'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { QuoteMessage } from '@/components/quote-message'
import { TextMessage } from '@/components/text-message'
import { toast } from 'sonner'
import { IconSend, IconMessageCircle } from '@tabler/icons-react'

interface Message {
  id: number
  content: string
  message_type: string
  quote_amount: number | null
  created_at: string
  sender_profile: {
    id: number
    first_name: string
    last_name: string
    username: string
  }
}

interface ChatInterfaceProps {
  conversation: any
  currentProfileId: number
}

export function ChatInterface({ conversation, currentProfileId }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    fetchMessages()
    setupRealtimeSubscription()
  }, [conversation.id])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const fetchMessages = async () => {
    try {
      const { data, error } = await supabase.rpc('get_conversation_messages', {
        conversation_id_param: conversation.id
      })

      if (error) throw error
      setMessages(data || [])
    } catch (error) {
      console.error('Error fetching messages:', error)
      toast.error('Failed to load messages')
    } finally {
      setLoading(false)
    }
  }

  const setupRealtimeSubscription = () => {
    const channel = supabase
      .channel('conversation_messages')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `conversation_id=eq.${conversation.id}`
      }, (payload) => {
        // Fetch the complete message with sender profile
        fetchMessages()
      })
      .subscribe()

    return () => supabase.removeChannel(channel)
  }

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMessage.trim() || sending) return

    setSending(true)
    try {
      const { error } = await supabase
        .from('messages')
        .insert({
          conversation_id: conversation.id,
          sender_id: currentProfileId,
          content: newMessage.trim(),
          message_type: 'text'
        })

      if (error) throw error

      setNewMessage('')
      
      // Update conversation last_message_at
      await supabase
        .from('conversations')
        .update({ last_message_at: new Date().toISOString() })
        .eq('id', conversation.id)

    } catch (error) {
      console.error('Error sending message:', error)
      toast.error('Failed to send message')
    } finally {
      setSending(false)
    }
  }

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const getSenderName = (senderProfile: any) => {
    if (senderProfile.first_name && senderProfile.last_name) {
      return `${senderProfile.first_name} ${senderProfile.last_name}`
    }
    return senderProfile.username || 'Unknown'
  }

  const getOtherParticipantName = () => {
    // Determine if current user is customer or studio owner
    const isCustomer = conversation.customer_id === currentProfileId
    
    if (isCustomer) {
      return getSenderName(conversation.studio_owner_profile)
    } else {
      return getSenderName(conversation.customer_profile)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading conversation...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="border-b p-4 bg-white">
        <div className="flex items-center">
          <IconMessageCircle className="h-5 w-5 mr-2 text-blue-600" />
          <div>
            <h3 className="font-medium">
              Chat with {getOtherParticipantName()}
            </h3>
            <p className="text-sm text-muted-foreground">
              {conversation.studios?.name} • {conversation.inquiries?.project_type}
            </p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center space-y-4">
              <IconMessageCircle className="h-12 w-12 mx-auto text-muted-foreground" />
              <div>
                <h3 className="text-lg font-medium">Start the conversation</h3>
                <p className="text-sm text-muted-foreground">
                  Send a message to begin discussing your project
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-1">
            {messages.map((message) => {
              const isOwn = message.sender_profile.id === currentProfileId
              const senderName = getSenderName(message.sender_profile)

              if (message.message_type === 'quote') {
                return (
                  <QuoteMessage
                    key={message.id}
                    content={message.content}
                    quoteAmount={message.quote_amount}
                    senderName={senderName}
                    timestamp={message.created_at}
                    isOwn={isOwn}
                  />
                )
              }

              return (
                <TextMessage
                  key={message.id}
                  content={message.content}
                  senderName={senderName}
                  timestamp={message.created_at}
                  isOwn={isOwn}
                />
              )
            })}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Message Input */}
      <div className="border-t p-4 bg-white">
        <form onSubmit={sendMessage} className="flex gap-2">
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message..."
            disabled={sending}
            className="flex-1"
          />
          <Button 
            type="submit" 
            disabled={!newMessage.trim() || sending}
            size="icon"
          >
            <IconSend className="h-4 w-4" />
          </Button>
        </form>
      </div>
    </div>
  )
} 