'use client'

import { useQuery } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'

export function useIsFollowingUser(userId: string | null) {
  const supabase = createClient()

  return useQuery({
    queryKey: ['is-following-user', userId],
    queryFn: async () => {
      if (!userId) return false
      
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return false

      const { data, error } = await supabase
        .from('social_connections')
        .select('id')
        .eq('follower_id', user.id)
        .eq('following_user_id', userId)
        .single()

      if (error && error.code !== 'PGRST116') { // PGRST116 = no rows found
        console.error('Error checking follow status:', error)
        return false
      }

      return !!data
    },
    enabled: !!userId
  })
}

export function useIsFollowingStudio(studioId: number | null) {
  const supabase = createClient()

  return useQuery({
    queryKey: ['is-following-studio', studioId],
    queryFn: async () => {
      if (!studioId) return false
      
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return false

      const { data, error } = await supabase
        .from('social_connections')
        .select('id')
        .eq('follower_id', user.id)
        .eq('following_studio_id', studioId)
        .single()

      if (error && error.code !== 'PGRST116') { // PGRST116 = no rows found
        console.error('Error checking follow status:', error)
        return false
      }

      return !!data
    },
    enabled: !!studioId
  })
}

export function useFollowerCount(userId?: string | null, studioId?: number | null) {
  const supabase = createClient()

  return useQuery({
    queryKey: ['follower-count', userId, studioId],
    queryFn: async () => {
      if (!userId && !studioId) return 0

      let query = supabase
        .from('social_connections')
        .select('id', { count: 'exact', head: true })

      if (userId) {
        query = query.eq('following_user_id', userId)
      } else if (studioId) {
        query = query.eq('following_studio_id', studioId)
      }

      const { count, error } = await query

      if (error) {
        console.error('Error fetching follower count:', error)
        return 0
      }

      return count || 0
    },
    enabled: !!(userId || studioId)
  })
}

export function useFollowingCount(userId: string | null) {
  const supabase = createClient()

  return useQuery({
    queryKey: ['following-count', userId],
    queryFn: async () => {
      if (!userId) return 0

      const { count, error } = await supabase
        .from('social_connections')
        .select('id', { count: 'exact', head: true })
        .eq('follower_id', userId)

      if (error) {
        console.error('Error fetching following count:', error)
        return 0
      }

      return count || 0
    },
    enabled: !!userId
  })
}