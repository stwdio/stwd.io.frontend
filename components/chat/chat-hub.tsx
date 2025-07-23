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
}

export function ChatHub({ 
  userId, 
  profile, 
  initialConversations,
  initialSelectedConversationId,
  targetUserId,
  studioId
}: ChatHubProps) {
  const [conversations, setConversations] = useState(initialConversations)
  const [selectedConversationId, setSelectedConversationId] = useState<number | null>(
    initialSelectedConversationId || null
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
  
  const selectedConversation = conversations.find(c => c.id === selectedConversationId)
  
  const handleConversationSelect = (conversationId: number) => {
    setSelectedConversationId(conversationId)
    setDraftTargetUserId(undefined)
    setDraftStudioId(undefined)
    setIsSidebarOpen(false)
    // Update URL
    router.push(`/chat?conversation=${conversationId}`)
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
      // Update URL to show the new conversation
      router.push(`/chat?conversation=${conversationId}`)
    }
  }

  return (
    <>
      {/* Desktop Layout */}
      <div className="hidden md:flex w-full">
        {/* Sidebar */}
        <div className="w-80 border-r bg-muted/10">
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
        </div>
        
        {/* Main Content */}
        <div className="flex-1">
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
      <div className="md:hidden w-full">
        {selectedConversation || draftTargetUserId ? (
          <div className="h-full flex flex-col">
            <div className="p-4 border-b flex items-center gap-2">
              <Sheet open={isSidebarOpen} onOpenChange={setIsSidebarOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <IconMenu2 className="h-5 w-5" />
                  </Button>
                </SheetTrigger>
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
              
              <h2 className="font-semibold truncate">
                {selectedConversation?.title || 'New Chat'}
              </h2>
            </div>
            
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
    </>
  )
}