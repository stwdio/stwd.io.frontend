import { Skeleton } from '@/components/ui/skeleton'

/**
 * Minimal auth loading skeleton that doesn't flash or disrupt the user experience
 * Used during auth state transitions to prevent jarring loading screens
 */
export function AuthLoadingSkeleton() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header/Navigation skeleton */}
      <div className="border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Skeleton className="h-8 w-32" />
            <div className="flex items-center space-x-4">
              <Skeleton className="h-8 w-20" />
              <Skeleton className="h-8 w-8 rounded-full" />
            </div>
          </div>
        </div>
      </div>

      {/* Main content skeleton */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-4 gap-6">
          {/* Sidebar skeleton */}
          <div className="lg:col-span-1">
            <div className="space-y-4">
              <Skeleton className="h-6 w-24" />
              <div className="space-y-2">
                {Array.from({ length: 4 }, (_, i) => (
                  <Skeleton key={i} className="h-4 w-full" />
                ))}
              </div>
            </div>
          </div>

          {/* Main content skeleton */}
          <div className="lg:col-span-3">
            <div className="space-y-6">
              <Skeleton className="h-8 w-48" />
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {Array.from({ length: 6 }, (_, i) => (
                  <div key={i} className="space-y-3">
                    <Skeleton className="aspect-video w-full" />
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

/**
 * Ultra-minimal loading state for very fast transitions
 * Use when you expect the auth state to resolve quickly
 */
export function MinimalAuthLoading() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center space-y-3">
        <div className="w-6 h-6 border-2 border-primary/30 border-t-primary rounded-full animate-spin mx-auto" />
        <p className="text-sm text-muted-foreground">Loading...</p>
      </div>
    </div>
  )
}