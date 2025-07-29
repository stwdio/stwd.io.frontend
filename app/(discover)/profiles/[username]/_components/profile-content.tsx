'use client'

import { useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { Input } from '@/components/ui/input'
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
  ChevronDown,
  ChevronUp,
  Search,
  MessageSquare,
  UserCheck,
  UserPlus
} from 'lucide-react'
import type { Database } from '@/lib/types/database'
import { FollowersList } from '@/components/social/followers-list'
import { FollowingList } from '@/components/social/following-list'
import { BackButton } from '@/components/back-button'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth/auth-context'
import { useAuthModal } from '@/lib/hooks/use-auth-modal'
import { useFollowUser, useUnfollowUser } from '@/lib/hooks/mutations/social'
import { useIsFollowingUser } from '@/lib/hooks/queries/social'

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

interface ProfileContentProps {
  profile: Profile & {
    profile_roles?: { role: Role }[] | { role: Role } | unknown
  }
}

export function ProfileContent({ profile }: ProfileContentProps) {
  const router = useRouter()
  const { user } = useAuth()
  const authModal = useAuthModal()
  const isAuthenticated = !!user
  const [skillsOpen, setSkillsOpen] = useState(true)
  const [portfolioOpen, setPortfolioOpen] = useState(true)
  const [socialOpen, setSocialOpen] = useState(true)
  const [skillSearchQuery, setSkillSearchQuery] = useState('')
  
  // Follow functionality
  const { data: isFollowing } = useIsFollowingUser(profile.user_id)
  const { mutate: followUser, isPending: isFollowingPending } = useFollowUser()
  const { mutate: unfollowUser, isPending: isUnfollowingPending } = useUnfollowUser()
  const isCurrentUser = user?.id === profile.user_id

  const avatarSrc = profile.avatar_url && profile.avatar_url.trim() !== '' 
    ? profile.avatar_url 
    : `https://api.dicebear.com/9.x/thumbs/svg?seed=${profile.user_id}&backgroundColor=ffffff&shapeColor=000000`

  const getDisplayName = () => {
    if (profile.first_name && profile.last_name) {
      return `${profile.first_name} ${profile.last_name}`
    }
    return profile.username
  }

  // Handle different profile_roles structures
  const getRoles = () => {
    if (!profile.profile_roles) return []
    
    if (Array.isArray(profile.profile_roles)) {
      return profile.profile_roles
    }
    
    if (typeof profile.profile_roles === 'object' && 'role' in profile.profile_roles) {
      return [profile.profile_roles as { role: Role }]
    }
    
    return []
  }

  const roles = getRoles()

  const socialLinks = profile.social_links || {}
  const portfolioLinks = profile.portfolio_links || {}
  const skills = profile.skills || []

  const handleMessage = () => {
    if (!isAuthenticated) {
      authModal.open(
        'Sign in to message users',
        'Create an account or sign in to start messaging other users.'
      )
      return
    }
    router.push(`/chat?user=${profile.username}`)
  }
  
  const handleFollow = () => {
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

  const filteredSkills = skills.filter(skill => 
    skill.toLowerCase().includes(skillSearchQuery.toLowerCase())
  )

  return (
    <div className="h-full flex flex-col bg-background overflow-hidden">
      {/* Fixed Header */}
      <div className="flex-shrink-0 border-b bg-background">
        <div className="flex items-center gap-4 px-6 py-4">
          <BackButton href="/discover/people" label="Back to People" />
        </div>
      </div>

      {/* Main Content Area - Two Column Grid */}
      <div className="flex-1 grid grid-cols-[40%_60%] overflow-hidden">
        {/* Left Column - Full Height Avatar Display */}
        <div className="relative bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 overflow-hidden h-full flex items-center justify-center">
          <div className="relative w-full max-w-md aspect-square p-8">
            <div className="w-full h-full rounded-full bg-white dark:bg-gray-950 shadow-2xl flex items-center justify-center overflow-hidden">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={avatarSrc}
                alt={getDisplayName()}
                className="h-full w-full object-cover"
              />
            </div>
          </div>
        </div>

        {/* Right Column - Scrollable Content */}
        <div className="h-full overflow-y-auto">
          <div className="p-8 space-y-8">
            {/* Profile Header */}
            <div className="space-y-4">
            <div className="flex items-start justify-between">
              <h1 className="text-4xl font-bold tracking-tight">{getDisplayName()}</h1>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <span className="text-lg">@{profile.username}</span>
              {roles.length > 0 && (
                <>
                  <span className="text-lg">•</span>
                  <span className="text-lg">
                    {roles[0].role.name}
                  </span>
                </>
              )}
            </div>
            
            {/* Professional Roles */}
            {roles.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {roles.map(({ role }) => {
                  const Icon = roleIcons[role.slug as keyof typeof roleIcons] || Briefcase
                  return (
                    <Badge key={role.id} variant="secondary" className="flex items-center gap-1.5 px-3 py-1">
                      <Icon className="h-4 w-4" />
                      {role.name}
                    </Badge>
                  )
                })}
              </div>
            )}

            {/* Website */}
            {profile.website && (
              <div className="flex items-center gap-2">
                <Globe className="h-4 w-4 text-muted-foreground" />
                <a 
                  href={profile.website} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  {profile.website.replace(/^https?:\/\//, '')}
                </a>
              </div>
            )}
          </div>

          {/* Bio */}
          {profile.bio && (
            <div>
              <p className="text-base leading-relaxed text-foreground/90">
                {profile.bio}
              </p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 w-full">
            <Button onClick={handleMessage} className="flex-1" size="lg">
              <MessageSquare className="h-5 w-5 mr-2" />
              Message
            </Button>
            {!isCurrentUser && (
              <Button 
                variant={isFollowing ? "secondary" : "outline"} 
                size="lg"
                onClick={handleFollow}
                disabled={isFollowingPending || isUnfollowingPending}
              >
                {isFollowing ? (
                  <>
                    <UserCheck className="h-5 w-5 mr-2" />
                    Following
                  </>
                ) : (
                  <>
                    <UserPlus className="h-5 w-5 mr-2" />
                    Follow
                  </>
                )}
              </Button>
            )}
          </div>

          {/* Skills Section - Collapsible with Search */}
          {skills.length > 0 && (
            <Collapsible open={skillsOpen} onOpenChange={setSkillsOpen}>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <CollapsibleTrigger asChild>
                    <Button variant="ghost" className="p-0 h-auto hover:bg-transparent">
                      <h3 className="text-lg font-semibold flex items-center gap-2">
                        Skills & Expertise
                        {skillsOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                      </h3>
                    </Button>
                  </CollapsibleTrigger>
                  {skillsOpen && skills.length > 5 && (
                    <div className="relative w-64">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        type="text"
                        placeholder="Search skills..."
                        value={skillSearchQuery}
                        onChange={(e) => setSkillSearchQuery(e.target.value)}
                        className="pl-9 h-9"
                      />
                    </div>
                  )}
                </div>
                <CollapsibleContent>
                  <div className="flex flex-wrap gap-2">
                    {filteredSkills.map((skill, index) => (
                      <Badge key={index} variant="secondary" className="font-normal">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </CollapsibleContent>
              </div>
            </Collapsible>
          )}

          {/* Portfolio Links - Collapsible */}
          {Object.keys(portfolioLinks).length > 0 && (
            <Collapsible open={portfolioOpen} onOpenChange={setPortfolioOpen}>
              <div className="space-y-4">
                <CollapsibleTrigger asChild>
                  <Button variant="ghost" className="p-0 h-auto hover:bg-transparent">
                    <h3 className="text-lg font-semibold flex items-center gap-2">
                      Portfolio & Work
                      {portfolioOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    </h3>
                  </Button>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
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
                </CollapsibleContent>
              </div>
            </Collapsible>
          )}

          {/* Social Links - Collapsible */}
          {Object.keys(socialLinks).length > 0 && (
            <Collapsible open={socialOpen} onOpenChange={setSocialOpen}>
              <div className="space-y-4">
                <CollapsibleTrigger asChild>
                  <Button variant="ghost" className="p-0 h-auto hover:bg-transparent">
                    <h3 className="text-lg font-semibold flex items-center gap-2">
                      Social Media
                      {socialOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    </h3>
                  </Button>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <div className="flex gap-3">
                    {Object.entries(socialLinks).map(([platform, url]) => {
                      const Icon = socialIcons[platform as keyof typeof socialIcons] || Globe
                      return (
                        <a
                          key={platform}
                          href={url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2.5 rounded-full border hover:bg-accent transition-colors"
                          aria-label={`Visit ${platform} profile`}
                        >
                          <Icon className="h-5 w-5" />
                        </a>
                      )
                    })}
                  </div>
                </CollapsibleContent>
              </div>
            </Collapsible>
          )}

          {/* Followers */}
          <div>
            <FollowersList userId={profile.user_id || ''} limit={10} />
          </div>

          {/* Following */}
          <div className="pb-8">
            <FollowingList userId={profile.user_id || ''} limit={10} />
          </div>
          </div>
        </div>
      </div>
    </div>
  )
}