"use client"

import React, { useState, useEffect } from "react"
import { notFound } from "next/navigation"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { User, MapPin, Calendar, Star, Music } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { generateIdenticon } from "@/lib/identicon"

interface ProfileData {
  id: number
  first_name: string
  middle_name: string | null
  last_name: string
  username: string
  role: "creator" | "owner" | "admin" | null
  avatar_url: string | null
  created_at: string
}

interface Studio {
  id: number
  name: string
  description: string | null
  hourly_rate: number
  published: boolean
  verified: boolean
  created_at: string
}

interface PublicProfilePageProps {
  params: {
    username: string
  }
}

export default function PublicProfilePage({ params }: PublicProfilePageProps) {
  const [profile, setProfile] = useState<ProfileData | null>(null)
  const [studios, setStudios] = useState<Studio[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchProfile()
  }, [params.username])

  const fetchProfile = async () => {
    try {
      // Fetch user profile by username
      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .eq("username", params.username)
        .single()

      if (profileError || !profileData) {
        notFound()
        return
      }

      setProfile(profileData)

      // If user is a studio owner, fetch their studios
      if (profileData.role === "owner") {
        const { data: studiosData, error: studiosError } = await supabase
          .from("studios")
          .select("*")
          .eq("owner_id", profileData.id)
          .eq("published", true)

        if (!studiosError && studiosData) {
          setStudios(studiosData)
        }
      }
    } catch (error) {
      console.error("Error fetching profile:", error)
      notFound()
    } finally {
      setLoading(false)
    }
  }

  const getDisplayName = () => {
    if (profile?.first_name && profile?.last_name) {
      return `${profile.first_name} ${profile.last_name}`
    }
    return profile?.username || ""
  }

  const getRoleDisplayName = (role: string | null) => {
    switch (role) {
      case "creator":
        return "Creator"
      case "owner":
        return "Studio Owner"
      case "admin":
        return "Admin"
      default:
        return "Member"
    }
  }

  const getRoleBadgeVariant = (role: string | null) => {
    switch (role) {
      case "creator":
        return "default"
      case "owner":
        return "secondary"
      case "admin":
        return "destructive"
      default:
        return "outline"
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-4"></div>
              <p className="text-gray-400">Loading profile...</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!profile) {
    notFound()
    return null
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Profile Header */}
        <div className="flex flex-col md:flex-row items-start md:items-center gap-6 mb-8">
          <Avatar className="h-24 w-24 md:h-32 md:w-32">
            <AvatarImage 
              src={profile.avatar_url || generateIdenticon(profile.username)} 
              alt={getDisplayName()} 
            />
            <AvatarFallback className="text-2xl">
              <User className="h-12 w-12" />
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1">
            <div className="flex flex-col md:flex-row md:items-center gap-4 mb-4">
              <h1 className="text-3xl md:text-4xl font-bold">{getDisplayName()}</h1>
              <Badge variant={getRoleBadgeVariant(profile.role)}>
                {getRoleDisplayName(profile.role)}
              </Badge>
            </div>
            
            <div className="flex items-center gap-4 text-gray-400">
              <span>@{profile.username}</span>
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                <span>Member since {formatDate(profile.created_at)}</span>
              </div>
            </div>
          </div>
        </div>

        <Separator className="bg-gray-800 mb-8" />

        {/* Content based on user role */}
        {profile.role === "owner" && (
          <section>
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
              <Music className="h-6 w-6" />
              Studios ({studios.length})
            </h2>
            
            {studios.length > 0 ? (
              <div className="grid gap-6 md:grid-cols-2">
                {studios.map((studio) => (
                  <Card key={studio.id} className="bg-gray-900 border-gray-800">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-xl text-white">{studio.name}</CardTitle>
                          <CardDescription className="text-gray-400">
                            ${studio.hourly_rate}/hour
                          </CardDescription>
                        </div>
                        {studio.verified && (
                          <Badge variant="secondary" className="bg-green-900 text-green-100">
                            Verified
                          </Badge>
                        )}
                      </div>
                    </CardHeader>
                    
                    {studio.description && (
                      <CardContent>
                        <p className="text-gray-300 line-clamp-3">{studio.description}</p>
                      </CardContent>
                    )}
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="bg-gray-900 border-gray-800">
                <CardContent className="text-center py-12">
                  <Music className="h-12 w-12 text-gray-600 mx-auto mb-4" />
                  <p className="text-gray-400">No studios published yet</p>
                </CardContent>
              </Card>
            )}
          </section>
        )}

        {profile.role === "creator" && (
          <section>
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
              <User className="h-6 w-6" />
              Creator Profile
            </h2>
            
            <Card className="bg-gray-900 border-gray-800">
              <CardContent className="text-center py-12">
                <User className="h-12 w-12 text-gray-600 mx-auto mb-4" />
                <p className="text-gray-400">Creative professional on stwd.io</p>
                <p className="text-sm text-gray-500 mt-2">
                  Booking studios and creating amazing content
                </p>
              </CardContent>
            </Card>
          </section>
        )}

        {(!profile.role || profile.role === "admin") && (
          <section>
            <Card className="bg-gray-900 border-gray-800">
              <CardContent className="text-center py-12">
                <User className="h-12 w-12 text-gray-600 mx-auto mb-4" />
                <p className="text-gray-400">Member of the stwd.io community</p>
              </CardContent>
            </Card>
          </section>
        )}
      </div>
    </div>
  )
} 