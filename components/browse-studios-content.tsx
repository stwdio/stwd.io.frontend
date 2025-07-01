"use client"

import { useState, useEffect, useMemo, useCallback } from "react"
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
import Link from "next/link"
import { supabase } from "@/lib/supabase"
import { useQuoteBasket } from "@/lib/store/quote-basket"

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

const STUDIOS_PER_PAGE = 9

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

  const hasActiveFilters = useMemo(() => {
    return filters.location || 
           filters.priceRange[0] > 0 || 
           filters.priceRange[1] < 500 ||
           filters.selectedAmenities.length > 0 ||
           filters.selectedGear.length > 0
  }, [filters])

  const handleFormSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault()
    onSearchFilters()
  }, [onSearchFilters])

  return (
    <form onSubmit={handleFormSubmit} className="space-y-6">
      {/* Location Filter */}
      <div className="space-y-2">
        <Label htmlFor="location-filter" className="text-sm font-medium">
          Location
        </Label>
        <div className="relative">
          <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            id="location-filter"
            type="text"
            placeholder="Enter city or area..."
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
          {filters.selectedAmenities.length > 0 && (
            <Badge variant="secondary" className="text-xs">
              {filters.selectedAmenities.length} selected
            </Badge>
          )}
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
          {filters.selectedGear.length > 0 && (
            <Badge variant="secondary" className="text-xs">
              {filters.selectedGear.length} selected
            </Badge>
          )}
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search equipment..."
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
              <div key={`${gear.item}-${index}`} className="flex items-center space-x-2">
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
              {filters.gearSearch ? `No equipment found matching "${filters.gearSearch}"` : "Loading equipment..."}
            </p>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="pt-4 border-t space-y-3">
        <Button 
          type="submit"
          className="w-full"
          size="lg"
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
        
        {hasActiveFilters && (
          <Button 
            type="button"
            onClick={onClearFilters}
            variant="outline" 
            className="w-full"
            size="sm"
            disabled={isLoading}
          >
            <RotateCcw className="h-4 w-4 mr-2" />
            Clear All Filters
          </Button>
        )}
      </div>
    </form>
  )
}

export function BrowseStudiosContent() {
  const [studios, setStudios] = useState<Studio[]>([])
  const [amenities, setAmenities] = useState<Amenity[]>([])
  const [availableGear, setAvailableGear] = useState<GearItem[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const [currentPage, setCurrentPage] = useState(0)
  const [totalCount, setTotalCount] = useState(0)
  const { addStudio, studios: basketStudios } = useQuoteBasket()

  // Consolidated filter state
  const [filters, setFilters] = useState<FilterState>({
    location: "",
    priceRange: [0, 500],
    selectedAmenities: [],
    selectedGear: [],
    amenitySearch: "",
    gearSearch: ""
  })

  // Debounce location filter to prevent excessive API calls
  const debouncedLocationFilter = useDebounce(filters.location, 500)

  // Memoized filter change handler to prevent recreation
  const handleFilterChange = useCallback((newFilters: Partial<FilterState>) => {
    setFilters(prev => ({ ...prev, ...newFilters }))
  }, [])

  // Initialize data on mount
  useEffect(() => {
    fetchStudios(true) // Reset to first page
    fetchAmenities()
    fetchAvailableGear()
  }, [])

  // Trigger search when debounced location changes
  useEffect(() => {
    if (debouncedLocationFilter !== filters.location) {
      // Only trigger if the debounced value is different from current
      return
    }
    fetchStudios(true)
  }, [debouncedLocationFilter])

  const buildQuery = useCallback(() => {
    let query = supabase
      .from("studios")
      .select(`
        *,
        studio_amenities (
          amenities (name)
        )
      `, { count: 'exact' })
      .eq("published", true)
      .eq("verification_status", "verified")

    if (debouncedLocationFilter) {
      query = query.ilike("location", `%${debouncedLocationFilter}%`)
    }

    query = query.gte("hourly_rate", filters.priceRange[0]).lte("hourly_rate", filters.priceRange[1])

    return query
  }, [debouncedLocationFilter, filters.priceRange])

  const fetchStudios = async (reset = false) => {
    const pageToFetch = reset ? 0 : currentPage
    const isFirstLoad = reset || pageToFetch === 0

    if (isFirstLoad) {
      setLoading(true)
    } else {
      setLoadingMore(true)
    }

    try {
      const query = buildQuery()
      const { data, error, count } = await query
        .range(pageToFetch * STUDIOS_PER_PAGE, (pageToFetch + 1) * STUDIOS_PER_PAGE - 1)
        .order('created_at', { ascending: false })

      if (error) {
        console.error("Error fetching studios:", error)
        return
      }

      if (data) {
        let studiosWithStats = data.map((studio) => ({
          ...studio,
          average_rating: 0,
          review_count: 0,
          amenities: studio.studio_amenities?.map((sa: any) => sa.amenities?.name).filter(Boolean) || [],
        }))

        // Apply amenity filter on client side since it's complex
        if (filters.selectedAmenities.length > 0) {
          studiosWithStats = studiosWithStats.filter((studio) =>
            filters.selectedAmenities.every((amenity) => studio.amenities?.includes(amenity)),
          )
        }

        // Apply gear filter on client side
        if (filters.selectedGear.length > 0) {
          studiosWithStats = studiosWithStats.filter((studio) => {
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
          setCurrentPage(1)
        } else {
          // Prevent duplicates by filtering out studios that already exist
          setStudios(prev => {
            const existingIds = new Set(prev.map(s => s.id))
            const newStudios = studiosWithStats.filter(studio => !existingIds.has(studio.id))
            return [...prev, ...newStudios]
          })
          setCurrentPage(prev => prev + 1)
        }

        setTotalCount(count || 0)
        setHasMore(data.length === STUDIOS_PER_PAGE)
      }
    } catch (error) {
      console.error("Error fetching studios:", error)
    } finally {
      setLoading(false)
      setLoadingMore(false)
    }
  }

  const loadMore = useCallback(() => {
    if (!loadingMore && hasMore) {
      fetchStudios(false)
    }
  }, [loadingMore, hasMore])

  const fetchAmenities = async () => {
    const { data } = await supabase.from("amenities").select("*").order("name")
    if (data) {
      setAmenities(data)
    }
  }

  const fetchAvailableGear = async () => {
    try {
      const { data, error } = await supabase
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
        
        data.forEach((studio) => {
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
            gearWords.forEach(word => {
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
    fetchStudios(true) // Reset and apply filters
  }, [])

  const handleClearFilters = useCallback(() => {
    setFilters({
      location: "",
      priceRange: [0, 500],
      selectedAmenities: [],
      selectedGear: [],
      amenitySearch: "",
      gearSearch: ""
    })
    // Fetch all studios after clearing filters
    setTimeout(() => {
      fetchStudios(true)
    }, 0)
  }, [])

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
      <div className="p-4 md:p-6">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Mobile Filters Skeleton */}
          <div className="lg:hidden">
            <Skeleton className="h-10 w-24 mb-4" />
          </div>

          {/* Desktop Filters Sidebar Skeleton */}
          <div className="hidden lg:block lg:w-80">
            <div className="sticky top-6">
              <Card>
                <CardContent className="p-6">
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

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
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
    <div className="p-4 md:p-6">
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Mobile Filters */}
        <div className="lg:hidden">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" className="mb-4">
                <Filter className="h-4 w-4 mr-2" />
                Filters
                {(filters.selectedAmenities.length > 0 || filters.selectedGear.length > 0 || filters.location) && (
                  <Badge variant="secondary" className="ml-2 text-xs">
                    {filters.selectedAmenities.length + filters.selectedGear.length + (filters.location ? 1 : 0)}
                  </Badge>
                )}
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-80 overflow-y-auto">
              <SheetHeader>
                <SheetTitle>Filters</SheetTitle>
              </SheetHeader>
              <div className="mt-6">
                <FiltersContent
                  filters={filters}
                  amenities={amenities}
                  availableGear={availableGear}
                  onFilterChange={handleFilterChange}
                  onSearchFilters={handleSearchFilters}
                  onClearFilters={handleClearFilters}
                  isLoading={loading}
                />
              </div>
            </SheetContent>
          </Sheet>
        </div>

        {/* Desktop Filters Sidebar */}
        <div className="hidden lg:block lg:w-80">
          <div className="sticky top-6">
            <Card className="shadow-sm">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold">Filters</h2>
                  {(filters.selectedAmenities.length > 0 || filters.selectedGear.length > 0 || filters.location) && (
                    <Badge variant="secondary" className="text-xs">
                      {filters.selectedAmenities.length + filters.selectedGear.length + (filters.location ? 1 : 0)} active
                    </Badge>
                  )}
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
        <div className="flex-1">
          <div className="mb-6">
            <h1 className="text-2xl font-bold">Browse Studios</h1>
            <p className="text-muted-foreground mt-1">
              Found {totalCount} studio{totalCount !== 1 ? 's' : ''}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {studios.map((studio) => (
              <Link key={studio.id} href={`/studios/${studio.id}`} className="block">
                <Card className="overflow-hidden hover:shadow-lg transition-shadow p-0 gap-0 cursor-pointer h-full flex flex-col">
                  <div className="aspect-video relative overflow-hidden rounded-t-lg">
                    <StudioImage
                      src={null} // TODO: Replace with actual studio image URL from database
                      alt={studio.name}
                      fill
                      width={300}
                      height={200}
                      className="object-cover"
                    />
                  </div>
                  <CardContent className="p-4 flex flex-col flex-1">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-semibold text-lg truncate">{studio.name}</h3>
                      <div className="text-right">
                        <p className="font-bold text-lg">${studio.hourly_rate}</p>
                        <p className="text-sm text-muted-foreground">per hour</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center mb-2">
                      <MapPin className="h-4 w-4 text-muted-foreground mr-1" />
                      <span className="text-sm text-muted-foreground">{studio.location}</span>
                    </div>

                    <div className="flex items-center mb-3">
                      <div className="flex">{renderStars(studio.average_rating || 0)}</div>
                      <span className="text-sm text-muted-foreground ml-2">
                        ({studio.review_count || 0} reviews)
                      </span>
                    </div>

                    <p className="text-sm text-muted-foreground mb-3 line-clamp-2 flex-1">
                      {studio.description}
                    </p>

                    <div className="flex flex-wrap gap-1 mb-4 min-h-[24px]">
                      {studio.amenities?.slice(0, 3).map((amenity) => (
                        <Badge key={amenity} variant="secondary" className="text-xs">
                          {amenity}
                        </Badge>
                      ))}
                      {studio.amenities && studio.amenities.length > 3 && (
                        <Badge variant="secondary" className="text-xs">
                          +{studio.amenities.length - 3} more
                        </Badge>
                      )}
                    </div>

                    {/* Fixed height action area */}
                    <div className="mt-auto">
                      <StudioCardActions studio={studio} />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>

          {/* Load More Button */}
          {hasMore && (
            <div className="mt-8 text-center">
              <Button 
                onClick={loadMore}
                disabled={loadingMore}
                variant="outline"
                className="min-w-32"
              >
                {loadingMore ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Loading...
                  </>
                ) : (
                  'Load More Studios'
                )}
              </Button>
            </div>
          )}

          {studios.length === 0 && !loading && (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No studios found matching your criteria.</p>
              <p className="text-sm text-muted-foreground mt-2">Try adjusting your filters.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
} 