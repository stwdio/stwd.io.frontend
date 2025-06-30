import React, { useState } from 'react'
import { Search, MessageCircle } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { useChatStore, type Conversation } from '@/hooks/useChatStore'

interface ChatSidebarProps {
  onSelectConversation: (conversation: Conversation) => void
  className?: string
}

export function ChatSidebar({ onSelectConversation, className }: ChatSidebarProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const { 
    conversations, 
    selectedConversation, 
    currentProfileId, 
    getUnreadCount 
  } = useChatStore()

  const filteredConversations = conversations.filter((conversation) => {
    if (!searchQuery) return true
    
    const query = searchQuery.toLowerCase()
    const participant = conversation.customer_id === currentProfileId 
      ? conversation.studio_owner_profile 
      : conversation.customer_profile
    
    const participantName = participant?.first_name && participant?.last_name
      ? `${participant.first_name} ${participant.last_name}`
      : participant?.username || ''
    
    const studioName = conversation.studios?.name || ''
    const projectType = conversation.inquiries?.project_type || ''
    
    return (
      participantName.toLowerCase().includes(query) ||
      studioName.toLowerCase().includes(query) ||
      projectType.toLowerCase().includes(query) ||
      conversation.last_message_content.toLowerCase().includes(query)
    )
  })

  const getParticipantInfo = (conversation: Conversation) => {
    if (!currentProfileId) return null
    
    const isCustomer = conversation.customer_id === currentProfileId
    const participant = isCustomer 
      ? conversation.studio_owner_profile 
      : conversation.customer_profile
    
    const name = participant?.first_name && participant?.last_name
      ? `${participant.first_name} ${participant.last_name}`
      : participant?.username || 'Unknown'
    
    const initials = participant?.first_name && participant?.last_name
      ? `${participant.first_name[0]}${participant.last_name[0]}`
      : participant?.username?.[0]?.toUpperCase() || '?'

    return { name, initials, avatar: participant?.avatar_url }
  }

  const formatTimestamp = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60)
    
    if (diffInHours < 1) {
      const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60))
      return diffInMinutes < 1 ? 'Just now' : `${diffInMinutes}m ago`
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)}h ago`
    } else {
      const diffInDays = Math.floor(diffInHours / 24)
      return diffInDays === 1 ? '1 day ago' : `${diffInDays} days ago`
    }
  }

  const formatLastMessage = (conversation: Conversation) => {
    if (!conversation.last_message_content) return 'No messages yet'
    
    const maxLength = 45
    const content = conversation.last_message_content
    
    if (content.length <= maxLength) return content
    return content.substring(0, maxLength) + '...'
  }

  return (
    <div className={cn("flex flex-col h-full bg-background border-r", className)}>
      {/* Header */}
      <div className="p-4 border-b bg-background">
        <div className="flex items-center gap-2 mb-4">
          <MessageCircle className="h-5 w-5 text-primary" />
          <h2 className="text-lg font-semibold">Messages</h2>
        </div>
        
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search conversations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 bg-muted/50 border-muted focus:bg-background"
          />
        </div>
      </div>

      {/* Conversations List */}
      <div className="flex-1 overflow-y-auto">
        {filteredConversations.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center space-y-4 p-6">
              <div className="h-12 w-12 mx-auto text-muted-foreground">💬</div>
              <div>
                <h3 className="text-lg font-medium">No conversations</h3>
                <p className="text-sm text-muted-foreground">
                  {searchQuery ? 'No matches found' : 'Start a new conversation'}
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-1 p-2">
            {filteredConversations.map((conversation) => {
              const participantInfo = getParticipantInfo(conversation)
              const unreadCount = getUnreadCount(conversation.id)
              const isSelected = selectedConversation?.id === conversation.id
              
              if (!participantInfo) return null

              return (
                <Button
                  key={conversation.id}
                  variant="ghost"
                  onClick={() => onSelectConversation(conversation)}
                  className={cn(
                    "w-full h-auto p-3 justify-start hover:bg-muted/50 transition-colors",
                    "rounded-lg border-2 border-transparent",
                    isSelected && "bg-muted border-primary/20 shadow-sm"
                  )}
                >
                  <div className="flex items-start gap-3 w-full">
                    {/* Avatar */}
                    <div className="relative">
                      <Avatar className="h-11 w-11 shrink-0">
                        <AvatarImage src={participantInfo.avatar} />
                        <AvatarFallback className="bg-primary/10 text-primary font-medium">
                          {participantInfo.initials}
                        </AvatarFallback>
                      </Avatar>
                      
                      {/* Online status indicator (optional) */}
                      <div className="absolute -bottom-0 -right-0 h-3 w-3 bg-green-500 border-2 border-background rounded-full" />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0 text-left">
                      {/* Header Row */}
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <div className="flex-1 min-w-0">
                          <h4 className={cn(
                            "font-medium text-sm truncate",
                            unreadCount > 0 ? "text-foreground" : "text-foreground/90"
                          )}>
                            {participantInfo.name}
                          </h4>
                          <p className="text-xs text-muted-foreground truncate">
                            {conversation.studios?.name} • {conversation.inquiries?.project_type}
                          </p>
                        </div>
                        
                        <div className="flex flex-col items-end gap-1 shrink-0">
                          <span className="text-xs text-muted-foreground">
                            {formatTimestamp(conversation.last_message_at)}
                          </span>
                          {unreadCount > 0 && (
                            <Badge 
                              variant="default" 
                              className="h-5 min-w-[20px] px-1.5 text-xs bg-primary text-primary-foreground"
                            >
                              {unreadCount > 99 ? '99+' : unreadCount}
                            </Badge>
                          )}
                        </div>
                      </div>

                      {/* Last Message */}
                      <p className={cn(
                        "text-sm text-muted-foreground truncate",
                        unreadCount > 0 && "font-medium text-foreground/80"
                      )}>
                        {formatLastMessage(conversation)}
                      </p>
                    </div>
                  </div>
                </Button>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
} 