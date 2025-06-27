'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { useQuoteBasket } from '@/lib/store/quote-basket'
import { Plus, Edit, MessageCircle, MessageSquare } from 'lucide-react'

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
  const { addStudio } = useQuoteBasket()
  const router = useRouter()

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
        
        // Check if user has made an inquiry to this studio
        if (profileData.role === 'creator') {
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
      }
      setLoading(false)
    }

    getProfileAndCheckInquiry()
  }, [studio.id])

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
        <Button className="w-full" size="lg">
          <MessageCircle className="h-4 w-4 mr-2" />
          Contact Studio
        </Button>
        
        <Button 
          variant="outline" 
          className="w-full"
          onClick={() => addStudio(studio)}
        >
          <Plus className="h-4 w-4 mr-2" />
          Add to Quote
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

  // For creators - show contact and either "View Inquiry" or "Add to Quote"
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
          onClick={() => router.push('/dashboard/creator')}
        >
          <MessageSquare className="h-4 w-4 mr-2" />
          View Inquiry
        </Button>
      ) : (
        <Button 
          variant="outline" 
          className="w-full"
          onClick={() => addStudio(studio)}
        >
          <Plus className="h-4 w-4 mr-2" />
          Add to Quote
        </Button>
      )}
    </>
  )
} 