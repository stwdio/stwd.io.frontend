'use client'

import React from 'react'
import { GenericCard } from '@/components/cards/generic-card'
import { IconMessage, IconUser } from '@tabler/icons-react'
import { Database } from '@/types/supabase'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth/auth-context'
import { useAuthModal } from '@/lib/hooks/use-auth-modal'
import { imagePresets } from '@/lib/utils/image-transformations'

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

  const displayName = profile.first_name && profile.last_name
    ? `${profile.first_name} ${profile.last_name}`
    : profile.username

  const avatarUrl = imagePresets.cardThumbnail(profile.avatar_url) || `https://api.dicebear.com/9.x/thumbs/svg?seed=${profile.user_id}&backgroundColor=ffffff&shapeColor=000000`

  const roles = Array.isArray(profile.profile_roles) 
    ? profile.profile_roles.map(pr => pr.role.name) 
    : []

  // Mock data for "followed by" - to be replaced with real data later
  const mockFollowers = [
    { id: 1, name: 'John Doe', avatar: `https://api.dicebear.com/9.x/thumbs/svg?seed=user1&backgroundColor=ffffff&shapeColor=000000` },
    { id: 2, name: 'Jane Smith', avatar: `https://api.dicebear.com/9.x/thumbs/svg?seed=user2&backgroundColor=ffffff&shapeColor=000000` },
    { id: 3, name: 'Mike Johnson', avatar: `https://api.dicebear.com/9.x/thumbs/svg?seed=user3&backgroundColor=ffffff&shapeColor=000000` },
    { id: 4, name: 'Sarah Wilson', avatar: `https://api.dicebear.com/9.x/thumbs/svg?seed=user4&backgroundColor=ffffff&shapeColor=000000` },
  ]

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
      subtitle={`@${profile.username}`}
      description={profile.bio || undefined}
      imageUrl={avatarUrl}
      link={`/profiles/${profile.username}`}
      tags={roles}
      followedBy={mockFollowers}
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