'use client'

import { GenericCard } from '@/components/cards/generic-card'
import { IconMessage, IconPlus } from '@tabler/icons-react'
import { StudioListMembershipIndicators } from '@/components/studio-list-membership-indicators'
import { StudioCardActions } from '@/components/studio-card-actions'
import { ReactNode, useState } from 'react'
import { getStudioPrimaryImageUrl } from '@/lib/utils'
import { getPriceTierSymbol } from '@/lib/constants/currencies'
import { useAuthModal } from '@/lib/hooks/use-auth-modal'
import { useAuth } from '@/lib/auth/auth-context'
import { useQuoteBasket } from '@/lib/store/quote-basket'
import { useRouter } from 'next/navigation'

interface Studio {
  id: number
  name: string
  description: string
  hourly_rate: number
  daily_rate?: number | null
  price_tier?: number
  currency?: string
  location: string
  owner_id: string
  published?: boolean
  verification_status: string
  created_at?: string
  average_rating?: number
  review_count?: number
  amenities?: string[]
  gear?: Record<string, unknown>
  notes?: string // For lists view
  photo_urls?: string[]
  slug?: string
}

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

interface StudioCardProps {
  studio: Studio
  // Props for optimized performance
  memberships?: {list_id: number, list_name: string, list_icon_emoji: string}[]
  sharedProfile?: Profile | null
  profileLoading?: boolean
  sharedProfessionalRoles?: ProfessionalRole[]
  sharedLists?: Array<{ id: number; name: string }>
  listsLoading?: boolean
  onListsChange?: () => void
  interactionStatus?: {
    hasInquiry: boolean
    hasConversation: boolean
    conversationId?: number
  }
  // Customization props
  showAmenities?: boolean
  showNotes?: boolean
  customActions?: ReactNode
  // Link behavior
  linkToStudio?: boolean
  className?: string
  // Performance optimization
  priority?: boolean
}

export function StudioCard({
  studio,
  memberships = [],
  sharedProfile,
  profileLoading = false,
  sharedProfessionalRoles = [],
  sharedLists = [],
  listsLoading = false,
  onListsChange,
  interactionStatus,
  showAmenities = true,
  showNotes = false,
  customActions,
  linkToStudio = true,
  className = '',
  priority = false
}: StudioCardProps) {
  const { user } = useAuth()
  const authModal = useAuthModal()
  const isAuthenticated = !!user
  const router = useRouter()
  const { addStudio, isStudioInBasket } = useQuoteBasket()
  const isInBasket = isStudioInBasket(studio.id)

  // Mock data for "followed by" - to be replaced with real data later
  const mockFollowers = [
    { id: 1, name: 'John Doe', avatar: `https://api.dicebear.com/9.x/thumbs/svg?seed=user1&backgroundColor=ffffff&shapeColor=000000` },
    { id: 2, name: 'Jane Smith', avatar: `https://api.dicebear.com/9.x/thumbs/svg?seed=user2&backgroundColor=ffffff&shapeColor=000000` },
    { id: 3, name: 'Mike Johnson', avatar: `https://api.dicebear.com/9.x/thumbs/svg?seed=user3&backgroundColor=ffffff&shapeColor=000000` },
    { id: 4, name: 'Sarah Wilson', avatar: `https://api.dicebear.com/9.x/thumbs/svg?seed=user4&backgroundColor=ffffff&shapeColor=000000` },
  ]

  const handleMessage = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    if (!isAuthenticated) {
      authModal.open(
        'Sign in to enquire with studios',
        'Create an account or sign in to start enquiring with studio owners.'
      )
      return
    }
    
    // Navigate to messages with studio context
    router.push(`/chat?studio=${studio.slug || studio.id}`)
  }

  const handleQuote = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    if (!isAuthenticated) {
      authModal.open(
        'Sign in to request quotes',
        'Create an account or sign in to request quotes from studios.'
      )
      return
    }
    
    // Add to quote basket
    await addStudio(studio)
  }

  const amenityTags = showAmenities && studio.amenities 
    ? studio.amenities.map(amenity => typeof amenity === 'string' ? amenity : amenity.name)
    : []

  const additionalContent = (
    <StudioListMembershipIndicators 
      studioId={studio.id.toString()} 
      className="mb-4"
      maxVisible={3}
      memberships={memberships}
      isLoading={profileLoading}
    />
  )

  return (
    <GenericCard
      id={studio.id}
      title={studio.name}
      description={studio.description}
      imageUrl={getStudioPrimaryImageUrl(studio.photo_urls, 600)}
      link={linkToStudio ? `/discover/studios/${studio.slug || studio.id}` : undefined}
      location={studio.location}
      rating={studio.average_rating}
      reviewCount={studio.review_count}
      priceTier={studio.price_tier ? getPriceTierSymbol(studio.price_tier) : '$'}
      tags={amenityTags}
      followedBy={mockFollowers}
      notes={showNotes ? studio.notes : undefined}
      additionalContent={additionalContent}
      className={className}
      priority={priority}
      customActions={customActions || (
        <StudioCardActions
          studio={studio}
          memberships={memberships}
          sharedProfile={sharedProfile}
          profileLoading={profileLoading}
          sharedProfessionalRoles={sharedProfessionalRoles}
          sharedLists={sharedLists}
          listsLoading={listsLoading}
          onListsChange={onListsChange}
          interactionStatus={interactionStatus}
        />
      )}
    />
  )
}