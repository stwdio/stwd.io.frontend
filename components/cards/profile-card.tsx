'use client'

import React, { useEffect, useState } from 'react'
import { GenericCard } from '@/components/cards/generic-card'
import { IconMessage, IconUserPlus, IconUserCheck, IconPlugConnected } from '@tabler/icons-react'
import { Database } from '@/types/supabase'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth/auth-context'
import { useAuthModal } from '@/lib/hooks/use-auth-modal'
import { imagePresets } from '@/lib/utils/image-transformations'
import { createClient } from '@/lib/supabase/client'
import { useIsFollowingUser } from '@/lib/hooks/queries/social'
import { useFollowUser, useUnfollowUser } from '@/lib/hooks/mutations/social'
import { useConnectionStatus } from '@/lib/hooks/queries/connections'
import { useSendConnectionRequest } from '@/lib/hooks/mutations/connections'

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
  linkToProfile?: boolean
  hideFollowButton?: boolean
  className?: string
  customActions?: React.ReactNode
}

export function ProfileCard({ profile, priority = false, linkToProfile = true, hideFollowButton = false, className, customActions }: ProfileCardProps) {
  const router = useRouter()
  const { user } = useAuth()
  const authModal = useAuthModal()
  const isAuthenticated = !!user
  const supabase = createClient()
  const [followers, setFollowers] = useState<Array<{ id: string, name: string, avatar: string | null }>>([])
  
  // Follow functionality (only query if we're showing the button)
  const { data: isFollowing } = useIsFollowingUser(hideFollowButton ? null : profile.user_id)
  const { mutate: followUser, isPending: isFollowingPending } = useFollowUser()
  const { mutate: unfollowUser, isPending: isUnfollowingPending } = useUnfollowUser()
  const isCurrentUser = user?.id === profile.user_id
  
  // Connection functionality
  const { data: connectionStatus } = useConnectionStatus(profile.user_id)
  const { mutate: sendConnectionRequest, isPending: isRequestPending } = useSendConnectionRequest()

  const displayName = profile.first_name && profile.last_name
    ? `${profile.first_name} ${profile.last_name}`
    : profile.username

  const avatarUrl = imagePresets.cardThumbnail(profile.avatar_url) || `https://api.dicebear.com/9.x/thumbs/svg?seed=${profile.user_id}&backgroundColor=ffffff&shapeColor=000000`

  const roles = Array.isArray(profile.profile_roles) 
    ? profile.profile_roles.map(pr => pr.role.name)
    : profile.profile_roles && typeof profile.profile_roles === 'object' && 'role' in profile.profile_roles
    ? [(profile.profile_roles as { role: { name: string } }).role.name]
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

  const handleFollow = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    if (!isAuthenticated) {
      authModal.open(
        'Sign in to follow users',
        'Create an account or sign in to follow other users.'
      )
      return
    }
    
    if (!profile.user_id) return
    
    if (isFollowing) {
      unfollowUser({ followingUserId: profile.user_id })
    } else {
      followUser({ followingUserId: profile.user_id })
    }
  }

  const handleConnect = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    if (!isAuthenticated) {
      authModal.open(
        'Sign in to connect',
        'Create an account or sign in to connect with other users.'
      )
      return
    }
    
    sendConnectionRequest(profile.user_id)
  }

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
    router.push(`/connect/chat?user=${profile.username}`)
  }

  return (
    <GenericCard
      id={profile.user_id}
      title={displayName}
      subtitle={primaryRole ? `${primaryRole} • @${profile.username}` : `@${profile.username}`}
      description={profile.bio || undefined}
      imageUrl={avatarUrl}
      link={linkToProfile ? `/profiles/${profile.username}` : undefined}
      tags={roles}
      followedBy={followers}
      priority={priority}
      className={className}
      customActions={customActions}
      primaryAction={customActions || isCurrentUser ? undefined : 
        connectionStatus?.status === 'accepted' ? {
          label: 'Message',
          icon: <IconMessage className="h-4 w-4 mr-1" />,
          onClick: handleMessage,
        } : connectionStatus?.status === 'pending' ? {
          label: 'Requested',
          icon: <IconPlugConnected className="h-4 w-4 mr-1" />,
          onClick: () => {},
          disabled: true,
        } : {
          label: 'Connect',
          icon: <IconPlugConnected className="h-4 w-4 mr-1" />,
          onClick: handleConnect,
          disabled: isRequestPending,
        }
      }
      secondaryAction={customActions || isCurrentUser || hideFollowButton ? undefined : {
        label: isFollowing ? 'Following' : 'Follow',
        icon: isFollowing ? <IconUserCheck className="h-4 w-4 mr-1" /> : <IconUserPlus className="h-4 w-4 mr-1" />,
        onClick: handleFollow,
        variant: isFollowing ? 'secondary' : 'default',
        className: isFollowing ? '' : 'bg-black hover:bg-gray-800 text-white hover:text-white border-black',
        disabled: isFollowingPending || isUnfollowingPending
      }}
    />
  )
}