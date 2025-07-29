'use client'

import { cn } from '@/lib/utils'
import { STWDMessage } from '@/hooks/use-stwd-realtime-chat'
import { useChatScroll } from '@/hooks/use-chat-scroll'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Send, Download, DollarSign, Clock } from 'lucide-react'
import { useState, useEffect } from 'react'

interface STWDMessageItemProps {
  message: STWDMessage
  isOwnMessage: boolean
  showHeader: boolean
}

export const STWDMessageItem = ({ message, isOwnMessage, showHeader }: STWDMessageItemProps) => {
  const senderName = message.sender_profile?.first_name && message.sender_profile?.last_name
    ? `${message.sender_profile.first_name} ${message.sender_profile.last_name}`
    : message.sender_profile?.username || 'Unknown User'

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    })
  }

  const renderMessageContent = () => {
    switch (message.message_type) {
      case 'quote':
        return (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm font-medium">
              <DollarSign className="h-4 w-4" />
              Quote Response
            </div>
                  {message.quote_amount && (
        <div className="text-lg font-bold">
          ${message.quote_amount.toLocaleString()}
        </div>
      )}
            <p className="text-sm">{message.content}</p>
          </div>
        )
      
      case 'file':
        return (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm font-medium">
              <Download className="h-4 w-4" />
              File Attachment
            </div>
            {message.file_name && (
              <p className="text-sm font-medium">{message.file_name}</p>
            )}
            {message.file_size && (
              <p className="text-xs text-muted-foreground">
                {(message.file_size / 1024 / 1024).toFixed(2)} MB
              </p>
            )}
            {message.content && <p className="text-sm">{message.content}</p>}
            {message.file_url && (
              <Button variant="outline" size="sm" asChild>
                <a href={message.file_url} target="_blank" rel="noopener noreferrer">
                  <Download className="h-3 w-3 mr-1" />
                  Download
                </a>
              </Button>
            )}
          </div>
        )
      
      case 'system':
        return (
          <div className="flex items-center gap-2 text-sm italic text-muted-foreground">
            <Clock className="h-4 w-4" />
            {message.content}
          </div>
        )
      
      default:
        return <p className="text-sm">{message.content}</p>
    }
  }

  if (message.message_type === 'system') {
    return (
      <div className="flex justify-center my-4">
        <div className="bg-muted px-3 py-1 rounded-full">
          {renderMessageContent()}
        </div>
      </div>
    )
  }

  return (
    <div className={`flex mt-2 ${isOwnMessage ? 'justify-end' : 'justify-start'}`}>
      <div
        className={cn('max-w-[75%] w-fit flex flex-col gap-1', {
          'items-end': isOwnMessage,
        })}
      >
        {showHeader && (
          <div
            className={cn('flex items-center gap-2 text-xs px-3', {
              'justify-end flex-row-reverse': isOwnMessage,
            })}
          >
            <span className="font-medium">{senderName}</span>
            <span className="text-foreground/50 text-xs">
              {formatTime(message.created_at)}
            </span>
          </div>
        )}
        <div
          className={cn(
            'py-3 px-4 rounded-xl text-sm w-fit',
            message.message_type === 'quote' ? 'border-2 border-primary/20' : '',
            isOwnMessage 
              ? 'bg-primary text-primary-foreground' 
              : 'bg-muted text-foreground'
          )}
        >
          {renderMessageContent()}
        </div>
      </div>
    </div>
  )
}

interface STWDChatAreaProps {
  messages: STWDMessage[]
  currentUserId: number
  onSendMessage: (content: string, messageType?: 'text' | 'quote', additionalData?: Record<string, unknown>) => void
  isConnected: boolean
  conversationTitle: string
  onBack?: () => void
  connectionError?: string | null
}

export function STWDChatArea({
  messages,
  currentUserId,
  onSendMessage,
  isConnected,
  conversationTitle,
  onBack,
  connectionError
}: STWDChatAreaProps) {
  const { containerRef, scrollToBottom } = useChatScroll()
  const [newMessage, setNewMessage] = useState('')

  useEffect(() => {
    scrollToBottom()
  }, [messages, scrollToBottom])

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMessage.trim() || !isConnected) return

    onSendMessage(newMessage)
    setNewMessage('')
  }

  return (
    <div className="flex flex-col h-full w-full bg-background text-foreground antialiased min-h-0">
      {/* Header */}
      <div className="flex items-center gap-3 p-4 border-b border-border shrink-0">
        {onBack && (
          <Button variant="ghost" size="sm" onClick={onBack}>
            ←
          </Button>
        )}
        <div className="flex-1">
          <h2 className="font-semibold text-lg">{conversationTitle}</h2>
          <p className="text-sm text-muted-foreground">
            {connectionError ? (
              <span className="text-orange-500">{connectionError}</span>
            ) : isConnected ? (
              'Connected'
            ) : (
              'Connecting...'
            )}
          </p>
        </div>
      </div>

      {/* Messages */}
      <div ref={containerRef} className="flex-1 overflow-y-auto p-4 space-y-4 min-h-0">
        {messages.length === 0 ? (
          <div className="text-center text-sm text-muted-foreground py-8">
            No messages yet. Start the conversation!
          </div>
        ) : null}
        <div className="space-y-1">
          {messages.map((message, index) => {
            const prevMessage = index > 0 ? messages[index - 1] : null
            const showHeader = !prevMessage || prevMessage.sender_id !== message.sender_id

            return (
              <div
                key={message.id}
                className="animate-in fade-in slide-in-from-bottom-4 duration-300"
              >
                <STWDMessageItem
                  message={message}
                  isOwnMessage={message.sender_id === currentUserId}
                  showHeader={showHeader}
                />
              </div>
            )
          })}
        </div>
      </div>

      {/* Input */}
      <form onSubmit={handleSendMessage} className="flex w-full gap-2 border-t border-border px-4 py-3 shrink-0">
        <Input
          className={cn(
            'rounded-full bg-background text-sm transition-all duration-300',
            isConnected && newMessage.trim() ? 'w-[calc(100%-36px)]' : 'w-full'
          )}
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type a message..."
          disabled={!isConnected}
        />
        {isConnected && newMessage.trim() && (
          <Button
            className="aspect-square rounded-full animate-in fade-in slide-in-from-right-4 duration-300"
            type="submit"
            disabled={!isConnected}
          >
            <Send className="size-4" />
          </Button>
        )}
      </form>
    </div>
  )
} 