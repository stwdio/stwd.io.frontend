"use client"

import { useState, useCallback, useMemo } from "react"
import { StudioCard } from "@/components/studio-card"
import { StudioCardSkeleton } from "@/components/skeletons"
import { useAuth } from "@/lib/auth/auth-context"
import { GenericGrid } from "@/components/discover/generic-grid"

// React Query hooks
import { useStudiosInfinite, useStudioListMemberships } from "@/lib/hooks/queries/studios"
import { useUserLists } from "@/lib/hooks/queries/auth"

interface FilterState {
  location: string
  priceRange: [number, number]
  selectedPriceTiers: number[]
  selectedAmenities: string[]
  selectedGear: string[]
}

interface BrowseStudiosContentProps {
  filters?: FilterState
  searchQuery?: string
}

export function BrowseStudiosContent({ 
  filters = {
    location: "",
    priceRange: [0, 1000],
    selectedPriceTiers: [],
    selectedAmenities: [],
    selectedGear: []
  },
  searchQuery = ""
}: BrowseStudiosContentProps) {
  const { user, profile, professionalRoles } = useAuth()

  // Combine all filters including search for the query
  const queryFilters = useMemo(() => ({
    location: filters.location,
    search: searchQuery,
    minRate: filters.priceRange[0],
    maxRate: filters.priceRange[1],
    priceTiers: filters.selectedPriceTiers,
    amenityIds: [], // TODO: Convert amenity names to IDs
    gearItems: filters.selectedGear
  }), [filters, searchQuery])
  
  // Fetch studios with infinite scroll
  const {
    data: studiosData,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading: studiosLoading,
    error: studiosError,
    refetch: refetchStudios
  } = useStudiosInfinite(queryFilters)

  // Flatten pages to get all studios
  const allStudios = useMemo(() => {
    return studiosData?.pages.flatMap(page => page.data || []) || []
  }, [studiosData])
  
  const studioIds = useMemo(() => {
    return allStudios.map(studio => studio.id.toString())
  }, [allStudios])

  // Fetch user lists
  const { 
    data: userLists = [], 
    isLoading: listsLoading,
    refetch: refetchLists
  } = useUserLists(profile?.id || null)

  // Fetch studio list memberships for the user's studios
  const { 
    data: membershipsMap = {}
  } = useStudioListMemberships(studioIds, profile?.id || null)

  const handleRefresh = useCallback(() => {
    refetchStudios()
    refetchLists()
  }, [refetchStudios, refetchLists])

  const renderStudio = useCallback((studio: any, index: number) => (
    <StudioCard
      key={studio.id}
      studio={studio}
      memberships={membershipsMap[studio.id.toString()] || []}
      sharedProfile={profile}
      profileLoading={false}
      sharedProfessionalRoles={professionalRoles}
      sharedLists={userLists}
      listsLoading={listsLoading}
      onListsChange={refetchLists}
      priority={index < 4}
    />
  ), [membershipsMap, profile, professionalRoles, userLists, listsLoading, refetchLists])

  return (
    <GenericGrid
      items={allStudios}
      renderItem={renderStudio}
      isLoading={studiosLoading}
      error={studiosError}
      hasNextPage={hasNextPage}
      isFetchingNextPage={isFetchingNextPage}
      fetchNextPage={fetchNextPage}
      onRefresh={handleRefresh}
      renderSkeleton={() => <StudioCardSkeleton />}
      emptyStateTitle="No studios found"
      emptyStateMessage="Try adjusting your filters or search criteria"
      errorMessage="Failed to load studios. Please try again."
    />
  )
}