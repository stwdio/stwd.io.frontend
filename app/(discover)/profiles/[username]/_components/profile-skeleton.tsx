import { Skeleton } from '@/components/ui/skeleton'

export function PublicProfileSkeleton() {
  return (
    <div className="h-full flex flex-col bg-background overflow-hidden">
      {/* Fixed Header */}
      <div className="flex-shrink-0 border-b bg-background">
        <div className="flex items-center gap-4 px-6 py-4">
          <Skeleton className="h-10 w-32" /> {/* Back button */}
        </div>
      </div>

      {/* Main Content Area - Responsive Grid */}
      <div className="flex-1 overflow-y-auto lg:overflow-hidden lg:grid lg:grid-cols-[40%_60%]">
        {/* Mobile: Both columns scroll together; Desktop: Grid layout with fixed image */}
        <div className="relative bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 overflow-hidden h-80 lg:h-full flex items-center justify-center">
          <div className="relative w-full max-w-md aspect-square p-8">
            <Skeleton className="w-full h-full rounded-full" />
          </div>
        </div>

        {/* Right Column - Always part of scrollable flow on mobile */}
        <div className="lg:overflow-y-auto">
          <div className="p-4 sm:p-6 lg:p-8 space-y-6 lg:space-y-8">
            {/* Profile Header */}
            <div className="space-y-4">
              <div className="flex items-start justify-between">
                <Skeleton className="h-8 sm:h-9 lg:h-10 w-3/4" /> {/* Name */}
              </div>
              <div className="flex items-center gap-2">
                <Skeleton className="h-6 w-32" /> {/* @username */}
                <Skeleton className="h-6 w-2" /> {/* bullet */}
                <Skeleton className="h-6 w-24" /> {/* role */}
              </div>
              
              {/* Professional Roles */}
              <div className="flex flex-wrap gap-2">
                <Skeleton className="h-7 w-28 rounded-full" />
                <Skeleton className="h-7 w-32 rounded-full" />
              </div>

              {/* Website */}
              <div className="flex items-center gap-2">
                <Skeleton className="h-4 w-4" />
                <Skeleton className="h-4 w-40" />
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex gap-3">
              <Skeleton className="h-10 w-28" />
              <Skeleton className="h-10 w-28" />
              <Skeleton className="h-10 w-28" />
            </div>

            {/* Followers/Following */}
            <div className="space-y-4">
              <div className="space-y-3">
                <Skeleton className="h-5 w-24" />
                <div className="flex -space-x-2">
                  {[...Array(5)].map((_, i) => (
                    <Skeleton key={i} className="h-10 w-10 rounded-full border-2 border-background" />
                  ))}
                  <Skeleton className="h-10 w-10 rounded-full border-2 border-background" />
                </div>
              </div>
              <div className="space-y-3">
                <Skeleton className="h-5 w-24" />
                <div className="flex -space-x-2">
                  {[...Array(5)].map((_, i) => (
                    <Skeleton key={i} className="h-10 w-10 rounded-full border-2 border-background" />
                  ))}
                  <Skeleton className="h-10 w-10 rounded-full border-2 border-background" />
                </div>
              </div>
            </div>

            {/* Divider */}
            <Skeleton className="h-px w-full" />

            {/* Bio Section */}
            <div className="space-y-3">
              <Skeleton className="h-6 w-12" /> {/* "Bio" heading */}
              <div className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
              </div>
            </div>

            {/* Skills Section */}
            <div className="border rounded-lg p-6 space-y-4">
              <div className="flex items-center justify-between">
                <Skeleton className="h-6 w-16" /> {/* "Skills" heading */}
                <Skeleton className="h-6 w-6 rounded" /> {/* Expand/collapse */}
              </div>
              <div className="flex flex-wrap gap-2">
                <Skeleton className="h-7 w-20 rounded-full" />
                <Skeleton className="h-7 w-24 rounded-full" />
                <Skeleton className="h-7 w-28 rounded-full" />
                <Skeleton className="h-7 w-20 rounded-full" />
                <Skeleton className="h-7 w-32 rounded-full" />
              </div>
            </div>

            {/* Portfolio Links */}
            <div className="border rounded-lg p-6 space-y-4">
              <div className="flex items-center justify-between">
                <Skeleton className="h-6 w-24" /> {/* "Portfolio" heading */}
                <Skeleton className="h-6 w-6 rounded" /> {/* Expand/collapse */}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Skeleton className="h-14 w-full rounded-lg" />
                <Skeleton className="h-14 w-full rounded-lg" />
                <Skeleton className="h-14 w-full rounded-lg" />
                <Skeleton className="h-14 w-full rounded-lg" />
              </div>
            </div>

            {/* Social Links */}
            <div className="border rounded-lg p-6 space-y-4">
              <div className="flex items-center justify-between">
                <Skeleton className="h-6 w-20" /> {/* "Social" heading */}
                <Skeleton className="h-6 w-6 rounded" /> {/* Expand/collapse */}
              </div>
              <div className="flex gap-3">
                <Skeleton className="h-10 w-10 rounded-full" />
                <Skeleton className="h-10 w-10 rounded-full" />
                <Skeleton className="h-10 w-10 rounded-full" />
                <Skeleton className="h-10 w-10 rounded-full" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}