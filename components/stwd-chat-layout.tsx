'use client'

import { createClient } from '@/lib/supabase/client'
import { useEffect, useState } from 'react'
import { STWDConversationList } from './stwd-conversation-list'
import { STWDChatArea } from './stwd-message-display'
import { useSTWDRealtimeChat } from '@/hooks/use-stwd-realtime-chat'
import { cn } from '@/lib/utils'
import { MessageCircle } from 'lucide-react'

interface ConversationDetails {
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

export function STWDChatLayout() {
  const [currentUser, setCurrentUser] = useState<{ id: number; role: string } | null>(null)
  const [selectedConversation, setSelectedConversation] = useState<ConversationDetails | null>(null)
  const [isMobile, setIsMobile] = useState(false)
  const [showChat, setShowChat] = useState(false)

  // Chat functionality
  const {
    messages,
    conversation,
    sendMessage,
    isConnected,
    isLoading: chatLoading,
  } = useSTWDRealtimeChat({
    conversationId: selectedConversation?.id || 0,
    currentUserId: currentUser?.id || 0,
  })

  // Get current user
  useEffect(() => {
    const getCurrentUser = async () => {
      const { data: { user }, error } = await createClient().auth.getUser()
      
      if (error || !user) {
        console.error('Error getting user:', error)
        return
      }

      // Get user profile with role
      const { data: profile, error: profileError } = await createClient()
        .from('profiles')
        .select('id, role')
        .eq('user_id', user.id)
        .single()

      if (profileError || !profile) {
        console.error('Error getting profile:', profileError)
        return
      }

      setCurrentUser({ id: profile.id, role: profile.role || 'creator' })
    }

    getCurrentUser()
  }, [createClient])

  // Handle mobile responsiveness
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  const handleSelectConversation = (conversation: ConversationDetails) => {
    setSelectedConversation(conversation)
    if (isMobile) {
      setShowChat(true)
    }
  }

  const handleBackToList = () => {
    setShowChat(false)
    setSelectedConversation(null)
  }

  const getConversationTitle = (conversation: ConversationDetails) => {
    if (!currentUser) return 'Chat'
    
    const otherParticipantProfile = conversation.customer_id === currentUser.id
      ? conversation.studio_owner_profile
      : conversation.customer_profile
    
    const otherParticipantName = otherParticipantProfile?.first_name && otherParticipantProfile?.last_name
      ? `${otherParticipantProfile.first_name} ${otherParticipantProfile.last_name}`
      : otherParticipantProfile?.username || 'Unknown User'
    
    const studioName = conversation.studios?.name
    
    if (conversation.customer_id === currentUser.id) {
      return `${studioName} (${otherParticipantName})`
    } else {
      return `${otherParticipantName}${studioName ? ` - ${studioName}` : ''}`
    }
  }

  if (!currentUser) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  if (isMobile) {
    return (
      <div className="flex flex-col h-full">
        {!showChat ? (
          <div className="flex flex-col h-full">
            <div className="p-4 border-b border-border">
              <h1 className="text-xl font-semibold">Messages</h1>
            </div>
            <STWDConversationList
              currentUserId={currentUser.id}
              selectedConversationId={selectedConversation?.id}
              onSelectConversation={handleSelectConversation}
              className="flex-1"
            />
          </div>
        ) : selectedConversation ? (
          <STWDChatArea
            messages={messages}
            currentUserId={currentUser.id}
            onSendMessage={sendMessage}
            isConnected={isConnected}
            conversationTitle={getConversationTitle(selectedConversation)}
            onBack={handleBackToList}
          />
        ) : null}
      </div>
    )
  }

  return (
    <div className="flex h-full">
      {/* Sidebar with conversations */}
      <div className="w-80 border-r border-border flex flex-col">
        <div className="p-4 border-b border-border">
          <h1 className="text-xl font-semibold">Messages</h1>
        </div>
        <STWDConversationList
          currentUserId={currentUser.id}
          selectedConversationId={selectedConversation?.id}
          onSelectConversation={handleSelectConversation}
          className="flex-1"
        />
      </div>

      {/* Main chat area */}
      <div className="flex-1 flex flex-col">
        {selectedConversation ? (
          <STWDChatArea
            messages={messages}
            currentUserId={currentUser.id}
            onSendMessage={sendMessage}
            isConnected={isConnected}
            conversationTitle={getConversationTitle(selectedConversation)}
          />
        ) : (
          <div className="flex-1 flex items-center justify-center text-center p-8">
            <div>
              <MessageCircle className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">
                Select a conversation
              </h3>
              <p className="text-muted-foreground">
                Choose a conversation from the sidebar to start chatting.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
} 