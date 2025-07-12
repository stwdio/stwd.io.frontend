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
import { Skeleton } from "@/components/ui/skeleton"
import { Star, MapPin, Plus, Filter, Loader2, Search, RotateCcw, X } from "lucide-react"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { StudioImage } from "@/components/studio-image-placeholder"
import { StudioCardActions } from "@/components/studio-card-actions"
import { StudioListMembershipIndicators } from "@/components/studio-list-membership-indicators"
import { StudioCard } from "@/components/studio-card"
import { MobileFilterSheet } from "@/components/mobile-filter-sheet"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"
import { useQuoteBasket } from "@/lib/store/quote-basket"
import { getBatchStudioListMemberships, getUserLists, ListWithCount } from "@/lib/actions/lists"
import { useAuth } from "@/lib/auth/auth-context"
import { getStudiosWithReviewsClient } from "@/lib/studio-reviews-client"

interface Studio {
  id: number
  name: string
  description: string
  hourly_rate: number
  location: string
  owner_id: string
  published: boolean
  verification_status: string
  created_at: string
  average_rating?: number
  review_count?: number
  amenities?: string[]
  gear?: any
  photo_urls?: string[]
}

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
}

// OPTIMIZED: Shared profile type
interface Profile {
  id: number
  user_id: string
  role: 'creator' | 'owner' | 'admin' | null
}

const STUDIOS_PER_PAGE = 12

// Custom hook for debounced values
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value)

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => {
      clearTimeout(handler)
    }
  }, [value, delay])

  return debouncedValue
}

// Skeleton component for loading studio cards
function StudioCardSkeleton() {
  return (
    <Card className="overflow-hidden p-0 gap-0 h-full flex flex-col">
      {/* Image skeleton */}
      <Skeleton className="aspect-video rounded-t-lg rounded-b-none" />
      
      <CardContent className="p-4 flex flex-col flex-1">
        {/* Title and price row */}
        <div className="flex justify-between items-start mb-2">
          <Skeleton className="h-6 w-32" />
          <div className="text-right">
            <Skeleton className="h-6 w-16 mb-1" />
            <Skeleton className="h-4 w-12" />
          </div>
        </div>
        
        {/* Location */}
        <div className="flex items-center mb-2">
          <Skeleton className="h-4 w-4 mr-1" />
          <Skeleton className="h-4 w-24" />
        </div>

        {/* Rating */}
        <div className="flex items-center mb-3">
          <div className="flex gap-1 mr-2">
            {Array.from({ length: 5 }, (_, i) => (
              <Skeleton key={i} className="h-4 w-4" />
            ))}
          </div>
          <Skeleton className="h-4 w-16" />
        </div>

        {/* Description - 2 lines */}
        <div className="mb-3 flex-1">
          <Skeleton className="h-4 w-full mb-2" />
          <Skeleton className="h-4 w-3/4" />
        </div>

        {/* Amenities */}
        <div className="flex flex-wrap gap-1 mb-4 min-h-[24px]">
          <Skeleton className="h-5 w-16" />
          <Skeleton className="h-5 w-20" />
          <Skeleton className="h-5 w-14" />
        </div>

        {/* Action buttons */}
        <div className="mt-auto">
          <div className="flex gap-2 h-8">
            <Skeleton className="h-8 flex-1" />
            <Skeleton className="h-8 flex-1" />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// Modern infinite scroll loading component
function InfiniteScrollLoader() {
  return (
    <div className="flex flex-col items-center justify-center py-8 space-y-4">
      {/* Animated dots */}
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
      {/* Loading text */}
      <p className="text-sm text-muted-foreground animate-pulse">
        Loading more studios...
      </p>
      {/* Skeleton cards preview */}
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

// Moved FiltersContent outside of the main component to prevent recreation on each render
function FiltersContent({ 
  filters, 
  amenities, 
  availableGear, 
  onFilterChange, 
  onSearchFilters, 
  onClearFilters,
  isLoading = false
}: FiltersContentProps) {
  // Memoize filtered lists to prevent unnecessary recalculations
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

  // Memoize event handlers to prevent recreation
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

  // Memoize derived values
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

      {/* Equipment & Gear Filter */}
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

        <div className="max-h-48 overflow-y-auto space-y-2 rounded-md border border-input p-3">
          {filteredGear.length > 0 ? (
            filteredGear.map((gear, index) => (
              <div key={`${gear.category}-${gear.item}-${index}`} className="flex items-center space-x-2">
                <Checkbox
                  id={`gear-${index}`}
                  checked={filters.selectedGear.includes(gear.item)}
                  onCheckedChange={(checked) => handleGearToggle(gear.item, checked as boolean)}
                  disabled={isLoading}
                />
                <Label 
                  htmlFor={`gear-${index}`} 
                  className="text-sm font-normal cursor-pointer flex-1"
                >
                  {gear.item}
                </Label>
              </div>
            ))
          ) : (
            <p className="text-sm text-muted-foreground text-center py-4">
              {filters.gearSearch ? `No gear found matching "${filters.gearSearch}"` : "Loading gear..."}
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
  const { user, profile: sharedProfile, loading: profileLoading } = useAuth()
  const [studios, setStudios] = useState<Studio[]>([])
  const [amenities, setAmenities] = useState<Amenity[]>([])
  const [availableGear, setAvailableGear] = useState<GearItem[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const [totalCount, setTotalCount] = useState(0)
  const { addStudio, studios: basketStudios } = useQuoteBasket()
  
  // OPTIMIZED: Batch list memberships state
  const [batchMemberships, setBatchMemberships] = useState<Record<string, {list_id: number, list_name: string, list_icon_emoji: string}[]>>({})
  const [membershipsLoading, setMembershipsLoading] = useState(false)
  
  // OPTIMIZED: Shared lists state to eliminate individual list fetches per dropdown
  const [sharedLists, setSharedLists] = useState<ListWithCount[]>([])
  const [listsLoading, setListsLoading] = useState(false)
  
  // Use refs to avoid stale closure issues
  const currentPageRef = useRef(0)
  const loadMoreRef = useRef<HTMLDivElement>(null)
  const isLoadingRef = useRef(false) // Prevent duplicate requests
  
  // Mobile filter sheet state
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

  // Memoized filter change handler to prevent recreation
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

  // OPTIMIZED: Batch fetch list memberships for all visible studios
  const fetchBatchMemberships = useCallback(async (studioList: Studio[]) => {
    if (studioList.length === 0) return
    
    setMembershipsLoading(true)
    try {
      const studioIds = studioList.map(studio => studio.id.toString())
      const result = await getBatchStudioListMemberships(studioIds)
      
      if (result.success) {
        setBatchMemberships(result.data || {})
      } else {
        console.error('Failed to fetch batch memberships:', result.error)
        // Set empty memberships instead of error to not break the UI
        setBatchMemberships({})
      }
    } catch (error) {
      console.error('Error fetching batch memberships:', error)
      setBatchMemberships({})
    } finally {
      setMembershipsLoading(false)
    }
  }, [])

  const fetchStudios = useCallback(async (reset = false) => {
    // Prevent duplicate requests
    if (isLoadingRef.current) return
    isLoadingRef.current = true

    const pageToFetch = reset ? 0 : currentPageRef.current
    const isFirstLoad = reset || pageToFetch === 0

    if (isFirstLoad) {
      setLoading(true)
      currentPageRef.current = 0
    } else {
      setLoadingMore(true)
    }

    try {
      // OPTIMIZED: Build the base query with specific columns only
      let query = createClient()
        .from("studios")
        .select(`
          id,
          name,
          description,
          hourly_rate,
          location,
          owner_id,
          published,
          verification_status,
          created_at,
          gear,
          photo_urls,
          studio_amenities (
            amenities (name)
          )
        `, { count: 'exact' })
        .eq("published", true)
        .eq("verification_status", "verified")

      // Apply server-side filters
      if (filters.location.trim()) {
        query = query.ilike("location", `%${filters.location.trim()}%`)
      }

      query = query.gte("hourly_rate", filters.priceRange[0]).lte("hourly_rate", filters.priceRange[1])

      // If we have amenity filters, we need to get studios that have ALL selected amenities
      if (filters.selectedAmenities.length > 0) {
        // First get all studios that have at least one of the selected amenities
        const { data: studioIds } = await createClient()
          .from("studio_amenities")
          .select("studio_id")
          .in("amenity_id", 
            await createClient()
              .from("amenities")
                              .select("id")
                .in("name", filters.selectedAmenities)
                .then(({ data }: any) => data?.map((a: any) => a.id) || [])
          )

        if (studioIds && studioIds.length > 0) {
          // Group by studio_id and count amenities to find studios with ALL selected amenities
          const studioIdCounts = studioIds.reduce((acc: any, { studio_id }: any) => {
            acc[studio_id] = (acc[studio_id] || 0) + 1
            return acc
          }, {} as Record<number, number>)

          // Filter to studios that have all selected amenities
          const validStudioIds = Object.entries(studioIdCounts)
            .filter(([_, count]) => count === filters.selectedAmenities.length)
            .map(([id, _]) => parseInt(id))

          if (validStudioIds.length === 0) {
            // No studios match all selected amenities
            setStudios([])
            setTotalCount(0)
            setHasMore(false)
            return
          }

          query = query.in("id", validStudioIds)
        } else {
          // No studios have any of the selected amenities
          setStudios([])
          setTotalCount(0)
          setHasMore(false)
          return
        }
      }

      const { data, error, count } = await query
        .range(pageToFetch * STUDIOS_PER_PAGE, (pageToFetch + 1) * STUDIOS_PER_PAGE - 1)
        .order('created_at', { ascending: false })

      if (error) {
        console.error("Error fetching studios:", error)
        return
      }

      if (data) {
        // Get studio IDs for review fetching
        const studioIds = data.map((studio: any) => studio.id)
        
        // Fetch review data for all studios
        const reviewsData = await getStudiosWithReviewsClient(studioIds)
        
        let studiosWithStats = data.map((studio: any) => {
          const studioReviews = reviewsData[studio.id] || { averageRating: 0, totalReviews: 0 }
          return {
            ...studio,
            average_rating: studioReviews.averageRating,
            review_count: studioReviews.totalReviews,
            amenities: studio.studio_amenities?.map((sa: any) => sa.amenities?.name).filter(Boolean) || [],
          }
        })

        // Apply gear filter on client side (since gear structure is complex)
        if (filters.selectedGear.length > 0) {
          studiosWithStats = studiosWithStats.filter((studio: any) => {
            if (!studio.gear) return false
            
            // Extract all gear items from the studio's gear object
            const studioGearItems: string[] = []
            
            if (typeof studio.gear === 'object') {
              Object.values(studio.gear).forEach((value) => {
                if (Array.isArray(value)) {
                  studioGearItems.push(...value.map(item => item.toLowerCase()))
                } else if (typeof value === 'string') {
                  studioGearItems.push(value.toLowerCase())
                }
              })
            } else if (typeof studio.gear === 'string') {
              studioGearItems.push(studio.gear.toLowerCase())
            }
            
            // Check if any selected gear is in the studio's gear
            return filters.selectedGear.some((selectedItem) =>
              studioGearItems.some(studioItem => 
                studioItem.includes(selectedItem.toLowerCase()) || 
                selectedItem.toLowerCase().includes(studioItem)
              )
            )
          })
        }

        if (reset) {
          setStudios(studiosWithStats)
          currentPageRef.current = 1
          // OPTIMIZED: Fetch memberships for initial load
          fetchBatchMemberships(studiosWithStats)
        } else {
          // Prevent duplicates by filtering out studios that already exist
          let updatedStudiosList: Studio[] = []
          
          setStudios(prev => {
            const existingIds = new Set(prev.map(s => s.id))
            const newStudios = studiosWithStats.filter((studio: any) => !existingIds.has(studio.id))
            updatedStudiosList = [...prev, ...newStudios]
            return updatedStudiosList
          })
          
          currentPageRef.current = currentPageRef.current + 1
          
          // OPTIMIZED: Fetch memberships for all visible studios (after state update)
          // Use setTimeout to ensure this runs after the state update is complete
          setTimeout(() => {
            fetchBatchMemberships(updatedStudiosList)
          }, 0)
        }

        setTotalCount(count || 0)
        setHasMore(data.length === STUDIOS_PER_PAGE)
      }
    } catch (error) {
      console.error("Error fetching studios:", error)
    } finally {
      setLoading(false)
      setLoadingMore(false)
      isLoadingRef.current = false
    }
  }, [filters.location, filters.priceRange, filters.selectedAmenities, filters.selectedGear])

  // Simple intersection observer for infinite scroll
  useEffect(() => {
    const currentRef = loadMoreRef.current
    if (!currentRef) return

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries
        if (entry.isIntersecting && hasMore && !loadingMore && !loading) {
          fetchStudios(false)
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
  }, [hasMore, loadingMore, loading, fetchStudios])

  // Profile now comes from AuthProvider - no need to fetch separately

  // OPTIMIZED: Fetch shared lists once on mount for authenticated users
  const fetchSharedLists = useCallback(async () => {
    // Only fetch lists if user is authenticated
    if (sharedProfile && !profileLoading) {
      setListsLoading(true)
      try {
        const result = await getUserLists()
        if (result.success) {
          setSharedLists(result.data || [])
        } else {
          console.error('Failed to fetch shared lists:', result.error)
          setSharedLists([])
        }
      } catch (error) {
        console.error('Error fetching shared lists:', error)
        setSharedLists([])
      } finally {
        setListsLoading(false)
      }
    } else if (!profileLoading && !sharedProfile) {
      // User is not authenticated, clear lists
      setSharedLists([])
      setListsLoading(false)
    }
  }, [sharedProfile, profileLoading])

  useEffect(() => {
    fetchSharedLists()
  }, [fetchSharedLists])

  // Initialize data on mount
  useEffect(() => {
    fetchStudios(true) // Reset to first page
    fetchAmenities()
    fetchAvailableGear()
  }, [])

  const fetchAmenities = async () => {
    const { data } = await createClient().from("amenities").select("*").order("name")
    if (data) {
      setAmenities(data)
    }
  }

  const fetchAvailableGear = async () => {
    try {
      const { data, error } = await createClient()
        .from("studios")
        .select("gear")
        .eq("published", true)
        .eq("verification_status", "verified")
        .not("gear", "is", null)

      if (error) {
        console.error("Error fetching gear:", error)
        return
      }

      if (data) {
        const allGearItems = new Set<string>()
        
        data.forEach((studio: any) => {
          if (studio.gear && typeof studio.gear === 'object') {
            Object.entries(studio.gear).forEach(([category, items]) => {
              if (Array.isArray(items)) {
                items.forEach((item: string) => {
                  if (typeof item === 'string' && item.trim()) {
                    allGearItems.add(item.trim())
                  }
                })
              } else if (typeof items === 'string' && items.trim()) {
                allGearItems.add(items.trim())
              }
            })
          } else if (typeof studio.gear === 'string' && studio.gear.trim()) {
            // Handle plain text gear descriptions
            const gearWords = studio.gear.toLowerCase().split(/[,\s]+/)
            gearWords.forEach((word: any) => {
              if (word.length > 2) { // Only include meaningful words
                allGearItems.add(word)
              }
            })
          }
        })

        // Convert to array and sort
        const gearArray = Array.from(allGearItems)
          .sort((a, b) => a.localeCompare(b))
          .slice(0, 100) // Limit to most common 100 items for performance

        const gearItems: GearItem[] = gearArray.map(item => ({
          category: 'equipment',
          item: item
        }))

        setAvailableGear(gearItems)
      }
    } catch (error) {
      console.error("Error processing gear data:", error)
    }
  }

  const handleSearchFilters = useCallback(() => {
    updateURL(filters)
    fetchStudios(true) // Reset and apply filters
  }, [filters, updateURL, fetchStudios])

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
    updateURL(clearedFilters)
    // Fetch all studios after clearing filters
    setTimeout(() => {
      fetchStudios(true)
    }, 0)
  }, [updateURL, fetchStudios])

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${i < Math.floor(rating) ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`}
      />
    ))
  }

  if (loading) {
    return (
      <div className="p-4 md:p-6 min-h-screen">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Mobile Filters Skeleton */}
          <div className="lg:hidden">
            <Skeleton className="h-10 w-24 mb-4" />
          </div>

          {/* Desktop Filters Sidebar Skeleton */}
          <div className="hidden lg:block lg:w-80">
            <div className="sticky top-6 h-[calc(100vh-3rem)]">
              <Card className="h-full">
                <CardContent className="p-6 h-full overflow-y-auto">
                  <Skeleton className="h-6 w-16 mb-4" />
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-16" />
                      <Skeleton className="h-10 w-full" />
                    </div>
                    <div className="space-y-4">
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-4 w-full" />
                    </div>
                                         <div className="space-y-4">
                       <Skeleton className="h-4 w-16" />
                       <div className="space-y-3">
                         {Array.from({ length: 6 }, (_, i) => (
                           <div key={i} className="flex items-center space-x-2">
                             <Skeleton className="h-4 w-4" />
                             <Skeleton className="h-4 w-20" />
                           </div>
                         ))}
                       </div>
                     </div>
                     <div className="space-y-4">
                       <Skeleton className="h-4 w-24" />
                       <div className="space-y-3">
                         {Array.from({ length: 8 }, (_, i) => (
                           <div key={i} className="flex items-center space-x-2">
                             <Skeleton className="h-4 w-4" />
                             <Skeleton className="h-4 w-24" />
                           </div>
                         ))}
                       </div>
                     </div>
                     <div className="pt-4 border-t space-y-3">
                       <Skeleton className="h-10 w-full" />
                       <Skeleton className="h-8 w-full" />
                     </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Studios Grid Skeleton */}
          <div className="flex-1">
            <div className="mb-6">
              <Skeleton className="h-8 w-48 mb-2" />
              <Skeleton className="h-5 w-32" />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4 sm:gap-6">
              {Array.from({ length: STUDIOS_PER_PAGE }, (_, i) => (
                <StudioCardSkeleton key={i} />
              ))}
            </div>
          </div>
        </div>
      </div>
    )
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
          availableGear={availableGear}
          onFilterChange={handleFilterChange}
          onSearchFilters={handleSearchFilters}
          onClearFilters={handleClearFilters}
          isLoading={loading}
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
                  availableGear={availableGear}
                  onFilterChange={handleFilterChange}
                  onSearchFilters={handleSearchFilters}
                  onClearFilters={handleClearFilters}
                  isLoading={loading}
                />
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Studios Grid */}
        <div className="flex-1 overflow-y-auto">
          {/* <div className="mb-6">
            <h1 className="text-3xl font-bold mb-2">Browse Recording Studios</h1>
            <p className="text-muted-foreground">
              {loading ? "Loading studios..." : `${totalCount} studios found`}
            </p>
          </div> */}

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4 sm:gap-6 bg-muted/20 p-4 sm:p-6 rounded-lg border">
              {Array.from({ length: 6 }).map((_, i) => (
                <Card key={i} className="overflow-hidden">
                  <Skeleton className="h-48 w-full" />
                  <CardContent className="p-4">
                    <Skeleton className="h-6 w-3/4 mb-2" />
                    <Skeleton className="h-4 w-1/2 mb-2" />
                    <Skeleton className="h-4 w-full mb-2" />
                    <Skeleton className="h-4 w-2/3" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : studios.length === 0 ? (
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
                  verification_status: studio.verification_status || 'unverified'
                }}
                memberships={batchMemberships[studio.id.toString()] || []}
                sharedProfile={sharedProfile}
                profileLoading={profileLoading}
                sharedLists={sharedLists}
                listsLoading={listsLoading}
                onListsChange={fetchSharedLists}
                showAmenities={true}
                linkToStudio={true}
                priority={index < 6}
              />
            ))}
          </div>


              {/* Infinite Scroll Trigger & Loading Indicator */}
              {hasMore && (
                <div ref={loadMoreRef} className="mt-8 min-h-[20px] flex items-center justify-center">
                  {loadingMore ? (
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