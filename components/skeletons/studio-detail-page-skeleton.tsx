import { Skeleton } from '@/components/ui/skeleton'

export function StudioDetailPageSkeleton() {
  return (
    <div className="h-full flex flex-col bg-background overflow-hidden">
      {/* Fixed Header */}
      <div className="flex-shrink-0 border-b bg-background">
        <div className="flex items-center gap-4 px-6 py-4">
          <Skeleton className="h-10 w-32" /> {/* Back button */}
        </div>
      </div>

      {/* Main Content Area - Responsive Grid */}
      <div className="flex-1 overflow-y-auto lg:overflow-hidden lg:grid lg:grid-cols-[45%_55%]">
        {/* Mobile: Both columns scroll together; Desktop: Grid layout with fixed image */}
        <div className="h-80 lg:h-full">
          <Skeleton className="w-full h-full" /> {/* Studio image carousel */}
        </div>

        {/* Right Column - Always part of scrollable flow on mobile */}
        <div className="lg:overflow-y-auto">
          <div className="p-4 sm:p-6 lg:p-8 space-y-6 lg:space-y-8">
            {/* Studio Header */}
            <div className="space-y-4">
              <div>
                <Skeleton className="h-8 sm:h-9 lg:h-10 w-3/4 mb-2" /> {/* Studio name */}
              </div>
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2">
                  <Skeleton className="h-4 w-4" /> {/* Map pin icon */}
                  <Skeleton className="h-4 w-32" /> {/* Location */}
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Skeleton key={i} className="h-4 w-4" /> 
                    ))}
                  </div>
                  <Skeleton className="h-4 w-8" /> {/* Rating count */}
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-3">
              <Skeleton className="h-10 w-32" />
              <Skeleton className="h-10 w-32" />
              <Skeleton className="h-10 w-32" />
            </div>

            {/* Gear Section */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Skeleton className="h-6 w-12" /> {/* Gear heading */}
                <Skeleton className="h-4 w-4" /> {/* Chevron */}
              </div>
            </div>

            {/* Followers Section */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Skeleton className="h-5 w-20" /> {/* Followers heading */}
                <Skeleton className="h-5 w-8" /> {/* Count */}
              </div>
              <div className="flex -space-x-2">
                {[...Array(5)].map((_, i) => (
                  <Skeleton key={i} className="h-10 w-10 rounded-full border-2 border-background" />
                ))}
              </div>
            </div>

            {/* Reviews Section */}
            <div className="space-y-4 pb-8">
              <Skeleton className="h-6 w-20" /> {/* Reviews heading */}
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="flex gap-3">
                    <Skeleton className="h-10 w-10 rounded-full flex-shrink-0" />
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-2">
                        <Skeleton className="h-4 w-24" /> {/* Reviewer name */}
                        <div className="flex gap-1">
                          {[...Array(5)].map((_, j) => (
                            <Skeleton key={j} className="h-3 w-3" />
                          ))}
                        </div>
                      </div>
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-3/4" />
                      <Skeleton className="h-3 w-20" /> {/* Time ago */}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Desktop Booking Widget - Hidden on mobile */}
        <div className="hidden lg:block lg:col-span-1 lg:sticky lg:top-6 lg:h-fit p-8">
          <div className="border rounded-lg p-6 space-y-4">
            <div className="text-center">
              <Skeleton className="h-8 w-20 mx-auto mb-1" />
              <Skeleton className="h-4 w-16 mx-auto" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}