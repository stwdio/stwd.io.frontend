'use client'

import { useState, useEffect, useRef } from 'react'
import { supabase } from '@/lib/supabase'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Send, DollarSign, User, Calendar, MapPin, Music, MessageSquare, FileText } from 'lucide-react'
import { generateIdenticon } from '@/lib/identicon'
import { toast } from 'sonner'

interface Message {
  id: number
  conversation_id: number
  sender_id: number
  content: string
  message_type: string
  quote_amount?: number
  file_url?: string
  file_name?: string
  file_size?: number
  read_at?: string
  created_at: string
  sender_profile: {
    first_name: string
    last_name: string
    username: string
    user_id: string
  }
}

interface Conversation {
  id: number
  inquiry_id: number
  customer_id: number
  studio_owner_id: number
  studio_id: number
  status: string
  last_message_at: string
  created_at: string
  inquiries: {
    project_type: string
    genre: string
    budget_range: string
    preferred_dates: string
    location_preference: string
    custom_message: string
  }
  studios: {
    name: string
    location: string
    hourly_rate: number
  }
  customer_profile: {
    first_name: string
    last_name: string
    username: string
    user_id: string
  }
  studio_owner_profile: {
    first_name: string
    last_name: string
    username: string
    user_id: string
  }
}

interface ChatInterfaceProps {
  conversation: Conversation
  currentProfileId: number
}

export function ChatInterface({ conversation, currentProfileId }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [showQuoteDialog, setShowQuoteDialog] = useState(false)
  const [quoteAmount, setQuoteAmount] = useState('')
  const [quoteMessage, setQuoteMessage] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    fetchMessages()
    markMessagesAsRead()
    
    // Set up real-time subscription
    const channel = supabase
      .channel(`conversation-${conversation.id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${conversation.id}`
        },
        (payload) => {
          fetchMessages() // Refetch to get complete message with sender profile
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [conversation.id])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const fetchMessages = async () => {
    try {
      const { data, error } = await supabase
        .from('messages')
        .select(`
          *,
          sender_profile:sender_id (
            first_name,
            last_name,
            username,
            user_id
          )
        `)
        .eq('conversation_id', conversation.id)
        .order('created_at', { ascending: true })

      if (error) throw error
      setMessages(data || [])
    } catch (error) {
      console.error('Error fetching messages:', error)
      toast.error('Failed to load messages')
    } finally {
      setLoading(false)
    }
  }

  const markMessagesAsRead = async () => {
    try {
      const { error } = await supabase.rpc('mark_messages_read', {
        conversation_id_param: conversation.id
      })
      
      if (error) throw error
    } catch (error) {
      console.error('Error marking messages as read:', error)
    }
  }

  const sendMessage = async (messageType: string = 'text', quoteAmount?: number) => {
    if ((!newMessage.trim() && messageType === 'text') || sending) return

    setSending(true)
    try {
      const { error } = await supabase.rpc('send_message', {
        conversation_id_param: conversation.id,
        content_param: messageType === 'quote' ? quoteMessage : newMessage,
        message_type_param: messageType,
        quote_amount_param: quoteAmount
      })

      if (error) throw error

      setNewMessage('')
      setQuoteMessage('')
      setQuoteAmount('')
      setShowQuoteDialog(false)
      
      // Messages will be updated via real-time subscription
    } catch (error) {
      console.error('Error sending message:', error)
      toast.error('Failed to send message')
    } finally {
      setSending(false)
    }
  }

  const handleSendQuote = () => {
    const amount = parseFloat(quoteAmount)
    if (isNaN(amount) || amount <= 0) {
      toast.error('Please enter a valid quote amount')
      return
    }
    sendMessage('quote', amount)
  }

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const formatMessageTime = (timestamp: string) => {
    const date = new Date(timestamp)
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  const formatQuoteAmount = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount)
  }

  const getOtherParticipant = () => {
    return conversation.customer_id === currentProfileId 
      ? conversation.studio_owner_profile 
      : conversation.customer_profile
  }

  const getChatTitle = () => {
    const otherParticipant = getOtherParticipant()
    const isCustomer = conversation.customer_id === currentProfileId
    
    if (isCustomer) {
      return conversation.studios.name
    } else {
      return `${otherParticipant.first_name} ${otherParticipant.last_name}`
    }
  }

  const otherParticipant = getOtherParticipant()

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center space-y-2">
          <MessageSquare className="h-8 w-8 mx-auto opacity-50" />
          <p className="text-sm text-muted-foreground">Loading messages...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full">
      {/* Chat Header */}
      <div className="border-b p-4">
        <div className="flex items-center space-x-3">
          <Avatar className="h-10 w-10">
            <AvatarImage 
              src={generateIdenticon(otherParticipant.user_id) || "/placeholder.svg"} 
              alt={`${otherParticipant.first_name} ${otherParticipant.last_name}`}
            />
            <AvatarFallback>
              <User className="h-5 w-5" />
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1">
            <h3 className="font-medium">{getChatTitle()}</h3>
            <p className="text-sm text-muted-foreground">
              {conversation.inquiries.project_type}
              {conversation.inquiries.genre && ` • ${conversation.inquiries.genre}`}
            </p>
          </div>
        </div>
      </div>

      {/* Project Details Card */}
      <div className="p-4 border-b bg-muted/20">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center">
              <FileText className="h-4 w-4 mr-2" />
              Project Details
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="space-y-2">
                <div className="flex items-center text-muted-foreground">
                  <Music className="h-4 w-4 mr-2" />
                  <span>Type: {conversation.inquiries.project_type}</span>
                </div>
                {conversation.inquiries.genre && (
                  <div className="flex items-center text-muted-foreground">
                    <Music className="h-4 w-4 mr-2" />
                    <span>Genre: {conversation.inquiries.genre}</span>
                  </div>
                )}
                {conversation.inquiries.budget_range && (
                  <div className="flex items-center text-muted-foreground">
                    <DollarSign className="h-4 w-4 mr-2" />
                    <span>Budget: {conversation.inquiries.budget_range}</span>
                  </div>
                )}
              </div>
              <div className="space-y-2">
                {conversation.inquiries.preferred_dates && (
                  <div className="flex items-center text-muted-foreground">
                    <Calendar className="h-4 w-4 mr-2" />
                    <span>Dates: {conversation.inquiries.preferred_dates}</span>
                  </div>
                )}
                {conversation.inquiries.location_preference && (
                  <div className="flex items-center text-muted-foreground">
                    <MapPin className="h-4 w-4 mr-2" />
                    <span>Location: {conversation.inquiries.location_preference}</span>
                  </div>
                )}
              </div>
            </div>
            {conversation.inquiries.custom_message && (
              <div className="mt-3 pt-3 border-t">
                <p className="text-sm text-muted-foreground">
                  <strong>Original Message:</strong> {conversation.inquiries.custom_message}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => {
          const isOwnMessage = message.sender_id === currentProfileId
          
          return (
            <div
              key={message.id}
              className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`flex items-start space-x-2 max-w-[70%] ${isOwnMessage ? 'flex-row-reverse space-x-reverse' : ''}`}>
                {!isOwnMessage && (
                  <Avatar className="h-8 w-8">
                    <AvatarImage 
                      src={generateIdenticon(message.sender_profile.user_id) || "/placeholder.svg"} 
                      alt={`${message.sender_profile.first_name} ${message.sender_profile.last_name}`}
                    />
                    <AvatarFallback>
                      <User className="h-4 w-4" />
                    </AvatarFallback>
                  </Avatar>
                )}
                
                <div className={`rounded-lg p-3 ${
                  isOwnMessage 
                    ? 'bg-primary text-primary-foreground' 
                    : 'bg-muted'
                }`}>
                  {message.message_type === 'quote' && message.quote_amount && (
                    <div className="mb-2">
                      <Badge variant={isOwnMessage ? "secondary" : "default"} className="mb-2">
                        <DollarSign className="h-3 w-3 mr-1" />
                        Quote: {formatQuoteAmount(message.quote_amount)}
                      </Badge>
                    </div>
                  )}
                  
                  <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                  
                  <div className={`text-xs mt-2 ${
                    isOwnMessage ? 'text-primary-foreground/70' : 'text-muted-foreground'
                  }`}>
                    {formatMessageTime(message.created_at)}
                  </div>
                </div>
              </div>
            </div>
          )
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <div className="border-t p-4">
        <div className="flex space-x-2">
          <Input
            placeholder="Type your message..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault()
                sendMessage()
              }
            }}
            disabled={sending}
          />
          
          <Dialog open={showQuoteDialog} onOpenChange={setShowQuoteDialog}>
            <DialogTrigger asChild>
              <Button variant="outline" size="icon">
                <DollarSign className="h-4 w-4" />
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Send Quote</DialogTitle>
                <DialogDescription>
                  Send a quote for this project
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="quote-amount">Quote Amount ($)</Label>
                  <Input
                    id="quote-amount"
                    type="number"
                    placeholder="Enter amount"
                    value={quoteAmount}
                    onChange={(e) => setQuoteAmount(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="quote-message">Message</Label>
                  <Textarea
                    id="quote-message"
                    placeholder="Add details about your quote..."
                    value={quoteMessage}
                    onChange={(e) => setQuoteMessage(e.target.value)}
                    rows={3}
                  />
                </div>
                <Button onClick={handleSendQuote} disabled={sending}>
                  Send Quote
                </Button>
              </div>
            </DialogContent>
          </Dialog>
          
          <Button onClick={() => sendMessage()} disabled={sending || !newMessage.trim()}>
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
} 