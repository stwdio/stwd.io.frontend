"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import Image from "next/image"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Star, MapPin, Wifi } from "lucide-react"
import { BookingWidget } from "@/components/booking-widget"
import { supabase } from "@/lib/supabase"
import { generateIdenticon } from "@/lib/identicon"

interface Studio {
  id: string
  name: string
  description: string
  hourly_rate: number
  location: string
  gear: any
  owner_id: string
  created_at: string
}

interface Review {
  id: string
  rating: number
  comment: string | null
  created_at: string
  profiles: {
    full_name: string | null
    avatar_url: string | null
    id: string
  }
}

interface Amenity {
  name: string
}

export default function StudioDetailPage() {
  const params = useParams()
  const studioId = params.id as string

  const [studio, setStudio] = useState<Studio | null>(null)
  const [reviews, setReviews] = useState<Review[]>([])
  const [amenities, setAmenities] = useState<Amenity[]>([])
  const [loading, setLoading] = useState(true)
  const [averageRating, setAverageRating] = useState(0)

  useEffect(() => {
    if (studioId) {
      fetchStudioData()
    }
  }, [studioId])

  const fetchStudioData = async () => {
    // Fetch studio details
    const { data: studioData } = await supabase.from("studios").select("*").eq("id", studioId).single()

    if (studioData) {
      setStudio(studioData)
    }

    // Fetch reviews
    const { data: reviewsData } = await supabase
      .from("reviews")
      .select(`
        *,
        profiles (full_name, avatar_url, id)
      `)
      .eq("studio_id", studioId)
      .order("created_at", { ascending: false })

    if (reviewsData) {
      setReviews(reviewsData)
      const avgRating =
        reviewsData.length > 0 ? reviewsData.reduce((sum, review) => sum + review.rating, 0) / reviewsData.length : 0
      setAverageRating(avgRating)
    }

    // Fetch amenities
    const { data: amenitiesData } = await supabase
      .from("studio_amenities")
      .select(`
        amenities (name)
      `)
      .eq("studio_id", studioId)

    if (amenitiesData) {
      setAmenities(amenitiesData.map((item) => item.amenities))
    }

    setLoading(false)
  }

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${i < Math.floor(rating) ? "fill-yellow-400 text-yellow-400" : "text-gray-600"}`}
      />
    ))
  }

  const getAvatarSrc = (profile: any) => {
    if (profile?.avatar_url) {
      return profile.avatar_url
    }
    return generateIdenticon(profile?.id || "")
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">Loading studio details...</div>
      </div>
    )
  }

  if (!studio) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">Studio not found</div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-8">
          {/* Image Gallery */}
          <div className="space-y-4">
            <div className="aspect-video relative overflow-hidden rounded-lg">
              <Image src="/placeholder.svg?height=400&width=600" alt={studio.name} fill className="object-cover" />
            </div>
            <div className="grid grid-cols-4 gap-2">
              {Array.from({ length: 4 }, (_, i) => (
                <div key={i} className="aspect-square relative overflow-hidden rounded-lg">
                  <Image
                    src={`/placeholder.svg?height=150&width=150`}
                    alt={`${studio.name} ${i + 1}`}
                    fill
                    className="object-cover cursor-pointer hover:opacity-80 transition-opacity"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Studio Info */}
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold mb-2">{studio.name}</h1>
              <div className="flex items-center space-x-4 text-gray-400">
                <div className="flex items-center">
                  <MapPin className="h-4 w-4 mr-1" />
                  {studio.location}
                </div>
                <div className="flex items-center space-x-1">
                  {renderStars(averageRating)}
                  <span className="ml-2">({reviews.length} reviews)</span>
                </div>
              </div>
            </div>

            <p className="text-gray-300 leading-relaxed">{studio.description}</p>

            {/* Amenities */}
            {amenities.length > 0 && (
              <div>
                <h3 className="text-xl font-semibold mb-3">Amenities</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {amenities.map((amenity, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <Wifi className="h-4 w-4 text-gray-400" />
                      <span className="text-sm">{amenity.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Gear List */}
            {studio.gear && Object.keys(studio.gear).length > 0 && (
              <div>
                <h3 className="text-xl font-semibold mb-3">Available Gear</h3>
                <div className="grid gap-4">
                  {Object.entries(studio.gear).map(([category, items]) => (
                    <div key={category}>
                      <h4 className="font-medium text-gray-300 mb-2 capitalize">{category}</h4>
                      <div className="flex flex-wrap gap-2">
                        {Array.isArray(items) ? (
                          items.map((item: string, index: number) => (
                            <Badge key={index} variant="secondary">
                              {item}
                            </Badge>
                          ))
                        ) : (
                          <Badge variant="secondary">{items}</Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Reviews */}
          <div>
            <h3 className="text-xl font-semibold mb-6">Reviews ({reviews.length})</h3>
            <div className="space-y-6">
              {reviews.map((review) => (
                <Card key={review.id} className="bg-gray-900/50 border-gray-800">
                  <CardContent className="p-6">
                    <div className="flex items-start space-x-4">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={getAvatarSrc(review.profiles) || "/placeholder.svg"} />
                        <AvatarFallback>{review.profiles.full_name?.charAt(0) || "U"}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <div>
                            <p className="font-medium">{review.profiles.full_name || "Anonymous"}</p>
                            <div className="flex items-center space-x-1">{renderStars(review.rating)}</div>
                          </div>
                          <p className="text-sm text-gray-400">{new Date(review.created_at).toLocaleDateString()}</p>
                        </div>
                        {review.comment && <p className="text-gray-300">{review.comment}</p>}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
              {reviews.length === 0 && (
                <p className="text-gray-400 text-center py-8">No reviews yet. Be the first to book and review!</p>
              )}
            </div>
          </div>
        </div>

        {/* Booking Widget */}
        <div className="lg:col-span-1">
          <div className="sticky top-24">
            <BookingWidget studio={studio} />
          </div>
        </div>
      </div>
    </div>
  )
}
