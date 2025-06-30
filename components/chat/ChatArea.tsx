import React, { useEffect, useRef, useState } from 'react'
import { ArrowLeft, MoreVertical } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { 
  ChatBubble,
  ChatBubbleAvatar,
  ChatBubbleMessage,
  ChatBubbleTimestamp
} from '@/src/components/ui/chat/chat-bubble'
import { ChatMessageList } from '@/src/components/ui/chat/chat-message-list'
import { useChatStore, type Message } from '@/hooks/useChatStore'
import { cn } from '@/lib/utils'
import { EmojiPickerComponent } from './EmojiPicker'
import { AnimatedChatInput } from './AnimatedChatInput'
import { FileAttachment } from './FileAttachment'

interface ChatAreaProps {
  onBack?: () => void
}

export function ChatArea({ onBack }: ChatAreaProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const [inputValue, setInputValue] = useState('')
  
  const {
    selectedConversation,
    messages,
    currentProfileId,
    sending,
    fetchMessages,
    sendMessage,
    setupMessageSubscription
  } = useChatStore()

  // Fetch messages when conversation changes
  useEffect(() => {
    if (selectedConversation?.id) {
      fetchMessages(selectedConversation.id)
      const cleanup = setupMessageSubscription(selectedConversation.id)
      return cleanup
    }
  }, [selectedConversation?.id, fetchMessages, setupMessageSubscription])

  // Auto scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const handleSendMessage = async (content: string) => {
    if (!selectedConversation?.id || !content.trim() || sending) return
    
    // Clear input immediately for better UX
    setInputValue('')
    
    // Send to backend - NO optimistic updates to avoid flash/disappear
    try {
      await sendMessage(content, selectedConversation.id)
      // Let real-time subscription handle adding the message
    } catch (error) {
      console.error('Failed to send message:', error)
      // Restore input value on error
      setInputValue(content)
    }
  }

  const handleEmojiClick = (emoji: string) => {
    setInputValue(prev => prev + emoji)
  }

  const handleFilesSelected = (files: File[]) => {
    // TODO: Implement file upload to Supabase storage
    console.log('Files selected:', files)
    // For now, just add a placeholder message
    const fileNames = files.map(f => f.name).join(', ')
    setInputValue(prev => prev + ` [Files: ${fileNames}]`)
  }

  const getParticipantInfo = () => {
    if (!selectedConversation || !currentProfileId) return null
    
    const isCustomer = selectedConversation.customer_id === currentProfileId
    const participant = isCustomer 
      ? selectedConversation.studio_owner_profile 
      : selectedConversation.customer_profile
    
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
    
    if (diffInHours < 24) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    } else {
      return `${date.toLocaleDateString([], { month: 'short', day: 'numeric' })} at ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
    }
  }

  const renderMessageContent = (message: Message) => {
    if (message.message_type === 'quote' && message.quote_amount && message.quote_amount > 0) {
      return (
        <div className="space-y-2">
          <div className="bg-primary/10 border border-primary/20 rounded-lg p-3">
            <div className="text-sm font-medium text-primary mb-1">Quote Response</div>
            <div className="text-lg font-bold text-primary">
              €{message.quote_amount}
            </div>
          </div>
          {message.content && (
            <div className="text-sm">{message.content}</div>
          )}
        </div>
      )
    }
    
    return message.content
  }

  if (!selectedConversation) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center space-y-4">
          <div className="h-12 w-12 mx-auto text-muted-foreground">💬</div>
          <div>
            <h3 className="text-lg font-medium">Select a conversation</h3>
            <p className="text-sm text-muted-foreground">
              Choose a conversation from the sidebar to start messaging
            </p>
          </div>
        </div>
      </div>
    )
  }

  const participantInfo = getParticipantInfo()

  return (
    <div className="flex flex-col h-full">
      {/* Header - Simplified */}
      <div className="border-b p-4 bg-background">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            {onBack && (
              <Button variant="ghost" size="icon" onClick={onBack} className="mr-2">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            )}
            
            {participantInfo && (
              <>
                <Avatar className="h-10 w-10 mr-3">
                  <AvatarImage src={participantInfo.avatar} />
                  <AvatarFallback>{participantInfo.initials}</AvatarFallback>
                </Avatar>
                
                <div>
                  <h3 className="font-medium text-base">
                    {participantInfo.name}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {selectedConversation.studios?.name} • {selectedConversation.inquiries?.project_type}
                  </p>
                </div>
              </>
            )}
          </div>
          
          {/* Only keep options menu */}
          <Button variant="ghost" size="icon">
            <MoreVertical className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-hidden bg-background">
        <ChatMessageList className="p-4 space-y-4">
          {messages.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center space-y-4">
                <div className="h-12 w-12 mx-auto text-muted-foreground">💭</div>
                <div>
                  <h3 className="text-lg font-medium">Start the conversation</h3>
                  <p className="text-sm text-muted-foreground">
                    Send a message to begin your discussion about the project
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <>
              {messages.map((message) => {
                const isOwn = message.sender_id === currentProfileId
                const senderInfo = isOwn ? null : {
                  name: message.sender_profile?.first_name && message.sender_profile?.last_name
                    ? `${message.sender_profile.first_name} ${message.sender_profile.last_name}`
                    : message.sender_profile?.username || 'Unknown',
                  initials: message.sender_profile?.first_name && message.sender_profile?.last_name
                    ? `${message.sender_profile.first_name[0]}${message.sender_profile.last_name[0]}`
                    : message.sender_profile?.username?.[0]?.toUpperCase() || '?',
                  avatar: message.sender_profile?.avatar_url
                }

                return (
                  <div
                    key={message.id}
                    className={cn(
                      "flex w-full",
                      isOwn ? "justify-end" : "justify-start"
                    )}
                  >
                    <div
                      className={cn(
                        "flex gap-2 max-w-[70%]",
                        isOwn ? "flex-row-reverse" : "flex-row"
                      )}
                    >
                      {/* Avatar for receiver only */}
                      {!isOwn && senderInfo && (
                        <Avatar className="w-8 h-8 shrink-0">
                          <AvatarImage src={senderInfo.avatar} />
                          <AvatarFallback className="text-xs">
                            {senderInfo.initials}
                          </AvatarFallback>
                        </Avatar>
                      )}
                      
                      {/* Message Bubble */}
                      <div className="flex flex-col">
                        <div
                          className={cn(
                            "px-4 py-3 rounded-2xl break-words",
                            isOwn 
                              ? "bg-primary text-primary-foreground rounded-br-md ml-auto" 
                              : "bg-muted text-foreground rounded-bl-md"
                          )}
                        >
                          {renderMessageContent(message)}
                        </div>
                        
                        {/* Timestamp */}
                        <div
                          className={cn(
                            "text-xs mt-1 px-1",
                            isOwn ? "text-right text-primary/70" : "text-left text-muted-foreground"
                          )}
                        >
                          {formatTimestamp(message.created_at)}
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
              <div ref={messagesEndRef} />
            </>
          )}
        </ChatMessageList>
      </div>

      {/* Enhanced Input Area */}
      <div className="border-t p-4 bg-background">
        <div className="flex items-end gap-2">
          {/* Emoji Picker */}
          <EmojiPickerComponent onEmojiClick={handleEmojiClick} />
          
          {/* File Attachment */}
          <FileAttachment onFilesSelected={handleFilesSelected} />
          
          {/* Animated Input */}
          <div className="flex-1">
            <AnimatedChatInput
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onSend={handleSendMessage}
              placeholder="Type a message..."
              disabled={sending}
            />
          </div>
        </div>
      </div>
    </div>
  )
} 