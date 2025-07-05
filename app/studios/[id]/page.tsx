import { notFound } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { StudioDetailContent } from "@/components/studio-detail-content"
import { createClient } from "@/lib/supabase/server"

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

export default async function StudioDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: studioId } = await params

  // Fetch studio details server-side
  const supabase = await createClient()
  const { data: studioData, error: studioError } = await supabase
    .from("studios")
    .select("*")
    .eq("id", studioId)
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
    .eq("studio_id", studioId)

  const amenities: Amenity[] =
    amenitiesData
      ?.map((item: any) => item.amenities)
      ?.filter((amenity: any) => amenity && amenity.name)
      ?.map((amenity: any) => ({ name: amenity.name })) || []

  const reviews: Review[] = [] // For now, empty reviews
  const averageRating = 0

  return (
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
  )
} 