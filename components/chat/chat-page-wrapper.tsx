'use client'

import { cn } from '@/lib/utils'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ChatHub } from './chat-hub'
import type { Database } from '@/lib/types/database'

type Profile = Database['public']['Tables']['profiles']['Row']
type Conversation = Database['public']['Tables']['conversations']['Row'] & {
  conversation_participants: Array<{
    user_id: string
    profile: Profile
  }>
  messages: Array<{
    id: number
    content: string
    created_at: string
    sender_id: string
  }>
}

interface ChatPageWrapperProps {
  userId: string
  profile: Profile
  initialConversations: Conversation[]
}

export function ChatPageWrapper({ userId, profile, initialConversations }: ChatPageWrapperProps) {
  const pathname = usePathname()
  
  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] lg:h-[calc(100vh-5rem)]">
      {/* Navigation header matching discover page */}
      <div className="border-b">
        <div className="px-4 py-3">
          <div className="flex items-center gap-3 text-base">
            <Link
              href="/discover"
              className="font-medium text-muted-foreground hover:text-foreground transition-all"
            >
              STUDIOS
            </Link>
            <span className="text-muted-foreground">|</span>
            <Link
              href="/discover/people"
              className="font-medium text-muted-foreground hover:text-foreground transition-all"
            >
              PEOPLE
            </Link>
            <span className="text-muted-foreground">|</span>
            <span className="font-medium text-foreground border-b-2 border-foreground">
              CHAT
            </span>
          </div>
        </div>
      </div>
      
      {/* Chat content */}
      <div className="flex-1 min-h-0">
        <ChatHub 
          userId={userId}
          profile={profile}
          initialConversations={initialConversations}
        />
      </div>
    </div>
  )
}