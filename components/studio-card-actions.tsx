'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'
import { useQuoteBasket } from '@/lib/store/quote-basket'
import { Plus, MessageSquare } from 'lucide-react'
import { toast } from 'sonner'
import { useAuthModal } from '@/lib/hooks/use-auth-modal'

interface Profile {
  id: number
  user_id: string
  system_role: 'user' | 'admin' | null
}

interface ProfessionalRole {
  role_id: number
  role: {
    id: number
    name: string
    slug: string
    description: string | null
  }
}

interface StudioCardActionsProps {
  studio: {
    id: number
    name: string
    description: string
    location: string
    hourly_rate: number
    owner_id: string
    verification_status: string
  }
  // OPTIMIZED: Receive membership data as props to avoid individual server action calls
  memberships?: {list_id: number, list_name: string, list_icon_emoji: string}[]
  // OPTIMIZED: Receive shared profile data to eliminate individual auth calls
  sharedProfile?: Profile | null
  profileLoading?: boolean
  // OPTIMIZED: Receive shared professional roles
  sharedProfessionalRoles?: ProfessionalRole[]
  // OPTIMIZED: Receive shared lists data to eliminate individual list fetches per dropdown
  sharedLists?: any[]
  listsLoading?: boolean
  onListsChange?: () => void
}

export function StudioCardActions({ 
  studio, 
  memberships = [], 
  sharedProfile, 
  profileLoading = false,
  sharedProfessionalRoles = [],
  sharedLists = [],
  listsLoading = false,
  onListsChange
}: StudioCardActionsProps) {
  // OPTIMIZED: Use shared profile instead of individual fetching
  const profile = sharedProfile
  const loading = profileLoading
  const professionalRoles = sharedProfessionalRoles
  const [hasInquiry, setHasInquiry] = useState(false)
  const [hasConversation, setHasConversation] = useState(false)
  const { addStudio, isStudioInBasket, onInquirySubmitted } = useQuoteBasket()
  const router = useRouter()
  const authModal = useAuthModal()

  const isInBasket = isStudioInBasket(studio.id)

  const handleViewConversation = async () => {
    if (!profile) return

    try {
      // Find the conversation for this studio and creator
      const { data: conversation, error } = await createClient()
        .from('conversations')
        .select('id')
        .eq('studio_id', studio.id)
        .eq('customer_id', profile.id)
        .single()

      if (error) {
        console.error('Error finding conversation:', error)
        // If no conversation exists, route to discover page instead
        router.push('/discover/studios')
        return
      }

      if (!conversation) {
        // If no conversation exists, route to discover page instead
        router.push('/discover/studios')
        return
      }

      // Navigate to messages page with conversation selected
      router.push(`/connect/chat?conversation=${conversation.id}`)
    } catch (error) {
      console.error('Error navigating to conversation:', error)
      // Fallback to discover page
      router.push('/discover/studios')
    }
  }

  const checkInquiryStatus = async (profileData: Profile) => {
    const supabase = createClient()
    
    // Check for existing inquiries
    const { data: inquiryCheck, error } = await supabase
      .from('inquiry_recipients')
      .select(`
        inquiry_id,
        inquiries!inner(creator_id)
      `)
      .eq('studio_id', studio.id)
      .eq('inquiries.creator_id', profileData.id)
      .limit(1)

    setHasInquiry((inquiryCheck && inquiryCheck.length > 0) || false)
    
    // Check for existing conversations with this studio
    // First check if studio owner exists
    const { data: studioOwner } = await supabase
      .from('profiles')
      .select('user_id')
      .eq('id', parseInt(studio.owner_id))
      .single()
    
    if (studioOwner) {
      // Check if there's a conversation between the user and studio owner
      const { data: conversationCheck } = await supabase
        .from('chat_conversations')
        .select(`
          id,
          chat_participants!inner(user_id)
        `)
        .eq('title', studio.name)
        .limit(1)
      
      const hasStudioConversation = conversationCheck && conversationCheck.some(conv => {
        const participantIds = conv.chat_participants.map(p => p.user_id)
        return participantIds.includes(profileData.user_id) && participantIds.includes(studioOwner.user_id)
      })
      
      setHasConversation(hasStudioConversation || false)
    }
  }

  // OPTIMIZED: Check inquiry status when profile is available
  useEffect(() => {
    if (profile && !loading) {
      checkInquiryStatus(profile)
    }
  }, [profile, loading, studio.id])
  
  // Listen for inquiry submissions in a separate effect
  useEffect(() => {
    const unsubscribe = onInquirySubmitted((studioIds) => {
      // If this studio was part of the submission, refresh inquiry status
      if (studioIds.includes(studio.id) && profile) {
        checkInquiryStatus(profile)
      }
    })
    
    return unsubscribe
  }, [studio.id, profile])

  // Consistent loading state - two button slots
  if (loading) {
    return (
      <div className="flex gap-1 h-8">
        <div className="h-8 bg-muted animate-pulse rounded-md flex-1"></div>
        <div className="h-8 bg-muted animate-pulse rounded-md flex-1"></div>
      </div>
    )
  }

  // If user is not logged in - show both buttons that prompt login
  if (!profile) {
    return (
      <div className="flex gap-2 w-full">
        <Button 
          variant="outline" 
          size="sm" 
          className="flex-1 text-xs"
          onClick={(e) => {
            e.preventDefault()
            e.stopPropagation()
            authModal.open("Sign in to message studios", "Create an account to start conversations with studio owners.")
          }}
        >
          <MessageSquare className="h-4 w-4 mr-1" />
          Enquire
        </Button>
        <Button
          size="sm"
          onClick={(e) => {
            e.preventDefault()
            e.stopPropagation()
            authModal.open("Sign in to get quotes", "Create an account to request quotes from multiple studios at once.")
          }}
          className="flex-1 text-xs"
          variant="default"
        >
          <Plus className="h-4 w-4 mr-1" />
          Quote
        </Button>
      </div>
    )
  }

  // If user owns this studio OR is an admin - return null (no actions needed)
  if (profile.system_role === 'admin' || parseInt(studio.owner_id) === profile.id) {
    return null
  }

  // For creators - show both Enquire and Quote buttons
  return (
    <div className="flex gap-2 w-full">
      <Button
        size="sm"
        onClick={(e) => {
          e.preventDefault()
          e.stopPropagation()
          // Navigate to chat with studio context
          router.push(`/connect/chat?studio=${studio.slug || studio.id}`)
        }}
        className="flex-1 text-xs"
        variant="outline"
      >
        <MessageSquare className="h-4 w-4 mr-1" />
        Enquire
      </Button>
      
      <Button
        size="sm"
        onClick={async (e) => {
          e.preventDefault()
          e.stopPropagation()
          if (hasInquiry) {
            toast.error('You already have a quote request for this studio')
            return
          }
          await addStudio(studio)
        }}
        className="flex-1 text-xs"
        disabled={isInBasket || hasInquiry}
        variant={isInBasket || hasInquiry ? "secondary" : "default"}
      >
        <Plus className="h-4 w-4 mr-1" />
        {hasInquiry ? 'Quoted' : isInBasket ? 'In Basket' : 'Quote'}
      </Button>
    </div>
  )
} 