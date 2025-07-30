'use client'

import { useEffect, useState } from 'react'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { cn, getAvatarImageUrl } from '@/lib/utils'
import { createClient } from '@/lib/supabase/client'
import { IconBuilding, IconMessage, IconFilter, IconSearch } from '@tabler/icons-react'
import type { Database } from '@/lib/types/database'

type Profile = Database['public']['Tables']['profiles']['Row']
type Conversation = {
  id: number
  created_at: string | null
  updated_at: string | null
  title?: string | null
  chat_participants: Array<{
    user_id: string
    profiles: Profile | null
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
  const [filter, setFilter] = useState<'all' | 'enquiries' | 'messages'>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [studioImages, setStudioImages] = useState<Record<string, string>>({})
  const supabase = createClient()
  
  // Fetch studio images for enquiries
  useEffect(() => {
    const fetchStudioImages = async () => {
      const enquiryConversations = conversations.filter(c => c.title && c.title.trim() !== '')
      const studioNames = enquiryConversations.map(c => c.title).filter(Boolean) as string[]
      
      if (studioNames.length === 0) return
      
      const { data: studios } = await supabase
        .from('studios')
        .select('name, photo_urls')
        .in('name', studioNames)
      
      if (studios) {
        const imageMap: Record<string, string> = {}
        studios.forEach(studio => {
          if (studio.photo_urls && studio.photo_urls.length > 0) {
            // Use optimized avatar size for list view (80x80)
            imageMap[studio.name] = getAvatarImageUrl(studio.photo_urls[0], 80) || studio.photo_urls[0]
          }
        })
        setStudioImages(imageMap)
      }
    }
    
    fetchStudioImages()
  }, [conversations, supabase])
  
  // Filter conversations based on type and search
  const filteredConversations = conversations.filter(conversation => {
    const isEnquiry = conversation.title && conversation.title.trim() !== ''
    
    // Type filter
    if (filter === 'enquiries' && !isEnquiry) return false
    if (filter === 'messages' && isEnquiry) return false
    
    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      const title = (conversation.title || '').toLowerCase()
      const otherUser = conversation.chat_participants.find(p => p.user_id !== currentUserId)?.profiles
      const userName = otherUser ? 
        `${otherUser.first_name || ''} ${otherUser.last_name || ''} ${otherUser.username || ''}`.toLowerCase() : ''
      const lastMessage = conversation.chat_messages[0]?.content?.toLowerCase() || ''
      
      return title.includes(query) || userName.includes(query) || lastMessage.includes(query)
    }
    
    return true
  })

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
    <div className="flex flex-col h-full">
      {/* Search and Filter */}
      <div className="h-[73px] p-4 border-b flex items-center">
        <div className="flex items-center gap-2 w-full">
          {/* Search Input */}
          <div className="relative flex-1">
            <IconSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search Conversations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          
          {/* Filter Button */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="default" size="icon" className="h-9 w-9">
                <IconFilter className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-48">
              <DropdownMenuItem
                onClick={() => setFilter('all')}
                className={cn("cursor-pointer", filter === 'all' && "bg-accent")}
              >
                <IconMessage className="h-4 w-4 mr-2" />
                All Chats
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => setFilter('enquiries')}
                className={cn("cursor-pointer", filter === 'enquiries' && "bg-accent")}
              >
                <IconBuilding className="h-4 w-4 mr-2" />
                Enquiries
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => setFilter('messages')}
                className={cn("cursor-pointer", filter === 'messages' && "bg-accent")}
              >
                <IconMessage className="h-4 w-4 mr-2" />
                Messages
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      
      <ScrollArea className="flex-1">
        <div className="p-2">
          {filteredConversations.map((conversation) => {
          const otherParticipants = conversation.chat_participants.filter(
            p => p.user_id !== currentUserId
          )
          const lastMessage = conversation.chat_messages[0]
          const otherUser = otherParticipants[0]?.profiles
          
          // Check if this is a studio enquiry
          const isEnquiry = conversation.title && conversation.title.trim() !== ''
          
          const displayName = otherUser
            ? (otherUser.first_name && otherUser.last_name 
                ? `${otherUser.first_name} ${otherUser.last_name}`.trim()
                : otherUser.username || 'Unknown User')
            : 'Unknown User'
          
          // Use studio image for enquiries, profile picture for messages
          const avatarUrl = isEnquiry && conversation.title && studioImages[conversation.title]
            ? studioImages[conversation.title]
            : otherUser?.avatar_url || (otherUser ? `https://api.dicebear.com/9.x/thumbs/svg?seed=${otherUser.user_id}&backgroundColor=ffffff&shapeColor=000000` : undefined)

          return (
            <button
              key={conversation.id}
              onClick={() => onSelect(conversation.id)}
              className={cn(
                "w-full p-3 rounded-lg flex items-start gap-3 hover:bg-accent transition-colors text-left",
                selectedId === conversation.id && "bg-accent",
                conversation.id === -1 && "opacity-90"
              )}
            >
              <Avatar className="h-10 w-10 shrink-0">
                <AvatarImage src={avatarUrl} alt={isEnquiry ? (conversation.title || undefined) : displayName} />
                <AvatarFallback>
                  {isEnquiry && conversation.title ? conversation.title.charAt(0) : displayName.charAt(0)}
                </AvatarFallback>
              </Avatar>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-baseline justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <h3 className="font-medium truncate">
                      {conversation.title || displayName}
                    </h3>
                    {(isEnquiry || conversation.id === -1) && (
                      <Badge variant="secondary" className="shrink-0 bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300">
                        {conversation.id === -1 ? 'Draft' : 'Enquiry'}
                      </Badge>
                    )}
                  </div>
                  {lastMessage && (
                    <span className="text-xs text-muted-foreground shrink-0 ml-1">
                      {(() => {
                        const date = new Date(lastMessage.created_at)
                        const now = new Date()
                        const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60)
                        
                        if (diffInHours < 1) {
                          const diffInMinutes = Math.floor(diffInHours * 60)
                          return diffInMinutes === 0 ? 'now' : `${diffInMinutes}m`
                        } else if (diffInHours < 24) {
                          return `${Math.floor(diffInHours)}h`
                        } else if (diffInHours < 168) { // 7 days
                          return `${Math.floor(diffInHours / 24)}d`
                        } else {
                          return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                        }
                      })()}
                    </span>
                  )}
                </div>
                
                {lastMessage ? (
                  <p className="text-sm text-muted-foreground truncate mt-1">
                    {lastMessage.sender_id === currentUserId ? 'You: ' : ''}
                    {lastMessage.content}
                  </p>
                ) : conversation.id === -1 ? (
                  <p className="text-sm text-muted-foreground truncate mt-1 italic">
                    Start typing to begin conversation...
                  </p>
                ) : null}
              </div>
            </button>
          )
        })}
      </div>
    </ScrollArea>
    </div>
  )
}