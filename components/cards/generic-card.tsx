'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Star, MapPin } from 'lucide-react'
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
    className?: string
    disabled?: boolean
    title?: string
  }
  secondaryAction?: {
    label: string
    icon?: ReactNode
    onClick: (e: React.MouseEvent) => void
    variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link'
    disabled?: boolean
    className?: string
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
          <Image
            src={`https://api.dicebear.com/9.x/thumbs/svg?seed=${id}&backgroundColor=ffffff&shapeColor=000000`}
            alt={title}
            fill
            className="object-cover"
            priority={priority}
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
        )}
      </div>
      
      <CardContent className="p-4 flex flex-col flex-1">
        {/* Header with title and price */}
        <div className="flex justify-between items-start mb-2">
          <div className="flex-1">
            <div className="h-[1.75rem]"> {/* Fixed height for title */}
              <h3 className="font-semibold text-lg truncate">{title}</h3>
            </div>
            <div className="h-4 mt-0.5">
              {subtitle && (
                <p className="text-sm text-muted-foreground">{subtitle}</p>
              )}
            </div>
          </div>
        </div>
        
        {/* Location */}
        <div className="flex items-center mb-2 min-h-[20px]">
          {location && (
            <>
              <MapPin className="h-4 w-4 text-muted-foreground mr-2" />
              <span className="text-sm text-muted-foreground">{location}</span>
            </>
          )}
        </div>

        {/* Rating */}
        <div className="flex items-center mb-3 min-h-[20px]">
          {rating !== undefined && (
            <>
              <div className="flex">{renderStars(rating)}</div>
              <span className="text-sm text-muted-foreground ml-2">
                ({reviewCount || 0} reviews)
              </span>
            </>
          )}
        </div>

        {/* Description */}
        <div className="mb-3 flex-1 min-h-[48px]">
          {description && (
            <p className="text-sm text-muted-foreground line-clamp-2">
              {description}
            </p>
          )}
        </div>

        {/* Notes */}
        {notes && (
          <div className="mb-3 p-2 bg-muted rounded-md">
            <p className="text-xs text-muted-foreground mb-1">My notes:</p>
            <p className="text-sm">{notes}</p>
          </div>
        )}

        {/* Additional content slot */}
        <div className="mb-3 min-h-[20px]">
          {additionalContent}
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-2 mb-3 min-h-[28px]">
          {tags.length > 0 && (
            <>
              {tags.slice(0, maxTags).map((tag, index) => (
                <Badge key={index} variant="secondary" className="text-xs px-2 py-0.5">
                  {tag}
                </Badge>
              ))}
              {tags.length > maxTags && (
                <Badge variant="secondary" className="text-xs px-2 py-0.5">
                  +{tags.length - maxTags} more
                </Badge>
              )}
            </>
          )}
        </div>

        {/* Followed by section */}
        <div className="flex items-center gap-2 mb-3 min-h-[32px]">
          {followedBy.length > 0 && (
            <>
              <span className="text-sm text-muted-foreground">Followed by</span>
              <div className="flex -space-x-2">
                {followedBy.slice(0, 3).map((follower) => (
                  <Avatar key={follower.id} className="h-6 w-6 border-2 border-background">
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
                  <div className="h-6 w-6 rounded-full bg-muted border-2 border-background flex items-center justify-center">
                    <span className="text-xs text-muted-foreground">+{followedBy.length - 3}</span>
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        {/* Action buttons */}
        {(primaryAction || secondaryAction || customActions) && (
          <div className="mt-auto flex gap-3">
            {customActions || (
              <>
                {primaryAction && (
                  <Button 
                    variant="outline" 
                    size="default" 
                    className={`flex-1 ${primaryAction.className || ''}`}
                    onClick={primaryAction.onClick}
                    disabled={primaryAction.disabled}
                    title={primaryAction.title}
                  >
                    {primaryAction.icon}
                    {primaryAction.label}
                  </Button>
                )}
                {secondaryAction && (
                  <Button 
                    variant={secondaryAction.variant || "outline"} 
                    size="default"
                    onClick={secondaryAction.onClick}
                    className={`flex-1 ${secondaryAction.className || ''}`}
                    disabled={secondaryAction.disabled}
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