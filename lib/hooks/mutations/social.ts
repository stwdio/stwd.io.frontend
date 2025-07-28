'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'

interface FollowUserParams {
  followingUserId: string
}

interface UnfollowUserParams {
  followingUserId: string
}

interface FollowStudioParams {
  followingStudioId: number
}

interface UnfollowStudioParams {
  followingStudioId: number
}

export function useFollowUser() {
  const queryClient = useQueryClient()
  const supabase = createClient()

  return useMutation({
    mutationFn: async ({ followingUserId }: FollowUserParams) => {
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
      return data
    },
    onSuccess: (_, variables) => {
      toast.success('User followed successfully')
      queryClient.invalidateQueries({ queryKey: ['is-following-user', variables.followingUserId] })
      queryClient.invalidateQueries({ queryKey: ['follower-count', variables.followingUserId] })
      queryClient.invalidateQueries({ queryKey: ['following-count'] })
      queryClient.invalidateQueries({ queryKey: ['followers'] })
      queryClient.invalidateQueries({ queryKey: ['following'] })
    },
    onError: (error) => {
      console.error('Error following user:', error)
      toast.error('Failed to follow user')
    }
  })
}

export function useUnfollowUser() {
  const queryClient = useQueryClient()
  const supabase = createClient()

  return useMutation({
    mutationFn: async ({ followingUserId }: UnfollowUserParams) => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const { error } = await supabase
        .from('social_connections')
        .delete()
        .eq('follower_id', user.id)
        .eq('following_user_id', followingUserId)

      if (error) throw error
    },
    onSuccess: (_, variables) => {
      toast.success('User unfollowed successfully')
      queryClient.invalidateQueries({ queryKey: ['is-following-user', variables.followingUserId] })
      queryClient.invalidateQueries({ queryKey: ['follower-count', variables.followingUserId] })
      queryClient.invalidateQueries({ queryKey: ['following-count'] })
      queryClient.invalidateQueries({ queryKey: ['followers'] })
      queryClient.invalidateQueries({ queryKey: ['following'] })
    },
    onError: (error) => {
      console.error('Error unfollowing user:', error)
      toast.error('Failed to unfollow user')
    }
  })
}

export function useFollowStudio() {
  const queryClient = useQueryClient()
  const supabase = createClient()

  return useMutation({
    mutationFn: async ({ followingStudioId }: FollowStudioParams) => {
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
      return data
    },
    onSuccess: (_, variables) => {
      toast.success('Studio followed successfully')
      queryClient.invalidateQueries({ queryKey: ['is-following-studio', variables.followingStudioId] })
      queryClient.invalidateQueries({ queryKey: ['studio-followers', variables.followingStudioId] })
      queryClient.invalidateQueries({ queryKey: ['follower-count', undefined, variables.followingStudioId] })
      queryClient.invalidateQueries({ queryKey: ['following-count'] })
      queryClient.invalidateQueries({ queryKey: ['followers'] })
      queryClient.invalidateQueries({ queryKey: ['following'] })
    },
    onError: (error) => {
      console.error('Error following studio:', error)
      toast.error('Failed to follow studio')
    }
  })
}

export function useUnfollowStudio() {
  const queryClient = useQueryClient()
  const supabase = createClient()

  return useMutation({
    mutationFn: async ({ followingStudioId }: UnfollowStudioParams) => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const { error } = await supabase
        .from('social_connections')
        .delete()
        .eq('follower_id', user.id)
        .eq('following_studio_id', followingStudioId)

      if (error) throw error
    },
    onSuccess: (_, variables) => {
      toast.success('Studio unfollowed successfully')
      queryClient.invalidateQueries({ queryKey: ['is-following-studio', variables.followingStudioId] })
      queryClient.invalidateQueries({ queryKey: ['studio-followers', variables.followingStudioId] })
      queryClient.invalidateQueries({ queryKey: ['follower-count', undefined, variables.followingStudioId] })
      queryClient.invalidateQueries({ queryKey: ['following-count'] })
      queryClient.invalidateQueries({ queryKey: ['followers'] })
      queryClient.invalidateQueries({ queryKey: ['following'] })
    },
    onError: (error) => {
      console.error('Error unfollowing studio:', error)
      toast.error('Failed to unfollow studio')
    }
  })
}