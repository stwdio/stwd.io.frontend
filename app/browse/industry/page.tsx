import { Suspense } from 'react'
import { createServerComponentClient } from '@/lib/supabase/server'
import { IndustryContent } from './_components/industry-content'
import { IndustryPageSkeleton } from './_components/industry-skeleton'

// Define the Profile interface to match the client component
interface Profile {
  id: number
  user_id: string
  first_name: string | null
  last_name: string | null
  username: string
  bio: string | null
  avatar_url: string | null
  profile_roles: {
    role: {
      id: number
      name: string
      slug: string
    }
  }[]
}

// Async component to fetch initial industry professionals data
async function IndustryDataWrapper() {
  const supabase = await createServerComponentClient()
  
  // Fetch all industry professionals (A&R, managers)
  const { data, error } = await supabase
    .from('profiles')
    .select(`
      id,
      user_id,
      first_name,
      last_name,
      username,
      bio,
      avatar_url,
      profile_roles!inner(
        role:roles!inner(
          id,
          name,
          slug
        )
      )
    `)
    .in('profile_roles.role.slug', ['a-and-r', 'manager'])

  if (error) {
    console.error('Error fetching industry professionals:', error)
    return <IndustryContent initialProfiles={[]} />
  }

  // Transform and deduplicate profiles
  const uniqueProfiles = data?.reduce((acc: Profile[], curr: any) => {
    if (!acc.find(p => p.id === curr.id)) {
      const profile: Profile = {
        id: curr.id,
        user_id: curr.user_id,
        first_name: curr.first_name,
        last_name: curr.last_name,
        username: curr.username,
        bio: curr.bio,
        avatar_url: curr.avatar_url,
        profile_roles: Array.isArray(curr.profile_roles) 
          ? curr.profile_roles.map((pr: any) => ({
              role: {
                id: pr.role.id,
                name: pr.role.name,
                slug: pr.role.slug
              }
            }))
          : []
      }
      acc.push(profile)
    }
    return acc
  }, []) || []

  return <IndustryContent initialProfiles={uniqueProfiles} />
}

export default function BrowseIndustryPage() {
  return (
    <Suspense fallback={<IndustryPageSkeleton />}>
      <IndustryDataWrapper />
    </Suspense>
  )
}