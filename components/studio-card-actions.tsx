'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'
import { useQuoteBasket } from '@/lib/store/quote-basket'
import { Plus, Eye, MessageSquare, BookmarkPlus } from 'lucide-react'
import { toast } from 'sonner'
import AddToListDropdown from './add-to-list-dropdown'
import { useAuthModal } from '@/lib/hooks/use-auth-modal'

interface Profile {
  id: number
  user_id: string
  role: 'creator' | 'owner' | 'admin' | null
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
  sharedLists = [],
  listsLoading = false,
  onListsChange
}: StudioCardActionsProps) {
  // OPTIMIZED: Use shared profile instead of individual fetching
  const profile = sharedProfile
  const loading = profileLoading
  const [hasInquiry, setHasInquiry] = useState(false)
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
        // If no conversation exists, route to creator dashboard instead
        router.push('/dashboard/creator')
        return
      }

      if (!conversation) {
        // If no conversation exists, route to creator dashboard instead
        router.push('/dashboard/creator')
        return
      }

      // Navigate to messages page with conversation selected
      router.push(`/profile/messages?conversation=${conversation.id}`)
    } catch (error) {
      console.error('Error navigating to conversation:', error)
      // Fallback to creator dashboard
      router.push('/dashboard/creator')
    }
  }

  const checkInquiryStatus = async (profileData: Profile) => {
    if (profileData.role !== 'creator') return
    
    const { data: inquiryCheck } = await createClient()
      .from('inquiry_recipients')
      .select(`
        inquiry_id,
        inquiries!inner(creator_id)
      `)
      .eq('studio_id', studio.id)
      .eq('inquiries.creator_id', profileData.id)
      .limit(1)

    setHasInquiry((inquiryCheck && inquiryCheck.length > 0) || false)
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

  // Consistent loading state - always three button slots
  if (loading) {
    return (
      <div className="flex gap-1 h-8">
        <div className="h-8 bg-muted animate-pulse rounded-md flex-1"></div>
        <div className="h-8 bg-muted animate-pulse rounded-md flex-1"></div>
        <div className="h-8 bg-muted animate-pulse rounded-md flex-1"></div>
      </div>
    )
  }

  // If user is not logged in - show creator actions (three buttons)
  if (!profile) {
    return (
      <div className="flex gap-1 h-8">
        <Button 
          variant="outline" 
          size="sm" 
          className="flex-1 pointer-events-none text-xs px-2"
        >
          <Eye className="h-4 w-4 mr-1" />
          View
        </Button>
        <Button 
          variant="outline" 
          size="sm" 
          className="flex-1 text-xs px-2"
          onClick={(e) => {
            e.preventDefault()
            e.stopPropagation()
            authModal.open("Sign in to save studios", "Create an account to save studios to your lists and organize your favorites.")
          }}
        >
          <BookmarkPlus className="h-4 w-4 mr-1" />
          List
        </Button>
        <Button
          size="sm"
          onClick={(e) => {
            e.preventDefault()
            e.stopPropagation()
            authModal.open("Sign in to get quotes", "Create an account to request quotes from multiple studios at once.")
          }}
          className="flex-1 text-xs px-2"
          variant="default"
        >
          <Plus className="h-4 w-4 mr-1" />
          Quote
        </Button>
      </div>
    )
  }

  // If user owns this studio OR is an admin - show only view button but maintain consistent height
  if (profile.role === 'admin' || parseInt(studio.owner_id) === profile.id) {
    return (
      <div className="flex gap-1 h-8">
        <Button 
          variant="outline" 
          size="sm" 
          className="w-full pointer-events-none text-xs px-2"
        >
          <Eye className="h-4 w-4 mr-1" />
          View Details
        </Button>
      </div>
    )
  }

  // For creators - show view details, list, and either "View Conversation" or "Add to Quote" (three buttons)
  return (
    <div className="flex gap-1 h-8">
      <Button 
        variant="outline" 
        size="sm" 
        className="flex-1 pointer-events-none text-xs px-2"
      >
        <Eye className="h-4 w-4 mr-1" />
        View
      </Button>
      <AddToListDropdown
        studioId={studio.id.toString()}
        studioName={studio.name}
        initialMemberships={memberships}
        sharedLists={sharedLists}
        listsLoading={listsLoading}
        onSuccess={onListsChange}
        trigger={
          <Button variant="outline" size="sm" className="flex-1 text-xs px-2">
            <BookmarkPlus className="h-4 w-4 mr-1" />
            List
          </Button>
        }
      />
      {hasInquiry ? (
        <Button
          size="sm"
          onClick={(e) => {
            e.preventDefault()
            e.stopPropagation()
            handleViewConversation()
          }}
          className="flex-1 text-xs px-2"
          variant="outline"
        >
          <MessageSquare className="h-4 w-4 mr-1" />
          Chat
        </Button>
      ) : (
        <Button
          size="sm"
          onClick={(e) => {
            e.preventDefault()
            e.stopPropagation()
            addStudio(studio)
          }}
          className="flex-1 text-xs px-2"
          disabled={isInBasket}
          variant={isInBasket ? "secondary" : "default"}
        >
          <Plus className="h-4 w-4 mr-1" />
          {isInBasket ? 'Quote' : 'Quote'}
        </Button>
      )}
    </div>
  )
} 