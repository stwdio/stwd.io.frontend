'use client'

import { Skeleton } from '@/components/ui/skeleton'

export function StudioDetailSkeleton() {
  return (
    <div className="h-full flex flex-col bg-background overflow-hidden">
      {/* Fixed Header */}
      <div className="flex-shrink-0 border-b bg-background">
        <div className="flex items-center gap-4 px-6 py-4">
          <Skeleton className="h-10 w-32" /> {/* Back button */}
        </div>
      </div>

      {/* Main Content Area - Two Column Grid */}
      <div className="flex-1 grid grid-cols-[45%_55%] overflow-hidden">
        {/* Left Column - Full Height Image Carousel */}
        <div className="relative bg-black overflow-hidden h-full">
          <Skeleton className="!h-full !w-full" />
          {/* Navigation buttons */}
          <Skeleton className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full" />
          <Skeleton className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full" />
        </div>

        {/* Right Column - Scrollable Content */}
        <div className="h-full overflow-y-auto">
          <div className="p-8 space-y-8">
            {/* Studio Header */}
            <div className="space-y-4">
              <div>
                <Skeleton className="h-10 w-3/4 mb-4" /> {/* Studio name */}
              </div>
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2">
                  <Skeleton className="h-4 w-4" /> {/* MapPin icon */}
                  <Skeleton className="h-4 w-32" /> {/* Location */}
                </div>
                <div className="flex items-center gap-2">
                  {/* Stars */}
                  <div className="flex gap-0.5">
                    {[...Array(5)].map((_, i) => (
                      <Skeleton key={i} className="h-4 w-4" />
                    ))}
                  </div>
                  <Skeleton className="h-4 w-8" /> {/* Review count */}
                </div>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex gap-3">
              <Skeleton className="h-10 w-28" />
              <Skeleton className="h-10 w-28" />
              <Skeleton className="h-10 w-28" />
            </div>

            {/* Followers section */}
            <div className="space-y-3">
              <Skeleton className="h-5 w-32" /> {/* "Followed by" text */}
              <div className="flex -space-x-2">
                {[...Array(4)].map((_, i) => (
                  <Skeleton key={i} className="h-10 w-10 rounded-full border-2 border-background" />
                ))}
                <Skeleton className="h-10 w-10 rounded-full border-2 border-background" />
              </div>
            </div>

            {/* Description */}
            <div className="space-y-3">
              <Skeleton className="h-6 w-24" /> {/* "Description" heading */}
              <div className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
              </div>
            </div>

            {/* Amenities */}
            <div className="space-y-3">
              <Skeleton className="h-6 w-20" /> {/* "Amenities" heading */}
              <div className="flex flex-wrap gap-2">
                {[...Array(6)].map((_, i) => (
                  <Skeleton key={i} className="h-6 w-24 rounded-full" />
                ))}
              </div>
            </div>

            {/* Gear Section */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Skeleton className="h-6 w-16" /> {/* "Gear" heading */}
                <Skeleton className="h-6 w-6 rounded" /> {/* Expand/collapse button */}
              </div>
              <div className="space-y-2">
                {[...Array(4)].map((_, i) => (
                  <Skeleton key={i} className="h-10 w-full rounded-md" />
                ))}
              </div>
            </div>

            {/* Reviews Section */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Skeleton className="h-6 w-20" /> {/* "Reviews" heading */}
                <Skeleton className="h-9 w-32 rounded-md" /> {/* Search input */}
              </div>
              {/* Review items */}
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="border rounded-lg p-4 space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <Skeleton className="h-10 w-10 rounded-full" />
                        <div>
                          <Skeleton className="h-4 w-32 mb-1" />
                          <Skeleton className="h-3 w-24" />
                        </div>
                      </div>
                      <div className="flex gap-0.5">
                        {[...Array(5)].map((_, j) => (
                          <Skeleton key={j} className="h-4 w-4" />
                        ))}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-2/3" />
                    </div>
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