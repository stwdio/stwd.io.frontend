'use client'

import { GenericCard } from '@/components/cards/generic-card'
import { StudioListMembershipIndicators } from '@/components/studio-list-membership-indicators'
import { StudioCardActions } from '@/components/studio-card-actions'
import { ReactNode } from 'react'
import { getStudioPrimaryImageUrl } from '@/lib/utils'
import { useAuth } from '@/lib/auth/auth-context'
import { useQuery } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'

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

  // Fetch real followers for the studio
  const { data: followers = [], isLoading: isFollowersLoading } = useQuery({
    queryKey: ['studio-followers', studio.id],
    queryFn: async () => {
      const supabase = createClient()
      
      // First get the follower connections
      const { data: connections, error: connectionsError } = await supabase
        .from('social_connections')
        .select('follower_id')
        .eq('following_studio_id', studio.id)
        .limit(4)
        .order('created_at', { ascending: false })

      if (connectionsError || !connections || connections.length === 0) {
        if (connectionsError) console.error('Error fetching studio followers:', connectionsError)
        return []
      }

      // Then fetch the profile data for those followers
      const followerIds = connections.map(c => c.follower_id)
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('user_id, username, first_name, last_name, avatar_url')
        .in('user_id', followerIds)

      if (profilesError) {
        console.error('Error fetching follower profiles:', profilesError)
        return []
      }

      return profiles.map(profile => ({
        id: profile.user_id,
        name: profile.first_name && profile.last_name 
          ? `${profile.first_name} ${profile.last_name}`
          : profile.username || 'Anonymous',
        avatar: profile.avatar_url || 
          `https://api.dicebear.com/9.x/thumbs/svg?seed=${profile.user_id}&backgroundColor=ffffff&shapeColor=000000`
      }))
    },
    enabled: !!studio.id
  })



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
      // Price tier removed for healthier discovery experience
      tags={amenityTags}
      followedBy={followers}
      notes={showNotes ? studio.notes : undefined}
      additionalContent={additionalContent}
      className={className}
      priority={priority}
      isFollowersLoading={isFollowersLoading}
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