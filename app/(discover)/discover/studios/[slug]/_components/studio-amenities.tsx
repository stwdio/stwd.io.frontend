import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { createServerComponentClient } from "@/lib/supabase/server"
import { Card, CardContent } from "@/components/ui/card"

interface Amenity {
  name: string
}

// Skeleton component that matches the exact layout of the amenities section
export function AmenitiesSkeleton() {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="space-y-4">
          {/* Title skeleton */}
          <Skeleton className="h-7 w-24" />
          
          {/* Amenity badges skeleton - Updated to match actual display */}
          <div className="flex flex-wrap gap-2">
            <Skeleton className="h-8 w-24 rounded-full" />
            <Skeleton className="h-8 w-20 rounded-full" />
            <Skeleton className="h-8 w-32 rounded-full" />
            <Skeleton className="h-8 w-28 rounded-full" />
            <Skeleton className="h-8 w-24 rounded-full" />
            <Skeleton className="h-8 w-30 rounded-full" />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// Async server component that fetches amenities data
export async function StudioAmenities({ studioId }: { studioId: number }) {
  const supabase = await createServerComponentClient()
  
  // Fetch amenities for this studio
  const { data: amenitiesData } = await supabase
    .from("studio_amenities")
    .select(`
      amenities (name)
    `)
    .eq("studio_id", studioId)

  const amenities: Amenity[] =
    amenitiesData
      ?.map((item: { amenities: { name: string } | null }) => item.amenities)
      ?.filter((amenity): amenity is { name: string } => amenity !== null && amenity.name !== undefined)
      ?.map((amenity) => ({ name: amenity.name })) || []

  if (amenities.length === 0) {
    return null
  }

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="space-y-4">
          <h3 className="text-lg md:text-xl font-semibold">Amenities</h3>
          <div className="flex flex-wrap gap-2">
            {amenities.map((amenity, index) => (
              <Badge key={index} variant="secondary" className="text-sm">
                {amenity.name}
              </Badge>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}