'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useQuoteBasket } from '@/lib/store/quote-basket'
import { Plus, Edit, MessageSquare, Eye } from 'lucide-react'
import { useAuthModal } from '@/lib/hooks/use-auth-modal'
import { useStudioInteractionStatus } from '@/lib/hooks/queries/studio-interactions'

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
  const conversationId = interactionStatus?.conversationId

  const isInBasket = isStudioInBasket(studio.id)

  const handleViewConversation = () => {
    if (conversationId) {
      router.push(`/connect/chat?conversation=${conversationId}`)
    } else {
      router.push('/discover/studios')
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
      <div className="flex gap-3">
        <div className="h-12 bg-muted animate-pulse rounded-md flex-1"></div>
        <div className="h-12 bg-muted animate-pulse rounded-md flex-1"></div>
      </div>
    )
  }

  // If user is not logged in
  if (!profile) {
    return (
      <>
        <Button 
          className="flex-1" 
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
          className="flex-1"
          size="lg"
          onClick={() => {
            authModal.open("Sign in to get quotes", "Create an account to request quotes from multiple studios at once.")
          }}
        >
          <Plus className="h-4 w-4 mr-2" />
          Quote
        </Button>
      </>
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

  // For creators - show Enquire and Quote buttons
  return (
    <>
      <Button 
        className="flex-1" 
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
        className="flex-1"
        size="lg"
        onClick={async () => {
          if (hasInquiry) {
            // Navigate to quotes page with studio filter
            router.push(`/connect/quotes?studio=${studio.slug || studio.id}`)
          } else {
            await addStudio(studio)
          }
        }}
        disabled={isInBasket && !hasInquiry}
      >
        {hasInquiry ? <Eye className="h-4 w-4 mr-2" /> : <Plus className="h-4 w-4 mr-2" />}
        {hasInquiry ? 'View Quote' : isInBasket ? 'In Basket' : 'Quote'}
      </Button>
    </>
  )
}