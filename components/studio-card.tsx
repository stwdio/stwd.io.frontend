'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Star, MapPin } from 'lucide-react'
import Link from 'next/link'
import { StudioImage } from '@/components/studio-image-placeholder'
import { StudioListMembershipIndicators } from '@/components/studio-list-membership-indicators'
import { StudioCardActions } from '@/components/studio-card-actions'
import { ReactNode } from 'react'
import { getStudioPrimaryImageUrl } from '@/lib/utils'
import { formatPrice, getPriceTierSymbol } from '@/lib/constants/currencies'

interface Studio {
  id: number
  name: string
  description: string
  hourly_rate: number
  daily_rate?: number | null
  price_tier?: number
  currency?: string
  location: string
  owner_id: string
  published?: boolean
  verification_status: string
  created_at?: string
  average_rating?: number
  review_count?: number
  amenities?: string[]
  gear?: any
  notes?: string // For lists view
  photo_urls?: string[]
  slug?: string
}

interface Profile {
  id: number
  user_id: string
  role: 'creator' | 'owner' | 'admin' | null
}

interface StudioCardProps {
  studio: Studio
  // Props for optimized performance
  memberships?: {list_id: number, list_name: string, list_icon_emoji: string}[]
  sharedProfile?: Profile | null
  profileLoading?: boolean
  sharedLists?: any[]
  listsLoading?: boolean
  onListsChange?: () => void
  // Customization props
  showAmenities?: boolean
  showNotes?: boolean
  customActions?: ReactNode
  // Link behavior
  linkToStudio?: boolean
  className?: string
  // Performance optimization
  priority?: boolean
}

export function StudioCard({
  studio,
  memberships = [],
  sharedProfile,
  profileLoading = false,
  sharedLists = [],
  listsLoading = false,
  onListsChange,
  showAmenities = true,
  showNotes = false,
  customActions,
  linkToStudio = true,
  className = '',
  priority = false
}: StudioCardProps) {
  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${
          i < rating
            ? 'fill-yellow-400 text-yellow-400'
            : 'text-gray-300'
        }`}
      />
    ))
  }

  const cardContent = (
    <Card className={`overflow-hidden hover:shadow-lg transition-shadow p-0 gap-0 cursor-pointer h-full flex flex-col ${className}`}>
      {/* Image */}
      <div className="aspect-video relative overflow-hidden rounded-t-lg">
        <StudioImage
          src={getStudioPrimaryImageUrl(studio.photo_urls, 300)}
          alt={studio.name}
          fill
          width={300}
          height={200}
          className="object-cover"
          priority={priority}
        />
      </div>
      
      <CardContent className="p-4 flex flex-col flex-1">
        {/* Header with title and price */}
        <div className="flex justify-between items-start mb-2">
          <h3 className="font-semibold text-lg truncate flex-1">{studio.name}</h3>
          <div className="flex items-start gap-3">
            {studio.price_tier && (
              <div className="text-center">
                <p className="text-lg text-muted-foreground">{getPriceTierSymbol(studio.price_tier)}</p>
              </div>
            )}
            {studio.daily_rate && (
              <div className="text-right">
                <p className="font-bold text-lg">{formatPrice(studio.daily_rate, studio.currency || 'USD')}</p>
                <p className="text-sm text-muted-foreground">per day</p>
              </div>
            )}
          </div>
        </div>
        
        {/* Location */}
        <div className="flex items-center mb-2">
          <MapPin className="h-4 w-4 text-muted-foreground mr-1" />
          <span className="text-sm text-muted-foreground">{studio.location}</span>
        </div>

        {/* Rating */}
        <div className="flex items-center mb-3">
          <div className="flex">{renderStars(studio.average_rating || 0)}</div>
          <span className="text-sm text-muted-foreground ml-2">
            ({studio.review_count || 0} reviews)
          </span>
        </div>

        {/* Description */}
        <p className="text-sm text-muted-foreground mb-3 line-clamp-2 flex-1">
          {studio.description}
        </p>

        {/* Notes (for lists view) */}
        {showNotes && studio.notes && (
          <div className="mb-3 p-2 bg-muted rounded-md">
            <p className="text-xs text-muted-foreground mb-1">My notes:</p>
            <p className="text-sm">{studio.notes}</p>
          </div>
        )}

        {/* List membership indicators */}
        <StudioListMembershipIndicators 
          studioId={studio.id.toString()} 
          className="mb-3"
          maxVisible={2}
          memberships={memberships}
          isLoading={profileLoading}
        />

        {/* Amenities */}
        {showAmenities && (
          <div className="flex flex-wrap gap-1 mb-4 min-h-[24px]">
            {studio.amenities?.slice(0, 3).map((amenity, index) => (
              <Badge key={index} variant="secondary" className="text-xs">
                {typeof amenity === 'string' ? amenity : amenity.name}
              </Badge>
            ))}
            {studio.amenities && studio.amenities.length > 3 && (
              <Badge variant="secondary" className="text-xs">
                +{studio.amenities.length - 3} more
              </Badge>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="mt-auto">
          {customActions || (
            <StudioCardActions 
              studio={studio}
              memberships={memberships}
              sharedProfile={sharedProfile}
              profileLoading={profileLoading}
              sharedLists={sharedLists}
              listsLoading={listsLoading}
              onListsChange={onListsChange}
            />
          )}
        </div>
      </CardContent>
    </Card>
  )

  // Wrap with link if linkToStudio is true
  if (linkToStudio) {
    return (
      <Link href={`/studios/${studio.slug || studio.id}`} className="block">
        {cardContent}
      </Link>
    )
  }

  return cardContent
} 