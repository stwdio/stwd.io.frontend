import { notFound, redirect } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { Suspense } from "react"
import { createServerComponentClient } from "@/lib/supabase/server"
import { getCoreStudioData } from "./_components/get-core-studio-data"
import { StudioAmenities, AmenitiesSkeleton } from "./_components/studio-amenities"
import { StudioReviews, ReviewsSkeleton } from "./_components/studio-reviews"
import { StudioDetailActions } from "@/components/studio-detail-client"
import { StudioImageWithSkeleton } from "./_components/studio-image-with-skeleton"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { MapPin, DollarSign } from "lucide-react"
import { getStudioPrimaryImageUrl } from "@/lib/utils"


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
      redirect(`/discover/studios/${studioData.slug}`)
    }
    notFound()
  }

  // Fetch only core studio data for instant page shell
  const studio = await getCoreStudioData(slug)

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="p-4 md:p-6">
        {/* Back Button - Instantly rendered */}
        <div className="mb-4 md:mb-6">
          <Button variant="ghost" asChild className="mb-4">
            <Link href="/discover">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Discover
            </Link>
          </Button>
        </div>

        <div className="grid lg:grid-cols-3 gap-6 lg:gap-8">
          {/* Main Content - Instantly rendered */}
          <div className="lg:col-span-2 space-y-6 lg:space-y-8">
            {/* Main Studio Image */}
            <div className="aspect-video relative overflow-hidden rounded-lg">
              <StudioImageWithSkeleton
                src={getStudioPrimaryImageUrl(studio.photo_urls, 800)}
                alt={studio.name}
                fill
                priority
                className="object-cover"
              />
            </div>

            {/* Studio Header Info */}
            <div className="space-y-4">
              <h1 className="text-2xl md:text-3xl font-bold">{studio.name}</h1>
              
              <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  {studio.location}
                </span>
                <span className="flex items-center gap-1">
                  <DollarSign className="h-4 w-4" />
                  ${studio.hourly_rate}/hour
                </span>
              </div>

              {studio.description && (
                <p className="text-base leading-relaxed">{studio.description}</p>
              )}
            </div>

            {/* Gear Section */}
            {studio.gear && Object.keys(studio.gear).length > 0 && (
              <Card>
                <CardContent className="pt-6">
                  <h3 className="text-lg md:text-xl font-semibold mb-4">Studio Gear</h3>
                  <div className="space-y-3">
                    {Object.entries(studio.gear).map(([category, items]: [string, any]) => (
                      <div key={category} className="space-y-2">
                        <h4 className="font-medium capitalize">{category.replace(/_/g, ' ')}</h4>
                        <div className="text-sm text-muted-foreground">
                          {Array.isArray(items) ? items.join(', ') : items}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Amenities Section - Streamed */}
            <Suspense fallback={<AmenitiesSkeleton />}>
              <StudioAmenities studioId={studio.id} />
            </Suspense>

            {/* Reviews Section - Streamed */}
            <Suspense fallback={<ReviewsSkeleton />}>
              <StudioReviews studioId={studio.id} studioName={studio.name} />
            </Suspense>
          </div>

          {/* Sidebar - Instantly rendered */}
          <div className="lg:col-span-1">
            <div className="sticky top-4 space-y-4">
              <Card>
                <CardContent className="p-6">
                  <div className="text-center mb-6">
                    <div className="text-3xl font-bold">${studio.hourly_rate}</div>
                    <div className="text-sm text-muted-foreground">per hour</div>
                  </div>
                  <StudioDetailActions studio={studio} />
                </CardContent>
              </Card>

              {/* Verification Badge */}
              {studio.verification_status === 'verified' && (
                <div className="text-center">
                  <Badge variant="secondary" className="text-sm">
                    ✓ Verified Studio
                  </Badge>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}