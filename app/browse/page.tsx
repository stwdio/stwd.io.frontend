"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Slider } from "@/components/ui/slider"
import { Badge } from "@/components/ui/badge"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"
import { Star, MapPin, Plus, Filter } from "lucide-react"
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

export default function BrowsePage() {
  const [studios, setStudios] = useState<Studio[]>([])
  const [amenities, setAmenities] = useState<Amenity[]>([])
  const [loading, setLoading] = useState(true)
  const [showFilters, setShowFilters] = useState(false)
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

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-b-2 border-primary"></div>
          <p className="text-muted-foreground">Loading studios...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
      {/* Header */}
      <header className="flex h-16 shrink-0 items-center gap-2">
        <div className="flex items-center gap-2">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <h1 className="text-lg font-semibold">Browse Studios</h1>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
            className="md:hidden"
          >
            <Filter className="h-4 w-4" />
            Filters
          </Button>
        </div>
      </header>

      <div className="flex flex-1 gap-4">
        {/* Filters Panel */}
        <div className={`${showFilters ? 'block' : 'hidden'} md:block w-full md:w-80 space-y-6`}>
          <Card className="p-4">
            <h2 className="text-lg font-semibold mb-4">Filters</h2>

            {/* Location Filter */}
            <div className="space-y-2 mb-4">
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                placeholder="Enter City Or Area"
                value={locationFilter}
                onChange={(e) => setLocationFilter(e.target.value)}
              />
            </div>

            {/* Price Range Filter */}
            <div className="space-y-4 mb-4">
              <Label>Price Range (Per Hour)</Label>
              <Slider value={priceRange} onValueChange={setPriceRange} max={500} min={0} step={10} className="w-full" />
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>${priceRange[0]}</span>
                <span>${priceRange[1]}</span>
              </div>
            </div>

            {/* Amenities Filter */}
            <div className="space-y-4">
              <Label>Amenities</Label>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {amenities.map((amenity) => (
                  <div key={amenity.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={`amenity-${amenity.id}`}
                      checked={selectedAmenities.includes(amenity.name)}
                      onCheckedChange={(checked) => handleAmenityChange(amenity.name, checked as boolean)}
                    />
                    <Label htmlFor={`amenity-${amenity.id}`} className="text-sm">
                      {amenity.name}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </div>

        {/* Studios Grid */}
        <div className="flex-1">
          {studios.length === 0 ? (
            <div className="flex h-64 items-center justify-center">
              <div className="text-center">
                <p className="text-lg text-muted-foreground">No studios found</p>
                <p className="text-sm text-muted-foreground">Try adjusting your filters</p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {studios.map((studio) => (
                <Card key={studio.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                  <div className="relative h-48 bg-muted">
                    <Image
                      src="/placeholder.jpg"
                      alt={studio.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-semibold text-lg">{studio.name}</h3>
                      <div className="flex items-center gap-1">
                        {renderStars(studio.average_rating || 0)}
                        <span className="text-sm text-muted-foreground ml-1">
                          ({studio.review_count || 0})
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-1 text-sm text-muted-foreground mb-2">
                      <MapPin className="h-4 w-4" />
                      {studio.location}
                    </div>
                    
                    <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                      {studio.description}
                    </p>
                    
                    {studio.amenities && studio.amenities.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-3">
                        {studio.amenities.slice(0, 3).map((amenity) => (
                          <Badge key={amenity} variant="secondary" className="text-xs">
                            {amenity}
                          </Badge>
                        ))}
                        {studio.amenities.length > 3 && (
                          <Badge variant="secondary" className="text-xs">
                            +{studio.amenities.length - 3} more
                          </Badge>
                        )}
                      </div>
                    )}
                    
                    <div className="flex items-center justify-between">
                      <div className="text-lg font-semibold">
                        ${studio.hourly_rate}/hr
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => addStudio(studio)}
                          disabled={basketStudios.some((s) => s.id === studio.id)}
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                        <Button size="sm" asChild>
                          <Link href={`/studios/${studio.id}`}>
                            View Details
                          </Link>
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
