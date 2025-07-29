import { Suspense } from 'react'
import { createServerComponentClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { Metadata } from 'next'
import { ProfileWithLayout } from './_components/profile-with-layout'
import { PublicProfileSkeleton } from './_components/profile-skeleton'
import type { Database } from '@/lib/types/database'

type Profile = Database['public']['Tables']['profiles']['Row']
type Role = Database['public']['Tables']['roles']['Row']

export async function generateMetadata({
  params,
}: {
  params: Promise<{ username: string }>
}): Promise<Metadata> {
  const { username } = await params
  const supabase = await createServerComponentClient()
  
  const { data: profile } = await supabase
    .from('profiles')
    .select('first_name, last_name, username, bio')
    .eq('username', username)
    .single()

  if (!profile) {
    return {
      title: 'Profile Not Found',
    }
  }

  const displayName = profile.first_name && profile.last_name
    ? `${profile.first_name} ${profile.last_name}`
    : profile.username

  const description = profile.bio || `View ${displayName}'s professional profile on stwd.io`

  return {
    title: `${displayName} - stwd.io`,
    description: description.substring(0, 160),
    openGraph: {
      title: `${displayName} - stwd.io`,
      description: description.substring(0, 160),
      type: 'profile',
      username: profile.username,
    },
  }
}

// Async component to fetch profile data
async function ProfileDataWrapper({ username }: { username: string }) {
  const supabase = await createServerComponentClient()

  // Fetch user profile with roles
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select(`
      *,
      profile_roles (
        role:roles (
          id,
          name,
          slug
        )
      )
    `)
    .eq('username', username)
    .single()

  if (profileError || !profile) {
    notFound()
  }

  // Type assertion for the profile with roles
  const profileWithRoles = profile as Profile & {
    profile_roles?: { role: Role }[]
  }

  return <ProfileWithLayout profile={profileWithRoles} />
}

export default async function UserProfilePage({
  params,
}: {
  params: Promise<{ username: string }>
}) {
  const { username } = await params

  return (
    <Suspense fallback={<PublicProfileSkeleton />}>
      <ProfileDataWrapper username={username} />
    </Suspense>
  )
}