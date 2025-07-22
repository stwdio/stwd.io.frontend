'use client'

import { useCallback, useEffect, useState } from 'react'
import { ProfileCard } from '@/components/profile-card'
import { Skeleton } from '@/components/ui/skeleton'
import { createClient } from '@/lib/supabase/client'
import { Database } from '@/types/supabase'
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
  subView: PeopleSubView
  searchQuery?: string
}

export function ProfilesGrid({ subView, searchQuery }: ProfilesGridProps) {
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
      
      if (subView !== 'all' && filteredData.length > 0) {
        const roleFilters: Record<string, string[]> = {
          'artists': ['musician', 'podcaster', 'voice-actor'],
          'engineers': ['engineer', 'producer'],
          'industry': ['record-label', 'other']
        }
        
        const allowedRoles = roleFilters[subView] || []
        filteredData = filteredData.filter(profile => 
          profile.profile_roles?.some((pr: any) => 
            allowedRoles.includes(pr.role?.slug || '')
          )
        )
      }
      
      setProfiles(filteredData)
    }
    
    setLoading(false)
  }, [subView, searchQuery, supabase])

  useEffect(() => {
    fetchProfiles()
  }, [fetchProfiles])

  const renderProfile = useCallback((profile: Profile) => (
    <ProfileCard key={profile.id} profile={profile} />
  ), [])

  const renderSkeleton = useCallback(() => (
    <Skeleton className="h-64 rounded-lg" />
  ), [])

  return (
    <GenericGrid
      items={profiles}
      renderItem={renderProfile}
      isLoading={loading}
      error={error}
      onRefresh={fetchProfiles}
      renderSkeleton={renderSkeleton}
      emptyStateTitle={`No ${subView === 'all' ? 'people' : subView} found`}
      emptyStateMessage={searchQuery ? `No results matching "${searchQuery}"` : "Check back later for new profiles"}
      errorMessage="Failed to load profiles. Please try again."
      skeletonCount={8}
    />
  )
}