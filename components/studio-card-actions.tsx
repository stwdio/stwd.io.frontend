'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'
import { useQuoteBasket } from '@/lib/store/quote-basket'
import { Plus, MessageSquare, Eye } from 'lucide-react'
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
    slug?: string
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
  // OPTIMIZED: Receive interaction status to avoid individual queries
  interactionStatus?: {
    hasInquiry: boolean
    hasConversation: boolean
    conversationId?: number
  }
}

export function StudioCardActions({ 
  studio, 
  memberships = [], 
  sharedProfile, 
  profileLoading = false,
  sharedProfessionalRoles = [],
  sharedLists = [],
  listsLoading = false,
  onListsChange,
  interactionStatus
}: StudioCardActionsProps) {
  // OPTIMIZED: Use shared profile instead of individual fetching
  const profile = sharedProfile
  const loading = profileLoading
  const professionalRoles = sharedProfessionalRoles
  
  // Use passed interaction status or fetch if not provided
  const [localHasInquiry, setLocalHasInquiry] = useState(false)
  const [localHasConversation, setLocalHasConversation] = useState(false)
  
  const hasInquiry = interactionStatus?.hasInquiry ?? localHasInquiry
  const hasConversation = interactionStatus?.hasConversation ?? localHasConversation
  const conversationId = interactionStatus?.conversationId
  
  const { addStudio, isStudioInBasket, onInquirySubmitted } = useQuoteBasket()
  const router = useRouter()
  const authModal = useAuthModal()

  const isInBasket = isStudioInBasket(studio.id)

  const handleViewConversation = async () => {
    if (conversationId) {
      router.push(`/connect/chat?conversation=${conversationId}`)
    } else if (!interactionStatus) {
      // Only fetch if interaction status wasn't provided
      try {
        const { data: conversation } = await createClient()
          .from('conversations')
          .select('id')
          .eq('studio_id', studio.id)
          .eq('customer_id', profile.id)
          .single()

        if (conversation) {
          router.push(`/connect/chat?conversation=${conversation.id}`)
        } else {
          router.push('/discover/studios')
        }
      } catch (error) {
        console.error('Error finding conversation:', error)
        router.push('/discover/studios')
      }
    } else {
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

    setLocalHasInquiry((inquiryCheck && inquiryCheck.length > 0) || false)
    
    // Check for existing conversations with this studio
    // First get all conversations for this user
    const { data: userConversations } = await supabase
      .from('chat_participants')
      .select(`
        conversation_id,
        chat_conversations!inner(
          id,
          title,
          chat_participants!inner(user_id)
        )
      `)
      .eq('user_id', profileData.user_id)
    
    if (userConversations) {
      // Check if any conversation has the studio name as title
      const hasStudioConversation = userConversations.some(item => {
        const conv = item.chat_conversations
        // Check if conversation title matches studio name (case insensitive)
        return conv.title?.toLowerCase() === studio.name.toLowerCase()
      })
      
      setLocalHasConversation(hasStudioConversation)
    }
  }

  // OPTIMIZED: Check inquiry status when profile is available and status not provided
  useEffect(() => {
    if (profile && !loading && !interactionStatus) {
      checkInquiryStatus(profile)
    }
  }, [profile, loading, studio.id, interactionStatus])
  
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
          className="flex-1 text-xs bg-black hover:bg-gray-800 text-white"
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
          if (hasConversation) {
            // If conversation exists, navigate to it
            handleViewConversation()
          } else {
            // Navigate to chat with studio context
            router.push(`/connect/chat?studio=${studio.slug || studio.id}`)
          }
        }}
        className="flex-1 text-xs"
        variant="outline"
      >
        {hasConversation ? <Eye className="h-4 w-4 mr-1" /> : <MessageSquare className="h-4 w-4 mr-1" />}
        {hasConversation ? 'View Chat' : 'Enquire'}
      </Button>
      
      <Button
        size="sm"
        onClick={async (e) => {
          e.preventDefault()
          e.stopPropagation()
          if (hasInquiry) {
            // Navigate to quotes page with studio slug
            router.push(`/connect/quotes?studio=${studio.slug || studio.id}`)
            return
          }
          await addStudio(studio)
        }}
        className="flex-1 text-xs bg-black hover:bg-gray-800 text-white"
        disabled={isInBasket}
      >
        {hasInquiry ? <Eye className="h-4 w-4 mr-1" /> : <Plus className="h-4 w-4 mr-1" />}
        {hasInquiry ? 'View Quote' : isInBasket ? 'In Basket' : 'Quote'}
      </Button>
    </div>
  )
} 