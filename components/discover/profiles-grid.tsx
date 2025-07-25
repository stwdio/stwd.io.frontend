'use client'

import { useCallback, useEffect, useState } from 'react'
import { ProfileCard } from '@/components/cards/profile-card'
import { GenericCardSkeleton } from '@/components/skeletons/generic-card-skeleton'
import { createClient } from '@/lib/supabase/client'
import { Database } from '@/lib/types/database'
import { GenericGrid } from '@/components/discover/generic-grid'

type Profile = Database['public']['Tables']['profiles']['Row'] & {
  profile_roles?: Array<{
    role: {
      id: number
      name: string
      slug: string
    }
  }>
}

type PeopleSubView = 'all' | 'artists' | 'engineers' | 'industry'

interface ProfilesGridProps {
  category: PeopleSubView
  searchQuery?: string
}

export function ProfilesGrid({ category, searchQuery }: ProfilesGridProps) {
  const [profiles, setProfiles] = useState<Profile[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<any>(null)
  const supabase = createClient()

  const fetchProfiles = useCallback(async () => {
    setLoading(true)
    setError(null)
    
    let query = supabase
      .from('profiles')
      .select(`
        *,
        profile_roles(
          role:roles(id, name, slug)
        )
      `)
      .not('system_role', 'is', null) // Only show users who have completed onboarding

    // Apply search if provided
    if (searchQuery) {
      query = query.or(
        `username.ilike.%${searchQuery}%,first_name.ilike.%${searchQuery}%,last_name.ilike.%${searchQuery}%`
      )
    }

    const { data, error: fetchError } = await query
      .order('created_at', { ascending: false })
      .limit(20)

    if (fetchError) {
      console.error('Error fetching profiles:', fetchError)
      setError(fetchError)
    } else {
      // Client-side filtering by role
      let filteredData = data || []
      
      if (category !== 'all' && filteredData.length > 0) {
        const roleFilters: Record<string, string[]> = {
          'artists': ['musician', 'podcaster', 'voice-actor'],
          'engineers': ['engineer', 'producer'],
          'industry': ['record-label', 'other']
        }
        
        const allowedRoles = roleFilters[category] || []
        filteredData = filteredData.filter(profile => 
          Array.isArray(profile.profile_roles) && 
          profile.profile_roles.some((pr: any) => 
            allowedRoles.includes(pr.role?.slug || '')
          )
        )
      }
      
      setProfiles(filteredData)
    }
    
    setLoading(false)
  }, [category, searchQuery, supabase])

  useEffect(() => {
    fetchProfiles()
  }, [fetchProfiles])

  const renderProfile = useCallback((profile: Profile, index: number) => (
    <ProfileCard key={profile.id} profile={profile} priority={index < 4} />
  ), [])

  const renderSkeleton = useCallback(() => (
    <GenericCardSkeleton />
  ), [])

  return (
    <GenericGrid
      items={profiles}
      renderItem={renderProfile}
      isLoading={loading}
      error={error}
      onRefresh={fetchProfiles}
      renderSkeleton={renderSkeleton}
      emptyStateTitle={`No ${category === 'all' ? 'people' : category} found`}
      emptyStateMessage={searchQuery ? `No results matching "${searchQuery}"` : "Check back later for new profiles"}
      errorMessage="Failed to load profiles. Please try again."
      skeletonCount={8}
    />
  )
}