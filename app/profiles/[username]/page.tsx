import { createServerComponentClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { Metadata } from 'next'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import Link from 'next/link'
import { 
  Globe, 
  Instagram, 
  Twitter, 
  Linkedin, 
  Facebook,
  Music,
  Mic,
  Radio,
  Briefcase,
  Wrench,
  Users,
  Building,
  ExternalLink,
  Mail
} from 'lucide-react'
import type { Database } from '@/lib/types/database'

type Profile = Database['public']['Tables']['profiles']['Row']
type Role = Database['public']['Tables']['roles']['Row']

const roleIcons = {
  'musician': Music,
  'podcaster': Mic,
  'voice-actor': Radio,
  'a-and-r': Briefcase,
  'engineer': Wrench,
  'manager': Users,
  'studio-owner': Building,
} as const

const socialIcons = {
  instagram: Instagram,
  twitter: Twitter,
  linkedin: Linkedin,
  facebook: Facebook,
} as const

const portfolioIcons = {
  spotify: Music,
  soundcloud: Music,
  discogs: Music,
  youtube: Music,
  bandcamp: Music,
} as const

export async function generateMetadata({
  params,
}: {
  params: Promise<{ username: string }>
}): Promise<Metadata> {
  const { username } = await params
  const supabase = await createServerComponentClient()
  
  const { data: profile } = await supabase
    .from('profiles')
    .select('first_name, last_name, username, bio')
    .eq('username', username)
    .single()

  if (!profile) {
    return {
      title: 'Profile Not Found',
    }
  }

  const displayName = profile.first_name && profile.last_name
    ? `${profile.first_name} ${profile.last_name}`
    : profile.username

  const description = profile.bio || `View ${displayName}'s professional profile on stwd.io`

  return {
    title: `${displayName} - stwd.io`,
    description: description.substring(0, 160),
    openGraph: {
      title: `${displayName} - stwd.io`,
      description: description.substring(0, 160),
      type: 'profile',
      username: profile.username,
    },
  }
}

export default async function UserProfilePage({
  params,
}: {
  params: Promise<{ username: string }>
}) {
  const { username } = await params
  const supabase = await createServerComponentClient()

  // Fetch user profile with roles
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select(`
      *,
      profile_roles (
        role:roles (
          id,
          name,
          slug
        )
      )
    `)
    .eq('username', username)
    .single()

  if (profileError || !profile) {
    notFound()
  }

  // Type assertion for the profile with roles
  const profileWithRoles = profile as Profile & {
    profile_roles: { role: Role }[]
  }

  // Use a deterministic avatar service for server components
  const avatarSrc = profileWithRoles.avatar_url && profileWithRoles.avatar_url.trim() !== '' 
    ? profileWithRoles.avatar_url 
    : `https://api.dicebear.com/9.x/thumbs/svg?seed=${profile.user_id}&backgroundColor=ffffff&shapeColor=000000`

  const getDisplayName = () => {
    if (profileWithRoles.first_name && profileWithRoles.last_name) {
      return `${profileWithRoles.first_name} ${profileWithRoles.last_name}`
    }
    return profileWithRoles.username
  }

  const socialLinks = profileWithRoles.social_links || {}
  const portfolioLinks = profileWithRoles.portfolio_links || {}
  const skills = profileWithRoles.skills || []

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="container max-w-4xl mx-auto px-4 py-8">
      {/* Profile Header */}
      <div className="flex flex-col md:flex-row items-start gap-6 mb-8">
        <div className="h-32 w-32 rounded-full bg-muted flex items-center justify-center overflow-hidden border-2 border-black">
          <img
            src={avatarSrc}
            alt={getDisplayName()}
            className="h-full w-full object-cover"
          />
        </div>
        
        <div className="flex-1">
          <h1 className="text-3xl font-bold mb-2">{getDisplayName()}</h1>
          <p className="text-muted-foreground mb-4">@{profileWithRoles.username}</p>
          
          {/* Professional Roles */}
          {profileWithRoles.profile_roles.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {profileWithRoles.profile_roles.map(({ role }) => {
                const Icon = roleIcons[role.slug as keyof typeof roleIcons] || Briefcase
                return (
                  <Badge key={role.id} variant="secondary" className="flex items-center gap-1">
                    <Icon className="h-3 w-3" />
                    {role.name}
                  </Badge>
                )
              })}
            </div>
          )}

          {/* Website */}
          {profileWithRoles.website && (
            <div className="flex items-center gap-2 text-sm">
              <Globe className="h-4 w-4" />
              <a 
                href={profileWithRoles.website} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                {profileWithRoles.website.replace(/^https?:\/\//, '')}
              </a>
            </div>
          )}
        </div>

        {/* Contact Button */}
        <Button variant="outline" className="gap-2">
          <Mail className="h-4 w-4" />
          Contact
        </Button>
      </div>

      <Separator className="mb-8" />

      {/* Bio Section */}
      {profileWithRoles.bio && (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-xl">About</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="whitespace-pre-wrap">{profileWithRoles.bio}</p>
          </CardContent>
        </Card>
      )}

      {/* Skills Section */}
      {skills.length > 0 && (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-xl">Skills</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {skills.map((skill, index) => (
                <Badge key={index} variant="outline">
                  {skill}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Portfolio Links */}
      {Object.keys(portfolioLinks).length > 0 && (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-xl">Portfolio</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.entries(portfolioLinks).map(([platform, url]) => {
                const Icon = portfolioIcons[platform as keyof typeof portfolioIcons] || Music
                return (
                  <a
                    key={platform}
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 p-3 rounded-lg border hover:bg-accent transition-colors"
                  >
                    <Icon className="h-5 w-5" />
                    <span className="capitalize flex-1">{platform}</span>
                    <ExternalLink className="h-4 w-4 text-muted-foreground" />
                  </a>
                )
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Social Links */}
      {Object.keys(socialLinks).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">Connect</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4">
              {Object.entries(socialLinks).map(([platform, url]) => {
                const Icon = socialIcons[platform as keyof typeof socialIcons] || Globe
                return (
                  <a
                    key={platform}
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 rounded-full border hover:bg-accent transition-colors"
                    aria-label={`Visit ${platform} profile`}
                  >
                    <Icon className="h-5 w-5" />
                  </a>
                )
              })}
            </div>
          </CardContent>
        </Card>
      )}
      </div>
    </div>
  )
}