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

// Count hooks removed as per healthier social environment initiative