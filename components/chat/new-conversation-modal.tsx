'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Textarea } from '@/components/ui/textarea'
import { Loader2 } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import type { Database } from '@/lib/types/database'

type Profile = Database['public']['Tables']['profiles']['Row']
type Studio = Database['public']['Tables']['studios']['Row']

interface NewConversationModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentUserId: string
  targetUserId?: string
  studioId?: string
  onConversationCreated: (conversationId: number) => void
}

export function NewConversationModal({
  open,
  onOpenChange,
  currentUserId,
  targetUserId,
  studioId,
  onConversationCreated
}: NewConversationModalProps) {
  const [loading, setLoading] = useState(false)
  const [targetProfile, setTargetProfile] = useState<Profile | null>(null)
  const [studio, setStudio] = useState<Studio | null>(null)
  const [message, setMessage] = useState('')
  const { toast } = useToast()
  const supabase = createClient()

  useEffect(() => {
    if (open && targetUserId) {
      // Fetch target user profile
      supabase
        .from('profiles')
        .select('*')
        .eq('user_id', targetUserId)
        .single()
        .then(({ data }) => {
          if (data) setTargetProfile(data)
        })
    }

    if (open && studioId) {
      // Fetch studio details
      supabase
        .from('studios')
        .select('*')
        .eq('id', studioId)
        .single()
        .then(({ data }) => {
          if (data) setStudio(data)
        })
    }
  }, [open, targetUserId, studioId, supabase])

  const handleCreateConversation = async () => {
    if (!targetUserId || !message.trim()) return

    setLoading(true)
    try {
      // Create new conversation
      const { data: conversation, error: convError } = await supabase
        .from('conversations')
        .insert({
          is_group: false,
          created_by: currentUserId
        })
        .select()
        .single()

      if (convError) throw convError

      // Add participants
      const { error: participantsError } = await supabase
        .from('conversation_participants')
        .insert([
          { conversation_id: conversation.id, user_id: currentUserId },
          { conversation_id: conversation.id, user_id: targetUserId }
        ])

      if (participantsError) throw participantsError

      // Send initial message
      const { error: messageError } = await supabase
        .from('messages')
        .insert({
          conversation_id: conversation.id,
          sender_id: currentUserId,
          content: message.trim()
        })

      if (messageError) throw messageError

      // Update conversation updated_at
      await supabase
        .from('conversations')
        .update({ updated_at: new Date().toISOString() })
        .eq('id', conversation.id)

      toast({
        title: 'Conversation started',
        description: 'Your message has been sent.'
      })

      onConversationCreated(conversation.id)
      onOpenChange(false)
      setMessage('')
    } catch (error) {
      console.error('Error creating conversation:', error)
      toast({
        title: 'Error',
        description: 'Failed to start conversation. Please try again.',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  const getDisplayName = () => {
    if (targetProfile) {
      return targetProfile.first_name && targetProfile.last_name
        ? `${targetProfile.first_name} ${targetProfile.last_name}`
        : targetProfile.username
    }
    return ''
  }

  const getAvatarUrl = () => {
    return targetProfile?.avatar_url || 
      `https://api.dicebear.com/9.x/thumbs/svg?seed=${targetUserId}&backgroundColor=ffffff&shapeColor=000000`
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Start a Conversation</DialogTitle>
          <DialogDescription>
            {studio ? `Message the owner of ${studio.name}` : 'Send a message to start chatting'}
          </DialogDescription>
        </DialogHeader>

        {targetProfile && (
          <div className="flex items-center gap-3 py-4">
            <Avatar className="h-12 w-12">
              <AvatarImage src={getAvatarUrl()} alt={getDisplayName()} />
              <AvatarFallback>{getDisplayName().charAt(0).toUpperCase()}</AvatarFallback>
            </Avatar>
            <div>
              <p className="font-semibold">{getDisplayName()}</p>
              <p className="text-sm text-muted-foreground">@{targetProfile.username}</p>
            </div>
          </div>
        )}

        <div className="space-y-4">
          <div>
            <Textarea
              placeholder={studio ? `Hi, I'm interested in ${studio.name}...` : "Type your message..."}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={4}
              className="resize-none"
            />
          </div>

          <div className="flex justify-end gap-3">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreateConversation}
              disabled={loading || !message.trim()}
            >
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Send Message
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}