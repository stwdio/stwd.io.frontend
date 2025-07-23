"use client"

import { useEffect, useRef } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

interface GenericGridProps<T> {
  items: T[]
  renderItem: (item: T, index: number) => React.ReactNode
  isLoading?: boolean
  error?: any
  hasNextPage?: boolean
  isFetchingNextPage?: boolean
  fetchNextPage?: () => void
  onRefresh?: () => void
  skeletonCount?: number
  renderSkeleton?: () => React.ReactNode
  emptyStateTitle?: string
  emptyStateMessage?: string
  errorMessage?: string
  gridClassName?: string
}

// Modern infinite scroll loading component
function InfiniteScrollLoader({ skeletonCount = 4, renderSkeleton }: { skeletonCount?: number, renderSkeleton?: () => React.ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center py-8 space-y-4">
      <div className="flex space-x-1">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="w-2 h-2 bg-primary rounded-full animate-pulse"
            style={{
              animationDelay: `${i * 0.15}s`,
              animationDuration: '1s'
            }}
          />
        ))}
      </div>
      <p className="text-sm text-muted-foreground animate-pulse">
        Loading more...
      </p>
      {renderSkeleton && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 w-full">
          {Array.from({ length: skeletonCount }).map((_, i) => (
            <div key={i} className="opacity-50">
              {renderSkeleton()}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export function GenericGrid<T>({
  items,
  renderItem,
  isLoading = false,
  error,
  hasNextPage = false,
  isFetchingNextPage = false,
  fetchNextPage,
  onRefresh,
  skeletonCount = 12,
  renderSkeleton,
  emptyStateTitle = "No items found",
  emptyStateMessage = "Try adjusting your filters or search criteria",
  errorMessage = "Failed to load items. Please try again.",
  gridClassName = "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6"
}: GenericGridProps<T>) {
  // Infinite scroll observer
  const observerTarget = useRef(null)

  useEffect(() => {
    if (!fetchNextPage) return

    const observer = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage()
        }
      },
      { threshold: 0.1 }
    )

    if (observerTarget.current) {
      observer.observe(observerTarget.current)
    }

    return () => observer.disconnect()
  }, [hasNextPage, fetchNextPage, isFetchingNextPage])

  // Initial loading state
  if (isLoading && !items.length && renderSkeleton) {
    return (
      <div className="flex flex-col flex-1">
        <div className={gridClassName}>
          {Array.from({ length: skeletonCount }).map((_, i) => (
            <div key={i}>
              {renderSkeleton()}
            </div>
          ))}
        </div>
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className="flex flex-col flex-1 px-4 py-3 sm:px-6 sm:py-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-muted-foreground">
                {errorMessage}
              </p>
              {onRefresh && (
                <Button onClick={onRefresh} className="mt-4">
                  Try Again
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Empty state
  if (!items.length && !isLoading) {
    return (
      <div className="flex flex-col flex-1 px-4 py-3 sm:px-6 sm:py-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <h3 className="text-lg font-semibold mb-2">{emptyStateTitle}</h3>
              <p className="text-muted-foreground">
                {emptyStateMessage}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="flex flex-col flex-1 px-4 py-3 sm:px-6 sm:py-4">
      <div className={gridClassName}>
        {items.map((item, index) => renderItem(item, index))}
      </div>

      {/* Infinite scroll trigger */}
      {fetchNextPage && <div ref={observerTarget} className="h-10" />}

      {/* Loading more indicator */}
      {isFetchingNextPage && (
        <InfiniteScrollLoader 
          skeletonCount={skeletonCount} 
          renderSkeleton={renderSkeleton}
        />
      )}

      {/* End of results - removed the message */}
    </div>
  )
}