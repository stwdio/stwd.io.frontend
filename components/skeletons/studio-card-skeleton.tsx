import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

interface StudioCardSkeletonProps {
  showActions?: boolean
  className?: string
}

export function StudioCardSkeleton({ 
  showActions = true, 
  className = '' 
}: StudioCardSkeletonProps) {
  return (
    <Card className={`overflow-hidden p-0 gap-0 h-full flex flex-col ${className}`}>
      {/* Image skeleton */}
      <Skeleton className="aspect-video rounded-t-lg rounded-b-none" />
      
      <CardContent className="p-4 flex flex-col flex-1">
        {/* Header with title and price */}
        <div className="flex justify-between items-start mb-2">
          <Skeleton className="h-6 w-32" />
          <div className="text-right">
            <Skeleton className="h-6 w-16 mb-1" />
            <Skeleton className="h-4 w-12" />
          </div>
        </div>
        
        {/* Location */}
        <div className="flex items-center mb-2">
          <Skeleton className="h-4 w-4 mr-1" />
          <Skeleton className="h-4 w-24" />
        </div>

        {/* Rating */}
        <div className="flex items-center mb-3">
          <div className="flex gap-1 mr-2">
            {Array.from({ length: 5 }, (_, i) => (
              <Skeleton key={i} className="h-4 w-4" />
            ))}
          </div>
          <Skeleton className="h-4 w-16" />
        </div>

        {/* Description */}
        <div className="mb-3 flex-1">
          <Skeleton className="h-4 w-full mb-2" />
          <Skeleton className="h-4 w-3/4" />
        </div>

        {/* Amenities */}
        <div className="flex flex-wrap gap-1 mb-4 min-h-[24px]">
          <Skeleton className="h-5 w-16" />
          <Skeleton className="h-5 w-20" />
          <Skeleton className="h-5 w-14" />
        </div>

        {/* Actions */}
        {showActions && (
          <div className="mt-auto">
            <div className="flex gap-2 h-8">
              <Skeleton className="h-8 flex-1" />
              <Skeleton className="h-8 flex-1" />
              <Skeleton className="h-8 flex-1" />
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}