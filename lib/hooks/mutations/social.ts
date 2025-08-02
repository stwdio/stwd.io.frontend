'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'

interface FollowUserParams {
  followingUserId: string
  userName?: string
}

interface UnfollowUserParams {
  followingUserId: string
  userName?: string
}

interface FollowStudioParams {
  followingStudioId: number
  studioName?: string
}

interface UnfollowStudioParams {
  followingStudioId: number
  studioName?: string
}

export function useFollowUser() {
  const queryClient = useQueryClient()
  const supabase = createClient()

  return useMutation({
    mutationFn: async ({ followingUserId, userName }: FollowUserParams) => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const { data, error } = await supabase
        .from('social_connections')
        .insert({
          follower_id: user.id,
          following_user_id: followingUserId
        })
        .select()
        .single()

      if (error) throw error
      return { ...data, userName }
    },
    onSuccess: (data, variables) => {
      const name = data.userName || 'User'
      toast.success(`Now Following ${name}`)
      queryClient.invalidateQueries({ queryKey: ['is-following-user', variables.followingUserId] })
      queryClient.invalidateQueries({ queryKey: ['follower-count', variables.followingUserId] })
      queryClient.invalidateQueries({ queryKey: ['following-count'] })
      queryClient.invalidateQueries({ queryKey: ['followers'] })
      queryClient.invalidateQueries({ queryKey: ['following'] })
    },
    onError: (error) => {
      console.error('Error following user:', error)
      toast.error('Failed To Follow User')
    }
  })
}

export function useUnfollowUser() {
  const queryClient = useQueryClient()
  const supabase = createClient()

  return useMutation({
    mutationFn: async ({ followingUserId, userName }: UnfollowUserParams) => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const { error } = await supabase
        .from('social_connections')
        .delete()
        .eq('follower_id', user.id)
        .eq('following_user_id', followingUserId)

      if (error) throw error
      return { userName }
    },
    onSuccess: (data, variables) => {
      const name = data?.userName || 'User'
      toast.success(`Unfollowed ${name}`)
      queryClient.invalidateQueries({ queryKey: ['is-following-user', variables.followingUserId] })
      queryClient.invalidateQueries({ queryKey: ['follower-count', variables.followingUserId] })
      queryClient.invalidateQueries({ queryKey: ['following-count'] })
      queryClient.invalidateQueries({ queryKey: ['followers'] })
      queryClient.invalidateQueries({ queryKey: ['following'] })
    },
    onError: (error) => {
      console.error('Error unfollowing user:', error)
      toast.error('Failed To Unfollow User')
    }
  })
}

export function useFollowStudio() {
  const queryClient = useQueryClient()
  const supabase = createClient()

  return useMutation({
    mutationFn: async ({ followingStudioId, studioName }: FollowStudioParams) => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const { data, error } = await supabase
        .from('social_connections')
        .insert({
          follower_id: user.id,
          following_studio_id: followingStudioId
        })
        .select()
        .single()

      if (error) throw error
      return { ...data, studioName }
    },
    onSuccess: (data, variables) => {
      const name = data.studioName || 'Studio'
      toast.success(`Now Following ${name}`)
      queryClient.invalidateQueries({ queryKey: ['is-following-studio', variables.followingStudioId] })
      queryClient.invalidateQueries({ queryKey: ['studio-followers', variables.followingStudioId] })
      queryClient.invalidateQueries({ queryKey: ['follower-count', undefined, variables.followingStudioId] })
      queryClient.invalidateQueries({ queryKey: ['following-count'] })
      queryClient.invalidateQueries({ queryKey: ['followers'] })
      queryClient.invalidateQueries({ queryKey: ['following'] })
    },
    onError: (error) => {
      console.error('Error following studio:', error)
      toast.error('Failed To Follow Studio')
    }
  })
}

export function useUnfollowStudio() {
  const queryClient = useQueryClient()
  const supabase = createClient()

  return useMutation({
    mutationFn: async ({ followingStudioId, studioName }: UnfollowStudioParams) => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const { error } = await supabase
        .from('social_connections')
        .delete()
        .eq('follower_id', user.id)
        .eq('following_studio_id', followingStudioId)

      if (error) throw error
      return { studioName }
    },
    onSuccess: (data, variables) => {
      const name = data?.studioName || 'Studio'
      toast.success(`Unfollowed ${name}`)
      queryClient.invalidateQueries({ queryKey: ['is-following-studio', variables.followingStudioId] })
      queryClient.invalidateQueries({ queryKey: ['studio-followers', variables.followingStudioId] })
      queryClient.invalidateQueries({ queryKey: ['follower-count', undefined, variables.followingStudioId] })
      queryClient.invalidateQueries({ queryKey: ['following-count'] })
      queryClient.invalidateQueries({ queryKey: ['followers'] })
      queryClient.invalidateQueries({ queryKey: ['following'] })
    },
    onError: (error) => {
      console.error('Error unfollowing studio:', error)
      toast.error('Failed To Unfollow Studio')
    }
  })
}