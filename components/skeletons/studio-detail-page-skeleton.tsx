import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

export function StudioDetailPageSkeleton() {
  return (
    <div className="p-4 md:p-6">
      {/* Back Button */}
      <div className="mb-4 md:mb-6">
        <Skeleton className="h-10 w-32 mb-4" />
      </div>

      <div className="grid lg:grid-cols-3 gap-6 lg:gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6 lg:space-y-8">
          {/* Main Studio Image */}
          <Skeleton className="aspect-video w-full rounded-lg" />

          {/* Image Gallery */}
          <div className="space-y-4">
            <Skeleton className="h-6 w-24" />
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
              {Array.from({ length: 4 }, (_, i) => (
                <Skeleton key={i} className="aspect-square rounded-lg" />
              ))}
            </div>
          </div>

          {/* Studio Info */}
          <div className="space-y-6">
            <div>
              {/* Studio Name */}
              <Skeleton className="h-8 w-64 md:h-10 md:w-80 mb-2" />
              <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4 space-y-2 sm:space-y-0">
                {/* Location */}
                <div className="flex items-center">
                  <Skeleton className="h-4 w-4 mr-1" />
                  <Skeleton className="h-4 w-32" />
                </div>
                {/* Rating */}
                <div className="flex items-center space-x-1">
                  <div className="flex space-x-1">
                    {Array.from({ length: 5 }, (_, i) => (
                      <Skeleton key={i} className="h-4 w-4" />
                    ))}
                  </div>
                  <Skeleton className="h-4 w-20 ml-2" />
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
            </div>

            {/* Mobile Rate Card */}
            <div className="lg:hidden">
              <Card className="border-2 border-primary/20">
                <CardContent className="p-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <Skeleton className="h-6 w-16 mb-1" />
                        <Skeleton className="h-3 w-12" />
                      </div>
                      <div className="flex gap-2">
                        <Skeleton className="h-5 w-16" />
                        <Skeleton className="h-5 w-16" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Skeleton className="h-10 w-full" />
                      <Skeleton className="h-10 w-full" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Amenities Section */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Skeleton className="h-6 w-24" />
                <Skeleton className="h-4 w-4" />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {Array.from({ length: 6 }, (_, i) => (
                  <div key={i} className="flex items-center space-x-2">
                    <Skeleton className="h-4 w-4" />
                    <Skeleton className="h-4 w-20" />
                  </div>
                ))}
              </div>
            </div>

            {/* Available Gear Section */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Skeleton className="h-6 w-32" />
                <Skeleton className="h-4 w-4" />
              </div>
              <div className="grid gap-4">
                {Array.from({ length: 3 }, (_, categoryIndex) => (
                  <div key={categoryIndex}>
                    <Skeleton className="h-4 w-24 mb-2" />
                    <div className="flex flex-wrap gap-2">
                      {Array.from({ length: 4 }, (_, itemIndex) => (
                        <Skeleton key={itemIndex} className="h-6 w-16" />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Reviews Section */}
          <div className="space-y-4">
            <Skeleton className="h-7 w-32" />
            <div className="space-y-4">
              {Array.from({ length: 3 }, (_, i) => (
                <div key={i} className="flex space-x-3">
                  <Skeleton className="h-10 w-10 rounded-full flex-shrink-0" />
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center space-x-2">
                      <Skeleton className="h-4 w-24" />
                      <div className="flex space-x-1">
                        {Array.from({ length: 5 }, (_, starIndex) => (
                          <Skeleton key={starIndex} className="h-3 w-3" />
                        ))}
                      </div>
                    </div>
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-20" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Desktop Booking Section */}
        <div className="hidden lg:block lg:col-span-1">
          <div className="lg:sticky lg:top-6">
            <Card>
              <CardContent className="p-4 md:p-6">
                <div className="space-y-4">
                  <div className="text-center">
                    <Skeleton className="h-8 w-20 mx-auto mb-1" />
                    <Skeleton className="h-4 w-16 mx-auto" />
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <Skeleton className="h-4 w-12" />
                      <Skeleton className="h-5 w-16" />
                    </div>
                    <div className="flex justify-between text-sm">
                      <Skeleton className="h-4 w-20" />
                      <Skeleton className="h-5 w-16" />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}