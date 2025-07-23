import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Skeleton } from "@/components/ui/skeleton"
import { Star } from "lucide-react"
import { getStudioReviews } from "@/lib/studio-reviews"
import { StudioReviews as StudioReviewsClient } from "@/components/studio-reviews"

// High-fidelity skeleton that matches the exact layout of a review card
const SkeletonReviewCard = () => (
  <div className="border-b border-border/40 pb-6 last:border-b-0 last:pb-0">
    <div className="flex items-start space-x-3">
      <Skeleton className="h-10 w-10 rounded-full" />
      <div className="flex-1 space-y-2">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <Skeleton className="h-4 w-24" /> {/* User name */}
            <Skeleton className="h-3 w-20" /> {/* Date */}
          </div>
          <Skeleton className="h-4 w-24" /> {/* Star rating */}
        </div>
        <div className="space-y-2">
          <Skeleton className="h-4 w-full" /> {/* Comment line 1 */}
          <Skeleton className="h-4 w-3/4" /> {/* Comment line 2 */}
        </div>
      </div>
    </div>
  </div>
)

// High-fidelity skeleton component that matches the reviews section
export function ReviewsSkeleton() {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <Skeleton className="h-7 w-20" /> {/* "Reviews" title */}
          <div className="flex items-center space-x-3">
            <Skeleton className="h-5 w-32" /> {/* Star rating */}
            <Skeleton className="h-5 w-16" /> {/* Review count */}
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-6">
          <SkeletonReviewCard />
          <SkeletonReviewCard />
          <SkeletonReviewCard />
        </div>
      </CardContent>
    </Card>
  )
}

// Async server component that fetches reviews data
export async function StudioReviews({ studioId, studioName }: { studioId: number; studioName: string }) {
  // Fetch reviews using the existing helper function
  const { reviews, averageRating } = await getStudioReviews(studioId)
  
  // Use the existing StudioReviews client component for rendering
  return (
    <StudioReviewsClient
      reviews={reviews}
      averageRating={averageRating}
      totalReviews={reviews.length}
      studioName={studioName}
      showTitle={true}
      maxVisible={3}
      variant="full"
    />
  )
}