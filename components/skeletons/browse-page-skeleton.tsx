import { Skeleton } from '@/components/ui/skeleton'
import { Card, CardContent } from '@/components/ui/card'
import { StudioCardSkeleton } from './studio-card-skeleton'

interface BrowsePageSkeletonProps {
  cardCount?: number
  showMobileFilter?: boolean
}

export function BrowsePageSkeleton({ 
  cardCount = 12, 
  showMobileFilter = true 
}: BrowsePageSkeletonProps) {
  return (
    <div className="p-4 md:p-6 min-h-screen max-h-screen overflow-hidden">
      <div className="flex h-full gap-6">
        {/* Desktop Filter Sidebar */}
        <div className="hidden lg:block w-80 flex-shrink-0">
          <Card className="h-full">
            <CardContent className="p-6 h-full overflow-auto">
              {/* Filter Header */}
              <div className="mb-6">
                <Skeleton className="h-6 w-32 mb-2" />
                <Skeleton className="h-4 w-48" />
              </div>

              {/* Location Search */}
              <div className="mb-6">
                <Skeleton className="h-4 w-16 mb-2" />
                <Skeleton className="h-10 w-full" />
              </div>

              {/* Price Range */}
              <div className="mb-6">
                <Skeleton className="h-4 w-20 mb-2" />
                <div className="flex justify-between mb-2">
                  <Skeleton className="h-4 w-12" />
                  <Skeleton className="h-4 w-12" />
                </div>
                <Skeleton className="h-2 w-full mb-2" />
                <div className="flex justify-between">
                  <Skeleton className="h-4 w-8" />
                  <Skeleton className="h-4 w-8" />
                </div>
              </div>

              {/* Amenities */}
              <div className="mb-6">
                <Skeleton className="h-4 w-20 mb-2" />
                <Skeleton className="h-8 w-full mb-3" />
                <div className="space-y-2 max-h-48 overflow-auto">
                  {Array.from({ length: 8 }, (_, i) => (
                    <div key={i} className="flex items-center space-x-2">
                      <Skeleton className="h-4 w-4" />
                      <Skeleton className="h-4 w-24" />
                    </div>
                  ))}
                </div>
                <Skeleton className="h-5 w-16 mt-2" />
              </div>

              {/* Gear */}
              <div className="mb-6">
                <Skeleton className="h-4 w-16 mb-2" />
                <Skeleton className="h-8 w-full mb-3" />
                <div className="space-y-4">
                  {Array.from({ length: 3 }, (_, categoryIndex) => (
                    <div key={categoryIndex}>
                      <Skeleton className="h-4 w-20 mb-2" />
                      <div className="space-y-2">
                        {Array.from({ length: 4 }, (_, itemIndex) => (
                          <div key={itemIndex} className="flex items-center space-x-2">
                            <Skeleton className="h-4 w-4" />
                            <Skeleton className="h-4 w-28" />
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Apply/Clear Buttons */}
              <div className="flex gap-2">
                <Skeleton className="h-10 flex-1" />
                <Skeleton className="h-10 flex-1" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Mobile Filter Button */}
          {showMobileFilter && (
            <div className="lg:hidden mb-4">
              <Skeleton className="h-10 w-32" />
            </div>
          )}

          {/* Studios Grid */}
          <div className="flex-1 overflow-auto">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4 sm:gap-6">
              {Array.from({ length: cardCount }, (_, i) => (
                <StudioCardSkeleton key={i} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}