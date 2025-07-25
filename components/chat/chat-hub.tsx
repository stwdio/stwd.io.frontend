'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'
import { ConversationList } from './conversation-list'
import { MessageThread } from './message-thread'
import { EmptyChat } from './empty-chat'
import { DraftMessageThread } from './draft-message-thread'
import { Button } from '@/components/ui/button'
import { IconMessage, IconMenu2 } from '@tabler/icons-react'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { createClient } from '@/lib/supabase/client'
import type { Database } from '@/lib/types/database'

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

interface ChatHubProps {
  userId: string
  profile: Profile
  initialConversations: Conversation[]
  initialSelectedConversationId?: number
  targetUserId?: string
  studioId?: string
  studioInfo?: { id: number; name: string; slug: string }
}

export function ChatHub({ 
  userId, 
  profile, 
  initialConversations,
  initialSelectedConversationId,
  targetUserId,
  studioId,
  studioInfo
}: ChatHubProps) {
  const [conversations, setConversations] = useState(initialConversations)
  // Auto-select the first conversation if none selected, unless we have a target user
  const [selectedConversationId, setSelectedConversationId] = useState<number | null>(
    initialSelectedConversationId || (!targetUserId && initialConversations.length > 0 ? initialConversations[0].id : null)
  )
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [draftTargetUserId, setDraftTargetUserId] = useState<string | undefined>(
    targetUserId && !initialSelectedConversationId ? targetUserId : undefined
  )
  const [draftStudioId, setDraftStudioId] = useState<string | undefined>(
    studioId && !initialSelectedConversationId ? studioId : undefined
  )
  const supabase = createClient()
  const router = useRouter()
  
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
          const newParticipant = payload.new as any
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
          const updated = payload.new as any
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
          const newMessage = payload.new as any
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
  }, [conversations.length, supabase])
  
  const selectedConversation = conversations.find(c => c.id === selectedConversationId)
  
  const handleConversationSelect = async (conversationId: number) => {
    const conversation = conversations.find(c => c.id === conversationId)
    if (!conversation) return
    
    setSelectedConversationId(conversationId)
    setDraftTargetUserId(undefined)
    setDraftStudioId(undefined)
    setIsSidebarOpen(false)
    
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

  return (
    <div className="h-full flex flex-col">
      {/* Desktop Layout */}
      <div className="hidden md:flex h-full min-h-0">
        {/* Sidebar */}
        <div className="w-96 border-r bg-muted/10 flex flex-col h-full">
          <div className="flex-1 overflow-hidden min-h-0 h-full">
            <ConversationList
              conversations={conversations}
              selectedId={selectedConversationId}
              onSelect={handleConversationSelect}
              currentUserId={userId}
            />
          </div>
        </div>
        
        {/* Main Content */}
        <div className="flex-1 flex flex-col min-w-0">
          {selectedConversation ? (
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
          ) : (
            <EmptyChat onNewChat={handleNewConversation} />
          )}
        </div>
      </div>
      
      {/* Mobile Layout */}
      <div className="md:hidden h-full">
        {selectedConversation || draftTargetUserId ? (
          <div className="flex flex-col h-full">
            <div className="p-4 border-b flex items-center gap-2">
              <Sheet open={isSidebarOpen} onOpenChange={setIsSidebarOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <IconMenu2 className="h-5 w-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-96 p-0">
                  <div className="h-full flex flex-col">
                    <div className="flex-1 overflow-hidden min-h-0">
                      <ConversationList
                        conversations={conversations}
                        selectedId={selectedConversationId}
                        onSelect={handleConversationSelect}
                        currentUserId={userId}
                      />
                    </div>
                  </div>
                </SheetContent>
              </Sheet>
              
              <h2 className="font-semibold truncate">
                {selectedConversation?.title || 'New Chat'}
              </h2>
            </div>
            
            <div className="flex-1 min-h-0">
              {selectedConversation ? (
                <MessageThread
                  conversation={selectedConversation}
                  currentUserId={userId}
                  currentProfile={profile}
                />
              ) : (
                <DraftMessageThread
                  currentUserId={userId}
                  currentProfile={profile}
                  targetUserId={draftTargetUserId!}
                  studioId={draftStudioId}
                  onConversationCreated={handleConversationCreated}
                />
              )}
            </div>
          </div>
        ) : (
          <div className="h-full flex flex-col">
            <div className="p-4 border-b">
              <Button 
                onClick={() => setIsSidebarOpen(true)}
                className="w-full"
                variant="outline"
              >
                <IconMenu2 className="mr-2 h-4 w-4" />
                View Conversations
              </Button>
            </div>
            
            <EmptyChat onNewChat={handleNewConversation} />
            
            <Sheet open={isSidebarOpen} onOpenChange={setIsSidebarOpen}>
              <SheetTrigger className="sr-only" />
              <SheetContent side="left" className="w-80 p-0">
                <div className="h-full flex flex-col">
                  <div className="p-4 border-b">
                    <Button 
                      onClick={handleNewConversation}
                      className="w-full"
                      size="sm"
                    >
                      <IconMessage className="mr-2 h-4 w-4" />
                      New Chat
                    </Button>
                  </div>
                  
                  <ConversationList
                    conversations={conversations}
                    selectedId={selectedConversationId}
                    onSelect={handleConversationSelect}
                    currentUserId={userId}
                  />
                </div>
              </SheetContent>
            </Sheet>
          </div>
        )}
      </div>
    </div>
  )
}