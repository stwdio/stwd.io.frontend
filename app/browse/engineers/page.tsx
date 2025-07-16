import { Suspense } from 'react'
import { createServerComponentClient } from '@/lib/supabase/server'
import { EngineersContent } from './_components/engineers-content'
import { EngineersPageSkeleton } from './_components/engineers-skeleton'

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

// Async component to fetch initial engineers data
async function EngineersDataWrapper() {
  const supabase = await createServerComponentClient()
  
  // Fetch all engineers
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
    .eq('profile_roles.role.slug', 'engineer')

  if (error) {
    console.error('Error fetching engineers:', error)
    return <EngineersContent initialProfiles={[]} />
  }

  // Transform the data to match the expected format
  const profiles: Profile[] = data?.map((profile: any) => ({
    id: profile.id,
    user_id: profile.user_id,
    first_name: profile.first_name,
    last_name: profile.last_name,
    username: profile.username,
    bio: profile.bio,
    avatar_url: profile.avatar_url,
    profile_roles: Array.isArray(profile.profile_roles) 
      ? profile.profile_roles.map((pr: any) => ({
          role: {
            id: pr.role.id,
            name: pr.role.name,
            slug: pr.role.slug
          }
        }))
      : []
  })) || []

  return <EngineersContent initialProfiles={profiles} />
}

export default function BrowseEngineersPage() {
  return (
    <Suspense fallback={<EngineersPageSkeleton />}>
      <EngineersDataWrapper />
    </Suspense>
  )
}