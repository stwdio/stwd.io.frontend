'use client'

import { useEffect } from 'react'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { cn } from '@/lib/utils'
import { formatDistanceToNow } from 'date-fns'
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

interface ConversationListProps {
  conversations: Conversation[]
  selectedId: number | null
  onSelect: (id: number) => void
  currentUserId: string
}

export function ConversationList({ 
  conversations, 
  selectedId, 
  onSelect,
  currentUserId 
}: ConversationListProps) {
  if (conversations.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center p-4">
        <p className="text-muted-foreground text-sm text-center">
          No conversations yet. Start a new chat!
        </p>
      </div>
    )
  }

  return (
    <ScrollArea className="flex-1">
      <div className="p-2">
        {conversations.map((conversation) => {
          const otherParticipants = conversation.chat_participants.filter(
            p => p.user_id !== currentUserId
          )
          const lastMessage = conversation.chat_messages[0]
          const otherUser = otherParticipants[0]?.profiles
          
          const displayName = otherUser
            ? `${otherUser.first_name} ${otherUser.last_name}`.trim() || otherUser.username
            : 'Unknown User'
          
          const avatarUrl = otherUser?.avatar_url || 
            (otherUser ? `https://api.dicebear.com/9.x/thumbs/svg?seed=${otherUser.id}` : undefined)

          return (
            <button
              key={conversation.id}
              onClick={() => onSelect(conversation.id)}
              className={cn(
                "w-full p-3 rounded-lg flex items-start gap-3 hover:bg-accent transition-colors text-left",
                selectedId === conversation.id && "bg-accent"
              )}
            >
              <Avatar className="h-10 w-10 shrink-0">
                <AvatarImage src={avatarUrl} alt={displayName} />
                <AvatarFallback>{displayName.charAt(0)}</AvatarFallback>
              </Avatar>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-baseline justify-between gap-2">
                  <h3 className="font-medium truncate">
                    {conversation.title || displayName}
                  </h3>
                  {lastMessage && (
                    <span className="text-xs text-muted-foreground shrink-0">
                      {formatDistanceToNow(new Date(lastMessage.created_at), { addSuffix: true })}
                    </span>
                  )}
                </div>
                
                {lastMessage && (
                  <p className="text-sm text-muted-foreground truncate mt-1">
                    {lastMessage.sender_id === currentUserId ? 'You: ' : ''}
                    {lastMessage.content}
                  </p>
                )}
              </div>
            </button>
          )
        })}
      </div>
    </ScrollArea>
  )
}