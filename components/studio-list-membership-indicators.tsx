'use client'

import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { BookmarkCheck } from 'lucide-react'

interface StudioListMembershipIndicatorsProps {
  studioId: string
  className?: string
  maxVisible?: number
  memberships?: {list_id: number, list_name: string, list_icon_emoji: string}[]
  isLoading?: boolean
}

export function StudioListMembershipIndicators({ 
  studioId, 
  className = '',
  maxVisible = 3,
  memberships = [],
  isLoading = false 
}: StudioListMembershipIndicatorsProps) {
  if (isLoading) {
    return (
      <div className={`flex flex-wrap gap-1 ${className}`}>
        <Skeleton className="h-5 w-16" />
        <Skeleton className="h-5 w-20" />
      </div>
    )
  }

  if (memberships.length === 0) {
    return null
  }

  const visibleMemberships = memberships.slice(0, maxVisible)
  const remainingCount = memberships.length - maxVisible

  return (
    <div className={`flex flex-wrap gap-1 items-center ${className}`}>
      <BookmarkCheck className="h-3 w-3 text-muted-foreground" />
      {visibleMemberships.map((membership) => (
        <Badge 
          key={membership.list_id} 
          variant="secondary" 
          className="text-xs h-5 px-2 py-0 flex items-center gap-1"
        >
          <span>{membership.list_icon_emoji}</span>
          <span>{membership.list_name}</span>
        </Badge>
      ))}
      {remainingCount > 0 && (
        <Badge 
          variant="outline" 
          className="text-xs h-5 px-2 py-0"
        >
          +{remainingCount} more
        </Badge>
      )}
    </div>
  )
} 