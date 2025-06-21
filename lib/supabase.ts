import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Helper function to fetch studio reviews through bookings
export async function getStudioReviews(studioId: number) {
  try {
    const { data, error } = await supabase
      .from("reviews")
      .select(`
        *,
        bookings!inner (
          studio_id,
          creator_id,
          profiles!bookings_creator_id_fkey (
            id,
            full_name,
            avatar_url
          )
        )
      `)
      .eq("bookings.studio_id", studioId)
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Error fetching studio reviews:", error)
      return { reviews: [], averageRating: 0, reviewCount: 0 }
    }

    if (!data || data.length === 0) {
      return { reviews: [], averageRating: 0, reviewCount: 0 }
    }

    // Transform the data to match the expected format
    const reviews = data.map((review) => ({
      ...review,
      profiles: review.bookings.profiles
    }))

    const averageRating = reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length

    return {
      reviews,
      averageRating,
      reviewCount: reviews.length
    }
  } catch (error) {
    console.error("Unexpected error fetching studio reviews:", error)
    return { reviews: [], averageRating: 0, reviewCount: 0 }
  }
}

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: number
          user_id: string
          role: "creator" | "owner" | "admin"
          stripe_customer_id: string | null
          full_name: string | null
          avatar_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: number
          user_id: string
          role?: "creator" | "owner" | "admin"
          stripe_customer_id?: string | null
          full_name?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: number
          user_id?: string
          role?: "creator" | "owner" | "admin"
          stripe_customer_id?: string | null
          full_name?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      studios: {
        Row: {
          id: number
          owner_id: number
          name: string
          description: string | null
          location: string | null
          hourly_rate: number
          published: boolean
          verified: boolean
          gear: any
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: number
          owner_id: number
          name: string
          description?: string | null
          location?: string | null
          hourly_rate: number
          published?: boolean
          verified?: boolean
          gear?: any
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: number
          owner_id?: number
          name?: string
          description?: string | null
          location?: string | null
          hourly_rate?: number
          published?: boolean
          verified?: boolean
          gear?: any
          created_at?: string
          updated_at?: string
        }
      }
      amenities: {
        Row: {
          id: number
          name: string
          created_at: string
        }
        Insert: {
          id?: number
          name: string
          created_at?: string
        }
        Update: {
          id?: number
          name?: string
          created_at?: string
        }
      }
      studio_amenities: {
        Row: {
          studio_id: number
          amenity_id: number
        }
        Insert: {
          studio_id: number
          amenity_id: number
        }
        Update: {
          studio_id?: number
          amenity_id?: number
        }
      }
      bookings: {
        Row: {
          id: number
          creator_id: number
          studio_id: number
          start_time: string
          end_time: string
          status: "pending" | "confirmed" | "rejected" | "canceled" | "completed"
          total_paid: number | null
          platform_fee: number | null
          owner_payout: number | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: number
          creator_id: number
          studio_id: number
          start_time: string
          end_time: string
          status?: "pending" | "confirmed" | "rejected" | "canceled" | "completed"
          total_paid?: number | null
          platform_fee?: number | null
          owner_payout?: number | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: number
          creator_id?: number
          studio_id?: number
          start_time?: string
          end_time?: string
          status?: "pending" | "confirmed" | "rejected" | "canceled" | "completed"
          total_paid?: number | null
          platform_fee?: number | null
          owner_payout?: number | null
          created_at?: string
          updated_at?: string
        }
      }
      reviews: {
        Row: {
          id: number
          booking_id: number
          rating: number
          comment: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: number
          booking_id: number
          rating: number
          comment?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: number
          booking_id?: number
          rating?: number
          comment?: string | null
          created_at?: string
          updated_at?: string
        }
      }
    }
  }
}
