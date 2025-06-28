'use client'

import { Badge } from '@/components/ui/badge'
import { IconMessage, IconCurrencyDollar, IconMessageCircle } from '@tabler/icons-react'
import { formatDistanceToNow } from 'date-fns'

interface ConversationListProps {
  conversations: any[]
  onSelectConversation: (conversation: any) => void
  selectedConversationId?: number
  currentProfileId: number
}

export function ConversationList({ 
  conversations, 
  onSelectConversation, 
  selectedConversationId,
  currentProfileId
}: ConversationListProps) {
  const getOtherParticipantName = (conversation: any) => {
    const isCustomer = conversation.customer_id === currentProfileId
    
    if (isCustomer) {
      const owner = conversation.studio_owner_profile
      if (owner?.first_name && owner?.last_name) {
        return `${owner.first_name} ${owner.last_name}`
      }
      return owner?.username || 'Studio Owner'
    } else {
      const customer = conversation.customer_profile
      if (customer?.first_name && customer?.last_name) {
        return `${customer.first_name} ${customer.last_name}`
      }
      return customer?.username || 'Customer'
    }
  }

  const getLastMessagePreview = (conversation: any) => {
    if (conversation.last_message_type === 'quote') {
      const amount = conversation.last_message_quote_amount
      return (
        <div className="flex items-center text-sm text-muted-foreground">
          <IconCurrencyDollar className="h-3 w-3 mr-1" />
          Quote: {amount ? `$${amount.toFixed(2)}` : 'No amount'}
        </div>
      )
    }
    
    if (conversation.last_message_content) {
      return (
        <p className="text-sm text-muted-foreground truncate">
          {conversation.last_message_content}
        </p>
      )
    }
    
    return (
      <p className="text-sm text-muted-foreground">
        New conversation
      </p>
    )
  }

  const getTimeAgo = (timestamp: string) => {
    try {
      return formatDistanceToNow(new Date(timestamp), { addSuffix: true })
    } catch {
      return 'Recently'
    }
  }

  if (conversations.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center space-y-4">
          <IconMessageCircle className="h-12 w-12 mx-auto text-muted-foreground" />
          <div>
            <h3 className="text-lg font-medium">No conversations yet</h3>
            <p className="text-sm text-muted-foreground">
              Your conversations will appear here when you start chatting
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {conversations.map((conversation) => {
        const hasUnread = conversation.unread_count > 0
        
        return (
          <button
            key={conversation.id}
            onClick={() => onSelectConversation(conversation)}
            className={`w-full text-left p-4 rounded-lg border transition-colors relative ${
              selectedConversationId === conversation.id
                ? 'bg-blue-50 border-blue-200'
                : 'bg-white border-gray-200 hover:bg-gray-50'
            }`}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className={`font-medium truncate ${hasUnread ? 'font-semibold' : ''}`}>
                    {getOtherParticipantName(conversation)}
                  </span>
                  {hasUnread && (
                    <Badge variant="default" className="bg-blue-600 text-white px-2 py-0.5 text-xs">
                      {conversation.unread_count}
                    </Badge>
                  )}
                </div>
                
                <div className="text-sm text-muted-foreground mb-2 truncate">
                  {conversation.studios?.name} • {conversation.inquiries?.project_type}
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    {getLastMessagePreview(conversation)}
                  </div>
                  {conversation.last_message_at && (
                    <div className="text-xs text-muted-foreground ml-2 flex-shrink-0">
                      {getTimeAgo(conversation.last_message_at)}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </button>
        )
      })}
    </div>
  )
} 