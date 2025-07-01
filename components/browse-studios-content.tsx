"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Slider } from "@/components/ui/slider"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Star, MapPin, Plus, Filter, Loader2 } from "lucide-react"
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
}

interface Amenity {
  id: string
  name: string
}

const STUDIOS_PER_PAGE = 9

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

export function BrowseStudiosContent() {
  const [studios, setStudios] = useState<Studio[]>([])
  const [amenities, setAmenities] = useState<Amenity[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const [currentPage, setCurrentPage] = useState(0)
  const [totalCount, setTotalCount] = useState(0)
  const { addStudio, studios: basketStudios } = useQuoteBasket()

  // Filter state
  const [locationFilter, setLocationFilter] = useState("")
  const [priceRange, setPriceRange] = useState([0, 500])
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([])

  useEffect(() => {
    fetchStudios(true) // Reset to first page
    fetchAmenities()
  }, [])

  useEffect(() => {
    fetchStudios(true) // Reset and apply filters
  }, [locationFilter, priceRange, selectedAmenities])

  const buildQuery = () => {
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

    if (locationFilter) {
      query = query.ilike("location", `%${locationFilter}%`)
    }

    query = query.gte("hourly_rate", priceRange[0]).lte("hourly_rate", priceRange[1])

    return query
  }

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
        if (selectedAmenities.length > 0) {
          studiosWithStats = studiosWithStats.filter((studio) =>
            selectedAmenities.every((amenity) => studio.amenities?.includes(amenity)),
          )
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

  const loadMore = () => {
    if (!loadingMore && hasMore) {
      fetchStudios(false)
    }
  }

  const fetchAmenities = async () => {
    const { data } = await supabase.from("amenities").select("*").order("name")
    if (data) {
      setAmenities(data)
    }
  }

  const handleAmenityChange = (amenityName: string, checked: boolean) => {
    if (checked) {
      setSelectedAmenities([...selectedAmenities, amenityName])
    } else {
      setSelectedAmenities(selectedAmenities.filter((a) => a !== amenityName))
    }
  }

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${i < Math.floor(rating) ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`}
      />
    ))
  }

  const FiltersContent = () => (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="location">Location</Label>
        <Input
          id="location"
          placeholder="Enter City Or Area"
          value={locationFilter}
          onChange={(e) => setLocationFilter(e.target.value)}
        />
      </div>

      <div className="space-y-4">
        <Label>Price Range (Per Hour)</Label>
        <Slider 
          defaultValue={priceRange} 
          onValueCommit={setPriceRange}
          max={500} 
          min={0} 
          step={10} 
          className="w-full" 
        />
        <div className="flex justify-between text-sm text-muted-foreground">
          <span>${priceRange[0]}</span>
          <span>${priceRange[1]}</span>
        </div>
      </div>

      <div className="space-y-4">
        <Label>Amenities</Label>
        <div className="grid grid-cols-1 gap-3 max-h-64 overflow-y-auto">
          {amenities.map((amenity) => (
            <div key={amenity.id} className="flex items-center space-x-2">
              <Checkbox
                id={amenity.id}
                checked={selectedAmenities.includes(amenity.name)}
                onCheckedChange={(checked) => handleAmenityChange(amenity.name, checked as boolean)}
              />
              <Label htmlFor={amenity.id} className="text-sm font-normal cursor-pointer">
                {amenity.name}
              </Label>
            </div>
          ))}
        </div>
      </div>
    </div>
  )

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
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-80">
              <SheetHeader>
                <SheetTitle>Filters</SheetTitle>
              </SheetHeader>
              <div className="mt-6">
                <FiltersContent />
              </div>
            </SheetContent>
          </Sheet>
        </div>

        {/* Desktop Filters Sidebar */}
        <div className="hidden lg:block lg:w-80">
          <div className="sticky top-6">
            <Card>
              <CardContent className="p-6">
                <h2 className="text-lg font-semibold mb-4">Filters</h2>
                <FiltersContent />
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

          {studios.length === 0 && (
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