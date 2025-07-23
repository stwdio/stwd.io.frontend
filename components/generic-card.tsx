'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Star, MapPin } from 'lucide-react'
import { IconMessage, IconPlus } from '@tabler/icons-react'
import Link from 'next/link'
import { ReactNode } from 'react'
import Image from 'next/image'

export interface GenericCardProps {
  // Core data
  id: string | number
  title: string
  subtitle?: string
  description?: string
  imageUrl?: string
  link?: string
  
  // Location data
  location?: string
  
  // Rating data
  rating?: number
  reviewCount?: number
  
  // Price data
  price?: string | number
  priceLabel?: string
  priceTier?: string
  
  // Tags/badges
  tags?: string[]
  maxTags?: number
  
  // Social proof
  followedBy?: Array<{
    id: string | number
    name: string
    avatar: string
  }>
  
  // Actions
  primaryAction?: {
    label: string
    icon?: ReactNode
    onClick: (e: React.MouseEvent) => void
  }
  secondaryAction?: {
    label: string
    icon?: ReactNode
    onClick: (e: React.MouseEvent) => void
  }
  customActions?: ReactNode
  
  // Additional content
  additionalContent?: ReactNode
  notes?: string
  
  // Customization
  className?: string
  priority?: boolean
  aspectRatio?: 'video' | 'square' | '4/3' | '3/2'
}

export function GenericCard({
  id,
  title,
  subtitle,
  description,
  imageUrl,
  link,
  location,
  rating,
  reviewCount,
  price,
  priceLabel,
  priceTier,
  tags = [],
  maxTags = 4,
  followedBy = [],
  primaryAction,
  secondaryAction,
  customActions,
  additionalContent,
  notes,
  className = '',
  priority = false,
  aspectRatio = 'video'
}: GenericCardProps) {
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

  const aspectRatioClasses = {
    'video': 'aspect-video',
    'square': 'aspect-square',
    '4/3': 'aspect-[4/3]',
    '3/2': 'aspect-[3/2]'
  }

  const cardContent = (
    <Card className={`overflow-hidden hover:shadow-lg transition-shadow p-0 gap-0 cursor-pointer h-full flex flex-col ${className}`}>
      {/* Image */}
      <div className={`${aspectRatioClasses[aspectRatio]} relative overflow-hidden rounded-t-lg bg-muted`}>
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={title}
            fill
            className="object-cover"
            priority={priority}
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Avatar className="w-1/2 h-1/2 rounded-none">
              <AvatarImage 
                src={`https://api.dicebear.com/9.x/thumbs/svg?seed=${id}&backgroundColor=ffffff&shapeColor=000000`} 
                alt={title}
                className="object-cover"
              />
              <AvatarFallback className="rounded-none text-4xl">
                {title.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
          </div>
        )}
      </div>
      
      <CardContent className="p-5 flex flex-col flex-1">
        {/* Header with title and price */}
        <div className="flex justify-between items-start mb-3">
          <div className="flex-1">
            <h3 className="font-semibold text-xl truncate">{title}</h3>
            {subtitle && (
              <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>
            )}
          </div>
          {(priceTier || price) && (
            <div className="flex items-start gap-3">
              {priceTier && (
                <div className="text-center">
                  <p className="text-lg text-muted-foreground">{priceTier}</p>
                </div>
              )}
              {price && (
                <div className="text-right">
                  <p className="font-bold text-xl">{price}</p>
                  {priceLabel && (
                    <p className="text-sm text-muted-foreground">{priceLabel}</p>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
        
        {/* Location */}
        {location && (
          <div className="flex items-center mb-3">
            <MapPin className="h-4 w-4 text-muted-foreground mr-2" />
            <span className="text-base text-muted-foreground">{location}</span>
          </div>
        )}

        {/* Rating */}
        {rating !== undefined && (
          <div className="flex items-center mb-4">
            <div className="flex">{renderStars(rating)}</div>
            <span className="text-sm text-muted-foreground ml-2">
              ({reviewCount || 0} reviews)
            </span>
          </div>
        )}

        {/* Description */}
        {description && (
          <p className="text-base text-muted-foreground mb-4 line-clamp-3 flex-1">
            {description}
          </p>
        )}

        {/* Notes */}
        {notes && (
          <div className="mb-3 p-2 bg-muted rounded-md">
            <p className="text-xs text-muted-foreground mb-1">My notes:</p>
            <p className="text-sm">{notes}</p>
          </div>
        )}

        {/* Additional content slot */}
        {additionalContent}

        {/* Tags */}
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4 min-h-[28px]">
            {tags.slice(0, maxTags).map((tag, index) => (
              <Badge key={index} variant="secondary" className="text-sm px-3 py-1">
                {tag}
              </Badge>
            ))}
            {tags.length > maxTags && (
              <Badge variant="secondary" className="text-sm px-3 py-1">
                +{tags.length - maxTags} more
              </Badge>
            )}
          </div>
        )}

        {/* Followed by section */}
        {followedBy.length > 0 && (
          <div className="flex items-center gap-3 mb-4 pt-3 border-t">
            <span className="text-sm text-muted-foreground">Followed by</span>
            <div className="flex -space-x-2">
              {followedBy.slice(0, 3).map((follower) => (
                <Avatar key={follower.id} className="h-8 w-8 border-2 border-background">
                  <AvatarImage 
                    src={follower.avatar} 
                    alt={follower.name} 
                  />
                  <AvatarFallback className="text-xs">
                    {follower.name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
              ))}
              {followedBy.length > 3 && (
                <div className="h-8 w-8 rounded-full bg-muted border-2 border-background flex items-center justify-center">
                  <span className="text-xs text-muted-foreground">+{followedBy.length - 3}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Action buttons */}
        {(primaryAction || secondaryAction || customActions) && (
          <div className="mt-auto flex gap-3">
            {customActions || (
              <>
                {primaryAction && (
                  <Button 
                    variant="outline" 
                    size="default" 
                    className="flex-1"
                    onClick={primaryAction.onClick}
                  >
                    {primaryAction.icon}
                    {primaryAction.label}
                  </Button>
                )}
                {secondaryAction && (
                  <Button 
                    variant="outline" 
                    size="default"
                    onClick={secondaryAction.onClick}
                    className={primaryAction ? '' : 'flex-1'}
                  >
                    {secondaryAction.icon}
                    {secondaryAction.label}
                  </Button>
                )}
              </>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )

  // Wrap with link if provided
  if (link) {
    return (
      <Link href={link} className="block">
        {cardContent}
      </Link>
    )
  }

  return cardContent
}