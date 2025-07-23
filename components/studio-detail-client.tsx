'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useQuoteBasket } from '@/lib/store/quote-basket'
import { Plus, Edit, MessageCircle, MessageSquare } from 'lucide-react'
import { toast } from 'sonner'
import { useAuthModal } from '@/lib/hooks/use-auth-modal'

interface Profile {
  id: number
  user_id: string
  role: 'creator' | 'owner' | 'admin' | null
}

interface StudioDetailActionsProps {
  studio: {
    id: number
    name: string
    description: string
    location: string
    hourly_rate: number
    owner_id: number
    verification_status: string
  }
}

export function StudioDetailActions({ studio }: StudioDetailActionsProps) {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [hasInquiry, setHasInquiry] = useState(false)
  const { addStudio, isStudioInBasket, onInquirySubmitted } = useQuoteBasket()
  const router = useRouter()
  const supabase = createClient()
  const authModal = useAuthModal()

  const isInBasket = isStudioInBasket(studio.id)

  const handleViewConversation = async () => {
    if (!profile) return

    try {
      // Find the conversation for this studio and creator
      const { data: conversation, error } = await supabase
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
    
    const { data: inquiryCheck } = await supabase
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

  useEffect(() => {
    const getProfileAndCheckInquiry = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        setLoading(false)
        return
      }

      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single()

      if (profileData) {
        setProfile(profileData)
        await checkInquiryStatus(profileData)
      }
      setLoading(false)
    }

    getProfileAndCheckInquiry()
  }, [studio.id])
  
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

  if (loading) {
    return (
      <div className="space-y-2">
        <div className="h-12 bg-muted animate-pulse rounded-md"></div>
        <div className="h-10 bg-muted animate-pulse rounded-md"></div>
      </div>
    )
  }

  // If user is not logged in - show creator actions (they'll be prompted to login)
  if (!profile) {
    return (
      <>
        <Button 
          className="w-full" 
          size="lg"
          onClick={() => authModal.open("Sign in to contact studios", "Create an account to message studio owners directly.")}
        >
          <MessageCircle className="h-4 w-4 mr-2" />
          Contact Studio
        </Button>
        
        <Button 
          variant="outline" 
          className="w-full"
          onClick={() => authModal.open("Sign in to get quotes", "Create an account to request quotes from multiple studios at once.")}
        >
          <Plus className="h-4 w-4 mr-2" />
          Quote
        </Button>
      </>
    )
  }

  // If user owns this studio OR is an admin - show edit button
  if (profile.role === 'admin' || studio.owner_id === profile.id) {
    return (
      <Button 
        className="w-full" 
        size="lg"
        onClick={() => router.push(`/dashboard/studios/${studio.id}/edit`)}
      >
        <Edit className="h-4 w-4 mr-2" />
        Edit Studio
      </Button>
    )
  }

  // For creators - show contact and either "View Inquiry" or "Quote"
  return (
    <>
      <Button className="w-full" size="lg">
        <MessageCircle className="h-4 w-4 mr-2" />
        Contact Studio
      </Button>
      
      {hasInquiry ? (
        <Button 
          variant="outline" 
          className="w-full"
          onClick={handleViewConversation}
        >
          <MessageSquare className="h-4 w-4 mr-2" />
          View Conversation
        </Button>
      ) : (
        <Button 
          variant="outline" 
          className="w-full"
          onClick={() => addStudio(studio)}
          disabled={isInBasket}
        >
          <Plus className="h-4 w-4 mr-2" />
          {isInBasket ? 'In Quote Basket' : 'Quote'}
        </Button>
      )}
    </>
  )
} 