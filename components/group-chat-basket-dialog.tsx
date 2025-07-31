'use client'

import { useState, useEffect } from 'react'
import { useGroupChatBasket } from '@/lib/store/group-chat-basket'
import { Dialog, DialogDescription, DialogHeader, DialogTitle, DialogPortal, DialogOverlay } from '@/components/ui/dialog'
import * as DialogPrimitive from "@radix-ui/react-dialog"
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { X, MessageSquare } from 'lucide-react'
import { cn } from '@/lib/utils'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import type { Database } from '@/lib/types/database'

type Profile = Database['public']['Tables']['profiles']['Row']

export function GroupChatBasketDialog() {
  const { userIds, isOpen, toggleBasket, removeUser, clearBasket } = useGroupChatBasket()
  const [isCreating, setIsCreating] = useState(false)
  const [users, setUsers] = useState<Profile[]>([])
  const [loading, setLoading] = useState(false)
  const supabase = createClient()
  const router = useRouter()

  // Fetch user profiles when dialog opens or userIds change
  useEffect(() => {
    if (isOpen && userIds.length > 0) {
      fetchUsers()
    }
  }, [isOpen, userIds])

  const fetchUsers = async () => {
    setLoading(true)
    try {
      const { data: profiles } = await supabase
        .from('profiles')
        .select('*')
        .in('user_id', userIds)
      
      if (profiles) {
        setUsers(profiles)
      }
    } catch (error) {
      console.error('Error fetching users:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateGroupChat = async () => {
    if (userIds.length < 2) {
      toast.error('Please select at least 2 people for a group chat')
      return
    }

    setIsCreating(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      // Create a new conversation with type 'group'
      const { data: conversation, error: convError } = await supabase
        .from('chat_conversations')
        .insert({
          is_group: true,
          created_by: user.id
        })
        .select()
        .single()

      if (convError) throw convError

      // Add selected users as participants (creator is added automatically by trigger)
      const participants = userIds.map(userId => ({
        conversation_id: conversation.id,
        user_id: userId
      }))

      if (participants.length > 0) {
        const { error: partError } = await supabase
          .from('chat_participants')
          .insert(participants)

        if (partError) throw partError
      }

      // Clear basket and close dialog
      clearBasket()
      toggleBasket()
      
      // Navigate to the new group chat
      router.push(`/connect/chat?conversation=${conversation.id}`)
      
      toast.success('Group chat created successfully')
    } catch (error: any) {
      console.error('Error creating group chat:', error)
      toast.error(error.message || 'Failed to create group chat')
    } finally {
      setIsCreating(false)
    }
  }

  const getDisplayName = (profile: Profile) => {
    return profile.first_name && profile.last_name
      ? `${profile.first_name} ${profile.last_name}`
      : profile.username || 'Unknown User'
  }

  const getAvatarUrl = (profile: Profile) => {
    return profile.avatar_url || 
      `https://api.dicebear.com/9.x/thumbs/svg?seed=${profile.user_id}&backgroundColor=ffffff&shapeColor=000000`
  }

  return (
    <Dialog open={isOpen} onOpenChange={toggleBasket}>
      <DialogPortal>
        <DialogOverlay />
        <DialogPrimitive.Content
          className={cn(
            "fixed left-[50%] top-[50%] z-50 grid w-full max-w-2xl max-h-[90vh] overflow-y-auto translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-6 shadow-lg duration-200",
            "data-[state=open]:animate-in data-[state=closed]:animate-out",
            "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
            "data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95",
            "sm:rounded-lg"
          )}
        >
          <DialogPrimitive.Close className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground">
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </DialogPrimitive.Close>
          
          <DialogHeader>
            <DialogTitle>Create Group Chat</DialogTitle>
            <DialogDescription>
              Review your selected connections and create a group chat
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Selected Users List */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold">Selected People ({users.length})</h3>
                {users.length > 0 && (
                  <Button variant="outline" size="sm" onClick={clearBasket}>
                    Clear All
                  </Button>
                )}
              </div>
              
              {loading ? (
                <div className="space-y-2">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="bg-muted rounded-lg h-16 animate-pulse" />
                  ))}
                </div>
              ) : users.length === 0 ? (
                <Card>
                  <CardContent className="pt-6">
                    <p className="text-center text-muted-foreground">
                      No people selected. Go back to connections and select people for your group chat.
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-2">
                  {users.map((user) => (
                    <Card key={user.user_id}>
                      <CardContent className="p-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <Avatar className="h-10 w-10">
                              <AvatarImage src={getAvatarUrl(user)} alt={getDisplayName(user)} />
                              <AvatarFallback>
                                {getDisplayName(user).charAt(0).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium">{getDisplayName(user)}</p>
                              {user.username && (
                                <p className="text-sm text-muted-foreground">@{user.username}</p>
                              )}
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeUser(user.user_id)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>

            {/* Info message */}
            {users.length >= 2 && (
              <div className="bg-muted rounded-lg p-4">
                <p className="text-sm text-muted-foreground">
                  You'll be added to the group chat along with the {users.length} selected people, 
                  making it a total of {users.length + 1} participants.
                </p>
              </div>
            )}

            {/* Action buttons */}
            <div className="flex gap-3 pt-4">
              <Button 
                onClick={handleCreateGroupChat}
                disabled={users.length < 2 || isCreating}
                className="flex-1"
              >
                <MessageSquare className="h-4 w-4 mr-2" />
                {isCreating ? 'Creating...' : `Create Group Chat (${users.length + 1} people)`}
              </Button>
              <Button variant="outline" onClick={toggleBasket}>
                Cancel
              </Button>
            </div>
          </div>
        </DialogPrimitive.Content>
      </DialogPortal>
    </Dialog>
  )
}