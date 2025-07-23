"use client"

import { Skeleton } from '@/components/ui/skeleton'
import { Card, CardContent } from '@/components/ui/card'
import { GenericCardSkeleton } from './generic-card-skeleton'
import { useEffect, useState } from 'react'

export function BrowsePageSkeleton() {
  const [isFullHDOrLarger, setIsFullHDOrLarger] = useState(false)

  // Check if screen is 1080p (1920px) or larger - matches browse-studios-content.tsx
  useEffect(() => {
    const checkScreenSize = () => {
      setIsFullHDOrLarger(window.innerWidth >= 1920)
    }
    
    checkScreenSize()
    window.addEventListener('resize', checkScreenSize)
    return () => window.removeEventListener('resize', checkScreenSize)
  }, [])

  return (
    <div className="flex flex-col flex-1 p-3 sm:p-4 md:p-6 overflow-hidden">
      <div className={`flex gap-4 flex-1 min-h-0 ${isFullHDOrLarger ? 'flex-row' : 'flex-col'}`}>
        {/* Desktop Filters Sidebar Skeleton - Only show on 1080p+ screens */}
        {isFullHDOrLarger && (
          <div className="w-96 flex-shrink-0 h-full">
            <div className="sticky top-0 h-full overflow-y-auto">
              <Card className="shadow-sm h-full flex flex-col">
                <CardContent className="p-4 lg:p-6 flex-1 flex flex-col min-h-0">
                  {/* Filters Header */}
                  <div className="flex items-center justify-between mb-6 flex-shrink-0">
                    <Skeleton className="h-6 w-16" />
                    <Skeleton className="h-5 w-20" />
                  </div>

                  {/* Location Search */}
                  <div className="space-y-2 flex-shrink-0 mb-6">
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-10 w-full" />
                  </div>

                  {/* Price Tier Filter */}
                  <div className="space-y-3 flex-shrink-0 mb-6">
                    <div className="flex items-center justify-between">
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-5 w-16" />
                    </div>
                    <div className="space-y-1">
                      {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="flex items-center space-x-2">
                          <Skeleton className="h-4 w-4" />
                          <Skeleton className="h-4 w-full max-w-[200px]" />
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Amenities Filter */}
                  <div className="flex flex-col space-y-3 mb-6">
                    <div className="flex items-center justify-between">
                      <Skeleton className="h-4 w-20" />
                      <Skeleton className="h-5 w-16" />
                    </div>
                    <Skeleton className="h-10 w-full" />
                    <div className="max-h-48 overflow-y-auto space-y-2 rounded-md border border-input p-3">
                      {[1, 2, 3, 4, 5].map((i) => (
                        <div key={i} className="flex items-center space-x-2">
                          <Skeleton className="h-4 w-4" />
                          <Skeleton className="h-4 w-24" />
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Gear Filter */}
                  <div className="flex flex-col space-y-3 mb-6">
                    <div className="flex items-center justify-between">
                      <Skeleton className="h-4 w-36" />
                      <Skeleton className="h-5 w-16" />
                    </div>
                    <Skeleton className="h-10 w-full" />
                    <div className="max-h-56 overflow-y-auto space-y-3 rounded-md border border-input p-3">
                      {[1, 2, 3].map((category) => (
                        <div key={category} className="space-y-2">
                          <Skeleton className="h-3 w-20" />
                          <div className="space-y-2 ml-2">
                            {[1, 2].map((item) => (
                              <div key={item} className="flex items-center space-x-2">
                                <Skeleton className="h-4 w-4" />
                                <Skeleton className="h-4 w-28" />
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Action Buttons - Sticky at bottom */}
                  <div className="flex-shrink-0 space-y-2 pt-4 border-t bg-background">
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-8 w-full" />
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {/* Studios Grid */}
        <div className="flex-1 min-w-0 overflow-y-auto">
          <div className="bg-muted/20 p-4 sm:p-6 rounded-lg border">
            {/* Studio Cards Grid - Match exact configuration from browse-studios-content.tsx */}
            <div className={`grid gap-4 sm:gap-6 ${
              isFullHDOrLarger 
                ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3' 
                : 'grid-cols-1 sm:grid-cols-1 md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3'
            }`}>
              {Array.from({ length: 12 }).map((_, i) => (
                <GenericCardSkeleton key={i} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}