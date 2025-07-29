'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useToast } from '@/hooks/use-toast'
import { createClient } from '@/lib/supabase/client'
import { 
  Instagram, 
  Twitter, 
  Linkedin, 
  Facebook,
  Plus,
  X,
  Save
} from 'lucide-react'
import type { Database } from '@/lib/types/database'

type Profile = Database['public']['Tables']['profiles']['Row']

const socialPlatforms = [
  { key: 'instagram', label: 'Instagram', icon: Instagram, placeholder: 'https://instagram.com/username' },
  { key: 'twitter', label: 'Twitter/X', icon: Twitter, placeholder: 'https://twitter.com/username' },
  { key: 'linkedin', label: 'LinkedIn', icon: Linkedin, placeholder: 'https://linkedin.com/in/username' },
  { key: 'facebook', label: 'Facebook', icon: Facebook, placeholder: 'https://facebook.com/username' },
]

const portfolioPlatforms = [
  { key: 'spotify', label: 'Spotify', placeholder: 'https://open.spotify.com/artist/...' },
  { key: 'soundcloud', label: 'SoundCloud', placeholder: 'https://soundcloud.com/username' },
  { key: 'discogs', label: 'Discogs', placeholder: 'https://www.discogs.com/artist/...' },
  { key: 'youtube', label: 'YouTube', placeholder: 'https://youtube.com/@channel' },
  { key: 'bandcamp', label: 'Bandcamp', placeholder: 'https://artist.bandcamp.com' },
]

interface ProfessionalSettingsFormProps {
  profile: Profile
}

export function ProfessionalSettingsForm({ profile }: ProfessionalSettingsFormProps) {
  const router = useRouter()
  const { toast } = useToast()
  const supabase = createClient()
  
  const [saving, setSaving] = useState(false)
  const [skills, setSkills] = useState<string[]>(profile.skills || [])
  const [socialLinks, setSocialLinks] = useState<Record<string, string>>(profile.social_links || {})
  const [portfolioLinks, setPortfolioLinks] = useState<Record<string, string>>(profile.portfolio_links || {})
  const [newSkill, setNewSkill] = useState('')

  const addSkill = () => {
    if (newSkill.trim() && !skills.includes(newSkill.trim())) {
      setSkills([...skills, newSkill.trim()])
      setNewSkill('')
    }
  }

  const removeSkill = (skill: string) => {
    setSkills(skills.filter(s => s !== skill))
  }

  const updateSocialLink = (platform: string, value: string) => {
    setSocialLinks({
      ...socialLinks,
      [platform]: value
    })
  }

  const updatePortfolioLink = (platform: string, value: string) => {
    setPortfolioLinks({
      ...portfolioLinks,
      [platform]: value
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          skills,
          social_links: socialLinks,
          portfolio_links: portfolioLinks,
        })
        .eq('user_id', profile.user_id)

      if (error) throw error

      toast({
        title: 'Success',
        description: 'Professional profile updated successfully',
      })
      
      router.refresh()
    } catch (error) {
      console.error('Error updating profile:', error)
      toast({
        title: 'Error',
        description: 'Failed to update profile',
        variant: 'destructive',
      })
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="divide-y">
      {/* Skills Section */}
      <div className="p-6 space-y-4">
        <div>
          <h3 className="text-base font-medium">Skills & Expertise</h3>
          <p className="text-sm text-muted-foreground">
            Add skills that showcase your professional abilities
          </p>
        </div>
        
        <div className="space-y-4">
          <div className="flex gap-2">
            <Input
              value={newSkill}
              onChange={(e) => setNewSkill(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())}
              placeholder="Add a skill..."
              className="flex-1"
            />
            <Button 
              type="button" 
              onClick={addSkill}
              size="icon"
              variant="secondary"
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>

          <div className="flex flex-wrap gap-2">
            {skills.map((skill, index) => (
              <Badge key={index} variant="secondary" className="gap-1">
                {skill}
                <button
                  type="button"
                  onClick={() => removeSkill(skill)}
                  className="ml-1 hover:text-destructive"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
          </div>
        </div>
      </div>

      {/* Portfolio Links */}
      <div className="p-6 space-y-4">
        <div>
          <h3 className="text-base font-medium">Portfolio Links</h3>
          <p className="text-sm text-muted-foreground">
            Share your work on music and creative platforms
          </p>
        </div>
        
        <div className="space-y-4">
          {portfolioPlatforms.map((platform) => (
            <div key={platform.key} className="space-y-2">
              <Label htmlFor={`portfolio-${platform.key}`}>
                {platform.label}
              </Label>
              <Input
                id={`portfolio-${platform.key}`}
                type="url"
                value={portfolioLinks[platform.key] || ''}
                onChange={(e) => updatePortfolioLink(platform.key, e.target.value)}
                placeholder={platform.placeholder}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Social Links */}
      <div className="p-6 space-y-4">
        <div>
          <h3 className="text-base font-medium">Social Media</h3>
          <p className="text-sm text-muted-foreground">
            Connect your social media profiles
          </p>
        </div>
        
        <div className="space-y-4">
          {socialPlatforms.map((platform) => {
            const Icon = platform.icon
            return (
              <div key={platform.key} className="space-y-2">
                <Label htmlFor={`social-${platform.key}`} className="flex items-center gap-2">
                  <Icon className="h-4 w-4" />
                  {platform.label}
                </Label>
                <Input
                  id={`social-${platform.key}`}
                  type="url"
                  value={socialLinks[platform.key] || ''}
                  onChange={(e) => updateSocialLink(platform.key, e.target.value)}
                  placeholder={platform.placeholder}
                />
              </div>
            )
          })}
        </div>
      </div>

      {/* Actions */}
      <div className="p-6 flex justify-between">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push(`/profiles/${profile.username}`)}
        >
          View Profile
        </Button>
        <Button type="submit" disabled={saving} className="gap-2">
          <Save className="h-4 w-4" />
          {saving ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>
    </form>
  )
}