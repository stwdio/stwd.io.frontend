'use client'

import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Check, X, Clock } from 'lucide-react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { formatDistanceToNow } from 'date-fns'
import type { Database } from '@/lib/types/database'

type Connection = Database['public']['Tables']['connections']['Row']
type Profile = Database['public']['Tables']['profiles']['Row']

interface ConnectionRequestCardProps {
  request: Connection & {
    requester?: Profile
    receiver?: Profile
  }
  type: 'incoming' | 'outgoing'
}

export function ConnectionRequestCard({ request, type }: ConnectionRequestCardProps) {
  const [isLoading, setIsLoading] = useState(false)
  const supabase = createClient()
  const queryClient = useQueryClient()
  const router = useRouter()

  const profile = type === 'incoming' ? request.requester : request.receiver

  const acceptMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from('connections')
        .update({ status: 'accepted', updated_at: new Date().toISOString() })
        .eq('id', request.id)

      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pending-requests'] })
      queryClient.invalidateQueries({ queryKey: ['my-connections'] })
    }
  })

  const rejectMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from('connections')
        .update({ status: 'rejected', updated_at: new Date().toISOString() })
        .eq('id', request.id)

      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pending-requests'] })
    }
  })

  const cancelMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from('connections')
        .delete()
        .eq('id', request.id)

      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sent-requests'] })
    }
  })

  const handleAccept = async () => {
    setIsLoading(true)
    try {
      await acceptMutation.mutateAsync()
    } finally {
      setIsLoading(false)
    }
  }

  const handleReject = async () => {
    setIsLoading(true)
    try {
      await rejectMutation.mutateAsync()
    } finally {
      setIsLoading(false)
    }
  }

  const handleCancel = async () => {
    setIsLoading(true)
    try {
      await cancelMutation.mutateAsync()
    } finally {
      setIsLoading(false)
    }
  }

  const handleProfileClick = () => {
    if (profile?.username) {
      router.push(`/profiles/${profile.username}`)
    }
  }

  if (!profile) return null

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Avatar 
              className="h-12 w-12 cursor-pointer" 
              onClick={handleProfileClick}
            >
              <AvatarImage src={profile.avatar_url || undefined} />
              <AvatarFallback>
                {profile.first_name?.[0] || profile.username?.[0] || '?'}
              </AvatarFallback>
            </Avatar>
            <div className="space-y-1">
              <button
                onClick={handleProfileClick}
                className="text-sm font-medium hover:underline text-left"
              >
                {profile.first_name && profile.last_name
                  ? `${profile.first_name} ${profile.last_name}`
                  : profile.username || 'Unknown User'}
              </button>
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {formatDistanceToNow(new Date(request.created_at), { addSuffix: true })}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {type === 'incoming' ? (
              <>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleReject}
                  disabled={isLoading}
                >
                  <X className="h-4 w-4" />
                  <span className="sr-only">Reject</span>
                </Button>
                <Button
                  size="sm"
                  onClick={handleAccept}
                  disabled={isLoading}
                >
                  <Check className="h-4 w-4" />
                  <span className="sr-only">Accept</span>
                </Button>
              </>
            ) : (
              <Button
                size="sm"
                variant="outline"
                onClick={handleCancel}
                disabled={isLoading}
              >
                Cancel Request
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}