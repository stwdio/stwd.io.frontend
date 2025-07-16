'use client'

import React, { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Wrench, ChevronRight, Volume2, Disc, Headphones } from 'lucide-react'
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
  avatar_url: string | null
  profile_roles: {
    role: {
      id: number
      name: string
      slug: string
    }
  }[]
}

interface EngineersContentProps {
  initialProfiles: Profile[]
}

// Mock specialties for engineers (in future, this could be a separate table)
const engineerSpecialties = [
  { id: 'mixing', label: 'Mixing', icon: Volume2 },
  { id: 'mastering', label: 'Mastering', icon: Disc },
  { id: 'recording', label: 'Recording', icon: Headphones },
]

export function EngineersContent({ initialProfiles }: EngineersContentProps) {
  const [profiles, setProfiles] = useState<Profile[]>(initialProfiles)
  const [loading, setLoading] = useState(false)
  const [selectedSpecialties, setSelectedSpecialties] = useState<string[]>([])
  const supabase = createClient()

  // Note: Since specialties are not yet in the database, filtering is client-side only
  // In a real implementation, this would filter server-side based on actual data
  useEffect(() => {
    // For now, just use the initial profiles
    // When specialties are added to the database, we would fetch filtered data here
    setProfiles(initialProfiles)
  }, [selectedSpecialties, initialProfiles])

  const getDisplayName = (profile: Profile) => {
    if (profile.first_name && profile.last_name) {
      return `${profile.first_name} ${profile.last_name}`
    }
    return profile.username
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
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <ProfileCardSkeleton key={i} />
          ))}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {profiles.map((profile) => {
              const avatarSrc = profile.avatar_url && profile.avatar_url.trim() !== '' 
                ? profile.avatar_url 
                : `https://api.dicebear.com/9.x/thumbs/svg?seed=${profile.user_id}&backgroundColor=ffffff&shapeColor=000000`
              
              return (
                <Card key={profile.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center overflow-hidden border border-black">
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
        </>
      )}
    </div>
  )
}