import { notFound } from "next/navigation"
import Image from "next/image"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Star, MapPin, Wifi, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { StudioImage } from "@/components/studio-image-placeholder"
import { StudioDetailActions } from "@/components/studio-detail-client"
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

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${i < Math.floor(rating) ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`}
      />
    ))
  }

  return (
    <div className="p-6">
            {/* Back Button */}
            <div className="mb-6">
              <Button variant="ghost" asChild className="mb-4">
                <Link href="/browse">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Browse
                </Link>
              </Button>
            </div>

            <div className="grid lg:grid-cols-3 gap-8">
              {/* Main Content */}
              <div className="lg:col-span-2 space-y-8">
                {/* Main Studio Image */}
                <div className="aspect-video relative overflow-hidden rounded-lg">
                  <StudioImage
                    src={null} // TODO: Replace with actual studio image URL
                    alt={studio.name}
                    fill
                    width={600}
                    height={400}
                    className="object-cover"
                    priority
                  />
                </div>

                {/* Image Gallery */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Gallery</h3>
                  <div className="grid grid-cols-4 gap-2">
                    {Array.from({ length: 4 }, (_, i) => (
                      <div key={i} className="aspect-square relative overflow-hidden rounded-lg">
                        <StudioImage
                          src={null}
                          alt={`${studio.name} ${i + 1}`}
                          fill
                          width={150}
                          height={150}
                          className="object-cover cursor-pointer hover:opacity-80 transition-opacity"
                        />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Studio Info */}
                <div className="space-y-6">
                  <div>
                    <h1 className="text-3xl font-bold mb-2">{studio.name}</h1>
                    <div className="flex items-center space-x-4 text-muted-foreground">
                      <div className="flex items-center">
                        <MapPin className="h-4 w-4 mr-1" />
                        {studio.location}
                      </div>
                      <div className="flex items-center space-x-1">
                        {renderStars(averageRating)}
                        <span className="ml-2">({reviews.length} reviews)</span>
                      </div>
                    </div>
                  </div>

                  <p className="text-muted-foreground leading-relaxed">{studio.description}</p>

                  {/* Amenities */}
                  {amenities.length > 0 && (
                    <div>
                      <h3 className="text-xl font-semibold mb-3">Amenities</h3>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                        {amenities.map((amenity, index) => (
                          <div key={index} className="flex items-center space-x-2">
                            <Wifi className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm">{amenity.name}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Gear List */}
                  {studio.gear && Object.keys(studio.gear).length > 0 && (
                    <div>
                      <h3 className="text-xl font-semibold mb-3">Available Gear</h3>
                      <div className="grid gap-4">
                        {Object.entries(studio.gear).map(([category, items]) => (
                          <div key={category}>
                            <h4 className="font-medium text-muted-foreground mb-2 capitalize">{category}</h4>
                            <div className="flex flex-wrap gap-2">
                              {Array.isArray(items) ? (
                                items.map((item: string, index: number) => (
                                  <Badge key={index} variant="secondary">
                                    {item}
                                  </Badge>
                                ))
                              ) : (
                                <Badge variant="secondary">{String(items)}</Badge>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Reviews */}
                <div>
                  <h3 className="text-xl font-semibold mb-6">Reviews ({reviews.length})</h3>
                  <div className="space-y-6">
                    {reviews.map((review) => (
                      <Card key={review.id}>
                        <CardContent className="p-6">
                          <div className="flex items-start space-x-4">
                            <Avatar className="h-10 w-10">
                              <AvatarImage src="/placeholder.svg" />
                              <AvatarFallback>U</AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                              <div className="flex items-center justify-between mb-2">
                                <div>
                                  <p className="font-medium">{review.user_email || "Anonymous"}</p>
                                  <div className="flex items-center space-x-1">{renderStars(review.rating)}</div>
                                </div>
                                <p className="text-sm text-muted-foreground">{new Date(review.created_at).toLocaleDateString()}</p>
                              </div>
                              {review.comment && <p className="text-muted-foreground">{review.comment}</p>}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                    {reviews.length === 0 && (
                      <p className="text-muted-foreground text-center py-8">No reviews yet. Be the first to book and review!</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Booking/Contact Section */}
              <div className="lg:col-span-1">
                <div className="sticky top-6">
                  <Card>
                    <CardContent className="p-6">
                      <div className="space-y-4">
                        <div className="text-center">
                          <div className="text-3xl font-bold">${studio.hourly_rate}</div>
                          <div className="text-sm text-muted-foreground">per hour</div>
                        </div>
                        
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>Status:</span>
                            <Badge variant={studio.published ? "default" : "secondary"}>
                              {studio.published ? "Available" : "Unavailable"}
                            </Badge>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span>Verification:</span>
                            <Badge variant={studio.verification_status === 'verified' ? "default" : "secondary"}>
                              {studio.verification_status === 'verified' ? "Verified" : "Pending"}
                            </Badge>
                          </div>
                        </div>

                        <StudioDetailActions studio={studio} />
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          </div>
  )
} 