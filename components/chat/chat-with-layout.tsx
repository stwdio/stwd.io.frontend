'use client'

import { ChatHub } from './chat-hub'
import type { Database } from '@/lib/types/database'

type Profile = Database['public']['Tables']['profiles']['Row']
type Conversation = Database['public']['Tables']['chat_conversations']['Row'] & {
  chat_participants: Array<{
    user_id: string
    profile: Profile
  }>
  chat_messages: Array<{
    id: number
    content: string
    created_at: string
    sender_id: string
  }>
}

interface ChatWithLayoutProps {
  userId: string
  profile: Profile
  initialConversations: Conversation[]
  initialSelectedConversationId?: number
  targetUserId?: string
  studioId?: string
}

export function ChatWithLayout({ 
  userId, 
  profile, 
  initialConversations,
  initialSelectedConversationId,
  targetUserId,
  studioId
}: ChatWithLayoutProps) {
  return (
    <ChatHub 
      userId={userId}
      profile={profile}
      initialConversations={initialConversations}
      initialSelectedConversationId={initialSelectedConversationId}
      targetUserId={targetUserId}
      studioId={studioId}
    />
  )
}