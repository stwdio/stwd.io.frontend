"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Slider } from "@/components/ui/slider"
import { Badge } from "@/components/ui/badge"
import { Star, MapPin } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { supabase } from "@/lib/supabase"

interface Studio {
  id: string
  name: string
  description: string
  hourly_rate: number
  location: string
  owner_id: string
  published: boolean
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
    // First, let's use a simpler query structure that works with the current database schema
    const { data, error } = await supabase
      .from("studios")
      .select(`
        *,
        studio_amenities (
          amenities (name)
        )
      `)
      .eq("published", true)

    if (error) {
      console.error("Error fetching studios:", error)
      setLoading(false)
      return
    }

    if (data) {
      // For now, we'll set reviews to empty arrays since we need to query them through bookings
      const studiosWithStats = data.map((studio) => ({
        ...studio,
        average_rating: 0, // We'll update this when we have bookings/reviews
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
        average_rating: 0, // We'll update this when we have bookings/reviews
        review_count: 0,
        amenities: studio.studio_amenities?.map((sa: any) => sa.amenities?.name).filter(Boolean) || [],
      }))

      // Filter by amenities if any selected
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
        className={`h-4 w-4 ${i < Math.floor(rating) ? "fill-yellow-400 text-yellow-400" : "text-gray-600"}`}
      />
    ))
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">Loading studios...</div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Filters Sidebar */}
        <div className="lg:w-80 space-y-6">
          <div className="sticky top-24">
            <h2 className="text-2xl font-bold mb-6">Filters</h2>

            {/* Location Filter */}
            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                placeholder="Enter City Or Area"
                value={locationFilter}
                onChange={(e) => setLocationFilter(e.target.value)}
              />
            </div>

            {/* Price Range Filter */}
            <div className="space-y-4">
              <Label>Price Range (Per Hour)</Label>
              <Slider value={priceRange} onValueChange={setPriceRange} max={500} min={0} step={10} className="w-full" />
              <div className="flex justify-between text-sm text-gray-400">
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
                      id={amenity.id}
                      checked={selectedAmenities.includes(amenity.name)}
                      onCheckedChange={(checked) => handleAmenityChange(amenity.name, checked as boolean)}
                    />
                    <Label htmlFor={amenity.id} className="text-sm">
                      {amenity.name}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Studios Grid */}
        <div className="flex-1">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold">Recording Studios</h1>
            <p className="text-gray-400">{studios.length} Studios Found</p>
          </div>

          <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
            {studios.map((studio) => (
              <Card key={studio.id} className="bg-gray-900/50 border-gray-800 hover:border-gray-700 transition-colors">
                <div className="aspect-video relative overflow-hidden rounded-t-lg">
                  <Image src="/placeholder.svg?height=200&width=300" alt={studio.name} fill className="object-cover" />
                </div>
                <CardContent className="p-6">
                  <div className="space-y-3">
                    <div>
                      <h3 className="text-xl font-semibold mb-1">{studio.name}</h3>
                      <div className="flex items-center text-sm text-gray-400">
                        <MapPin className="h-4 w-4 mr-1" />
                        {studio.location}
                      </div>
                    </div>

                    <p className="text-gray-300 text-sm line-clamp-2">{studio.description}</p>

                    {studio.amenities && studio.amenities.length > 0 && (
                      <div className="flex flex-wrap gap-1">
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
                      <div className="flex items-center space-x-2">
                        <div className="flex items-center">{renderStars(studio.average_rating || 0)}</div>
                        <span className="text-sm text-gray-400">({studio.review_count || 0})</span>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold">${studio.hourly_rate}</div>
                        <div className="text-xs text-gray-400">per hour</div>
                      </div>
                    </div>

                    <Button asChild className="w-full">
                      <Link href={`/studios/${studio.id}`}>View Details</Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {studios.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-400 text-lg">No Studios Found Matching Your Criteria.</p>
              <p className="text-gray-500 mt-2">Try Adjusting Your Filters.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
