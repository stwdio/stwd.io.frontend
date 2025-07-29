'use client'

import { useQuery } from '@supabase-cache-helpers/postgrest-react-query'
import { useInfiniteQuery } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import { CACHE_TIMES } from '@/lib/react-query/client'
import type { Database } from '@/lib/types/database'

const getSupabaseClient = () => createClient()

// Type for profile with roles
type ProfileWithRoles = Database['public']['Tables']['profiles']['Row'] & {
  profile_roles?: Array<{
    role: {
      id: number
      name: string
      slug: string
    }
  }>
}

const PAGE_SIZE = 20

/**
 * Hook for fetching profiles with infinite scroll
 * Similar to useStudiosInfinite but for profiles
 */
export function useProfilesInfinite(filters?: {
  search?: string
  category?: 'all' | 'artists' | 'engineers' | 'industry'
  roleFilters?: string[]
}) {
  return useInfiniteQuery({
    queryKey: ['profiles', 'infinite', filters],
    queryFn: async ({ pageParam = 0 }) => {
      let query = getSupabaseClient()
        .from('profiles')
        .select(`
          *,
          profile_roles(
            role:roles(
              id,
              name,
              slug
            )
          )
        `, { count: 'exact' })
        .not('system_role', 'is', null) // Only show users who have completed onboarding

      // Apply search filter
      if (filters?.search) {
        query = query.or(
          `username.ilike.%${filters.search}%,first_name.ilike.%${filters.search}%,last_name.ilike.%${filters.search}%`
        )
      }

      const from = pageParam * PAGE_SIZE
      const to = from + PAGE_SIZE - 1

      const { data, error, count } = await query
        .range(from, to)
        .order('created_at', { ascending: false })

      if (error) {
        throw error
      }

      // Client-side filtering by role (since we can't filter JSONB in the query directly)
      let filteredData = data || []
      
      // Apply category filter
      if (filters?.category && filters.category !== 'all' && filteredData.length > 0) {
        const categoryRoleFilters: Record<string, string[]> = {
          'artists': ['musician', 'podcaster', 'voice-actor'],
          'engineers': ['engineer', 'producer'],
          'industry': ['record-label', 'other']
        }
        
        const allowedRoles = categoryRoleFilters[filters.category] || []
        filteredData = filteredData.filter(profile => 
          Array.isArray(profile.profile_roles) && 
          profile.profile_roles.some((pr) => 
            allowedRoles.includes(pr.role?.slug || '')
          )
        )
      }
      
      // Apply role filters from filter panel
      if (filters?.roleFilters && filters.roleFilters.length > 0 && filteredData.length > 0) {
        filteredData = filteredData.filter(profile => {
          if (Array.isArray(profile.profile_roles)) {
            return profile.profile_roles.some((pr) => 
              filters.roleFilters!.includes(pr.role?.slug || '')
            )
          }
          return false
        })
      }

      return {
        data: filteredData,
        count: count || 0,
        pageParam,
        // Only has more if we received a full page from the database (before filtering)
        hasMore: data && data.length === PAGE_SIZE && filteredData.length > 0
      }
    },
    getNextPageParam: (lastPage) => {
      return lastPage.hasMore ? lastPage.pageParam + 1 : undefined
    },
    initialPageParam: 0,
    ...CACHE_TIMES.user_profile,
  })
}

/**
 * Hook for fetching current user's profile
 * This works with your existing AuthProvider pattern
 * Use this when you need reactive profile updates
 */
export function useProfile(userId: string | null) {
  return useQuery(
    getSupabaseClient()
      .from('profiles')
      .select('*')
      .eq('user_id', userId!)
      .single(),
    {
      ...CACHE_TIMES.user_profile,
      enabled: !!userId,
    }
  )
}

/**
 * Hook for getting profile by ID (not user_id)
 * Useful for displaying other users' profiles
 */
export function useProfileById(profileId: number | null) {
  return useQuery(
    getSupabaseClient()
      .from('profiles')
      .select(`
        id,
        username,
        first_name,
        last_name,
        avatar_url,
        role,
        created_at
      `)
      .eq('id', profileId!)
      .single(),
    {
      ...CACHE_TIMES.user_profile,
      enabled: !!profileId,
    }
  )
}

/**
 * Hook for getting current user's profile ID
 * Uses your existing database function
 */
export function useMyProfileId() {
  return useQuery(
    getSupabaseClient().rpc('get_my_profile_id'),
    {
      ...CACHE_TIMES.user_profile,
    }
  )
}

/**
 * Hook for checking if user is admin
 * Uses your existing database function
 */
export function useIsAdmin() {
  return useQuery(
    getSupabaseClient().rpc('is_admin'),
    {
      ...CACHE_TIMES.user_profile,
    }
  )
}

/**
 * Hook for getting user's lists with studio counts
 * Perfect for dashboard sidebar
 */
export function useUserLists(userProfileId: number | null) {
  return useQuery(
    getSupabaseClient().rpc('get_user_lists_with_counts', {
      user_profile_id: userProfileId!
    }),
    {
      ...CACHE_TIMES.user_profile,
      enabled: !!userProfileId,
    }
  )
}

/**
 * Hook for getting user's bookings
 * Used in creator dashboards
 */
export function useUserBookings(userProfileId: number | null) {
  return useQuery(
    getSupabaseClient()
      .from('bookings')
      .select(`
        *,
        studio:studios(
          id,
          name,
          location,
          photo_urls
        ),
        reviews(
          id,
          rating,
          comment
        )
      `)
      .eq('creator_id', userProfileId!)
      .order('created_at', { ascending: false }),
    {
      ...CACHE_TIMES.bookings,
      enabled: !!userProfileId,
    }
  )
}

/**
 * Hook for getting user's inquiries
 * Shows all inquiries made by the user
 */
export function useUserInquiries(userProfileId: number | null) {
  return useQuery(
    getSupabaseClient()
      .from('inquiries')
      .select(`
        *,
        inquiry_recipients(
          studio_id,
          status,
          response_message,
          quote_amount,
          responded_at,
          studio:studios(
            id,
            name,
            location,
            photo_urls
          )
        )
      `)
      .eq('creator_id', userProfileId!)
      .order('created_at', { ascending: false }),
    {
      ...CACHE_TIMES.user_profile,
      enabled: !!userProfileId,
    }
  )
}

/**
 * Hook for getting user's notifications
 * Real-time updates for new notifications
 */
export function useUserNotifications(userProfileId: number | null) {
  return useQuery(
    getSupabaseClient()
      .from('notifications')
      .select('*')
      .eq('user_id', userProfileId!)
      .order('created_at', { ascending: false })
      .limit(50), // Limit to recent 50 notifications
    {
      staleTime: 30 * 1000,     // 30 seconds - notifications should be fresh
      gcTime: 5 * 60 * 1000,    // 5 minutes
      enabled: !!userProfileId,
    }
  )
}

/**
 * Hook for getting unread notification count
 * Used for badge displays
 */
export function useUnreadNotificationCount(userProfileId: number | null) {
  return useQuery(
    getSupabaseClient()
      .from('notifications')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', userProfileId!)
      .eq('is_read', false),
    {
      staleTime: 30 * 1000,     // 30 seconds
      gcTime: 5 * 60 * 1000,    // 5 minutes
      enabled: !!userProfileId,
    }
  )
}