import { createClient } from '@/lib/supabase/server'

export interface Review {
  id: number
  rating: number
  comment: string | null
  created_at: string
  reviewer?: {
    first_name: string | null
    last_name: string | null
    username: string
    avatar_url?: string | null
  }
}

export interface StudioReviewsData {
  reviews: Review[]
  averageRating: number
  totalReviews: number
}

export async function getStudioReviews(studioId: number): Promise<StudioReviewsData> {
  const supabase = await createClient()

  try {
    // Get reviews with reviewer information
    const { data: reviews, error: reviewsError } = await supabase
      .from('reviews')
      .select(`
        id,
        rating,
        comment,
        created_at,
        reviewer:profiles!reviewer_id (
          first_name,
          last_name,
          username,
          avatar_url
        )
      `)
      .eq('studio_id', studioId)
      .order('created_at', { ascending: false })

    if (reviewsError) {
      console.error('Error fetching reviews:', reviewsError)
      return {
        reviews: [],
        averageRating: 0,
        totalReviews: 0
      }
    }

    // Calculate average rating
    const totalReviews = reviews?.length || 0
    const averageRating = totalReviews > 0 
      ? reviews.reduce((sum, review) => sum + (review.rating || 0), 0) / totalReviews 
      : 0

    return {
      reviews: reviews || [],
      averageRating: Math.round(averageRating * 10) / 10, // Round to 1 decimal place
      totalReviews
    }

  } catch (error) {
    console.error('Error in getStudioReviews:', error)
    return {
      reviews: [],
      averageRating: 0,
      totalReviews: 0
    }
  }
}

export async function getStudiosWithReviews(studioIds?: number[]): Promise<Record<number, StudioReviewsData>> {
  const supabase = await createClient()

  try {
    let query = supabase
      .from('reviews')
      .select(`
        id,
        rating,
        comment,
        created_at,
        studio_id,
        reviewer:profiles!reviewer_id (
          first_name,
          last_name,
          username,
          avatar_url
        )
      `)
      .order('created_at', { ascending: false })

    // Filter by studio IDs if provided
    if (studioIds && studioIds.length > 0) {
      query = query.in('studio_id', studioIds)
    }

    const { data: reviews, error } = await query

    if (error) {
      console.error('Error fetching studio reviews:', error)
      return {}
    }

    // Group reviews by studio_id and calculate stats
    const studioReviewsMap: Record<number, StudioReviewsData> = {}

    reviews?.forEach((review) => {
      const studioId = review.studio_id
      if (!studioReviewsMap[studioId]) {
        studioReviewsMap[studioId] = {
          reviews: [],
          averageRating: 0,
          totalReviews: 0
        }
      }
      studioReviewsMap[studioId].reviews.push(review)
    })

    // Calculate averages for each studio
    Object.keys(studioReviewsMap).forEach((studioIdStr) => {
      const studioId = parseInt(studioIdStr)
      const studioData = studioReviewsMap[studioId]
      const totalReviews = studioData.reviews.length
      const averageRating = totalReviews > 0 
        ? studioData.reviews.reduce((sum, review) => sum + (review.rating || 0), 0) / totalReviews 
        : 0

      studioData.totalReviews = totalReviews
      studioData.averageRating = Math.round(averageRating * 10) / 10
    })

    return studioReviewsMap

  } catch (error) {
    console.error('Error in getStudiosWithReviews:', error)
    return {}
  }
}