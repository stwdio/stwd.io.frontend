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
      
      <CardContent className="p-5 flex flex-col flex-1">
        {/* Header with title and price - exactly matching GenericCard */}
        <div className="flex justify-between items-start mb-3">
          <div className="flex-1">
            <Skeleton className="h-6 w-32" /> {/* title with text-xl height */}
            <div className="h-5 mt-1"> {/* Fixed height container for subtitle */}
              <Skeleton className="h-4 w-24" />
            </div>
          </div>
          <div className="text-lg text-muted-foreground">
            <Skeleton className="h-5 w-8" />
          </div>
        </div>
        
        {/* Location - exactly matching GenericCard */}
        <div className="flex items-center mb-3 min-h-[24px]">
          <Skeleton className="h-4 w-32" />
        </div>

        {/* Rating - exactly matching GenericCard */}
        <div className="flex items-center mb-4 min-h-[24px]">
          <div className="flex">
            {Array.from({ length: 5 }, (_, i) => (
              <Skeleton key={i} className="h-4 w-4 mr-0.5" />
            ))}
          </div>
          <Skeleton className="h-4 w-20 ml-2" />
        </div>

        {/* Description - exactly matching GenericCard */}
        <div className="mb-4 flex-1 min-h-[72px]">
          <Skeleton className="h-4 w-full mb-1" />
          <Skeleton className="h-4 w-full mb-1" />
          <Skeleton className="h-4 w-3/4" />
        </div>

        {/* Notes section would go here if visible - skipping as it's conditional */}

        {/* Additional content slot - exactly matching GenericCard */}
        <div className="mb-4 min-h-[24px]">
          {/* Empty - additionalContent is optional */}
        </div>

        {/* Tags - exactly matching GenericCard */}
        <div className="flex flex-wrap gap-2 mb-4 min-h-[32px]">
          <Skeleton className="h-6 w-16 rounded-full" />
          <Skeleton className="h-6 w-20 rounded-full" />
        </div>

        {/* Followed by section - exactly matching GenericCard */}
        <div className="flex items-center gap-3 mb-4 min-h-[40px]">
          <Skeleton className="h-4 w-20" />
          <div className="flex -space-x-2">
            {Array.from({ length: 3 }, (_, i) => (
              <Skeleton key={i} className="h-8 w-8 rounded-full border-2 border-background" />
            ))}
          </div>
          <Skeleton className="h-4 w-6" />
        </div>

        {/* Action buttons - exactly matching GenericCard */}
        <div className="mt-auto flex gap-3">
          <Skeleton className="h-10 flex-1 rounded-md" />
          <Skeleton className="h-10 flex-1 rounded-md" />
        </div>
      </CardContent>
    </Card>
  )
}