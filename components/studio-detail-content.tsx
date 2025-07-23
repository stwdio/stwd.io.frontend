'use client'

import { useState } from 'react'
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Star, MapPin, Wifi, ChevronDown, ChevronUp } from "lucide-react"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { StudioImage } from "@/components/studio-image-placeholder"
import { StudioDetailActions } from "@/components/studio-detail-client"
import { StudioReviews } from "@/components/studio-reviews"
import { getStudioPrimaryImageUrl, getTransformedImageUrl } from "@/lib/utils"
import { getPriceTierSymbol } from "@/lib/constants/currencies"

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
}

// Client component for collapsible sections
function CollapsibleSection({ 
  title, 
  children, 
  defaultOpen = true,
  className = "" 
}: { 
  title: string
  children: React.ReactNode
  defaultOpen?: boolean
  className?: string
}) {
  const [isOpen, setIsOpen] = useState(defaultOpen)

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen} className={className}>
      <CollapsibleTrigger asChild>
        <Button variant="ghost" className="w-full justify-between p-0 h-auto">
          <h3 className="text-lg md:text-xl font-semibold">{title}</h3>
          {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </Button>
      </CollapsibleTrigger>
      <CollapsibleContent className="mt-3">
        {children}
      </CollapsibleContent>
    </Collapsible>
  )
}

export function StudioDetailContent({ studio, amenities, reviews, averageRating }: StudioDetailContentProps) {
  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${i < Math.floor(rating) ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`}
      />
    ))
  }

  return (
    <div className="grid lg:grid-cols-3 gap-6 lg:gap-8">
      {/* Main Content */}
      <div className="lg:col-span-2 space-y-6 lg:space-y-8">
        {/* Main Studio Image */}
        <div className="aspect-video relative overflow-hidden rounded-lg">
          <StudioImage
            src={getStudioPrimaryImageUrl(studio.photo_urls, 800)}
            alt={studio.name}
            fill
            width={600}
            height={400}
            className="object-cover"
            priority
          />
        </div>

        {/* Image Gallery */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Gallery</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
            {studio.photo_urls && studio.photo_urls.length > 0 ? (
              // Show actual uploaded photos
              studio.photo_urls.slice(0, 4).map((photoUrl, i) => (
                <div key={i} className="aspect-square relative overflow-hidden rounded-lg">
                  <StudioImage
                    src={getTransformedImageUrl(photoUrl, 150)}
                    alt={`${studio.name} ${i + 1}`}
                    fill
                    width={150}
                    height={150}
                    className="object-cover cursor-pointer hover:opacity-80 transition-opacity"
                  />
                </div>
              ))
            ) : (
              // Show placeholder images if no photos uploaded
              Array.from({ length: 4 }, (_, i) => (
                <div key={i} className="aspect-square relative overflow-hidden rounded-lg">
                  <StudioImage
                    src={null}
                    alt={`${studio.name} ${i + 1}`}
                    fill
                    width={150}
                    height={150}
                    className="object-cover cursor-pointer hover:opacity-80 transition-opacity"
                  />
                </div>
              ))
            )}
          </div>
        </div>

        {/* Studio Info */}
        <div className="space-y-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold mb-2">{studio.name}</h1>
            <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4 space-y-2 sm:space-y-0 text-muted-foreground">
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

          <p className="text-muted-foreground leading-relaxed">{studio.description}</p>

          {/* Mobile Rate/Book/Contact Card */}
          <div className="lg:hidden">
            <Card className="border-2 border-primary/20">
              <CardContent className="p-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="text-xl font-bold">
                      {getPriceTierSymbol(studio.price_tier || 1)}
                    </div>
                    <div className="flex gap-2">
                      <Badge variant={studio.published ? "default" : "secondary"} className="text-xs">
                        {studio.published ? "Available" : "Unavailable"}
                      </Badge>
                      <Badge variant={studio.verification_status === 'verified' ? "default" : "secondary"} className="text-xs">
                        {studio.verification_status === 'verified' ? "Verified" : "Pending"}
                      </Badge>
                    </div>
                  </div>
                  <StudioDetailActions studio={studio} />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Amenities - Collapsible */}
          {amenities.length > 0 && (
            <CollapsibleSection title="Amenities">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {amenities.map((amenity, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <Wifi className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{amenity.name}</span>
                  </div>
                ))}
              </div>
            </CollapsibleSection>
          )}

          {/* Available Gear - Collapsible */}
          {studio.gear && Object.keys(studio.gear).length > 0 && (
            <CollapsibleSection title="Available Gear">
              <div className="grid gap-4">
                {Object.entries(studio.gear).map(([category, items]) => (
                  <div key={category}>
                    <h4 className="font-medium text-muted-foreground mb-2 capitalize">{category}</h4>
                    <div className="flex flex-wrap gap-2">
                      {Array.isArray(items) ? (
                        items.map((item: string, index: number) => (
                          <Badge key={index} variant="secondary">
                            {item}
                          </Badge>
                        ))
                      ) : (
                        <Badge variant="secondary">{String(items)}</Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CollapsibleSection>
          )}
        </div>

        {/* Reviews */}
        <div className="space-y-4">
          <StudioReviews 
            reviews={reviews}
            averageRating={averageRating}
            totalReviews={reviews.length}
            studioName={studio.name}
            showTitle={true}
            variant="full"
            maxVisible={5}
          />
        </div>
      </div>

      {/* Desktop Booking/Contact Section */}
      <div className="hidden lg:block lg:col-span-1">
        <div className="lg:sticky lg:top-6">
          <Card>
            <CardContent className="p-4 md:p-6">
              <div className="space-y-4">
                <div className="text-center">
                  <div className="text-2xl md:text-3xl font-bold">
                    {getPriceTierSymbol(studio.price_tier || 1)}
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Status:</span>
                    <Badge variant={studio.published ? "default" : "secondary"}>
                      {studio.published ? "Available" : "Unavailable"}
                    </Badge>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Verification:</span>
                    <Badge variant={studio.verification_status === 'verified' ? "default" : "secondary"}>
                      {studio.verification_status === 'verified' ? "Verified" : "Pending"}
                    </Badge>
                  </div>
                </div>

                <StudioDetailActions studio={studio} />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
} 