'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import Link from 'next/link'
import { UserPlus, Building } from 'lucide-react'

interface FollowingUser {
  following_user_id: string
  created_at: string
  following_user: {
    username: string
    first_name: string | null
    last_name: string | null
    avatar_url: string | null
  }
}

interface FollowingStudio {
  following_studio_id: number
  created_at: string
  following_studio: {
    id: number
    name: string
    slug: string
    photo_urls: string[] | null
  }
}

type Following = FollowingUser | FollowingStudio

interface FollowingListProps {
  userId: string
  limit?: number
}

export function FollowingList({ userId, limit = 20 }: FollowingListProps) {
  const [following, setFollowing] = useState<Following[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'users' | 'studios'>('all')
  const supabase = createClient()

  useEffect(() => {
    async function fetchFollowing() {
      setLoading(true)
      
      try {
        // Fetch both user and studio follows
        const [userFollows, studioFollows] = await Promise.all([
          supabase
            .from('social_connections')
            .select(`
              following_user_id,
              created_at
            `)
            .eq('follower_id', userId)
            .not('following_user_id', 'is', null)
            .order('created_at', { ascending: false }),
          
          supabase
            .from('social_connections')
            .select(`
              following_studio_id,
              created_at,
              following_studio:studios!inner(
                id,
                name,
                slug,
                photo_urls
              )
            `)
            .eq('follower_id', userId)
            .not('following_studio_id', 'is', null)
            .order('created_at', { ascending: false })
        ])
        
        if (userFollows.error) {
          console.error('Error fetching user follows:', userFollows.error)
        }
        if (studioFollows.error) {
          console.error('Error fetching studio follows:', studioFollows.error)
        }
        
        // Process user follows - fetch profile data separately
        let processedUserFollows: Following[] = []
        if (userFollows.data && userFollows.data.length > 0) {
          const userIds = userFollows.data.map(f => f.following_user_id)
          const { data: profiles } = await supabase
            .from('profiles')
            .select('user_id, username, first_name, last_name, avatar_url')
            .in('user_id', userIds)
          
          if (profiles) {
            const profileMap = new Map(profiles.map(p => [p.user_id, p]))
            processedUserFollows = userFollows.data
              .map(follow => ({
                following_user_id: follow.following_user_id,
                created_at: follow.created_at,
                following_user: profileMap.get(follow.following_user_id) || {
                  username: 'unknown',
                  first_name: null,
                  last_name: null,
                  avatar_url: null
                }
              }))
              .filter(f => f.following_user.username !== 'unknown')
          }
        }
        
        const allFollowing = [
          ...processedUserFollows,
          ...(studioFollows.data || [])
        ].sort((a, b) => 
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        )
        
        setFollowing(allFollowing.slice(0, limit))
      } catch (error) {
        console.error('Error:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchFollowing()
  }, [userId, limit, supabase])

  const isUserFollow = (follow: Following): follow is FollowingUser => {
    return 'following_user_id' in follow
  }

  const getDisplayName = (user: FollowingUser['following_user']) => {
    if (user.first_name && user.last_name) {
      return `${user.first_name} ${user.last_name}`
    }
    return user.username
  }

  const getInitials = (user: FollowingUser['following_user']) => {
    if (user.first_name && user.last_name) {
      return `${user.first_name[0]}${user.last_name[0]}`
    }
    return user.username.substring(0, 2).toUpperCase()
  }

  const getStudioImage = (photoUrls: string[] | null) => {
    if (photoUrls && photoUrls.length > 0) {
      return photoUrls[0]
    }
    return null
  }

  const filteredFollowing = following.filter(follow => {
    if (filter === 'all') return true
    if (filter === 'users') return isUserFollow(follow)
    if (filter === 'studios') return !isUserFollow(follow)
    return true
  })

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5" />
            Following
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex items-center gap-3">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-3 w-16" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <UserPlus className="h-5 w-5" />
            Following
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex gap-2 mb-4">
          <Button
            variant={filter === 'all' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setFilter('all')}
          >
            All
          </Button>
          <Button
            variant={filter === 'users' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setFilter('users')}
          >
            Users
          </Button>
          <Button
            variant={filter === 'studios' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setFilter('studios')}
          >
            Studios
          </Button>
        </div>
        
        {filteredFollowing.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            {filter === 'all' ? 'Not following anyone yet' : `No ${filter} followed`}
          </p>
        ) : (
          <div className="space-y-3">
            {filteredFollowing.map((follow) => {
              if (isUserFollow(follow)) {
                return (
                  <Link
                    key={follow.following_user_id}
                    href={`/profiles/${follow.following_user.username}`}
                    className="flex items-center gap-3 p-2 rounded-lg hover:bg-accent transition-colors"
                  >
                    <Avatar>
                      <AvatarImage 
                        src={follow.following_user.avatar_url || undefined} 
                        alt={getDisplayName(follow.following_user)} 
                      />
                      <AvatarFallback>
                        {getInitials(follow.following_user)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">
                        {getDisplayName(follow.following_user)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        @{follow.following_user.username}
                      </p>
                    </div>
                    <Badge variant="secondary" className="text-xs">
                      User
                    </Badge>
                  </Link>
                )
              } else {
                const studio = (follow as FollowingStudio).following_studio
                const studioImage = getStudioImage(studio.photo_urls)
                
                return (
                  <Link
                    key={studio.id}
                    href={`/discover/studios/${studio.slug}`}
                    className="flex items-center gap-3 p-2 rounded-lg hover:bg-accent transition-colors"
                  >
                    <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center overflow-hidden">
                      {studioImage ? (
                        <img
                          src={studioImage}
                          alt={studio.name}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <Building className="h-5 w-5 text-muted-foreground" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">
                        {studio.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Studio
                      </p>
                    </div>
                    <Badge variant="secondary" className="text-xs">
                      Studio
                    </Badge>
                  </Link>
                )
              }
            })}
            {following.length >= limit && (
              <Button variant="ghost" className="w-full" size="sm">
                View all
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}