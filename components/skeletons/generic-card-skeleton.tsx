import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

interface GenericCardSkeletonProps {
  className?: string
}

export function GenericCardSkeleton({ 
  className = '' 
}: GenericCardSkeletonProps) {
  return (
    <Card className={`overflow-hidden hover:shadow-lg transition-shadow p-0 gap-0 cursor-pointer h-full flex flex-col ${className}`}>
      {/* Image - exactly matching GenericCard */}
      <div className="aspect-video relative overflow-hidden rounded-t-lg bg-muted">
        <Skeleton className="w-full h-full" />
      </div>
      
      <CardContent className="p-4 flex flex-col flex-1">
        {/* Header with title and price - exactly matching GenericCard */}
        <div className="flex justify-between items-start mb-2">
          <div className="flex-1">
            <div className="h-[1.75rem]"> {/* Exact height for text-lg line-height */}
              <Skeleton className="h-5 w-32" />
            </div>
            <div className="h-4 mt-0.5"> {/* Fixed height container for subtitle */}
              <Skeleton className="h-3 w-24" />
            </div>
          </div>
          <div className="h-[1.75rem]"> {/* Match text-lg container */}
            <Skeleton className="h-5 w-8" />
          </div>
        </div>
        
        {/* Location - exactly matching GenericCard */}
        <div className="flex items-center mb-2 min-h-[20px]">
          <Skeleton className="h-4 w-32" />
        </div>

        {/* Rating - exactly matching GenericCard */}
        <div className="flex items-center mb-3 min-h-[20px]">
          <div className="flex">
            {Array.from({ length: 5 }, (_, i) => (
              <Skeleton key={i} className="h-4 w-4 mr-0.5" />
            ))}
          </div>
          <Skeleton className="h-4 w-20 ml-2" />
        </div>

        {/* Description - exactly matching GenericCard */}
        <div className="mb-3 flex-1 min-h-[48px]">
          <Skeleton className="h-4 w-full mb-1.5" />
          <Skeleton className="h-4 w-3/4" />
        </div>

        {/* Notes section would go here if visible - skipping as it's conditional */}

        {/* Additional content slot - exactly matching GenericCard */}
        <div className="mb-3 min-h-[20px]">
          {/* Empty - additionalContent is optional */}
        </div>

        {/* Tags - exactly matching GenericCard */}
        <div className="flex flex-wrap gap-2 mb-3 min-h-[28px]">
          <Skeleton className="h-5 w-16 rounded-full" />
          <Skeleton className="h-5 w-20 rounded-full" />
        </div>

        {/* Followed by section - exactly matching GenericCard */}
        <div className="flex items-center gap-2 mb-3 min-h-[32px]">
          <Skeleton className="h-4 w-20" />
          <div className="flex -space-x-2">
            {Array.from({ length: 3 }, (_, i) => (
              <Skeleton key={i} className="h-6 w-6 rounded-full border-2 border-background" />
            ))}
          </div>
          <Skeleton className="h-4 w-6" />
        </div>

        {/* Action buttons - exactly matching GenericCard */}
        <div className="mt-auto flex gap-3">
          <Skeleton className="h-9 flex-1 rounded-md" />
          <Skeleton className="h-9 flex-1 rounded-md" />
        </div>
      </CardContent>
    </Card>
  )
}