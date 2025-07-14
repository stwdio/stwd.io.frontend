'use client'

import { useQuery } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'

interface Role {
  id: number
  name: string
  slug: string
  description: string | null
}

interface ProfileRole {
  role_id: number
  role: Role
}

/**
 * Hook to fetch all available roles
 */
export function useRoles() {
  const supabase = createClient()
  
  return useQuery({
    queryKey: ['roles'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('roles')
        .select('*')
        .order('name')
      
      if (error) throw error
      return data as Role[]
    },
    staleTime: 1000 * 60 * 60, // 1 hour - roles don't change often
  })
}

/**
 * Hook to fetch a user's professional roles
 */
export function useUserRoles(profileId: number | null) {
  const supabase = createClient()
  
  return useQuery({
    queryKey: ['user-roles', profileId],
    queryFn: async () => {
      if (!profileId) return []
      
      const { data, error } = await supabase
        .from('profile_roles')
        .select(`
          role_id,
          role:roles(*)
        `)
        .eq('profile_id', profileId)
      
      if (error) throw error
      return (data as unknown as ProfileRole[]) || []
    },
    enabled: !!profileId,
    staleTime: 1000 * 60 * 5, // 5 minutes
  })
}

/**
 * Check if a profile has any professional roles
 */
export async function hasAnyProfessionalRole(profileId: number): Promise<boolean> {
  const supabase = createClient()
  
  const { count, error } = await supabase
    .from('profile_roles')
    .select('*', { count: 'exact', head: true })
    .eq('profile_id', profileId)
  
  if (error) {
    console.error('Error checking professional roles:', error)
    return false
  }
  
  return (count || 0) > 0
}