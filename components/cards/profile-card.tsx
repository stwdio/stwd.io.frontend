'use client'

import React, { useEffect, useState } from 'react'
import { GenericCard } from '@/components/cards/generic-card'
import { IconMessage, IconUser } from '@tabler/icons-react'
import { Database } from '@/types/supabase'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth/auth-context'
import { useAuthModal } from '@/lib/hooks/use-auth-modal'
import { imagePresets } from '@/lib/utils/image-transformations'
import { createClient } from '@/lib/supabase/client'

type Profile = Database['public']['Tables']['profiles']['Row'] & {
  profile_roles?: Array<{
    role: {
      id: number
      name: string
      slug: string
    }
  }>
}

interface ProfileCardProps {
  profile: Profile
  priority?: boolean
}

export function ProfileCard({ profile, priority = false }: ProfileCardProps) {
  const router = useRouter()
  const { user } = useAuth()
  const authModal = useAuthModal()
  const isAuthenticated = !!user
  const supabase = createClient()
  const [followers, setFollowers] = useState<Array<{ id: string, name: string, avatar: string | null }>>([])

  const displayName = profile.first_name && profile.last_name
    ? `${profile.first_name} ${profile.last_name}`
    : profile.username

  const avatarUrl = imagePresets.cardThumbnail(profile.avatar_url) || `https://api.dicebear.com/9.x/thumbs/svg?seed=${profile.user_id}&backgroundColor=ffffff&shapeColor=000000`

  const roles = Array.isArray(profile.profile_roles) 
    ? profile.profile_roles.map(pr => pr.role.name) 
    : []
  
  const primaryRole = roles[0] || ''

  useEffect(() => {
    async function fetchFollowers() {
      // First get the follower connections
      const { data: connections } = await supabase
        .from('social_connections')
        .select('follower_id')
        .eq('following_user_id', profile.user_id)
        .limit(4)
        .order('created_at', { ascending: false })

      if (connections && connections.length > 0) {
        // Then fetch the profile data for those followers
        const followerIds = connections.map(c => c.follower_id)
        const { data: profiles } = await supabase
          .from('profiles')
          .select('user_id, username, first_name, last_name, avatar_url')
          .in('user_id', followerIds)
        
        if (profiles) {
          setFollowers(profiles.map(follower => ({
            id: follower.user_id,
            name: follower.first_name && follower.last_name 
              ? `${follower.first_name} ${follower.last_name}` 
              : follower.username,
            avatar: follower.avatar_url
          })))
        }
      }
    }

    fetchFollowers()
  }, [profile.user_id, supabase])

  const handleMessage = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    if (!isAuthenticated) {
      authModal.open(
        'Sign in to message users',
        'Create an account or sign in to start messaging other users.'
      )
      return
    }
    
    // Navigate to messages with user context
    router.push(`/chat?user=${profile.username}`)
  }

  const handleProfile = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    router.push(`/profiles/${profile.username}`)
  }

  return (
    <GenericCard
      id={profile.user_id}
      title={displayName}
      subtitle={primaryRole ? `${primaryRole} • @${profile.username}` : `@${profile.username}`}
      description={profile.bio || undefined}
      imageUrl={avatarUrl}
      link={`/profiles/${profile.username}`}
      tags={roles}
      followedBy={followers}
      priority={priority}
      primaryAction={{
        label: 'Message',
        icon: <IconMessage className="h-5 w-5 mr-2" />,
        onClick: handleMessage
      }}
      secondaryAction={{
        label: '',
        icon: <IconUser className="h-5 w-5" />,
        onClick: handleProfile
      }}
    />
  )
}