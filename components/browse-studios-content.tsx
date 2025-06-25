"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Slider } from "@/components/ui/slider"
import { Badge } from "@/components/ui/badge"
import { Star, MapPin, Plus, Filter } from "lucide-react"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import Link from "next/link"
import Image from "next/image"
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

export function BrowseStudiosContent() {
  const [studios, setStudios] = useState<Studio[]>([])
  const [amenities, setAmenities] = useState<Amenity[]>([])
  const [loading, setLoading] = useState(true)
  const { addStudio, studios: basketStudios } = useQuoteBasket()

  // Filter state
  const [locationFilter, setLocationFilter] = useState("")
  const [priceRange, setPriceRange] = useState([0, 500])
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([])

  useEffect(() => {
    fetchStudios()
    fetchAmenities()
  }, [])

  useEffect(() => {
    applyFilters()
  }, [locationFilter, priceRange, selectedAmenities])

  const fetchStudios = async () => {
    const { data, error } = await supabase
      .from("studios")
      .select(`
        *,
        studio_amenities (
          amenities (name)
        )
      `)
      .eq("published", true)
      .eq("verification_status", "verified")

    if (error) {
      console.error("Error fetching studios:", error)
      setLoading(false)
      return
    }

    if (data) {
      const studiosWithStats = data.map((studio) => ({
        ...studio,
        average_rating: 0,
        review_count: 0,
        amenities: studio.studio_amenities?.map((sa: any) => sa.amenities?.name).filter(Boolean) || [],
      }))
      setStudios(studiosWithStats)
    }
    setLoading(false)
  }

  const fetchAmenities = async () => {
    const { data } = await supabase.from("amenities").select("*").order("name")
    if (data) {
      setAmenities(data)
    }
  }

  const applyFilters = async () => {
    let query = supabase
      .from("studios")
      .select(`
        *,
        studio_amenities (
          amenities (name)
        )
      `)
      .eq("published", true)
      .eq("verification_status", "verified")

    if (locationFilter) {
      query = query.ilike("location", `%${locationFilter}%`)
    }

    query = query.gte("hourly_rate", priceRange[0]).lte("hourly_rate", priceRange[1])

    const { data, error } = await query

    if (error) {
      console.error("Error applying filters:", error)
      return
    }

    if (data) {
      let filteredStudios = data.map((studio) => ({
        ...studio,
        average_rating: 0,
        review_count: 0,
        amenities: studio.studio_amenities?.map((sa: any) => sa.amenities?.name).filter(Boolean) || [],
      }))

      if (selectedAmenities.length > 0) {
        filteredStudios = filteredStudios.filter((studio) =>
          selectedAmenities.every((amenity) => studio.amenities?.includes(amenity)),
        )
      }

      setStudios(filteredStudios)
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
          value={priceRange} 
          onValueChange={setPriceRange} 
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
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading studios...</p>
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
              Found {studios.length} studio{studios.length !== 1 ? 's' : ''}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {studios.map((studio) => (
              <Card key={studio.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                <div className="aspect-video bg-muted relative">
                  <Image
                    src="/placeholder.jpg"
                    alt={studio.name}
                    fill
                    className="object-cover"
                  />
                </div>
                <CardContent className="p-4">
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

                  <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                    {studio.description}
                  </p>

                  <div className="flex flex-wrap gap-1 mb-4">
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

                  <div className="flex gap-2">
                    <Button asChild variant="outline" size="sm" className="flex-1">
                      <Link href={`/studios/${studio.id}`}>View Details</Link>
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => addStudio(studio)}
                      className="flex-1"
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      Add to Quote
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

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