'use client'

import { useState, useRef, useEffect } from 'react'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { IconSend } from '@tabler/icons-react'
import { format } from 'date-fns'
import { cn, getAvatarImageUrl } from '@/lib/utils'
import { createClient } from '@/lib/supabase/client'
import type { Database } from '@/lib/types/database'
import Link from 'next/link'

type Profile = Database['public']['Tables']['profiles']['Row']
type Conversation = Database['public']['Tables']['chat_conversations']['Row'] & {
  chat_participants: Array<{
    user_id: string
    profiles: Profile
  }>
  chat_messages: Array<{
    id: number
    content: string
    created_at: string
    sender_id: string
  }>
}

interface MessageThreadProps {
  conversation: Conversation
  currentUserId: string
  currentProfile: Profile
}

export function MessageThread({ 
  conversation, 
  currentUserId
}: MessageThreadProps) {
  const [message, setMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [messages, setMessages] = useState(conversation.chat_messages)
  const [studioImage, setStudioImage] = useState<string | null>(null)
  const [studioSlug, setStudioSlug] = useState<string | null>(null)
  const scrollRef = useRef<HTMLDivElement>(null)
  const supabase = createClient()
  
  const otherParticipants = conversation.chat_participants.filter(
    p => p.user_id !== currentUserId
  )
  
  const participantMap = new Map(
    conversation.chat_participants.map(p => [p.user_id, p.profiles])
  )
  
  // Load messages and studio image when conversation changes
  useEffect(() => {
    const loadMessages = async () => {
      const { data: messages } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('conversation_id', conversation.id)
        .order('created_at', { ascending: true })
      
      if (messages) {
        setMessages(messages)
      }
    }
    
    const loadStudioImage = async () => {
      if (conversation.title) {
        const { data: studio } = await supabase
          .from('studios')
          .select('photo_urls, slug')
          .eq('name', conversation.title)
          .single()
        
        if (studio) {
          if (studio.photo_urls && studio.photo_urls.length > 0) {
            // Use optimized avatar size for header (80x80)
            setStudioImage(getAvatarImageUrl(studio.photo_urls[0], 80) || studio.photo_urls[0])
          }
          setStudioSlug(studio.slug)
        }
      }
    }
    
    loadMessages()
    loadStudioImage()
  }, [conversation.id, conversation.title, supabase])
  
  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])
  
  // Subscribe to realtime messages
  useEffect(() => {
    // Create a channel for this conversation
    const channel = supabase
      .channel(`conversation-${conversation.id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'chat_messages',
          filter: `conversation_id=eq.${conversation.id}`
        },
        (payload) => {
          const newMessage = payload.new as { id: number; sender_id: string; content: string; created_at: string; conversation_id: number }
          // Only add if it's not from the current user (we already added it locally)
          if (newMessage.sender_id !== currentUserId) {
            setMessages(prev => [...prev, newMessage])
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'DELETE',
          schema: 'public',
          table: 'chat_messages',
          filter: `conversation_id=eq.${conversation.id}`
        },
        (payload) => {
          const deletedMessage = payload.old as { id: number }
          setMessages(prev => prev.filter(msg => msg.id !== deletedMessage.id))
        }
      )
      .subscribe()
    
    // Cleanup subscription on unmount
    return () => {
      supabase.removeChannel(channel)
    }
  }, [conversation.id, currentUserId, supabase])
  
  const handleSend = async () => {
    if (!message.trim() || isLoading) return
    
    setIsLoading(true)
    try {
      // Try RPC function first to avoid RLS recursion
      let newMessage
      let error
      
      try {
        // Attempt to use RPC function
        const { data: messageId, error: rpcError } = await supabase
          .rpc('send_chat_message', {
            p_conversation_id: conversation.id,
            p_content: message.trim()
          })
        
        if (rpcError) {
          // Fallback to direct insert
          const { data, error: insertError } = await supabase
            .from('chat_messages')
            .insert({
              conversation_id: conversation.id,
              sender_id: currentUserId,
              content: message.trim()
            })
            .select()
            .single()
          
          newMessage = data
          error = insertError
        } else {
          // Fetch the created message
          const { data, error: fetchError } = await supabase
            .from('chat_messages')
            .select('*')
            .eq('id', messageId)
            .single()
          
          newMessage = data
          error = fetchError
        }
      } catch (e) {
        // If RPC doesn't exist, try direct insert
        const { data, error: insertError } = await supabase
          .from('chat_messages')
          .insert({
            conversation_id: conversation.id,
            sender_id: currentUserId,
            content: message.trim()
          })
          .select()
          .single()
        
        newMessage = data
        error = insertError
      }
      
      if (error) throw error
      
      // Add the message to the local state immediately
      setMessages([...messages, newMessage])
      setMessage('')
      
      // Note: The RPC function already updates the conversation's updated_at timestamp
      // No need to update it again here
    } catch (error) {
      console.error('Failed to send message:', error)
    } finally {
      setIsLoading(false)
    }
  }
  
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="h-[73px] p-4 border-b flex items-center">
        <div className="flex items-center gap-3">
          {otherParticipants.map(participant => {
            const profile = participant.profiles
            const displayName = profile.first_name && profile.last_name 
              ? `${profile.first_name} ${profile.last_name}`.trim()
              : profile.username || 'Unknown User'
            const isEnquiry = conversation.title && conversation.title.trim() !== ''
            const avatarUrl = isEnquiry && studioImage 
              ? studioImage 
              : profile.avatar_url || `https://api.dicebear.com/9.x/thumbs/svg?seed=${profile.user_id}&backgroundColor=ffffff&shapeColor=000000`
            
            return (
              <div key={participant.user_id} className="flex items-center gap-3">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={avatarUrl} alt={isEnquiry ? conversation.title : displayName} />
                  <AvatarFallback>
                    {isEnquiry && conversation.title ? conversation.title.charAt(0) : displayName.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h2 className="font-semibold">
                    {conversation.title ? (
                      studioSlug ? (
                        <>
                          {' '}
                          <Link href={`/discover/studios/${studioSlug}`} className="hover:underline">
                            {conversation.title}
                          </Link>
                        </>
                      ) : (
                        `${conversation.title}`
                      )
                    ) : (
                      profile.username ? (
                        <Link href={`/profiles/${profile.username}`} className="hover:underline">
                          {displayName}
                        </Link>
                      ) : (
                        displayName
                      )
                    )}
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    {conversation.title ? (
                      profile.username ? (
                        <Link href={`/profiles/${profile.username}`} className="hover:underline">
                          {displayName}
                        </Link>
                      ) : (
                        displayName
                      )
                    ) : (
                      'Direct message'
                    )}
                  </p>
                </div>
              </div>
            )
          })}
        </div>
      </div>
      
      {/* Messages */}
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          {messages.map((msg) => {
            const isCurrentUser = msg.sender_id === currentUserId
            const sender = participantMap.get(msg.sender_id)
            const displayName = sender 
              ? (sender.first_name && sender.last_name 
                  ? `${sender.first_name} ${sender.last_name}`.trim()
                  : sender.username || 'Unknown')
              : 'Unknown'
            const avatarUrl = sender?.avatar_url || 
              (sender ? `https://api.dicebear.com/9.x/thumbs/svg?seed=${sender.user_id}&backgroundColor=ffffff&shapeColor=000000` : undefined)
            
            return (
              <div
                key={msg.id}
                className={cn(
                  "flex gap-3",
                  isCurrentUser && "flex-row-reverse"
                )}
              >
                <Avatar className="h-8 w-8 shrink-0">
                  <AvatarImage src={avatarUrl} alt={displayName} />
                  <AvatarFallback>{displayName.charAt(0)}</AvatarFallback>
                </Avatar>
                
                <div className={cn(
                  "flex flex-col gap-1 max-w-[70%]",
                  isCurrentUser && "items-end"
                )}>
                  <div className={cn(
                    "px-4 py-2 rounded-lg",
                    isCurrentUser
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted"
                  )}>
                    <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {format(new Date(msg.created_at), 'p')}
                  </span>
                </div>
              </div>
            )
          })}
          <div ref={scrollRef} />
        </div>
      </ScrollArea>
      
      {/* Input */}
      <div className="p-4 border-t">
        <div className="flex gap-2 items-center">
          <Input
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type a message..."
            className="flex-1"
            disabled={isLoading}
          />
          <Button 
            onClick={handleSend} 
            disabled={!message.trim() || isLoading}
            size="icon"
            className="shrink-0"
          >
            <IconSend className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}