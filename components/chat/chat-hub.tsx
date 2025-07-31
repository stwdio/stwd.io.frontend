'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ConnectLayout } from '@/components/connect/connect-layout'
import { ConversationList } from './conversation-list'
import { MessageThread } from './message-thread'
import { EmptyChat } from './empty-chat'
import { DraftMessageThread } from './draft-message-thread'
import { createClient } from '@/lib/supabase/client'
import type { Database } from '@/lib/types/database'

type Profile = Database['public']['Tables']['profiles']['Row']
type Conversation = Database['public']['Tables']['chat_conversations']['Row'] & {
  chat_participants: Array<{
    user_id: string
    profiles?: Profile | null
  }>
  chat_messages: Array<{
    id: number
    content: string
    created_at: string
    sender_id: string
  }>
}

interface ChatHubProps {
  userId: string
  profile: Profile
  initialConversations: Conversation[]
  initialSelectedConversationId?: number
  targetUserId?: string
  studioId?: string
  studioInfo?: { id: number; name: string; slug: string }
  shouldRedirectToFirst?: boolean
}

export function ChatHub({ 
  userId, 
  profile, 
  initialConversations,
  initialSelectedConversationId,
  targetUserId,
  studioId,
  shouldRedirectToFirst
}: ChatHubProps) {
  console.log('ChatHub props:', {
    userId,
    profileUsername: profile.username,
    initialConversationsCount: initialConversations.length,
    initialSelectedConversationId,
    targetUserId,
    studioId
  })
  const [conversations, setConversations] = useState(initialConversations)
  // Auto-select the first conversation if none selected, unless we have a target user
  const [selectedConversationId, setSelectedConversationId] = useState<number | null>(
    initialSelectedConversationId || (!targetUserId && initialConversations.length > 0 ? initialConversations[0].id : null)
  )
  const [draftTargetUserId, setDraftTargetUserId] = useState<string | undefined>(
    targetUserId && !initialSelectedConversationId ? targetUserId : undefined
  )
  const [draftStudioId, setDraftStudioId] = useState<string | undefined>(
    studioId && !initialSelectedConversationId ? studioId : undefined
  )
  const supabase = createClient()
  const router = useRouter()
  
  // Handle client-side redirect to first conversation
  useEffect(() => {
    if (shouldRedirectToFirst && conversations.length > 0 && !selectedConversationId && !draftTargetUserId) {
      const firstConversation = conversations[0]
      
      // If it's a group chat, use conversation ID
      if (firstConversation.is_group) {
        router.replace(`/connect/chat?conversation=${firstConversation.id}`)
      } else {
        // Find the other participant for 1-on-1 chats
        const otherParticipant = firstConversation.chat_participants?.find(
          (p: any) => p.user_id !== userId
        )
        
        if (otherParticipant?.profiles?.username) {
          router.replace(`/connect/chat?user=${otherParticipant.profiles.username}`)
        }
      }
    }
  }, [shouldRedirectToFirst, conversations, selectedConversationId, draftTargetUserId, router, userId])
  
  // Subscribe to realtime updates for conversations
  useEffect(() => {
    // Subscribe to new conversations where user is a participant
    const channel = supabase
      .channel('user-conversations')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'chat_participants',
          filter: `user_id=eq.${userId}`
        },
        async (payload) => {
          const newParticipant = payload.new as { conversation_id: number; user_id: number }
          // Fetch the full conversation data
          const { data: conversation } = await supabase
            .from('chat_conversations')
            .select(`
              *,
              chat_participants!inner(
                user_id
              ),
              chat_messages(
                id,
                content,
                created_at,
                sender_id
              )
            `)
            .eq('id', newParticipant.conversation_id)
            .single()
          
          if (conversation) {
            // Fetch profiles
            const userIds = conversation.chat_participants.map(p => p.user_id)
            const { data: profiles } = await supabase
              .from('profiles')
              .select('*')
              .in('user_id', userIds)
            
            const profileMap = new Map(profiles?.map(p => [p.user_id, p]) || [])
            const conversationWithProfiles = {
              ...conversation,
              chat_participants: conversation.chat_participants.map(p => ({
                ...p,
                profiles: profileMap.get(p.user_id) || null
              }))
            }
            
            // Add to conversations if not already present
            setConversations(prev => {
              const exists = prev.some(c => c.id === conversation.id)
              if (!exists) {
                return [conversationWithProfiles, ...prev]
              }
              return prev
            })
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'chat_conversations'
        },
        (payload) => {
          const updated = payload.new as { id: number; [key: string]: unknown }
          setConversations(prev => 
            prev.map(conv => 
              conv.id === updated.id 
                ? { ...conv, ...updated }
                : conv
            )
          )
        }
      )
      .subscribe()
    
    return () => {
      supabase.removeChannel(channel)
    }
  }, [userId, supabase])
  
  // Subscribe to new messages to update conversation list
  useEffect(() => {
    if (conversations.length === 0) return
    
    const channel = supabase
      .channel('conversation-messages')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'chat_messages',
          filter: `conversation_id=in.(${conversations.map(c => c.id).join(',')})`
        },
        (payload) => {
          const newMessage = payload.new as { conversation_id: number; id: number; content: string; created_at: string; sender_id: number }
          // Update the conversation with the new message
          setConversations(prev => 
            prev.map(conv => {
              if (conv.id === newMessage.conversation_id) {
                return {
                  ...conv,
                  chat_messages: [newMessage],
                  updated_at: new Date().toISOString()
                }
              }
              return conv
            }).sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
          )
        }
      )
      .subscribe()
    
    return () => {
      supabase.removeChannel(channel)
    }
  }, [conversations, supabase])
  
  const selectedConversation = conversations.find(c => c.id === selectedConversationId)
  
  // Create a mock conversation for the draft state
  const [draftTargetProfile, setDraftTargetProfile] = useState<{ user_id: number; username?: string; first_name?: string; last_name?: string } | null>(null)
  const [draftStudio, setDraftStudio] = useState<{ id: number; name: string; slug: string } | null>(null)
  
  // Fetch draft target profile and studio info
  useEffect(() => {
    if (draftTargetUserId) {
      supabase
        .from('profiles')
        .select('*')
        .eq('user_id', draftTargetUserId)
        .single()
        .then(({ data }) => {
          if (data) setDraftTargetProfile(data)
        })
    }
    
    if (draftStudioId) {
      supabase
        .from('studios')
        .select('*')
        .eq('id', parseInt(draftStudioId))
        .single()
        .then(({ data }) => {
          if (data) setDraftStudio(data)
        })
    }
  }, [draftTargetUserId, draftStudioId, supabase])
  
  // Create mock conversation for display
  const mockDraftConversation = draftTargetUserId && draftTargetProfile ? {
    id: -1, // Negative ID to indicate it's a draft
    title: draftStudio?.name || null,
    is_group: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    created_by: userId,
    chat_participants: [
      {
        user_id: draftTargetUserId,
        profiles: draftTargetProfile
      },
      {
        user_id: userId,
        profiles: profile
      }
    ],
    chat_messages: []
  } : null
  
  // Combine real conversations with mock draft
  const displayConversations = mockDraftConversation 
    ? [mockDraftConversation, ...conversations]
    : conversations
  
  const handleConversationSelect = async (conversationId: number) => {
    const conversation = conversations.find(c => c.id === conversationId)
    if (!conversation) return
    
    setSelectedConversationId(conversationId)
    setDraftTargetUserId(undefined)
    setDraftStudioId(undefined)
    
    // Determine URL based on conversation type
    let url = `/connect/chat?conversation=${conversationId}`
    
    // If it's a studio enquiry (has a title), try to get studio info
    if (conversation.title) {
      // Try to find studio by name
      const { data: studio } = await supabase
        .from('studios')
        .select('slug')
        .eq('name', conversation.title)
        .single()
      
      if (studio?.slug) {
        url = `/connect/chat?studio=${studio.slug}`
      }
    } else {
      // It's a profile message - get the other user's username
      const otherParticipant = conversation.chat_participants.find(
        p => p.user_id !== userId
      )
      
      if (otherParticipant?.profiles?.username) {
        url = `/connect/chat?user=${otherParticipant.profiles.username}`
      }
    }
    
    // Update URL without full page reload
    window.history.replaceState(null, '', url)
  }
  
  const handleNewConversation = () => {
    // TODO: Implement new conversation flow
    console.log('New conversation')
  }
  
  const handleConversationCreated = async (conversationId: number) => {
    // Fetch the new conversation and add it to the list
    const { data: newConversation } = await supabase
      .from('chat_conversations')
      .select(`
        *,
        chat_participants!inner(
          user_id
        ),
        chat_messages(
          id,
          content,
          created_at,
          sender_id
        )
      `)
      .eq('id', conversationId)
      .single()
    
    if (newConversation) {
      // Fetch profiles for participants
      const userIds = newConversation.chat_participants.map(p => p.user_id)
      const { data: profiles } = await supabase
        .from('profiles')
        .select('*')
        .in('user_id', userIds)
      
      // Attach profiles to participants
      const profileMap = new Map(profiles?.map(p => [p.user_id, p]) || [])
      const conversationWithProfiles = {
        ...newConversation,
        chat_participants: newConversation.chat_participants.map(p => ({
          ...p,
          profiles: profileMap.get(p.user_id) || null
        }))
      }
      
      setConversations([conversationWithProfiles, ...conversations])
      setSelectedConversationId(conversationId)
      setDraftTargetUserId(undefined)
      setDraftStudioId(undefined)
      // Don't update URL - keep the nice studio/user URL
    }
  }

  const sidebar = (
    <ConversationList
      conversations={displayConversations}
      selectedId={draftTargetUserId && !selectedConversationId ? -1 : selectedConversationId}
      onSelect={(id) => {
        if (id === -1) {
          // It's the draft conversation, do nothing as it's already selected
          return
        }
        handleConversationSelect(id)
      }}
      currentUserId={userId}
    />
  )

  const content = selectedConversation ? (
    <MessageThread
      conversation={selectedConversation}
      currentUserId={userId}
      currentProfile={profile}
    />
  ) : draftTargetUserId ? (
    <DraftMessageThread
      currentUserId={userId}
      currentProfile={profile}
      targetUserId={draftTargetUserId}
      studioId={draftStudioId}
      onConversationCreated={handleConversationCreated}
    />
  ) : null

  const emptyState = <EmptyChat onNewChat={handleNewConversation} />

  return (
    <div className="h-full flex flex-col">
      {/* Mobile header */}
      <div className="lg:hidden flex-shrink-0 bg-background">
        <div className="w-full px-4 sm:px-6">
          <div className="flex items-center justify-between py-4">
            <div>
              <h2 className="text-3xl font-bold">CONNECT</h2>
              <h3 className="text-xl font-medium uppercase text-muted-foreground">
                Chat
              </h3>
            </div>
          </div>
        </div>
      </div>
      
      {/* Chat content */}
      <div className="flex-1 overflow-hidden">
        <ConnectLayout
          sidebar={sidebar}
          content={content}
          emptyState={emptyState}
          selectedId={selectedConversation?.id || (draftTargetUserId ? -1 : null)}
          mobileTitle={selectedConversation?.title || 'New Chat'}
          onBackToList={() => {
            setSelectedConversationId(null)
            setDraftTargetUserId(undefined)
            setDraftStudioId(undefined)
          }}
        />
      </div>
    </div>
  )
}