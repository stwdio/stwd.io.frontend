'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { useQuoteBasket } from '@/lib/store/quote-basket'
import { Plus, Eye, MessageSquare } from 'lucide-react'

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
}

export function StudioCardActions({ studio }: StudioCardActionsProps) {
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
      <div className="flex gap-2">
        <div className="h-8 bg-muted animate-pulse rounded-md flex-1"></div>
        <div className="h-8 bg-muted animate-pulse rounded-md flex-1"></div>
      </div>
    )
  }

  // If user is not logged in - show creator actions
  if (!profile) {
    return (
      <div className="flex gap-2">
        <Button 
          variant="outline" 
          size="sm" 
          className="flex-1 pointer-events-none"
        >
          <Eye className="h-4 w-4 mr-1" />
          View Details
        </Button>
        <Button
          size="sm"
          onClick={(e) => {
            e.preventDefault()
            e.stopPropagation()
            addStudio(studio)
          }}
          className="flex-1"
        >
          <Plus className="h-4 w-4 mr-1" />
          Add to Quote
        </Button>
      </div>
    )
  }

  // If user owns this studio OR is an admin - only show view details
  if (profile.role === 'admin' || parseInt(studio.owner_id) === profile.id) {
    return (
      <div className="flex gap-2">
        <Button 
          variant="outline" 
          size="sm" 
          className="flex-1 pointer-events-none"
        >
          <Eye className="h-4 w-4 mr-1" />
          View Details
        </Button>
      </div>
    )
  }

  // For creators - show view details and either "View Inquiry" or "Add to Quote"
  return (
    <div className="flex gap-2">
      <Button 
        variant="outline" 
        size="sm" 
        className="flex-1 pointer-events-none"
      >
        <Eye className="h-4 w-4 mr-1" />
        View Details
      </Button>
      {hasInquiry ? (
        <Button
          size="sm"
          onClick={(e) => {
            e.preventDefault()
            e.stopPropagation()
            router.push('/dashboard/creator')
          }}
          className="flex-1"
          variant="outline"
        >
          <MessageSquare className="h-4 w-4 mr-1" />
          View Inquiry
        </Button>
      ) : (
        <Button
          size="sm"
          onClick={(e) => {
            e.preventDefault()
            e.stopPropagation()
            addStudio(studio)
          }}
          className="flex-1"
        >
          <Plus className="h-4 w-4 mr-1" />
          Add to Quote
        </Button>
      )}
    </div>
  )
} 