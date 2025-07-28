'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Star, ChevronDown, ChevronUp } from "lucide-react"
import { Collapsible, CollapsibleTrigger } from "@/components/ui/collapsible"

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

interface StudioReviewsProps {
  reviews: Review[]
  averageRating: number
  totalReviews: number
  studioName: string
  showTitle?: boolean
  maxVisible?: number
  variant?: 'compact' | 'full'
}

export function StudioReviews({ 
  reviews, 
  averageRating, 
  totalReviews, 
  studioName,
  showTitle = true,
  maxVisible = 3,
  variant = 'full'
}: StudioReviewsProps) {
  const [showAllReviews, setShowAllReviews] = useState(false)

  const renderStars = (rating: number, size: 'sm' | 'md' = 'sm') => {
    const starSize = size === 'sm' ? 'h-4 w-4' : 'h-5 w-5'
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`${starSize} ${
          i < rating
            ? 'fill-yellow-400 text-yellow-400'
            : 'text-gray-300'
        }`}
      />
    ))
  }

  const getInitials = (firstName: string | null, lastName: string | null, username: string) => {
    if (firstName && lastName) {
      return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase()
    }
    if (firstName) {
      return firstName.charAt(0).toUpperCase()
    }
    return username.charAt(0).toUpperCase()
  }

  const getDisplayName = (reviewer: Review['reviewer']) => {
    if (!reviewer) return 'Anonymous'
    if (reviewer.first_name && reviewer.last_name) {
      return `${reviewer.first_name} ${reviewer.last_name}`
    }
    if (reviewer.first_name) {
      return reviewer.first_name
    }
    return reviewer.username
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    })
  }

  if (reviews.length === 0) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <div className="text-muted-foreground">
            <Star className="h-8 w-8 mx-auto mb-2 text-gray-300" />
            <p>No reviews yet</p>
            <p className="text-sm">Be the first to review {studioName}</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  const visibleReviews = showAllReviews ? reviews : reviews.slice(0, maxVisible)
  const hasMoreReviews = reviews.length > maxVisible

  if (variant === 'compact') {
    return (
      <div className="space-y-3">
        {/* Rating Summary */}
        <div className="flex items-center space-x-3">
          <div className="flex items-center">
            {renderStars(Math.round(averageRating))}
            <span className="ml-2 text-sm font-medium">{averageRating.toFixed(1)}</span>
          </div>
          <span className="text-sm text-muted-foreground">
            ({totalReviews} review{totalReviews !== 1 ? 's' : ''})
          </span>
        </div>

        {/* Latest Review */}
        {reviews.length > 0 && (
          <div className="border-l-2 border-primary/20 pl-3">
            <p className="text-sm text-muted-foreground line-clamp-2">
              &ldquo;{reviews[0].comment}&rdquo;
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              - {getDisplayName(reviews[0].reviewer)}
            </p>
          </div>
        )}
      </div>
    )
  }

  return (
    <Card>
      {showTitle && (
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl">Reviews</CardTitle>
            <div className="flex items-center space-x-3">
              <div className="flex items-center">
                {renderStars(Math.round(averageRating), 'md')}
                <span className="ml-2 text-lg font-medium">{averageRating.toFixed(1)}</span>
              </div>
              <span className="text-muted-foreground">
                ({totalReviews} review{totalReviews !== 1 ? 's' : ''})
              </span>
            </div>
          </div>
        </CardHeader>
      )}
      
      <CardContent className={showTitle ? 'pt-0' : 'pt-6'}>
        <div className="space-y-6">
          {visibleReviews.map((review) => (
            <div key={review.id} className="border-b border-border/40 pb-6 last:border-b-0 last:pb-0">
              <div className="flex items-start space-x-3">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={review.reviewer?.avatar_url || ''} />
                  <AvatarFallback>
                    {getInitials(
                      review.reviewer?.first_name || null,
                      review.reviewer?.last_name || null,
                      review.reviewer?.username || 'A'
                    )}
                  </AvatarFallback>
                </Avatar>
                
                <div className="flex-1 space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-sm">
                        {getDisplayName(review.reviewer)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatDate(review.created_at)}
                      </p>
                    </div>
                    <div className="flex items-center">
                      {renderStars(review.rating)}
                    </div>
                  </div>
                  
                  {review.comment && (
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {review.comment}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}

          {hasMoreReviews && (
            <div className="text-center pt-4">
              <Collapsible open={showAllReviews} onOpenChange={setShowAllReviews}>
                <CollapsibleTrigger asChild>
                  <Button variant="ghost" className="text-primary">
                    {showAllReviews ? (
                      <>
                        <ChevronUp className="h-4 w-4 mr-1" />
                        Show Less
                      </>
                    ) : (
                      <>
                        <ChevronDown className="h-4 w-4 mr-1" />
                        Show All {reviews.length} Reviews
                      </>
                    )}
                  </Button>
                </CollapsibleTrigger>
              </Collapsible>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}