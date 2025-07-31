'use client'

import { Skeleton } from '@/components/ui/skeleton'
import { GenericCardSkeleton } from '@/components/skeletons/generic-card-skeleton'

export function ConnectionsHubSkeleton() {
  return (
    <div className="h-full flex flex-col">
      {/* Mobile header */}
      <div className="lg:hidden flex-shrink-0 bg-background">
        <div className="w-full px-4 sm:px-6">
          <div className="flex items-center justify-between py-4">
            <div>
              <h2 className="text-3xl font-bold">CONNECT</h2>
              <h3 className="text-xl font-medium uppercase text-muted-foreground">
                Connections
              </h3>
            </div>
          </div>
        </div>
      </div>
      
      <div className="flex-1 flex flex-col">
        {/* Search and Filter Bar Skeleton */}
        <div className="flex-shrink-0 bg-background">
          <div className="w-full px-4 sm:px-6 py-4 border-b">
            <div className="flex gap-3 items-center justify-end">
              <Skeleton className="h-9 w-[280px] rounded-md" />
              <Skeleton className="h-9 w-9 rounded-md" />
            </div>
          </div>
        </div>
        
        {/* Cards Grid Skeleton */}
        <div className="flex-1 overflow-hidden">
          <div className="h-full overflow-auto">
            <div className="w-full px-4 sm:px-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 py-6">
                {[...Array(8)].map((_, i) => (
                  <GenericCardSkeleton key={i} />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}