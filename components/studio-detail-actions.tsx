'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useQuoteBasket } from '@/lib/store/quote-basket'
import { Plus, Edit, MessageSquare, Eye, UserCheck, UserPlus } from 'lucide-react'
import { useAuthModal } from '@/lib/hooks/use-auth-modal'
import { useStudioInteractionStatus } from '@/lib/hooks/queries/studio-interactions'
import { useFollowStudio, useUnfollowStudio } from '@/lib/hooks/mutations/social'
import { useIsFollowingStudio } from '@/lib/hooks/queries/social'
import { toast } from 'sonner'

interface Profile {
  id: number
  user_id: string
  role: 'creator' | 'owner' | 'admin' | null
}

interface StudioDetailActionsProps {
  studio: {
    id: number
    name: string
    slug?: string
    description: string
    location: string
    hourly_rate: number
    owner_id: number
    verification_status: string
  }
}

export function StudioDetailActions({ studio }: StudioDetailActionsProps) {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [userId, setUserId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const { addStudio, isStudioInBasket } = useQuoteBasket()
  const router = useRouter()
  const authModal = useAuthModal()
  
  // Use the shared hook for interaction status
  const { data: interactionStatus } = useStudioInteractionStatus(studio.id, userId)
  const hasInquiry = interactionStatus?.hasInquiry || false
  const hasConversation = interactionStatus?.hasConversation || false
  const hasEnquiry = interactionStatus?.hasEnquiry || false
  const conversationId = interactionStatus?.conversationId

  const isInBasket = isStudioInBasket(studio.id)
  
  // Follow functionality
  const { data: isFollowing } = useIsFollowingStudio(studio.id)
  const { mutate: followStudio, isPending: isFollowingPending } = useFollowStudio()
  const { mutate: unfollowStudio, isPending: isUnfollowingPending } = useUnfollowStudio()

  const handleViewConversation = () => {
    if (conversationId) {
      router.push(`/connect/chat?conversation=${conversationId}`)
    } else {
      // If we don't have a conversation ID, something went wrong
      // Navigate to chat with studio context to create a new one
      router.push(`/connect/chat?studio=${studio.slug || studio.id}`)
    }
  }
  
  const handleFollow = () => {
    if (!profile) {
      authModal.open(
        'Sign in to follow studios',
        'Create an account or sign in to follow studios.'
      )
      return
    }
    
    if (isFollowing) {
      unfollowStudio({ followingStudioId: studio.id })
    } else {
      followStudio({ followingStudioId: studio.id })
    }
  }

  useEffect(() => {
    const getProfile = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        setLoading(false)
        return
      }
      
      setUserId(user.id)

      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single()

      if (profileData) {
        setProfile(profileData)
      }

      setLoading(false)
    }

    getProfile()
  }, [])

  if (loading) {
    return (
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="h-12 bg-muted animate-pulse rounded-md sm:flex-1"></div>
        <div className="h-12 bg-muted animate-pulse rounded-md sm:flex-1"></div>
      </div>
    )
  }

  // If user is not logged in
  if (!profile) {
    return (
      <div className="flex flex-col sm:flex-row gap-3">
        <Button 
          className="sm:flex-1" 
          size="lg"
          variant="outline"
          onClick={() => {
            authModal.open("Sign in to message studios", "Create an account to start conversations with studio owners.")
          }}
        >
          <MessageSquare className="h-4 w-4 mr-2" />
          Enquire
        </Button>
        <Button 
          className="sm:flex-1"
          size="lg"
          onClick={() => {
            authModal.open("Sign in to add studios", "Create an account to add studios to your basket and send enquiries.")
          }}
        >
          <Plus className="h-4 w-4 mr-2" />
          Add to Basket
        </Button>
        <Button 
          variant="outline"
          size="lg"
          onClick={handleFollow}
          className="sm:flex-initial"
        >
          <UserPlus className="h-4 w-4 mr-2" />
          Follow
        </Button>
      </div>
    )
  }

  // For owners
  if (profile.role === 'owner' && profile.id === studio.owner_id) {
    return (
      <Button 
        className="w-full" 
        size="lg"
        onClick={() => router.push(`/workspace/studios/${studio.id}/edit`)}
      >
        <Edit className="h-4 w-4 mr-2" />
        Edit Studio
      </Button>
    )
  }

  // For creators - show Enquire, Quote and Follow buttons
  return (
    <div className="flex flex-col sm:flex-row gap-3">
      <Button 
        className="sm:flex-1" 
        size="lg"
        variant="outline"
        onClick={() => {
          if (hasConversation) {
            handleViewConversation()
          } else {
            // Navigate to chat with studio context
            router.push(`/connect/chat?studio=${studio.slug || studio.id}`)
          }
        }}
      >
        {hasConversation ? <Eye className="h-4 w-4 mr-2" /> : <MessageSquare className="h-4 w-4 mr-2" />}
        {hasConversation ? 'View Chat' : 'Enquire'}
      </Button>
      
      <Button 
        className="sm:flex-1"
        size="lg"
        onClick={async () => {
          if (!isInBasket && !hasEnquiry) {
            await addStudio(studio)
          }
        }}
        disabled={isInBasket || hasEnquiry}
      >
        <Plus className="h-4 w-4 mr-2" />
        {hasEnquiry ? 'Already Quoted' : isInBasket ? 'Added' : 'Add to Basket'}
      </Button>
      
      <Button 
        variant={isFollowing ? "secondary" : "outline"}
        size="lg"
        onClick={handleFollow}
        disabled={isFollowingPending || isUnfollowingPending}
        className="sm:flex-initial"
      >
        {isFollowing ? (
          <>
            <UserCheck className="h-4 w-4 mr-2" />
            Following
          </>
        ) : (
          <>
            <UserPlus className="h-4 w-4 mr-2" />
            Follow
          </>
        )}
      </Button>
    </div>
  )
}