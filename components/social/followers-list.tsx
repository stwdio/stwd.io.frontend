'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import Link from 'next/link'
import { Users } from 'lucide-react'

interface Follower {
  follower_id: string
  created_at: string
  follower: {
    username: string
    first_name: string | null
    last_name: string | null
    avatar_url: string | null
  }
}

interface FollowersListProps {
  userId?: string
  studioId?: number
  limit?: number
}

export function FollowersList({ userId, studioId, limit = 20 }: FollowersListProps) {
  const [followers, setFollowers] = useState<Follower[]>([])
  const [loading, setLoading] = useState(true)
  const [totalCount, setTotalCount] = useState(0)
  const supabase = createClient()

  useEffect(() => {
    async function fetchFollowers() {
      setLoading(true)
      
      try {
        let query = supabase
          .from('social_connections')
          .select(`
            follower_id,
            created_at
          `, { count: 'exact' })
        
        if (userId) {
          query = query.eq('following_user_id', userId)
        } else if (studioId) {
          query = query.eq('following_studio_id', studioId)
        }
        
        query = query.order('created_at', { ascending: false }).limit(limit)
        
        const { data: connections, error, count } = await query
        
        if (error) {
          console.error('Error fetching followers:', error)
        } else if (connections && connections.length > 0) {
          // Fetch profile data for all followers
          const followerIds = connections.map(c => c.follower_id)
          const { data: profiles } = await supabase
            .from('profiles')
            .select('user_id, username, first_name, last_name, avatar_url')
            .in('user_id', followerIds)
          
          if (profiles) {
            const profileMap = new Map(profiles.map(p => [p.user_id, p]))
            const followersWithProfiles = connections
              .map(conn => ({
                follower_id: conn.follower_id,
                created_at: conn.created_at,
                follower: profileMap.get(conn.follower_id) || {
                  username: 'unknown',
                  first_name: null,
                  last_name: null,
                  avatar_url: null
                }
              }))
              .filter(f => f.follower.username !== 'unknown')
            
            setFollowers(followersWithProfiles)
          }
          setTotalCount(count || 0)
        } else {
          setFollowers([])
          setTotalCount(0)
        }
      } catch (error) {
        console.error('Error:', error)
      } finally {
        setLoading(false)
      }
    }

    if (userId || studioId) {
      fetchFollowers()
    }
  }, [userId, studioId, limit, supabase])

  const getDisplayName = (follower: Follower['follower']) => {
    if (follower.first_name && follower.last_name) {
      return `${follower.first_name} ${follower.last_name}`
    }
    return follower.username
  }

  const getInitials = (follower: Follower['follower']) => {
    if (follower.first_name && follower.last_name) {
      return `${follower.first_name[0]}${follower.last_name[0]}`
    }
    return follower.username.substring(0, 2).toUpperCase()
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Followers
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
            <Users className="h-5 w-5" />
            Followers
          </div>
          <span className="text-sm font-normal text-muted-foreground">
            {totalCount} {totalCount === 1 ? 'follower' : 'followers'}
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {followers.length === 0 ? (
          <p className="text-sm text-muted-foreground">No followers yet</p>
        ) : (
          <div className="space-y-3">
            {followers.map((follower) => (
              <Link
                key={follower.follower_id}
                href={`/profiles/${follower.follower.username}`}
                className="flex items-center gap-3 p-2 rounded-lg hover:bg-accent transition-colors"
              >
                <Avatar>
                  <AvatarImage 
                    src={follower.follower.avatar_url || undefined} 
                    alt={getDisplayName(follower.follower)} 
                  />
                  <AvatarFallback>
                    {getInitials(follower.follower)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">
                    {getDisplayName(follower.follower)}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    @{follower.follower.username}
                  </p>
                </div>
              </Link>
            ))}
            {totalCount > limit && (
              <Button variant="ghost" className="w-full" size="sm">
                View all {totalCount} followers
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}