'use client'

import { useState } from 'react'
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Star, MapPin, ChevronLeft, ChevronRight, ChevronDown, ChevronUp, Search } from "lucide-react"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { StudioImage } from "@/components/studio-image-placeholder"
import { StudioDetailActions } from "@/components/studio-detail-actions"
import { imagePresets } from "@/lib/utils/image-transformations"
// Price tier imports removed for healthier discovery experience
import { BackButton } from "@/components/back-button"
import { cn } from "@/lib/utils"
import { FollowersList } from "@/components/social/followers-list"

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
  const [gearOpen, setGearOpen] = useState(true)
  const [gearSearchQuery, setGearSearchQuery] = useState('')
  const [reviewSearchQuery, setReviewSearchQuery] = useState('')
  
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
              <div>
                <h1 className="text-4xl font-bold tracking-tight">{studio.name}</h1>
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

            {/* Description */}
            <div>
              <p className="text-base leading-relaxed text-foreground/90">
                {studio.description}
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 w-full">
              <StudioDetailActions studio={studio} />
            </div>


            {/* Gear Section - Collapsible with Search */}
            {studio.gear && Object.keys(studio.gear).length > 0 && (
              <Collapsible open={gearOpen} onOpenChange={setGearOpen}>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <CollapsibleTrigger asChild>
                      <Button variant="ghost" className="p-0 h-auto hover:bg-transparent">
                        <h3 className="text-lg font-semibold flex items-center gap-2">
                          Gear
                          {gearOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                        </h3>
                      </Button>
                    </CollapsibleTrigger>
                    {gearOpen && (
                      <div className="relative w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          type="text"
                          placeholder="Search Gear..."
                          value={gearSearchQuery}
                          onChange={(e) => setGearSearchQuery(e.target.value)}
                          className="pl-9 h-9"
                        />
                      </div>
                    )}
                  </div>
                  <CollapsibleContent className="space-y-4">
                    {Object.entries(studio.gear).map(([category, items]) => {
                      const filteredItems = Array.isArray(items) 
                        ? items.filter((item: string) => 
                            item.toLowerCase().includes(gearSearchQuery.toLowerCase())
                          )
                        : [String(items)].filter(item => 
                            item.toLowerCase().includes(gearSearchQuery.toLowerCase())
                          )
                      
                      if (filteredItems.length === 0) return null
                      
                      return (
                        <div key={category} className="space-y-2">
                          <h4 className="text-sm font-medium text-muted-foreground capitalize">
                            {category}
                          </h4>
                          <div className="flex flex-wrap gap-2">
                            {filteredItems.map((item: string, index: number) => (
                              <Badge key={index} variant="secondary" className="font-normal">
                                {item}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )
                    })}
                  </CollapsibleContent>
                </div>
              </Collapsible>
            )}

            {/* Studio Followers */}
            <div>
              <FollowersList studioId={studio.id} limit={10} />
            </div>

            {/* Reviews Section with Search */}
            <div className="space-y-4 pb-8">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Reviews</h3>
                {reviews.length > 0 && (
                  <div className="relative w-64">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="text"
                      placeholder="Search Reviews..."
                      value={reviewSearchQuery}
                      onChange={(e) => setReviewSearchQuery(e.target.value)}
                      className="pl-9 h-9"
                    />
                  </div>
                )}
              </div>
              {reviews.length > 0 ? (
                <div className="space-y-4">
                  {reviews
                    .filter(review => {
                      const searchLower = reviewSearchQuery.toLowerCase()
                      const reviewerName = review.reviewer?.first_name || 'Anonymous'
                      return reviewerName.toLowerCase().includes(searchLower) ||
                             (review.comment && review.comment.toLowerCase().includes(searchLower))
                    })
                    .slice(0, showAllReviews ? undefined : 3)
                    .map((review) => (
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
                    ))
                  }
                  {reviews.filter(review => {
                    const searchLower = reviewSearchQuery.toLowerCase()
                    const reviewerName = review.reviewer?.first_name || 'Anonymous'
                    return reviewerName.toLowerCase().includes(searchLower) ||
                           (review.comment && review.comment.toLowerCase().includes(searchLower))
                  }).length > 3 && (
                    <Button
                      variant="link"
                      onClick={() => setShowAllReviews(!showAllReviews)}
                      className="px-0 h-auto font-normal text-base"
                    >
                      {showAllReviews ? 'Show less' : `Show all ${reviews.filter(review => {
                        const searchLower = reviewSearchQuery.toLowerCase()
                        const reviewerName = review.reviewer?.first_name || 'Anonymous'
                        return reviewerName.toLowerCase().includes(searchLower) ||
                               (review.comment && review.comment.toLowerCase().includes(searchLower))
                      }).length} reviews`}
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