'use client'

import React from 'react'
import Link from 'next/link'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { IconMessage, IconUser } from '@tabler/icons-react'
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

interface ProfileCardProps {
  profile: Profile
}

export function ProfileCard({ profile }: ProfileCardProps) {
  const displayName = profile.first_name && profile.last_name
    ? `${profile.first_name} ${profile.last_name}`
    : profile.username

  const avatarUrl = profile.avatar_url || 
    `https://api.dicebear.com/9.x/thumbs/svg?seed=${profile.user_id}&backgroundColor=ffffff&shapeColor=000000`

  const primaryRole = profile.profile_roles?.[0]?.role

  // Mock data for "followed by" - to be replaced with real data later
  const mockFollowers = [
    { id: 1, name: 'John Doe', avatar: 'user1' },
    { id: 2, name: 'Jane Smith', avatar: 'user2' },
    { id: 3, name: 'Mike Johnson', avatar: 'user3' },
  ]

  return (
    <Card className="group hover:shadow-lg transition-all duration-200 overflow-hidden">
      <Link href={`/profiles/${profile.username}`} className="block">
        <CardHeader className="p-0">
          {/* Profile Image/Avatar */}
          <div className="relative aspect-square bg-muted">
            <Avatar className="w-full h-full rounded-none">
              <AvatarImage 
                src={avatarUrl} 
                alt={displayName}
                className="object-cover"
              />
              <AvatarFallback className="rounded-none text-2xl">
                {displayName.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
          </div>
        </CardHeader>
      </Link>
      
      <CardContent className="p-4 space-y-3">
        {/* Name and Role */}
        <div>
          <h3 className="font-semibold text-lg line-clamp-1">{displayName}</h3>
          {primaryRole && (
            <Badge variant="secondary" className="mt-1">
              {primaryRole.name}
            </Badge>
          )}
        </div>

        {/* Bio */}
        {profile.bio && (
          <p className="text-sm text-muted-foreground line-clamp-2">
            {profile.bio}
          </p>
        )}

        {/* Followed by section (mock data) */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">Followed by</span>
          <div className="flex -space-x-2">
            {mockFollowers.slice(0, 3).map((follower) => (
              <Avatar key={follower.id} className="h-6 w-6 border-2 border-background">
                <AvatarImage 
                  src={`https://api.dicebear.com/9.x/thumbs/svg?seed=${follower.avatar}&backgroundColor=ffffff&shapeColor=000000`} 
                  alt={follower.name} 
                />
                <AvatarFallback className="text-xs">
                  {follower.name.charAt(0)}
                </AvatarFallback>
              </Avatar>
            ))}
            {mockFollowers.length > 3 && (
              <div className="h-6 w-6 rounded-full bg-muted border-2 border-background flex items-center justify-center">
                <span className="text-xs text-muted-foreground">+{mockFollowers.length - 3}</span>
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 pt-2">
          <Button 
            variant="outline" 
            size="sm" 
            className="flex-1"
            onClick={(e) => {
              e.preventDefault()
              // TODO: Implement message functionality
              console.log('Message user:', profile.username)
            }}
          >
            <IconMessage className="h-4 w-4 mr-1" />
            Message
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            asChild
          >
            <Link href={`/profiles/${profile.username}`}>
              <IconUser className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}