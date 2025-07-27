import { notFound } from 'next/navigation'
import { createServerComponentClient } from '@/lib/supabase/server'
import { StudioDetailContent } from '@/components/studio-detail-content'
import { getCoreStudioData } from './_components/get-core-studio-data'
import { Metadata } from 'next'
import { getStudioPrimaryImageUrl } from '@/lib/utils'
import { BackButton } from '@/components/back-button'

interface StudioPageProps {
  params: Promise<{
    slug: string
  }>
}

export async function generateMetadata({ params }: StudioPageProps): Promise<Metadata> {
  const { slug } = await params
  const supabase = await createServerComponentClient()
  
  const { data: studio } = await supabase
    .from('studios')
    .select('name, description, location, photo_urls')
    .eq('slug', slug)
    .eq('published', true)
    .single()
  
  if (!studio) {
    return {}
  }
  
  const primaryImageUrl = getStudioPrimaryImageUrl(studio.photo_urls || [])
  
  return {
    title: `${studio.name} | stwd.io`,
    description: studio.description || `Professional recording studio in ${studio.location}`,
    openGraph: {
      title: studio.name,
      description: studio.description || `Professional recording studio in ${studio.location}`,
      images: primaryImageUrl ? [primaryImageUrl] : [],
    },
  }
}

export default async function StudioPage({ params }: StudioPageProps) {
  const { slug } = await params
  const supabase = await createServerComponentClient()
  
  // Get current user
  const { data: { user } } = await supabase.auth.getUser()
  
  // Get user profile if authenticated
  let profile = null
  if (user) {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', user.id)
      .single()
    profile = data
  }
  
  // Get studio by slug
  const { data: studio, error } = await supabase
    .from('studios')
    .select('*')
    .eq('slug', slug)
    .eq('published', true)
    .single()
  
  if (error || !studio) {
    notFound()
  }
  
  // Get studio owner profile
  const { data: ownerProfile } = await supabase
    .from('profiles')
    .select('first_name, last_name, username, avatar_url')
    .eq('user_id', studio.owner_id)
    .single()
  
  // Get studio amenities
  const { data: studioAmenities } = await supabase
    .from('studio_amenities')
    .select('amenities(name)')
    .eq('studio_id', studio.id)
  
  const amenities = studioAmenities?.map(sa => ({ name: sa.amenities?.name || '' })) || []
  
  // Get studio reviews
  const { data: reviews } = await supabase
    .from('reviews')
    .select(`
      id,
      rating,
      comment,
      created_at,
      reviewer:profiles!reviewer_id(
        first_name,
        last_name,
        username,
        avatar_url
      )
    `)
    .eq('studio_id', studio.id)
    .order('created_at', { ascending: false })
  
  // Calculate average rating
  const averageRating = reviews && reviews.length > 0
    ? reviews.reduce((acc, review) => acc + review.rating, 0) / reviews.length
    : 0
  
  // Format reviews with reviewer data
  const formattedReviews = reviews?.map(review => ({
    ...review,
    reviewer: review.reviewer ? {
      first_name: review.reviewer.first_name,
      last_name: review.reviewer.last_name,
      username: review.reviewer.username,
      avatar_url: review.reviewer.avatar_url
    } : undefined
  })) || []
  
  return (
    <StudioDetailContent
      studio={studio}
      amenities={amenities}
      reviews={formattedReviews}
      averageRating={averageRating}
      ownerProfile={ownerProfile}
      currentUserProfile={profile}
    />
  )
}