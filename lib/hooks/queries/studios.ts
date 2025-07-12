'use client'

import { useQuery } from '@supabase-cache-helpers/postgrest-react-query'
import { useInfiniteQuery } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import { CACHE_TIMES } from '@/lib/react-query/client'
import type { Database, StudioWithDetails } from '@/lib/types/database'

// Re-export createClient with proper typing for consistency
const getSupabaseClient = () => createClient<Database>()

/**
 * Hook for fetching all published studios with full details
 * Uses automatic cache key generation and relationship loading
 */
export function useStudios() {
  return useQuery(
    getSupabaseClient()
      .from('studios')
      .select(`
        id,
        name,
        description,
        location,
        hourly_rate,
        photo_urls,
        published,
        verified,
        verification_status,
        created_at,
        updated_at,
        amenities!studio_amenities(
          id,
          name
        ),
        reviews(
          id,
          rating,
          comment,
          created_at,
          reviewer:profiles(
            id,
            username,
            first_name,
            last_name,
            avatar_url
          )
        ),
        owner:profiles(
          id,
          username,
          first_name,
          last_name,
          avatar_url
        )
      `)
      .eq('published', true)
      .order('created_at', { ascending: false }),
    {
      ...CACHE_TIMES.studios,
    }
  )
}

/**
 * Hook for fetching a single studio by ID with full details
 * Perfect for studio detail pages
 */
export function useStudio(studioId: number | null) {
  return useQuery(
    getSupabaseClient()
      .from('studios')
      .select(`
        *,
        amenities!studio_amenities(
          id,
          name
        ),
        reviews(
          id,
          rating,
          comment,
          created_at,
          updated_at,
          reviewer:profiles(
            id,
            username,
            first_name,
            last_name,
            avatar_url
          )
        ),
        pricing_rules(*),
        add_on_services(*),
        owner:profiles(
          id,
          username,
          first_name,
          last_name,
          avatar_url,
          created_at
        )
      `)
      .eq('id', studioId!)
      .single(),
    {
      ...CACHE_TIMES.studios,
      enabled: !!studioId, // Only run query if studioId exists
    }
  )
}

/**
 * Hook for infinite scroll studio browsing
 * Uses React Query's useInfiniteQuery with Supabase
 */
export function useStudiosInfinite(filters?: {
  location?: string
  minRate?: number
  maxRate?: number
  amenityIds?: number[]
  verified?: boolean
}) {
  const PAGE_SIZE = 20

  return useInfiniteQuery({
    queryKey: ['studios', 'infinite', filters],
    queryFn: async ({ pageParam = 0 }) => {
      let query = getSupabaseClient()
        .from('studios')
        .select(`
          id,
          name,
          description,
          location,
          hourly_rate,
          photo_urls,
          verified,
          verification_status,
          amenities!studio_amenities(
            id,
            name
          ),
          reviews(rating)
        `, { count: 'exact' })
        .eq('published', true)

      // Apply filters dynamically
      if (filters?.location) {
        query = query.ilike('location', `%${filters.location}%`)
      }
      
      if (filters?.minRate) {
        query = query.gte('hourly_rate', filters.minRate)
      }
      
      if (filters?.maxRate) {
        query = query.lte('hourly_rate', filters.maxRate)
      }
      
      if (filters?.verified !== undefined) {
        query = query.eq('verified', filters.verified)
      }

      const from = pageParam * PAGE_SIZE
      const to = from + PAGE_SIZE - 1

      const { data, error, count } = await query
        .range(from, to)
        .order('created_at', { ascending: false })

      if (error) {
        throw error
      }

      return {
        data: data || [],
        count: count || 0,
        pageParam,
        hasMore: data && data.length === PAGE_SIZE
      }
    },
    getNextPageParam: (lastPage) => {
      return lastPage.hasMore ? lastPage.pageParam + 1 : undefined
    },
    initialPageParam: 0,
    ...CACHE_TIMES.studios,
  })
}

/**
 * Hook for fetching studios owned by a specific user
 * Used in owner dashboards
 */
export function useMyStudios(ownerId: number | null) {
  return useQuery(
    getSupabaseClient()
      .from('studios')
      .select(`
        *,
        amenities!studio_amenities(
          id,
          name
        ),
        reviews(
          id,
          rating,
          comment,
          created_at,
          reviewer:profiles(username, first_name, last_name)
        ),
        bookings(
          id,
          status,
          start_time,
          end_time,
          total_paid,
          creator:profiles(username, first_name, last_name)
        )
      `)
      .eq('owner_id', ownerId!)
      .order('created_at', { ascending: false }),
    {
      ...CACHE_TIMES.studios,
      enabled: !!ownerId,
    }
  )
}

/**
 * Hook for fetching studios using your optimized database function
 * This leverages your existing N+1 prevention patterns
 */
export function useStudioListMemberships(studioIds: number[], userProfileId: number | null) {
  return useQuery(
    getSupabaseClient().rpc('get_batch_studio_list_memberships_optimized', {
      studio_ids: studioIds,
      user_profile_id: userProfileId!
    }),
    {
      ...CACHE_TIMES.studios,
      enabled: !!userProfileId && studioIds.length > 0,
    }
  )
}

/**
 * Hook for fetching studios from a specific list
 * Used in user's saved lists
 */
export function useListStudios(listId: number | null, userProfileId: number | null) {
  return useQuery(
    getSupabaseClient().rpc('get_list_studios_for_quote', {
      list_id_param: listId!,
      user_profile_id: userProfileId!
    }),
    {
      ...CACHE_TIMES.studios,
      enabled: !!listId && !!userProfileId,
    }
  )
}

/**
 * Hook for searching studios by location with PostGIS
 * When you implement geographic search, this will be ready
 */
export function useStudiosNearLocation(
  lat: number | null, 
  lng: number | null, 
  radiusKm: number = 50
) {
  // This will be implemented when you add PostGIS geographic functions
  // For now, returning a disabled query
  return useQuery(
    getSupabaseClient()
      .from('studios')
      .select(`
        id,
        name,
        description,
        location,
        hourly_rate,
        photo_urls,
        verified
      `)
      .eq('published', true),
    {
      ...CACHE_TIMES.studios,
      enabled: false, // Disabled until PostGIS function is implemented
    }
  )
}

/**
 * Hook for getting amenities (reference data)
 * Cached longer since it changes infrequently
 */
export function useAmenities() {
  return useQuery(
    getSupabaseClient()
      .from('amenities')
      .select('*')
      .order('name'),
    {
      ...CACHE_TIMES.amenities,
    }
  )
}