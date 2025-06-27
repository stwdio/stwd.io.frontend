'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { ConversationList } from '@/components/conversation-list'
import { ChatInterface } from '@/components/chat-interface'
import { Card, CardContent } from '@/components/ui/card'
import { MessageSquare, Users } from 'lucide-react'

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
  unread_count: number
  last_message_content: string
}

export default function MessagesPage() {
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null)
  const [currentProfileId, setCurrentProfileId] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchCurrentProfile()
  }, [])

  const fetchCurrentProfile = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        setLoading(false)
        return
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('id')
        .eq('user_id', session.user.id)
        .single()

      if (profile) {
        setCurrentProfileId(profile.id)
      }
    } catch (error) {
      console.error('Error fetching profile:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px] p-6">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading messages...</p>
        </div>
      </div>
    )
  }

  if (!currentProfileId) {
    return (
      <div className="flex items-center justify-center min-h-[400px] p-6">
        <div className="text-center space-y-4">
          <MessageSquare className="h-12 w-12 mx-auto text-muted-foreground" />
          <div>
            <h3 className="text-lg font-medium">Authentication Required</h3>
            <p className="text-sm text-muted-foreground">
              Please log in to access your messages
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold flex items-center">
          <MessageSquare className="h-8 w-8 mr-3" />
          Messages
        </h1>
        <p className="text-muted-foreground mt-2">
          Communicate with clients and studio owners about your projects
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-200px)]">
        {/* Conversation List */}
        <div className="lg:col-span-1">
          <Card className="h-full">
            <CardContent className="p-0 h-full">
              <div className="border-b p-4">
                <h2 className="font-medium flex items-center">
                  <Users className="h-4 w-4 mr-2" />
                  Conversations
                </h2>
              </div>
              <div className="overflow-y-auto h-[calc(100%-60px)]">
                <ConversationList
                  onSelectConversation={setSelectedConversation}
                  selectedConversationId={selectedConversation?.id}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Chat Interface */}
        <div className="lg:col-span-2">
          <Card className="h-full">
            <CardContent className="p-0 h-full">
              {selectedConversation ? (
                <ChatInterface
                  conversation={selectedConversation}
                  currentProfileId={currentProfileId}
                />
              ) : (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center space-y-4">
                    <MessageSquare className="h-12 w-12 mx-auto text-muted-foreground" />
                    <div>
                      <h3 className="text-lg font-medium">Select a conversation</h3>
                      <p className="text-sm text-muted-foreground">
                        Choose a conversation from the list to start chatting
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
} 