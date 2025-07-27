'use client'

import { useState } from 'react'
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Star, MapPin, ChevronLeft, ChevronRight } from "lucide-react"
import { StudioImage } from "@/components/studio-image-placeholder"
import { StudioDetailActions } from "@/components/studio-detail-client"
import { imagePresets } from "@/lib/utils/image-transformations"
import { getPriceTierSymbol } from "@/lib/constants/currencies"
import { BackButton } from "@/components/back-button"
import { cn } from "@/lib/utils"

interface Studio {
  id: number
  name: string
  description: string
  location: string
  hourly_rate: number
  price_tier?: number
  gear: any
  owner_id: number
  created_at: string
  verification_status: string
  published: boolean
  photo_urls?: string[]
}

interface Review {
  id: number
  rating: number
  comment: string | null
  created_at: string
  reviewer?: {
    first_name: string | null
    last_name: string | null
    username: string
    avatar_url?: string | null
  }
}

interface Amenity {
  name: string
}

interface StudioDetailContentProps {
  studio: Studio
  amenities: Amenity[]
  reviews: Review[]
  averageRating: number
  ownerProfile?: any
  currentUserProfile?: any
}

export function StudioDetailContent({ studio, amenities, reviews, averageRating, ownerProfile, currentUserProfile }: StudioDetailContentProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [showAllReviews, setShowAllReviews] = useState(false)
  
  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={cn(
          "h-4 w-4",
          i < Math.floor(rating) ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
        )}
      />
    ))
  }

  // Prepare all images including placeholder if no photos
  const allImages = studio.photo_urls && studio.photo_urls.length > 0 
    ? studio.photo_urls 
    : [null] // Show at least one placeholder

  const handlePreviousImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + allImages.length) % allImages.length)
  }

  const handleNextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % allImages.length)
  }

  return (
    <div className="h-full flex flex-col bg-background overflow-hidden">
      {/* Fixed Header */}
      <div className="flex-shrink-0 border-b bg-background">
        <div className="flex items-center gap-4 px-6 py-4">
          <BackButton href="/discover" label="Back to Studios" />
        </div>
      </div>

      {/* Main Content Area - Two Column Grid */}
      <div className="flex-1 grid grid-cols-[45%_55%] overflow-hidden">
        {/* Left Column - Full Height Image Carousel */}
        <div className="relative bg-black overflow-hidden h-full">
          <div className="relative h-full w-full overflow-hidden">
            <StudioImage
              src={allImages[currentImageIndex] ? imagePresets.galleryLarge(allImages[currentImageIndex]) : null}
              alt={`${studio.name} ${currentImageIndex + 1}`}
              fill
              sizes="45vw"
              className="!h-full !w-full object-cover"
              style={{ position: 'absolute', height: '100%', width: '100%' }}
              priority={currentImageIndex === 0}
            />
            {allImages.length > 1 && (
              <>
                <button
                  onClick={handlePreviousImage}
                  className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/80 hover:bg-white transition-colors flex items-center justify-center"
                  aria-label="Previous image"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <button
                  onClick={handleNextImage}
                  className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/80 hover:bg-white transition-colors flex items-center justify-center"
                  aria-label="Next image"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
              </>
            )}
          </div>
        </div>

        {/* Right Column - Scrollable Content */}
        <div className="h-full overflow-y-auto">
          <div className="p-8 space-y-8">
            {/* Studio Header */}
            <div className="space-y-4">
              <div className="flex items-start justify-between">
                <h1 className="text-4xl font-bold tracking-tight">{studio.name}</h1>
                <div className="text-right">
                  <span className="text-3xl font-bold">
                    {getPriceTierSymbol(studio.price_tier || 1)}
                  </span>
                  <span className="text-sm text-muted-foreground block">Price range</span>
                </div>
              </div>
              <div className="flex items-center gap-6 text-muted-foreground">
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  <span>{studio.location}</span>
                </div>
                <div className="flex items-center gap-2">
                  {renderStars(averageRating)}
                  <span className="text-sm">({reviews.length})</span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col gap-3 w-full">
              <StudioDetailActions studio={studio} />
            </div>

            {/* Description */}
            <div>
              <p className="text-base leading-relaxed text-foreground/90">
                {studio.description}
              </p>
            </div>


            {/* Available Gear Section */}
            {studio.gear && Object.keys(studio.gear).length > 0 && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Available Gear</h3>
                <div className="space-y-4">
                  {Object.entries(studio.gear).map(([category, items]) => (
                    <div key={category} className="space-y-2">
                      <h4 className="text-sm font-medium text-muted-foreground capitalize">
                        {category}
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {Array.isArray(items) ? (
                          items.map((item: string, index: number) => (
                            <Badge key={index} variant="secondary" className="font-normal">
                              {item}
                            </Badge>
                          ))
                        ) : (
                          <Badge variant="secondary" className="font-normal">
                            {String(items)}
                          </Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Reviews Section */}
            <div className="space-y-4 pb-8">
              <h3 className="text-lg font-semibold">
                Reviews ({reviews.length})
              </h3>
              {reviews.length > 0 ? (
                <div className="space-y-4">
                  {reviews.slice(0, showAllReviews ? reviews.length : 3).map((review) => (
                    <div key={review.id} className="space-y-2">
                      <div className="flex items-center gap-3">
                        <div className="flex">
                          {renderStars(review.rating)}
                        </div>
                        <span className="font-medium">
                          {review.reviewer?.first_name || 'Anonymous'}
                        </span>
                      </div>
                      {review.comment && (
                        <p className="text-foreground/80 leading-relaxed">
                          {review.comment}
                        </p>
                      )}
                    </div>
                  ))}
                  {reviews.length > 3 && (
                    <Button
                      variant="link"
                      onClick={() => setShowAllReviews(!showAllReviews)}
                      className="px-0 h-auto font-normal text-base"
                    >
                      {showAllReviews ? 'Show less' : `Show all ${reviews.length} reviews`}
                    </Button>
                  )}
                </div>
              ) : (
                <p className="text-muted-foreground">No reviews yet</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}