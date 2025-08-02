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
import { IconBuilding, IconMessage, IconFilter, IconSearch, IconUsers } from '@tabler/icons-react'
import type { Database } from '@/lib/types/database'

type Profile = Database['public']['Tables']['profiles']['Row']
type Conversation = {
  id: number
  created_at: string | null
  updated_at: string | null
  title?: string | null
  is_group?: boolean
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
  const [filter, setFilter] = useState<'all' | 'enquiries' | 'messages' | 'groups'>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [studioImages, setStudioImages] = useState<Record<string, string>>({})
  const supabase = createClient()
  
  // Truncate function for sidebar - adjusted for names
  const truncate = (input: string, limit: number = 50) =>
    input?.length > limit ? `${input.substring(0, limit - 3)}...` : input
  
  // Fetch studio images for enquiries
  useEffect(() => {
    const fetchStudioImages = async () => {
      // Only fetch images for group chats with titles (enquiries)
      const enquiryConversations = conversations.filter(c => c.is_group && c.title && c.title.trim() !== '')
      const studioNames = enquiryConversations.map(c => c.title).filter(Boolean) as string[]
      
      if (studioNames.length === 0) return
      
      // Studio names are directly in the title
      const actualStudioNames = studioNames
      
      const { data: studios } = await supabase
        .from('studios')
        .select('name, photo_urls')
        .in('name', actualStudioNames)
      
      if (studios) {
        const imageMap: Record<string, string> = {}
        studios.forEach(studio => {
          if (studio.photo_urls && studio.photo_urls.length > 0) {
            // Use optimized avatar size for list view (80x80)
            const imageUrl = getAvatarImageUrl(studio.photo_urls[0], 80) || studio.photo_urls[0]
            // Map the studio name
            imageMap[studio.name] = imageUrl
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
    const isGroup = conversation.is_group === true
    const isRegularGroup = isGroup && !isEnquiry // Group chat that's not an enquiry
    
    // Type filter
    if (filter === 'enquiries' && !isEnquiry) return false
    if (filter === 'messages' && (isEnquiry || isRegularGroup)) return false
    if (filter === 'groups' && !isRegularGroup) return false
    
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
              <DropdownMenuItem
                onClick={() => setFilter('groups')}
                className={cn("cursor-pointer", filter === 'groups' && "bg-accent")}
              >
                <IconUsers className="h-4 w-4 mr-2" />
                Groups
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      
      <ScrollArea className="flex-1">
        <div className="p-2 space-y-2">
          {filteredConversations.map((conversation) => {
          const otherParticipants = conversation.chat_participants.filter(
            p => p.user_id !== currentUserId
          )
          const lastMessage = conversation.chat_messages?.[0]
          const otherUser = otherParticipants[0]?.profiles
          
          // Check if this is a studio enquiry
          const isEnquiry = conversation.title && conversation.title.trim() !== ''
          
          // Handle group chat display
          const isGroupChat = conversation.is_group === true && !isEnquiry
          let displayName = 'Unknown User'
          let avatarUrl: string | undefined
          
          if (isEnquiry) {
            // For enquiries, show studio name
            displayName = conversation.title || 'Studio Enquiry'
            
            // Use studio image for enquiries
            avatarUrl = studioImages[displayName]
            
            // If no studio image yet, use a placeholder with studio initial
            if (!avatarUrl) {
              avatarUrl = `https://api.dicebear.com/9.x/initials/svg?seed=${displayName}&backgroundColor=0ea5e9&fontSize=50`
            }
          } else if (isGroupChat) {
            // For regular group chats, show participant names (limit to 2)
            const participantNames = otherParticipants
              .map(p => {
                return p.profiles?.first_name || p.profiles?.username || 'Unknown'
              })
              .filter(Boolean)
            
            if (participantNames.length === 0) {
              displayName = 'Group Chat'
            } else if (participantNames.length <= 2) {
              displayName = participantNames.join(', ')
            } else {
              const firstTwo = participantNames.slice(0, 2).join(', ')
              const othersCount = participantNames.length - 2
              displayName = `${firstTwo} & ${othersCount} ${othersCount === 1 ? 'Other' : 'Others'}`
            }
            
            avatarUrl = otherUser?.avatar_url || (otherUser ? `https://api.dicebear.com/9.x/thumbs/svg?seed=${conversation.id}-group&backgroundColor=ffffff&shapeColor=000000` : undefined)
          } else {
            // For 1-on-1 chats
            displayName = otherUser
              ? (otherUser.first_name && otherUser.last_name 
                  ? `${otherUser.first_name} ${otherUser.last_name}`.trim()
                  : otherUser.username || 'Unknown User')
              : 'Unknown User'
            
            // Use studio image for enquiries, profile picture for messages
            avatarUrl = isEnquiry && conversation.title && studioImages[conversation.title]
              ? studioImages[conversation.title]
              : otherUser?.avatar_url || (otherUser ? `https://api.dicebear.com/9.x/thumbs/svg?seed=${otherUser.user_id}&backgroundColor=ffffff&shapeColor=000000` : undefined)
          }

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
                  {isGroupChat ? (
                    <IconUsers className="h-5 w-5" />
                  ) : isEnquiry ? (
                    displayName.charAt(0)
                  ) : (
                    displayName.charAt(0)
                  )}
                </AvatarFallback>
              </Avatar>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-medium">
                    {truncate(displayName)}
                  </h3>
                  <div className="flex items-center gap-2 shrink-0 ml-2">
                    {(isEnquiry || conversation.id === -1) && (
                      <Badge variant="secondary" className="bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300">
                        {conversation.id === -1 ? 'Draft' : 'Enquiry'}
                      </Badge>
                    )}
                    {isGroupChat && !isEnquiry && (
                      <Badge variant="secondary" className="bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300">
                        Group
                      </Badge>
                    )}
                  </div>
                </div>
                
                <div className="flex items-end justify-between gap-2 mt-1">
                  <div className="flex-1 min-w-0">
                    {lastMessage ? (
                      <p className="text-sm text-muted-foreground">
                        {(() => {
                          // Find the sender's profile
                          const sender = conversation.chat_participants.find(
                            p => p.user_id === lastMessage.sender_id
                          )?.profiles
                          
                          let senderName = 'Unknown'
                          if (lastMessage.sender_id === currentUserId) {
                            senderName = 'You'
                          } else if (sender) {
                            // Special case for Concierge
                            if (sender.username === 'studio_concierge' || sender.first_name === 'Studio') {
                              senderName = 'Concierge'
                            } else {
                              senderName = sender.first_name || sender.username || 'Unknown'
                            }
                          }
                          
                          // Truncate message with sender name considered
                          const prefix = `${senderName}: `
                          const availableLength = 65 - prefix.length // Increased from 50 to 65 for names
                          const truncatedContent = truncate(lastMessage.content, availableLength)
                          
                          return (
                            <>
                              <span className="font-bold">{senderName}:</span> {truncatedContent}
                            </>
                          )
                        })()}
                      </p>
                    ) : conversation.id === -1 ? (
                      <p className="text-sm text-muted-foreground italic">
                        Start typing to begin conversation...
                      </p>
                    ) : null}
                  </div>
                  {lastMessage && (
                    <span className="text-xs text-muted-foreground shrink-0 ml-2">
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
              </div>
            </button>
          )
        })}
      </div>
    </ScrollArea>
    </div>
  )
}