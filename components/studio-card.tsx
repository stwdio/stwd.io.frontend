'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Star, MapPin } from 'lucide-react'
import { IconMessage, IconPlus } from '@tabler/icons-react'
import Link from 'next/link'
import { StudioImageWithSkeleton } from '@/components/studio-image-with-skeleton'
import { StudioListMembershipIndicators } from '@/components/studio-list-membership-indicators'
import { ReactNode } from 'react'
import { getStudioPrimaryImageUrl } from '@/lib/utils'
import { formatPrice, getPriceTierSymbol } from '@/lib/constants/currencies'
import { useAuthModal } from '@/lib/hooks/use-auth-modal'
import { useAuth } from '@/lib/auth/auth-context'
import { useQuoteBasket } from '@/lib/store/quote-basket'
import { useRouter } from 'next/navigation'

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
  system_role: 'user' | 'admin' | null
}

interface ProfessionalRole {
  role_id: number
  role: {
    id: number
    name: string
    slug: string
    description: string | null
  }
}

interface StudioCardProps {
  studio: Studio
  // Props for optimized performance
  memberships?: {list_id: number, list_name: string, list_icon_emoji: string}[]
  sharedProfile?: Profile | null
  profileLoading?: boolean
  sharedProfessionalRoles?: ProfessionalRole[]
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
  sharedProfessionalRoles = [],
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
  const { user } = useAuth()
  const authModal = useAuthModal()
  const isAuthenticated = !!user
  const router = useRouter()
  const { addStudio, isStudioInBasket } = useQuoteBasket()
  const isInBasket = isStudioInBasket(studio.id)

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

  const handleMessage = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    if (!isAuthenticated) {
      authModal.open(
        'Sign in to message studios',
        'Create an account or sign in to start messaging studio owners.'
      )
      return
    }
    
    // Navigate to messages with studio context
    router.push(`/profile/messages?studio=${studio.id}`)
  }

  const handleQuote = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    if (!isAuthenticated) {
      authModal.open(
        'Sign in to request quotes',
        'Create an account or sign in to request quotes from studios.'
      )
      return
    }
    
    // Add to quote basket
    addStudio(studio)
  }

  // Mock data for "followed by" - to be replaced with real data later
  const mockFollowers = [
    { id: 1, name: 'John Doe', avatar: 'user1' },
    { id: 2, name: 'Jane Smith', avatar: 'user2' },
    { id: 3, name: 'Mike Johnson', avatar: 'user3' },
    { id: 4, name: 'Sarah Wilson', avatar: 'user4' },
  ]

  const cardContent = (
    <Card className={`overflow-hidden hover:shadow-lg transition-shadow p-0 gap-0 cursor-pointer h-full flex flex-col ${className}`}>
      {/* Image */}
      <div className="aspect-video relative overflow-hidden rounded-t-lg">
        <StudioImageWithSkeleton
          src={getStudioPrimaryImageUrl(studio.photo_urls, 300)}
          alt={studio.name}
          fill
          width={300}
          height={200}
          className="object-cover"
          priority={priority}
        />
      </div>
      
      <CardContent className="p-5 flex flex-col flex-1">
        {/* Header with title and price */}
        <div className="flex justify-between items-start mb-3">
          <h3 className="font-semibold text-xl truncate flex-1">{studio.name}</h3>
          <div className="flex items-start gap-3">
            {studio.price_tier && (
              <div className="text-center">
                <p className="text-lg text-muted-foreground">{getPriceTierSymbol(studio.price_tier)}</p>
              </div>
            )}
            {studio.daily_rate && (
              <div className="text-right">
                <p className="font-bold text-xl">{formatPrice(studio.daily_rate, studio.currency || 'USD')}</p>
                <p className="text-sm text-muted-foreground">per day</p>
              </div>
            )}
          </div>
        </div>
        
        {/* Location */}
        <div className="flex items-center mb-3">
          <MapPin className="h-4 w-4 text-muted-foreground mr-2" />
          <span className="text-base text-muted-foreground">{studio.location}</span>
        </div>

        {/* Rating */}
        <div className="flex items-center mb-4">
          <div className="flex">{renderStars(studio.average_rating || 0)}</div>
          <span className="text-sm text-muted-foreground ml-2">
            ({studio.review_count || 0} reviews)
          </span>
        </div>

        {/* Description */}
        <p className="text-base text-muted-foreground mb-4 line-clamp-3 flex-1">
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
          className="mb-4"
          maxVisible={3}
          memberships={memberships}
          isLoading={profileLoading}
        />

        {/* Amenities */}
        {showAmenities && (
          <div className="flex flex-wrap gap-2 mb-4 min-h-[28px]">
            {studio.amenities?.slice(0, 4).map((amenity, index) => (
              <Badge key={index} variant="secondary" className="text-sm px-3 py-1">
                {typeof amenity === 'string' ? amenity : amenity.name}
              </Badge>
            ))}
            {studio.amenities && studio.amenities.length > 4 && (
              <Badge variant="secondary" className="text-sm px-3 py-1">
                +{studio.amenities.length - 4} more
              </Badge>
            )}
          </div>
        )}

        {/* New: Followed by section */}
        <div className="flex items-center gap-3 mb-4 pt-3 border-t">
          <span className="text-sm text-muted-foreground">Followed by</span>
          <div className="flex -space-x-2">
            {mockFollowers.slice(0, 3).map((follower) => (
              <Avatar key={follower.id} className="h-8 w-8 border-2 border-background">
                <AvatarImage 
                  src={`https://api.dicebear.com/9.x/thumbs/svg?seed=${follower.avatar}&backgroundColor=ffffff&shapeColor=000000`} 
                  alt={follower.name} 
                />
                <AvatarFallback className="text-xs">
                  {follower.name.charAt(0)}
                </AvatarFallback>
              </Avatar>
            ))}
            {mockFollowers.length > 3 && (
              <div className="h-8 w-8 rounded-full bg-muted border-2 border-background flex items-center justify-center">
                <span className="text-xs text-muted-foreground">+{mockFollowers.length - 3}</span>
              </div>
            )}
          </div>
        </div>

        {/* New: Action buttons */}
        <div className="mt-auto flex gap-3">
          {customActions || (
            <>
              <Button 
                variant="outline" 
                size="default" 
                className="flex-1"
                onClick={handleMessage}
              >
                <IconMessage className="h-5 w-5 mr-2" />
                Message
              </Button>
              <Button 
                variant={isInBasket ? "default" : "outline"} 
                size="default"
                onClick={handleQuote}
                disabled={isInBasket}
              >
                <IconPlus className="h-5 w-5" />
              </Button>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  )

  // Wrap with link if linkToStudio is true
  if (linkToStudio) {
    return (
      <Link href={`/discover/studios/${studio.slug || studio.id}`} className="block">
        {cardContent}
      </Link>
    )
  }

  return cardContent
}