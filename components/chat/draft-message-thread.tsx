'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { IconSend } from '@tabler/icons-react'
import { Loader2 } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import type { Database } from '@/lib/types/database'

type Profile = Database['public']['Tables']['profiles']['Row']
type Studio = Database['public']['Tables']['studios']['Row']

interface DraftMessageThreadProps {
  currentUserId: string
  currentProfile: Profile
  targetUserId: string
  studioId?: string
  onConversationCreated: (conversationId: number) => void
}

export function DraftMessageThread({
  currentUserId,
  currentProfile,
  targetUserId,
  studioId,
  onConversationCreated
}: DraftMessageThreadProps) {
  const [loading, setLoading] = useState(false)
  const [targetProfile, setTargetProfile] = useState<Profile | null>(null)
  const [studio, setStudio] = useState<Studio | null>(null)
  const [message, setMessage] = useState('')
  const [sending, setSending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()
  const supabase = createClient()
  

  useEffect(() => {
    // Fetch target user profile
    if (targetUserId) {
      supabase
        .from('profiles')
        .select('*')
        .eq('user_id', targetUserId)
        .single()
        .then(({ data, error }) => {
          if (error) {
            console.error('Error fetching target profile:', error)
            setError('Unable to load user profile. The studio owner may have an invalid profile.')
          } else if (data) {
            setTargetProfile(data)
            setError(null)
          }
        })
    }

    // Fetch studio details if provided
    if (studioId) {
      supabase
        .from('studios')
        .select('*')
        .eq('id', parseInt(studioId))
        .single()
        .then(({ data, error }) => {
          if (error) {
            console.error('Error fetching studio:', error)
          } else if (data) {
            setStudio(data)
          }
        })
    }
  }, [targetUserId, studioId, supabase])

  const handleSendMessage = async () => {
    if (!message.trim() || sending) return

    setSending(true)
    try {
      // First verify we have a valid session
      const { data: { session }, error: sessionError } = await supabase.auth.getSession()
      
      if (sessionError || !session) {
        throw new Error('You must be logged in to send messages')
      }


      // Try direct insert with simplified approach
      const { data: conversation, error: convError } = await supabase
        .from('chat_conversations')
        .insert({
          is_group: false,
          created_by: session.user.id,
          title: studio ? studio.name : null
        })
        .select()
        .single()

      if (convError) {
        console.error('Error creating conversation:', convError)
        throw convError
      }
      
      const finalConversation = conversation

      // Add the other participant (creator is added automatically by trigger)
      const { error: participantsError } = await supabase
        .from('chat_participants')
        .insert({ 
          conversation_id: finalConversation.id, 
          user_id: targetUserId 
        })

      if (participantsError) {
        console.error('Error adding participants:', participantsError)
        throw participantsError
      }

      // Send initial message
      const { error: messageError } = await supabase
        .from('chat_messages')
        .insert({
          conversation_id: finalConversation.id,
          sender_id: session.user.id,
          content: message.trim()
        })

      if (messageError) throw messageError

      toast({
        title: 'Message sent',
        description: 'Your conversation has been started.'
      })

      onConversationCreated(finalConversation.id)
    } catch (error) {
      console.error('Error creating conversation:', error)
      toast({
        title: 'Error',
        description: 'Failed to send message. Please try again.',
        variant: 'destructive'
      })
    } finally {
      setSending(false)
    }
  }

  const getDisplayName = (profile: Profile) => {
    return profile.first_name && profile.last_name
      ? `${profile.first_name} ${profile.last_name}`
      : profile.username
  }

  const getAvatarUrl = (profile: Profile) => {
    return profile.avatar_url || 
      `https://api.dicebear.com/9.x/thumbs/svg?seed=${profile.user_id}&backgroundColor=ffffff&shapeColor=000000`
  }

  if (error) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center max-w-md">
          <h3 className="text-lg font-semibold mb-2">Unable to start conversation</h3>
          <p className="text-sm text-muted-foreground">{error}</p>
        </div>
      </div>
    )
  }

  if (!targetProfile) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground mx-auto mb-4" />
          <p className="text-sm text-muted-foreground">Loading conversation...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="border-b p-4 flex items-center gap-3">
        <Avatar className="h-10 w-10">
          <AvatarImage src={getAvatarUrl(targetProfile)} alt={getDisplayName(targetProfile)} />
          <AvatarFallback>{getDisplayName(targetProfile).charAt(0).toUpperCase()}</AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <h3 className="font-semibold">{getDisplayName(targetProfile)}</h3>
          <p className="text-sm text-muted-foreground">
            {studio ? `Owner of ${studio.name}` : `@${targetProfile.username}`}
          </p>
        </div>
      </div>

      {/* Empty messages area with prompt */}
      <div className="flex-1 p-6 flex items-center justify-center">
        <div className="text-center max-w-md">
          <h3 className="text-lg font-semibold mb-2">Start a conversation</h3>
          <p className="text-muted-foreground">
            {studio 
              ? `Send a message to ${getDisplayName(targetProfile)} about ${studio.name}`
              : `Send a message to ${getDisplayName(targetProfile)} to start chatting`
            }
          </p>
        </div>
      </div>

      {/* Message input */}
      <div className="border-t p-4">
        <div className="flex gap-2">
          <Textarea
            placeholder={studio ? `Hi, I'm interested in ${studio.name}...` : "Type a message..."}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault()
                handleSendMessage()
              }
            }}
            rows={1}
            className="flex-1 min-h-[40px] max-h-[120px] resize-none"
          />
          <Button
            onClick={handleSendMessage}
            disabled={sending || !message.trim()}
            size="icon"
          >
            {sending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <IconSend className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}