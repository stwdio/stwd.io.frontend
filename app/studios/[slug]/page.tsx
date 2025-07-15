import { notFound, redirect } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { StudioDetailContent } from "@/components/studio-detail-content"
import { createServerComponentClient } from "@/lib/supabase/server"
import { getStudioReviews } from "@/lib/studio-reviews"
import { Suspense } from "react"
import { StudioDetailPageSkeleton } from "@/components/skeletons"

interface Studio {
  id: number
  name: string
  description: string
  location: string
  hourly_rate: number
  gear: any
  owner_id: number
  created_at: string
  verification_status: string
  published: boolean
  photo_urls?: string[]
  slug: string
}

interface Review {
  id: string
  rating: number
  comment: string | null
  created_at: string
  user_email?: string
}

interface Amenity {
  name: string
}

export default async function StudioDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params

  // Check if slug is actually a numeric ID for backward compatibility
  const isNumericId = /^\d+$/.test(slug)
  
  const supabase = await createServerComponentClient()
  
  if (isNumericId) {
    // If it's a numeric ID, redirect to the slug-based URL
    const { data: studioData } = await supabase
      .from("studios")
      .select("slug")
      .eq("id", parseInt(slug))
      .single()
    
    if (studioData?.slug) {
      redirect(`/studios/${studioData.slug}`)
    }
    notFound()
  }

  // Fetch studio details server-side using slug
  const { data: studioData, error: studioError } = await supabase
    .from("studios")
    .select("*")
    .eq("slug", slug)
    .single()

  if (studioError || !studioData) {
    notFound()
  }

  const studio: Studio = studioData

  // Fetch amenities server-side
  const { data: amenitiesData } = await supabase
    .from("studio_amenities")
    .select(`
      amenities (name)
    `)
    .eq("studio_id", studio.id)

  const amenities: Amenity[] =
    amenitiesData
      ?.map((item: any) => item.amenities)
      ?.filter((amenity: any) => amenity && amenity.name)
      ?.map((amenity: any) => ({ name: amenity.name })) || []

  // Fetch reviews server-side
  const reviewsData = await getStudioReviews(studio.id)
  const reviews = reviewsData.reviews
  const averageRating = reviewsData.averageRating

  return (
    <Suspense fallback={<StudioDetailPageSkeleton />}>
      <div className="flex-1 overflow-y-auto">
        <div className="p-4 md:p-6">
          {/* Back Button */}
          <div className="mb-4 md:mb-6">
            <Button variant="ghost" asChild className="mb-4">
              <Link href="/browse">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Browse
              </Link>
            </Button>
          </div>

          <StudioDetailContent 
            studio={studio}
            amenities={amenities}
            reviews={reviews}
            averageRating={averageRating}
          />
        </div>
      </div>
    </Suspense>
  )
}