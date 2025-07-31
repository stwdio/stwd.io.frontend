'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { IconSend } from '@tabler/icons-react'
import { Loader2 } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import type { Database } from '@/lib/types/database'
import { imagePresets } from '@/lib/utils/image-transformations'
import Link from 'next/link'

type Profile = Database['public']['Tables']['profiles']['Row']
type Studio = Database['public']['Tables']['studios']['Row']

interface DraftMessageThreadProps {
  currentUserId: string
  currentProfile: Profile
  targetUserId?: string
  studioId?: string
  onConversationCreated: (conversationId: number) => void
}

export function DraftMessageThread({
  targetUserId,
  studioId,
  onConversationCreated
}: DraftMessageThreadProps) {
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

    // Fetch studio details if provided (studioId is actually a slug)
    if (studioId) {
      supabase
        .from('studios')
        .select('*')
        .eq('slug', studioId)
        .single()
        .then(async ({ data: studioData, error: studioError }) => {
          if (studioError) {
            console.error('Error fetching studio:', studioError)
          } else if (studioData) {
            setStudio(studioData)
            // If we don't have a targetUserId, fetch the owner profile
            if (!targetUserId && studioData.owner_id) {
              const { data: ownerProfile, error: profileError } = await supabase
                .from('profiles')
                .select('*')
                .eq('user_id', studioData.owner_id)
                .single()
              
              if (profileError) {
                console.error('Error fetching studio owner profile:', profileError)
                setError('Unable to load studio owner profile.')
              } else if (ownerProfile) {
                setTargetProfile(ownerProfile)
              }
            }
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


      // Try RPC function first to avoid RLS recursion, fallback to direct insert
      let conversation
      let convError
      
      try {
        // Attempt to use RPC function (if it exists)
        const { data: rpcData, error: rpcError } = await supabase
          .rpc('create_chat_conversation', {
            p_is_group: false,
            p_title: studio ? studio.name : null
          })
          .single()
        
        if (!rpcError && rpcData) {
          conversation = rpcData
        } else {
          // Fallback to direct insert
          const { data, error } = await supabase
            .from('chat_conversations')
            .insert({
              is_group: false,
              created_by: session.user.id,
              title: studio ? studio.name : null
            })
            .select()
            .single()
          
          conversation = data
          convError = error
        }
      } catch (e) {
        // If RPC doesn't exist, try direct insert
        const { data, error } = await supabase
          .from('chat_conversations')
          .insert({
            is_group: false,
            created_by: session.user.id,
            title: studio ? studio.name : null
          })
          .select()
          .single()
        
        conversation = data
        convError = error
      }

      if (convError) {
        console.error('Error creating conversation:', convError)
        throw convError
      }
      
      const finalConversation = conversation

      // Add the other participant (creator is added automatically by trigger)
      // Use targetUserId if available, otherwise get from targetProfile
      const participantUserId = targetUserId || targetProfile?.user_id
      if (!participantUserId) {
        throw new Error('No recipient user ID available')
      }
      
      const { error: participantsError } = await supabase
        .from('chat_participants')
        .insert({ 
          conversation_id: finalConversation.id, 
          user_id: participantUserId 
        })

      if (participantsError) {
        console.error('Error adding participants:', participantsError)
        throw participantsError
      }

      // Send initial message - try RPC first to avoid RLS recursion
      let messageError
      
      try {
        // Attempt to use RPC function (if it exists)
        const { data: rpcData, error: rpcError } = await supabase
          .rpc('send_chat_message', {
            p_conversation_id: finalConversation.id,
            p_content: message.trim()
          })
        
        if (rpcError) {
          // Fallback to direct insert
          const { error } = await supabase
            .from('chat_messages')
            .insert({
              conversation_id: finalConversation.id,
              sender_id: session.user.id,
              content: message.trim()
            })
          messageError = error
        }
      } catch (e) {
        // If RPC doesn't exist, try direct insert
        const { error } = await supabase
          .from('chat_messages')
          .insert({
            conversation_id: finalConversation.id,
            sender_id: session.user.id,
            content: message.trim()
          })
        messageError = error
      }

      if (messageError) throw messageError

      toast({
        title: 'Message sent',
        description: 'Your conversation has been started.'
      })

      onConversationCreated(finalConversation.id)
    } catch (error: any) {
      console.error('Error creating conversation:', error)
      
      // Check for specific database policy error
      if (error?.code === '42P17') {
        console.error('RLS Recursion Error - Apply this COMPLETE migration to fix:')
        console.error(`
-- Fix for chat system RLS recursion issues
-- Run this ENTIRE script in Supabase SQL editor

-- 1. Create RPC function to safely create conversations
CREATE OR REPLACE FUNCTION create_chat_conversation(
  p_is_group BOOLEAN DEFAULT false,
  p_title TEXT DEFAULT NULL
)
RETURNS TABLE (
  id BIGINT,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ,
  is_group BOOLEAN,
  created_by UUID,
  title TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  INSERT INTO chat_conversations (is_group, created_by, title)
  VALUES (p_is_group, auth.uid(), p_title)
  RETURNING 
    chat_conversations.id,
    chat_conversations.created_at,
    chat_conversations.updated_at,
    chat_conversations.is_group,
    chat_conversations.created_by,
    chat_conversations.title;
END;
$$;

-- 2. Create RPC function to safely send messages
CREATE OR REPLACE FUNCTION send_chat_message(
  p_conversation_id BIGINT,
  p_content TEXT
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_sender_id UUID;
BEGIN
  -- Get the current user's ID
  v_sender_id := auth.uid();
  
  -- Verify user is a participant in the conversation (basic check)
  IF NOT EXISTS (
    SELECT 1 FROM chat_participants 
    WHERE conversation_id = p_conversation_id 
    AND user_id = v_sender_id
  ) THEN
    RAISE EXCEPTION 'User is not a participant in this conversation';
  END IF;
  
  -- Insert the message
  INSERT INTO chat_messages (conversation_id, sender_id, content)
  VALUES (p_conversation_id, v_sender_id, p_content);
  
  -- Update conversation's last_message_at
  UPDATE chat_conversations 
  SET updated_at = NOW()
  WHERE id = p_conversation_id;
END;
$$;

-- 3. Grant execute permissions to authenticated users
GRANT EXECUTE ON FUNCTION create_chat_conversation TO authenticated;
GRANT EXECUTE ON FUNCTION send_chat_message TO authenticated;

-- 4. ALTERNATIVE: If RPC functions don't work, simplify the RLS policies
-- This removes the circular dependency by simplifying the policies
-- Only run this if the RPC functions above don't resolve the issue

-- Simplify chat_messages insert policy to avoid recursion
-- DROP POLICY IF EXISTS "Users can insert their own messages" ON chat_messages;
-- CREATE POLICY "Users can insert their own messages" ON chat_messages
--   FOR INSERT TO authenticated
--   WITH CHECK (sender_id = auth.uid());

-- Simplify chat_messages select policy
-- DROP POLICY IF EXISTS "Users can view messages in their conversations" ON chat_messages;
-- CREATE POLICY "Users can view messages in their conversations" ON chat_messages
--   FOR SELECT TO authenticated
--   USING (
--     conversation_id IN (
--       SELECT conversation_id 
--       FROM chat_participants 
--       WHERE user_id = auth.uid()
--     )
--   );
        `)
        
        toast({
          title: 'Database Configuration Error',
          description: 'RLS recursion detected. Check console for SQL migration to fix this issue.',
          variant: 'destructive'
        })
      } else {
        toast({
          title: 'Error',
          description: error?.message || 'Failed to send message. Please try again.',
          variant: 'destructive'
        })
      }
    } finally {
      setSending(false)
    }
  }

  const getDisplayName = (profile: Profile) => {
    return profile.first_name && profile.last_name
      ? `${profile.first_name} ${profile.last_name}`
      : profile.username || 'Unknown User'
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
      <div className="h-[73px] border-b p-4 flex items-center gap-3">
        <Avatar className="h-10 w-10">
          <AvatarImage 
            src={studio?.photo_urls?.[0] ? imagePresets.avatar(studio.photo_urls[0]) : imagePresets.avatar(getAvatarUrl(targetProfile))} 
            alt={studio ? studio.name : getDisplayName(targetProfile)} 
          />
          <AvatarFallback>
            {studio ? studio.name.charAt(0).toUpperCase() : getDisplayName(targetProfile).charAt(0).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <h3 className="font-semibold">
            {studio ? (
              studio.slug ? (
                <Link href={`/discover/studios/${studio.slug}`} className="hover:underline">
                  {studio.name}
                </Link>
              ) : (
                studio.name
              )
            ) : (
              getDisplayName(targetProfile)
            )}
          </h3>
          {studio && (
            <p className="text-sm text-muted-foreground">
              {targetProfile.username ? (
                <Link href={`/profiles/${targetProfile.username}`} className="hover:underline">
                  {getDisplayName(targetProfile)}
                </Link>
              ) : (
                getDisplayName(targetProfile)
              )}
            </p>
          )}
          {!studio && targetProfile.username && (
            <p className="text-sm text-muted-foreground">
              @
              <Link href={`/profiles/${targetProfile.username}`} className="hover:underline">
                {targetProfile.username}
              </Link>
            </p>
          )}
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
        <div className="flex gap-2 items-center">
          <Input
            placeholder={studio ? `Hi, I'm interested in ${studio.name}...` : "Type a message..."}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault()
                handleSendMessage()
              }
            }}
            className="flex-1"
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