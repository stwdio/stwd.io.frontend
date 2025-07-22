'use client'

import { useEffect, useState } from 'react'
import { ProfileCard } from '@/components/profile-card'
import { Skeleton } from '@/components/ui/skeleton'
import { createClient } from '@/lib/supabase/client'
import { Database } from '@/types/supabase'

type Profile = Database['public']['Tables']['profiles']['Row'] & {
  profile_roles?: Array<{
    role: {
      id: number
      name: string
      slug: string
    }
  }>
}

type PeopleSubView = 'all' | 'artists' | 'engineers' | 'industry'

interface ProfilesGridProps {
  subView: PeopleSubView
  searchQuery?: string
}

export function ProfilesGrid({ subView, searchQuery }: ProfilesGridProps) {
  const [profiles, setProfiles] = useState<Profile[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    const fetchProfiles = async () => {
      setLoading(true)
      
      let query = supabase
        .from('profiles')
        .select(`
          *,
          profile_roles(
            role:roles(id, name, slug)
          )
        `)
        .not('system_role', 'is', null) // Only show users who have completed onboarding

      // For now, we'll fetch all profiles and filter on the client side
      // TODO: Implement proper server-side filtering when role relationships are fixed

      // Apply search if provided
      if (searchQuery) {
        query = query.or(
          `username.ilike.%${searchQuery}%,first_name.ilike.%${searchQuery}%,last_name.ilike.%${searchQuery}%`
        )
      }

      const { data, error } = await query
        .order('created_at', { ascending: false })
        .limit(20)

      if (error) {
        console.error('Error fetching profiles:', error)
      } else {
        // Client-side filtering by role
        let filteredData = data || []
        
        if (subView !== 'all' && filteredData.length > 0) {
          const roleFilters: Record<string, string[]> = {
            'artists': ['musician', 'podcaster', 'voice-actor'],
            'engineers': ['engineer', 'producer'],
            'industry': ['record-label', 'other']
          }
          
          const allowedRoles = roleFilters[subView] || []
          filteredData = filteredData.filter(profile => 
            profile.profile_roles?.some((pr: any) => 
              allowedRoles.includes(pr.role?.slug || '')
            )
          )
        }
        
        setProfiles(filteredData)
      }
      
      setLoading(false)
    }

    fetchProfiles()
  }, [subView, searchQuery, supabase])

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {[...Array(8)].map((_, i) => (
          <Skeleton key={i} className="h-64 rounded-lg" />
        ))}
      </div>
    )
  }

  if (profiles.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">
          No {subView === 'all' ? 'people' : subView} found
          {searchQuery && ` matching "${searchQuery}"`}
        </p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {profiles.map((profile) => (
        <ProfileCard key={profile.id} profile={profile} />
      ))}
    </div>
  )
}