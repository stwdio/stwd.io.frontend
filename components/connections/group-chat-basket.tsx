'use client'

import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { X, MessageSquare } from 'lucide-react'
import { useMutation } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import type { Database } from '@/lib/types/database'

type Profile = Database['public']['Tables']['profiles']['Row']

interface GroupChatBasketProps {
  selectedUsers: string[]
  connections: Profile[]
  onClear: () => void
}

export function GroupChatBasket({ selectedUsers, connections, onClear }: GroupChatBasketProps) {
  const [isCreating, setIsCreating] = useState(false)
  const supabase = createClient()
  const router = useRouter()

  const selectedConnections = connections.filter(conn => 
    selectedUsers.includes(conn.user_id)
  )

  const createGroupChatMutation = useMutation({
    mutationFn: async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      // Create a new conversation with type 'group' using RPC function
      const { data: conversation, error: convError } = await supabase
        .rpc('create_chat_conversation', {
          p_is_group: true,
          p_title: null
        })
        .single()

      if (convError) throw convError

      // Add selected users as participants (creator is added automatically by trigger)
      const participants = selectedUsers.map(userId => ({
        conversation_id: conversation.id,
        user_id: userId
      }))

      if (participants.length > 0) {
        const { error: partError } = await supabase
          .from('chat_participants')
          .insert(participants)

        if (partError) throw partError
      }

      return conversation.id
    },
    onSuccess: (conversationId) => {
      router.push(`/connect/chat?conversation=${conversationId}`)
    }
  })

  const handleCreateGroupChat = async () => {
    if (selectedUsers.length < 2) return

    setIsCreating(true)
    try {
      await createGroupChatMutation.mutateAsync()
    } finally {
      setIsCreating(false)
    }
  }

  if (selectedUsers.length === 0) return null

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <Card className="w-80 shadow-lg">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-sm">
              {selectedUsers.length} Selected
            </h3>
            <Button
              size="sm"
              variant="ghost"
              onClick={onClear}
              className="h-8 w-8 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          <div className="flex flex-wrap gap-2 mb-4 max-h-32 overflow-y-auto">
            {selectedConnections.map((connection) => (
              <div key={connection.user_id} className="flex items-center gap-1 bg-muted rounded-full pr-2">
                <Avatar className="h-6 w-6">
                  <AvatarImage src={connection.avatar_url || undefined} />
                  <AvatarFallback className="text-xs">
                    {connection.first_name?.[0] || connection.username?.[0] || '?'}
                  </AvatarFallback>
                </Avatar>
                <span className="text-xs">
                  {connection.first_name || connection.username}
                </span>
              </div>
            ))}
          </div>

          <Button
            className="w-full"
            onClick={handleCreateGroupChat}
            disabled={isCreating || selectedUsers.length < 2}
          >
            <MessageSquare className="h-4 w-4 mr-2" />
            {selectedUsers.length < 2 
              ? 'Select at least 2 people' 
              : `Create Group Chat (${selectedUsers.length + 1} people)`}
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}