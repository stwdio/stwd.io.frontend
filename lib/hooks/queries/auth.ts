'use client'

import { useQuery } from '@supabase-cache-helpers/postgrest-react-query'
import { createClient } from '@/lib/supabase/client'
import { CACHE_TIMES } from '@/lib/react-query/client'
import type { Database } from '@/lib/types/database'

const getSupabaseClient = () => createClient()

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