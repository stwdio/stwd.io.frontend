'use client'

import { useCallback, useMemo, useEffect } from 'react'
import { ProfileCard } from '@/components/cards/profile-card'
import { GenericCardSkeleton } from '@/components/skeletons/generic-card-skeleton'
import { GenericGrid } from '@/components/discover/generic-grid'
import { useProfilesInfinite } from '@/lib/hooks/queries/auth'
import { Database } from '@/lib/types/database'
import { useQueryClient } from '@tanstack/react-query'

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
  roleFilters?: string[]
}

export function ProfilesGrid({ category, searchQuery, roleFilters = [] }: ProfilesGridProps) {
  const queryClient = useQueryClient()
  
  // Combine all filters for the query
  const queryFilters = useMemo(() => ({
    search: searchQuery,
    category,
    roleFilters
  }), [category, searchQuery, roleFilters])

  // Fetch profiles with infinite scroll
  const {
    data: profilesData,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading: profilesLoading,
    error: profilesError,
    refetch: refetchProfiles
  } = useProfilesInfinite(queryFilters)
  
  // Invalidate cache on mount to ensure fresh data
  useEffect(() => {
    queryClient.invalidateQueries({ queryKey: ['profiles', 'infinite'] })
  }, [])

  // Flatten pages to get all profiles and deduplicate
  const allProfiles = useMemo(() => {
    const profiles = profilesData?.pages.flatMap(page => page.data || []) || []
    // Deduplicate profiles based on ID
    const uniqueProfiles = profiles.filter((profile, index, self) =>
      index === self.findIndex((p) => p.id === profile.id)
    )
    return uniqueProfiles
  }, [profilesData])

  const renderProfile = useCallback((profile: Profile, index: number) => (
    <ProfileCard key={`profile-${profile.id}-${index}`} profile={profile} priority={index < 4} />
  ), [])

  const renderSkeleton = useCallback(() => (
    <GenericCardSkeleton />
  ), [])

  return (
    <GenericGrid
      items={allProfiles}
      renderItem={renderProfile}
      isLoading={profilesLoading}
      error={profilesError}
      hasNextPage={hasNextPage}
      isFetchingNextPage={isFetchingNextPage}
      fetchNextPage={fetchNextPage}
      onRefresh={refetchProfiles}
      renderSkeleton={renderSkeleton}
      emptyStateTitle={`No ${category === 'all' ? 'people' : category} found`}
      emptyStateMessage={searchQuery ? `No results matching "${searchQuery}"` : "Check back later for new profiles"}
      errorMessage="Failed to load profiles. Please try again."
      skeletonCount={8}
    />
  )
}