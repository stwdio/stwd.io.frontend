"use client"

import React, { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/lib/auth/auth-context'
import { Wrench, ChevronRight, MapPin, Headphones, Volume2, Disc } from 'lucide-react'
import { generateIdenticon } from '@/lib/identicon'
import Link from 'next/link'
import { ProfileCardSkeleton } from '@/components/skeletons'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'

interface Profile {
  id: number
  user_id: string
  first_name: string | null
  last_name: string | null
  username: string
  bio: string | null
  profile_roles: {
    role: {
      id: number
      name: string
      slug: string
    }
  }[]
}

export default function BrowseEngineersPage() {
  const [profiles, setProfiles] = useState<Profile[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedSpecialties, setSelectedSpecialties] = useState<string[]>([])
  const supabase = createClient()
  const { profile } = useAuth()

  useEffect(() => {
    fetchEngineers()
  }, [selectedSpecialties])

  const fetchEngineers = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select(`
          id,
          user_id,
          first_name,
          last_name,
          username,
          bio,
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
        return
      }

      setProfiles(data || [])
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

  // Mock specialties for engineers (in future, this could be a separate table)
  const engineerSpecialties = [
    { id: 'mixing', label: 'Mixing', icon: Volume2 },
    { id: 'mastering', label: 'Mastering', icon: Disc },
    { id: 'recording', label: 'Recording', icon: Headphones },
  ]

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Discover Engineers</h1>
          <p className="text-muted-foreground">
            Find audio engineers, mixing and mastering professionals
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
        <h1 className="text-3xl font-bold mb-2">Discover Engineers</h1>
        <p className="text-muted-foreground">
          Find audio engineers, mixing and mastering professionals
        </p>
      </div>

      {/* Filters */}
      <div className="mb-8 space-y-4">
        <div>
          <h3 className="text-sm font-medium mb-3">Filter by Specialty</h3>
          <div className="flex flex-wrap gap-3">
            {engineerSpecialties.map((specialty) => {
              const Icon = specialty.icon
              const isChecked = selectedSpecialties.includes(specialty.id)
              
              return (
                <div key={specialty.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={`specialty-${specialty.id}`}
                    checked={isChecked}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        setSelectedSpecialties([...selectedSpecialties, specialty.id])
                      } else {
                        setSelectedSpecialties(selectedSpecialties.filter(s => s !== specialty.id))
                      }
                    }}
                  />
                  <Label
                    htmlFor={`specialty-${specialty.id}`}
                    className="flex items-center gap-2 cursor-pointer"
                  >
                    <Icon className="h-4 w-4" />
                    {specialty.label}
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
          const avatarSrc = generateIdenticon(profile.user_id)
          
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
                  <Badge variant="secondary" className="flex items-center gap-1 w-fit">
                    <Wrench className="h-3 w-3" />
                    Audio Engineer
                  </Badge>
                  
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
            No engineers found. Check back soon as our network grows!
          </p>
        </div>
      )}
    </div>
  )
}