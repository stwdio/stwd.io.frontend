"use client"

import { useState, useEffect, useMemo, useCallback, useRef } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Slider } from "@/components/ui/slider"
import { Badge } from "@/components/ui/badge"
import { Filter, Loader2, Search, RotateCcw, X } from "lucide-react"
import { StudioCard } from "@/components/studio-card"
import { MobileFilterSheet } from "@/components/mobile-filter-sheet"
import { BrowsePageSkeleton, StudioCardSkeleton } from "@/components/skeletons"
import { useAuth } from "@/lib/auth/auth-context"

// React Query hooks
import { useStudiosInfinite, useAmenities, useStudioListMemberships, useAvailableGear } from "@/lib/hooks/queries/studios"
import { useUserLists } from "@/lib/hooks/queries/auth"

interface Amenity {
  id: string
  name: string
}

interface GearItem {
  category: string
  item: string
}

interface FilterState {
  location: string
  priceRange: [number, number]
  selectedAmenities: string[]
  selectedGear: string[]
  amenitySearch: string
  gearSearch: string
}

interface FiltersContentProps {
  filters: FilterState
  amenities: Amenity[]
  availableGear: GearItem[]
  onFilterChange: (filters: Partial<FilterState>) => void
  onSearchFilters: () => void
  onClearFilters: () => void
  isLoading?: boolean
  gearLoading?: boolean
  gearError?: any
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
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 w-full max-w-6xl">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="opacity-50">
            <StudioCardSkeleton />
          </div>
        ))}
      </div>
    </div>
  )
}

// Filters Content Component
function FiltersContent({ 
  filters, 
  amenities, 
  availableGear, 
  onFilterChange, 
  onSearchFilters, 
  onClearFilters,
  isLoading = false,
  gearLoading = false,
  gearError = null
}: FiltersContentProps) {
  const filteredAmenities = useMemo(() => {
    if (!filters.amenitySearch.trim()) return amenities
    return amenities.filter(amenity => 
      amenity.name.toLowerCase().includes(filters.amenitySearch.toLowerCase())
    )
  }, [amenities, filters.amenitySearch])

  const filteredGear = useMemo(() => {
    if (!filters.gearSearch.trim()) return availableGear
    return availableGear.filter(gear => 
      gear.item.toLowerCase().includes(filters.gearSearch.toLowerCase())
    )
  }, [availableGear, filters.gearSearch])

  const handleLocationChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    onFilterChange({ location: e.target.value })
  }, [onFilterChange])

  const handleAmenitySearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    onFilterChange({ amenitySearch: e.target.value })
  }, [onFilterChange])

  const handleGearSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    onFilterChange({ gearSearch: e.target.value })
  }, [onFilterChange])

  const handlePriceRangeChange = useCallback((value: number[]) => {
    onFilterChange({ priceRange: [value[0], value[1]] })
  }, [onFilterChange])

  const handleAmenityToggle = useCallback((amenityName: string, checked: boolean) => {
    const newAmenities = checked
      ? [...filters.selectedAmenities, amenityName]
      : filters.selectedAmenities.filter(a => a !== amenityName)
    onFilterChange({ selectedAmenities: newAmenities })
  }, [filters.selectedAmenities, onFilterChange])

  const handleGearToggle = useCallback((gearItem: string, checked: boolean) => {
    const newGear = checked
      ? [...filters.selectedGear, gearItem]
      : filters.selectedGear.filter(g => g !== gearItem)
    onFilterChange({ selectedGear: newGear })
  }, [filters.selectedGear, onFilterChange])

  const handleFormSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault()
    onSearchFilters()
  }, [onSearchFilters])

  const hasActiveFilters = useMemo(() => 
    filters.location.trim() !== "" ||
    filters.selectedAmenities.length > 0 ||
    filters.selectedGear.length > 0 ||
    filters.priceRange[0] !== 0 ||
    filters.priceRange[1] !== 500
  , [filters])

  return (
    <form onSubmit={handleFormSubmit} className="space-y-6">
      {/* Location Search */}
      <div className="space-y-4">
        <Label className="text-sm font-medium">Location</Label>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search by city, state..."
            value={filters.location}
            onChange={handleLocationChange}
            className="pl-10"
            disabled={isLoading}
          />
          {filters.location && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="absolute right-1 top-1/2 transform -translate-y-1/2 h-7 w-7 p-0"
              onClick={() => onFilterChange({ location: "" })}
            >
              <X className="h-3 w-3" />
              <span className="sr-only">Clear location</span>
            </Button>
          )}
        </div>
      </div>

      {/* Price Range Filter */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Label className="text-sm font-medium">Price Range (Per Hour)</Label>
          <div className="text-sm text-muted-foreground">
            ${filters.priceRange[0]} - ${filters.priceRange[1]}
          </div>
        </div>
        <Slider 
          value={filters.priceRange}
          onValueChange={handlePriceRangeChange}
          max={500} 
          min={0} 
          step={10} 
          className="w-full"
          disabled={isLoading}
        />
      </div>

      {/* Amenities Filter */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Label className="text-sm font-medium">Amenities</Label>
          <Badge 
            variant="secondary" 
            className={`text-xs transition-opacity ${
              filters.selectedAmenities.length > 0 ? 'opacity-100' : 'opacity-0'
            }`}
          >
            {filters.selectedAmenities.length} selected
          </Badge>
        </div>
        
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search amenities..."
            value={filters.amenitySearch}
            onChange={handleAmenitySearchChange}
            className="pl-10"
            disabled={isLoading}
          />
          {filters.amenitySearch && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="absolute right-1 top-1/2 transform -translate-y-1/2 h-7 w-7 p-0"
              onClick={() => onFilterChange({ amenitySearch: "" })}
            >
              <X className="h-3 w-3" />
              <span className="sr-only">Clear search</span>
            </Button>
          )}
        </div>

        <div className="max-h-48 overflow-y-auto space-y-2 rounded-md border border-input p-3">
          {filteredAmenities.length > 0 ? (
            filteredAmenities.map((amenity) => (
              <div key={amenity.id} className="flex items-center space-x-2">
                <Checkbox
                  id={`amenity-${amenity.id}`}
                  checked={filters.selectedAmenities.includes(amenity.name)}
                  onCheckedChange={(checked) => handleAmenityToggle(amenity.name, checked as boolean)}
                  disabled={isLoading}
                />
                <Label 
                  htmlFor={`amenity-${amenity.id}`} 
                  className="text-sm font-normal cursor-pointer flex-1"
                >
                  {amenity.name}
                </Label>
              </div>
            ))
          ) : (
            <p className="text-sm text-muted-foreground text-center py-4">
              {filters.amenitySearch ? `No amenities found matching "${filters.amenitySearch}"` : "Loading amenities..."}
            </p>
          )}
        </div>
      </div>

      {/* Gear Filter */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Label className="text-sm font-medium">Equipment & Gear</Label>
          <Badge 
            variant="secondary" 
            className={`text-xs transition-opacity ${
              filters.selectedGear.length > 0 ? 'opacity-100' : 'opacity-0'
            }`}
          >
            {filters.selectedGear.length} selected
          </Badge>
        </div>
        
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search gear..."
            value={filters.gearSearch}
            onChange={handleGearSearchChange}
            className="pl-10"
            disabled={isLoading}
          />
          {filters.gearSearch && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="absolute right-1 top-1/2 transform -translate-y-1/2 h-7 w-7 p-0"
              onClick={() => onFilterChange({ gearSearch: "" })}
            >
              <X className="h-3 w-3" />
              <span className="sr-only">Clear search</span>
            </Button>
          )}
        </div>

        <div className="max-h-48 overflow-y-auto space-y-3 rounded-md border border-input p-3">
          {filteredGear.length > 0 ? (
            // Group gear by category
            Object.entries(
              filteredGear.reduce((acc, gear) => {
                if (!acc[gear.category]) acc[gear.category] = []
                acc[gear.category].push(gear.item)
                return acc
              }, {} as Record<string, string[]>)
            ).map(([category, items]) => (
              <div key={category} className="space-y-2">
                <Label className="text-xs uppercase tracking-wide text-muted-foreground font-medium">
                  {category}
                </Label>
                <div className="space-y-2 ml-2">
                  {items.map((item) => (
                    <div key={`${category}-${item}`} className="flex items-center space-x-2">
                      <Checkbox
                        id={`gear-${category}-${item}`}
                        checked={filters.selectedGear.includes(item)}
                        onCheckedChange={(checked) => handleGearToggle(item, checked as boolean)}
                        disabled={isLoading}
                      />
                      <Label 
                        htmlFor={`gear-${category}-${item}`} 
                        className="text-sm font-normal cursor-pointer flex-1"
                      >
                        {item}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
            ))
          ) : (
            <p className="text-sm text-muted-foreground text-center py-4">
              {gearLoading ? "Loading gear..." : 
               gearError ? "Error loading gear" :
               filters.gearSearch ? `No gear found matching "${filters.gearSearch}"` : 
               "No gear available"}
            </p>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="space-y-2 pt-4 border-t">
        <Button 
          type="submit"
          className="w-full"
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Searching...
            </>
          ) : (
            <>
              <Search className="h-4 w-4 mr-2" />
              Search Studios
            </>
          )}
        </Button>
        
        <Button 
          type="button"
          onClick={onClearFilters}
          variant="outline" 
          className="w-full"
          size="sm"
          disabled={isLoading || !hasActiveFilters}
        >
          <RotateCcw className="h-4 w-4 mr-2" />
          Clear All Filters
        </Button>
      </div>
    </form>
  )
}

export function BrowseStudiosContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { profile: sharedProfile, loading: profileLoading } = useAuth()
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false)

  // Initialize filter state from URL parameters
  const [filters, setFilters] = useState<FilterState>(() => {
    const params = new URLSearchParams(searchParams.toString())
    return {
      location: params.get('location') || "",
      priceRange: [
        parseInt(params.get('minPrice') || '0'),
        parseInt(params.get('maxPrice') || '500')
      ] as [number, number],
      selectedAmenities: params.get('amenities') ? params.get('amenities')!.split(',') : [],
      selectedGear: params.get('gear') ? params.get('gear')!.split(',') : [],
      amenitySearch: "",
      gearSearch: ""
    }
  })

  // State for active filters that are applied to the query
  const [activeFilters, setActiveFilters] = useState<FilterState>(() => {
    const params = new URLSearchParams(searchParams.toString())
    return {
      location: params.get('location') || "",
      priceRange: [
        parseInt(params.get('minPrice') || '0'),
        parseInt(params.get('maxPrice') || '500')
      ] as [number, number],
      selectedAmenities: params.get('amenities') ? params.get('amenities')!.split(',') : [],
      selectedGear: params.get('gear') ? params.get('gear')!.split(',') : [],
      amenitySearch: "",
      gearSearch: ""
    }
  })

  // Get amenities with automatic caching
  const { data: amenitiesData } = useAmenities()

  // Get available gear with automatic caching
  const { data: availableGearData, isLoading: gearLoading, error: gearError } = useAvailableGear()

  // Get user lists with automatic caching
  const { data: userListsData, isLoading: listsLoading } = useUserLists(sharedProfile?.id || null)

  // Convert amenities data to expected format
  const amenities = useMemo(() => {
    return (amenitiesData || []).map(amenity => ({
      id: amenity.id.toString(),
      name: amenity.name
    }))
  }, [amenitiesData])

  // Convert amenity names to IDs for the API call (using active filters)
  const selectedAmenityIds = useMemo(() => {
    return activeFilters.selectedAmenities.map(amenityName => {
      const amenity = amenities.find(a => a.name === amenityName)
      return amenity ? parseInt(amenity.id) : null
    }).filter(id => id !== null)
  }, [activeFilters.selectedAmenities, amenities])

  // React Query hooks - automatic caching and background updates!
  const {
    data: studiosData,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading: studiosLoading,
    isError: studiosError,
    refetch: refetchStudios
  } = useStudiosInfinite({
    location: activeFilters.location,
    minRate: activeFilters.priceRange[0],
    maxRate: activeFilters.priceRange[1],
    amenityIds: selectedAmenityIds,
    gearItems: activeFilters.selectedGear,
  })

  // Flatten studios from all pages
  const studios = useMemo(() => {
    return studiosData?.pages.flatMap(page => page.data || []) || []
  }, [studiosData])

  // Get studio IDs for batch memberships
  const studioIds = useMemo(() => {
    return studios.map(studio => studio.id)
  }, [studios])

  // Get batch memberships with automatic caching
  const { data: batchMemberships } = useStudioListMemberships(studioIds, sharedProfile?.id || null)

  // Intersection observer for infinite scroll
  const loadMoreRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const currentRef = loadMoreRef.current
    if (!currentRef) return

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries
        if (entry.isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage()
        }
      },
      {
        threshold: 0.1,
        rootMargin: '100px'
      }
    )

    observer.observe(currentRef)

    return () => {
      observer.unobserve(currentRef)
    }
  }, [hasNextPage, isFetchingNextPage, fetchNextPage])

  // Transform batch memberships to expected format
  const membershipsByStudio = useMemo(() => {
    if (!batchMemberships) return {}
    
    const result: Record<string, any[]> = {}
    batchMemberships.forEach((membership: any) => {
      const studioId = membership.studio_id.toString()
      if (!result[studioId]) {
        result[studioId] = []
      }
      result[studioId].push({
        list_id: membership.list_id,
        list_name: membership.list_name,
        list_icon_emoji: membership.list_icon_emoji
      })
    })
    return result
  }, [batchMemberships])

  const handleFilterChange = useCallback((newFilters: Partial<FilterState>) => {
    setFilters(prev => ({ ...prev, ...newFilters }))
  }, [])

  // Update URL parameters when filters change
  const updateURL = useCallback((currentFilters: FilterState) => {
    const params = new URLSearchParams()
    
    if (currentFilters.location.trim()) {
      params.set('location', currentFilters.location.trim())
    }
    
    if (currentFilters.priceRange[0] !== 0) {
      params.set('minPrice', currentFilters.priceRange[0].toString())
    }
    
    if (currentFilters.priceRange[1] !== 500) {
      params.set('maxPrice', currentFilters.priceRange[1].toString())
    }
    
    if (currentFilters.selectedAmenities.length > 0) {
      params.set('amenities', currentFilters.selectedAmenities.join(','))
    }
    
    if (currentFilters.selectedGear.length > 0) {
      params.set('gear', currentFilters.selectedGear.join(','))
    }

    const newURL = `${window.location.pathname}${params.toString() ? '?' + params.toString() : ''}`
    router.replace(newURL, { scroll: false })
  }, [router])

  const handleSearchFilters = useCallback(() => {
    // Apply the current filters as active filters
    setActiveFilters(filters)
    updateURL(filters)
  }, [filters, updateURL])

  const handleClearFilters = useCallback(() => {
    const clearedFilters = {
      location: "",
      priceRange: [0, 500] as [number, number],
      selectedAmenities: [],
      selectedGear: [],
      amenitySearch: "",
      gearSearch: ""
    }
    setFilters(clearedFilters)
    setActiveFilters(clearedFilters)
    updateURL(clearedFilters)
  }, [updateURL])

  // Loading state
  if (studiosLoading) {
    return <BrowsePageSkeleton />
  }

  return (
    <div className="p-4 md:p-6 min-h-screen max-h-screen overflow-hidden">
      <div className="flex flex-col lg:flex-row gap-6 h-full">
        {/* Mobile Filter Button - Top Right */}
        <div className="lg:hidden fixed top-14 right-4 z-40">
          <div className="relative">
            <Button 
              variant="outline" 
              size="lg"
              className="h-12 w-12 rounded-full shadow-lg border-2 border-black bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 p-0"
              onClick={() => setMobileFilterOpen(true)}
            >
              <Filter className="h-4 w-4" />
            </Button>
            {(filters.selectedAmenities.length > 0 || filters.selectedGear.length > 0 || filters.location) && (
              <Badge 
                variant="default" 
                className="absolute -top-2 -right-2 h-6 w-6 p-0 flex items-center justify-center text-xs font-bold min-w-[1.5rem] border-2 border-black bg-primary/95 backdrop-blur supports-[backdrop-filter]:bg-primary/90"
              >
                {filters.selectedAmenities.length + filters.selectedGear.length + (filters.location ? 1 : 0)}
              </Badge>
            )}
          </div>
        </div>

        {/* Mobile Filter Sheet */}
        <MobileFilterSheet
          filters={filters}
          amenities={amenities}
          availableGear={availableGearData || []}
          onFilterChange={handleFilterChange}
          onSearchFilters={handleSearchFilters}
          onClearFilters={handleClearFilters}
          isLoading={studiosLoading}
          gearLoading={gearLoading}
          gearError={gearError}
          open={mobileFilterOpen}
          onOpenChange={setMobileFilterOpen}
        />

        {/* Desktop Filters Sidebar */}
        <div className="hidden lg:block lg:w-80 lg:flex-shrink-0">
          <div className="sticky top-6 h-[calc(100vh-3rem)]">
            <Card className="shadow-sm h-full">
              <CardContent className="p-6 h-full overflow-y-auto">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold">Filters</h2>
                  <Badge 
                    variant="secondary" 
                    className={`text-xs transition-opacity ${
                      (filters.selectedAmenities.length > 0 || filters.selectedGear.length > 0 || filters.location) 
                        ? 'opacity-100' : 'opacity-0'
                    }`}
                  >
                    {filters.selectedAmenities.length + filters.selectedGear.length + (filters.location ? 1 : 0)} active
                  </Badge>
                </div>
                <FiltersContent
                  filters={filters}
                  amenities={amenities}
                  availableGear={availableGearData || []}
                  onFilterChange={handleFilterChange}
                  onSearchFilters={handleSearchFilters}
                  onClearFilters={handleClearFilters}
                  isLoading={studiosLoading}
                  gearLoading={gearLoading}
                  gearError={gearError}
                />
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Studios Grid */}
        <div className="flex-1 overflow-y-auto">
          {studiosError ? (
            <div className="text-center py-12">
              <div className="text-muted-foreground mb-4">
                <h3 className="text-lg font-medium mb-2">Error loading studios</h3>
                <p>Please try again or contact support if the problem persists.</p>
              </div>
              <Button onClick={() => refetchStudios()} variant="outline">
                Try again
              </Button>
            </div>
          ) : studios.length === 0 && !studiosLoading ? (
            <div className="text-center py-12">
              <div className="text-muted-foreground mb-4">
                <Search className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <h3 className="text-lg font-medium mb-2">No studios found</h3>
                <p>Try adjusting your filters or search criteria.</p>
              </div>
              <Button onClick={handleClearFilters} variant="outline">
                Clear all filters
              </Button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4 sm:gap-6 bg-muted/20 p-4 sm:p-6 rounded-lg border">
                {studios.map((studio, index) => (
                  <StudioCard
                    key={studio.id}
                    studio={{
                      ...studio,
                      owner_id: studio.owner_id || '',
                      verification_status: studio.verification_status || 'unverified',
                      amenities: studio.amenities?.map(a => a.name) || []
                    }}
                    memberships={membershipsByStudio[studio.id.toString()] || []}
                    sharedProfile={sharedProfile}
                    profileLoading={profileLoading}
                    sharedLists={userListsData || []}
                    listsLoading={listsLoading}
                    onListsChange={() => {}} // React Query automatically updates
                    showAmenities={true}
                    linkToStudio={true}
                    priority={index < 6}
                  />
                ))}
              </div>

              {/* Infinite Scroll Trigger & Loading Indicator */}
              {hasNextPage && (
                <div ref={loadMoreRef} className="mt-8 min-h-[20px] flex items-center justify-center">
                  {isFetchingNextPage ? (
                    <InfiniteScrollLoader />
                  ) : (
                    <div className="h-4 w-full" />
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}