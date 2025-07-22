"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { StudioCard } from "@/components/studio-card"
import { StudioCardSkeleton } from "@/components/skeletons"
import { useAuth } from "@/lib/auth/auth-context"

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

// Modern infinite scroll loading component
function InfiniteScrollLoader() {
  return (
    <div className="flex flex-col items-center justify-center py-8 space-y-4">
      <div className="flex space-x-1">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="w-2 h-2 bg-primary rounded-full animate-pulse"
            style={{
              animationDelay: `${i * 0.15}s`,
              animationDuration: '1s'
            }}
          />
        ))}
      </div>
      <p className="text-sm text-muted-foreground animate-pulse">
        Loading more studios...
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 w-full">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="opacity-50">
            <StudioCardSkeleton />
          </div>
        ))}
      </div>
    </div>
  )
}

export function BrowseStudiosContent() {
  const { user, profile, professionalRoles } = useAuth()
  
  // Filter state - will be managed by parent Discover component in future
  const [filters, setFilters] = useState<FilterState>({
    location: "",
    priceRange: [0, 1000],
    selectedPriceTiers: [],
    selectedAmenities: [],
    selectedGear: []
  })

  // Fetch studios with infinite scroll
  const {
    data: studiosData,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading: studiosLoading,
    error: studiosError,
    refetch: refetchStudios
  } = useStudiosInfinite(filters)

  // Flatten pages to get all studios
  const allStudios = studiosData?.pages.flatMap(page => page.data || []) || []
  const studioIds = allStudios.map(studio => studio.id.toString())

  // Fetch user lists
  const { 
    data: userLists = [], 
    isLoading: listsLoading,
    refetch: refetchLists
  } = useUserLists(profile?.id || null)

  // Fetch studio list memberships for the user's studios
  const { 
    data: membershipsMap = {},
    isLoading: membershipsLoading
  } = useStudioListMemberships(studioIds, userLists, !!profile)

  // Infinite scroll observer
  const observerTarget = useRef(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage()
        }
      },
      { threshold: 0.1 }
    )

    if (observerTarget.current) {
      observer.observe(observerTarget.current)
    }

    return () => observer.disconnect()
  }, [hasNextPage, fetchNextPage, isFetchingNextPage])

  const handleRefresh = useCallback(() => {
    refetchStudios()
    refetchLists()
  }, [refetchStudios, refetchLists])

  // Initial loading state
  if (studiosLoading && !studiosData) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
        {Array.from({ length: 12 }).map((_, i) => (
          <StudioCardSkeleton key={i} />
        ))}
      </div>
    )
  }

  // Error state
  if (studiosError) {
    return (
      <div className="col-span-full">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-muted-foreground">
                Failed to load studios. Please try again.
              </p>
              <Button onClick={handleRefresh} className="mt-4">
                Try Again
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Empty state
  if (!allStudios.length) {
    return (
      <div className="col-span-full">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <h3 className="text-lg font-semibold mb-2">No studios found</h3>
              <p className="text-muted-foreground">
                Try adjusting your filters or search criteria
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
        {allStudios.map((studio, index) => (
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
        ))}
      </div>

      {/* Infinite scroll trigger */}
      <div ref={observerTarget} className="h-10" />

      {/* Loading more indicator */}
      {isFetchingNextPage && <InfiniteScrollLoader />}

      {/* End of results */}
      {!hasNextPage && allStudios.length > 0 && (
        <div className="text-center py-8">
          <p className="text-muted-foreground">
            You've reached the end! {allStudios.length} studios found.
          </p>
        </div>
      )}
    </>
  )
}