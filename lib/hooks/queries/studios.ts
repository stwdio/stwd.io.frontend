'use client'

import { useQuery } from '@supabase-cache-helpers/postgrest-react-query'
import { useInfiniteQuery, useQuery as useReactQuery } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import { CACHE_TIMES } from '@/lib/react-query/client'
import type { Database, StudioWithDetails } from '@/lib/types/database'

// Re-export createClient with proper typing for consistency
const getSupabaseClient = () => createClient()

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
        slug,
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
  search?: string
  minRate?: number
  maxRate?: number
  priceTiers?: number[]
  amenityIds?: number[]
  gearItems?: string[]
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
          daily_rate,
          price_tier,
          currency,
          photo_urls,
          verified,
          verification_status,
          slug,
          amenities!studio_amenities(
            id,
            name
          ),
          reviews(rating),
          owner_id
        `, { count: 'exact' })
        .eq('published', true)

      // Apply filters dynamically
      if (filters?.location) {
        query = query.ilike('location', `%${filters.location}%`)
      }
      
      if (filters?.search) {
        query = query.or(`name.ilike.%${filters.search}%,description.ilike.%${filters.search}%`)
      }
      
      if (filters?.minRate) {
        query = query.gte('hourly_rate', filters.minRate)
      }
      
      if (filters?.maxRate) {
        query = query.lte('hourly_rate', filters.maxRate)
      }
      
      if (filters?.priceTiers && filters.priceTiers.length > 0) {
        query = query.in('price_tier', filters.priceTiers)
      }
      
      if (filters?.verified !== undefined) {
        query = query.eq('verified', filters.verified)
      }

      // Apply amenity filtering using our custom function
      if (filters?.amenityIds && filters.amenityIds.length > 0) {
        // Use the database function to get studios with all specified amenities
        const { data: studioIds, error: amenityError } = await getSupabaseClient()
          .rpc('get_studios_with_amenities', { amenity_ids: filters.amenityIds })
        
        if (amenityError) {
          throw amenityError
        } else if (studioIds && studioIds.length > 0) {
          const ids = studioIds.map((row: { studio_id: number }) => row.studio_id)
          query = query.filter('id', 'in', `(${ids.join(',')})`)
        } else {
          // No studios match the amenity criteria - return empty result
          query = query.filter('id', 'eq', -1) // Non-existent ID to return empty
        }
      }

      // Apply gear filtering using our custom function
      if (filters?.gearItems && filters.gearItems.length > 0) {
        // Use the database function to get studios with any of the specified gear items
        const { data: studioIds, error: gearError } = await getSupabaseClient()
          .rpc('get_studios_with_gear', { gear_items: filters.gearItems })
        
        if (gearError) {
          throw gearError
        } else if (studioIds && studioIds.length > 0) {
          const ids = studioIds.map((row: { studio_id: number }) => row.studio_id)
          query = query.filter('id', 'in', `(${ids.join(',')})`)
        } else {
          // No studios match the gear criteria - return empty result
          query = query.filter('id', 'eq', -1) // Non-existent ID to return empty
        }
      }

      const from = pageParam * PAGE_SIZE
      const to = from + PAGE_SIZE - 1

      const { data, error, count } = await query
        .range(from, to)
        .order('created_at', { ascending: false })

      if (error) {
        throw error
      }

      // Process the data to calculate review statistics
      const processedData = (data || []).map(studio => {
        const reviews = studio.reviews || []
        const validRatings = reviews.filter(r => r.rating != null).map(r => r.rating)
        
        return {
          ...studio,
          review_count: validRatings.length,
          average_rating: validRatings.length > 0 
            ? validRatings.reduce((sum, rating) => sum + rating, 0) / validRatings.length 
            : 0
        }
      })

      return {
        data: processedData,
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

/**
 * Hook for getting available gear items
 * Extracts unique gear items from all studios' JSONB gear field
 */
export function useAvailableGear() {
  return useReactQuery({
    queryKey: ['gear', 'available'],
    queryFn: async () => {
      const { data, error } = await getSupabaseClient()
        .from('studios')
        .select('gear')
        .eq('published', true)
        .not('gear', 'is', null)

      if (error) {
        throw error
      }
      
      // Extract all unique gear items from the JSONB data
      const gearCategories: Record<string, Set<string>> = {}
      
      data?.forEach(studio => {
        if (studio.gear && typeof studio.gear === 'object') {
          Object.entries(studio.gear).forEach(([category, items]) => {
            if (!gearCategories[category]) {
              gearCategories[category] = new Set()
            }
            
            if (Array.isArray(items)) {
              items.forEach(item => {
                if (typeof item === 'string') {
                  gearCategories[category].add(item)
                }
              })
            } else if (typeof items === 'string') {
              gearCategories[category].add(items)
            }
          })
        }
      })

      // Convert to array format expected by the UI
      const result: { category: string; item: string }[] = []
      Object.entries(gearCategories).forEach(([category, itemsSet]) => {
        Array.from(itemsSet).forEach(item => {
          result.push({ category, item })
        })
      })

      const sortedResult = result.sort((a, b) => {
        // Sort by category first, then by item
        if (a.category !== b.category) {
          return a.category.localeCompare(b.category)
        }
        return a.item.localeCompare(b.item)
      })

      return sortedResult
    },
    staleTime: 1000 * 60 * 30, // 30 minutes
    gcTime: 1000 * 60 * 60, // 1 hour (formerly cacheTime)
  })
}