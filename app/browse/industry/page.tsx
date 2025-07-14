"use client"

import React, { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Briefcase, Users, ChevronRight, MapPin } from 'lucide-react'
import Link from 'next/link'
import { ProfileCardSkeleton } from '@/components/skeletons'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'

const roleIcons = {
  'a-and-r': Briefcase,
  'manager': Users,
} as const

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

export default function BrowseIndustryPage() {
  const [profiles, setProfiles] = useState<Profile[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedRoles, setSelectedRoles] = useState<string[]>([])
  const supabase = createClient()

  useEffect(() => {
    fetchIndustryProfessionals()
  }, [selectedRoles])

  const fetchIndustryProfessionals = async () => {
    setLoading(true)
    try {
      let query = supabase
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

      // Filter by selected roles if any
      if (selectedRoles.length > 0) {
        query = query.in('profile_roles.role.slug', selectedRoles)
      }

      const { data, error } = await query

      if (error) {
        console.error('Error fetching industry professionals:', error)
        return
      }

      // Deduplicate profiles (in case someone has multiple industry roles)
      const uniqueProfiles = data?.reduce((acc: Profile[], curr) => {
        if (!acc.find(p => p.id === curr.id)) {
          acc.push(curr)
        }
        return acc
      }, []) || []

      setProfiles(uniqueProfiles)
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  const getDisplayName = (profile: Profile) => {
    if (profile.first_name && profile.last_name) {
      return `${profile.first_name} ${profile.last_name}`
    }
    return profile.username
  }

  const getIndustryRoles = (profile: Profile) => {
    return profile.profile_roles
      .filter(pr => ['a-and-r', 'manager'].includes(pr.role.slug))
      .map(pr => pr.role)
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Discover Industry Professionals</h1>
          <p className="text-muted-foreground">
            Connect with A&R representatives, managers, and other industry professionals
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <ProfileCardSkeleton key={i} />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Discover Industry Professionals</h1>
        <p className="text-muted-foreground">
          Connect with A&R representatives, managers, and other industry professionals
        </p>
      </div>

      {/* Filters */}
      <div className="mb-8 space-y-4">
        <div>
          <h3 className="text-sm font-medium mb-3">Filter by Role</h3>
          <div className="flex flex-wrap gap-3">
            {[
              { slug: 'a-and-r', label: 'A&R', icon: Briefcase },
              { slug: 'manager', label: 'Manager', icon: Users },
            ].map((role) => {
              const Icon = role.icon
              const isChecked = selectedRoles.includes(role.slug)
              
              return (
                <div key={role.slug} className="flex items-center space-x-2">
                  <Checkbox
                    id={`role-${role.slug}`}
                    checked={isChecked}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        setSelectedRoles([...selectedRoles, role.slug])
                      } else {
                        setSelectedRoles(selectedRoles.filter(r => r !== role.slug))
                      }
                    }}
                  />
                  <Label
                    htmlFor={`role-${role.slug}`}
                    className="flex items-center gap-2 cursor-pointer"
                  >
                    <Icon className="h-4 w-4" />
                    {role.label}
                  </Label>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Results */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {profiles.map((profile) => {
          const avatarSrc = profile.avatar_url && profile.avatar_url.trim() !== '' 
            ? profile.avatar_url 
            : `https://api.dicebear.com/7.x/identicon/svg?seed=${profile.user_id}`
          const industryRoles = getIndustryRoles(profile)
          
          return (
            <Card key={profile.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center overflow-hidden">
                      <img
                        src={avatarSrc}
                        alt={getDisplayName(profile)}
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <div>
                      <CardTitle className="text-lg">
                        {getDisplayName(profile)}
                      </CardTitle>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex flex-wrap gap-2">
                    {industryRoles.map((role) => {
                      const Icon = roleIcons[role.slug as keyof typeof roleIcons] || Briefcase
                      return (
                        <Badge key={role.id} variant="secondary" className="flex items-center gap-1">
                          <Icon className="h-3 w-3" />
                          {role.name}
                        </Badge>
                      )
                    })}
                  </div>
                  
                  {profile.bio && (
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {profile.bio}
                    </p>
                  )}
                  
                  <div className="flex justify-end">
                    <Button asChild size="sm" variant="ghost">
                      <Link href={`/profiles/${profile.username}`}>
                        View Profile
                        <ChevronRight className="h-4 w-4 ml-1" />
                      </Link>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {profiles.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">
            No industry professionals found matching your criteria.
          </p>
        </div>
      )}
    </div>
  )
}