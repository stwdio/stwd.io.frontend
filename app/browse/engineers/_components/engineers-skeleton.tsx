import { ProfileCardSkeleton } from '@/components/skeletons'
import { Skeleton } from '@/components/ui/skeleton'

export function EngineersPageSkeleton() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <Skeleton className="h-9 w-48 mb-2" />
        <Skeleton className="h-5 w-96" />
      </div>
      
      {/* Filters skeleton */}
      <div className="mb-8 space-y-4">
        <div>
          <Skeleton className="h-4 w-32 mb-3" />
          <div className="flex flex-wrap gap-3">
            <Skeleton className="h-6 w-24" />
            <Skeleton className="h-6 w-28" />
            <Skeleton className="h-6 w-28" />
          </div>
        </div>
      </div>
      
      {/* Results skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <ProfileCardSkeleton key={i} />
        ))}
      </div>
    </div>
  )
}