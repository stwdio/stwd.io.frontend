"use client"

import React, { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/lib/auth/auth-context'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { toast } from 'sonner'
import { ProfileFormSkeleton } from '@/components/skeletons'
import { 
  Globe, 
  Instagram, 
  Twitter, 
  Linkedin, 
  Facebook,
  Music,
  Plus,
  X,
  Save
} from 'lucide-react'

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

export default function ProfessionalSettingsPage() {
  const { user, profile } = useAuth()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState({
    bio: '',
    website: '',
    skills: [] as string[],
    social_links: {} as Record<string, string>,
    portfolio_links: {} as Record<string, string>,
  })
  const [newSkill, setNewSkill] = useState('')
  const supabase = createClient()

  useEffect(() => {
    fetchProfileData()
  }, [user])

  const fetchProfileData = async () => {
    if (!user) return

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('bio, website, skills, social_links, portfolio_links')
        .eq('user_id', user.id)
        .single()

      if (error) throw error

      if (data) {
        setFormData({
          bio: data.bio || '',
          website: data.website || '',
          skills: data.skills || [],
          social_links: data.social_links || {},
          portfolio_links: data.portfolio_links || {},
        })
      }
    } catch (error) {
      console.error('Error fetching profile:', error)
      toast.error('Failed to load profile data')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          bio: formData.bio,
          website: formData.website,
          skills: formData.skills,
          social_links: formData.social_links,
          portfolio_links: formData.portfolio_links,
        })
        .eq('user_id', user?.id)

      if (error) throw error

      toast.success('Professional profile updated successfully')
    } catch (error) {
      console.error('Error updating profile:', error)
      toast.error('Failed to update profile')
    } finally {
      setSaving(false)
    }
  }

  const addSkill = () => {
    if (newSkill.trim() && !formData.skills.includes(newSkill.trim())) {
      setFormData(prev => ({
        ...prev,
        skills: [...prev.skills, newSkill.trim()]
      }))
      setNewSkill('')
    }
  }

  const removeSkill = (skill: string) => {
    setFormData(prev => ({
      ...prev,
      skills: prev.skills.filter(s => s !== skill)
    }))
  }

  const updateSocialLink = (platform: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      social_links: {
        ...prev.social_links,
        [platform]: value
      }
    }))
  }

  const updatePortfolioLink = (platform: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      portfolio_links: {
        ...prev.portfolio_links,
        [platform]: value
      }
    }))
  }

  if (loading || !profile) {
    return <ProfileFormSkeleton />
  }

  return (
    <div className="container max-w-2xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Professional Profile</h1>
        <p className="text-muted-foreground">
          Customize your public profile to showcase your work and connect with others in the industry.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Bio Section */}
        <Card>
          <CardHeader>
            <CardTitle>About You</CardTitle>
            <CardDescription>
              Tell others about yourself and your work
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="bio">Bio</Label>
              <Textarea
                id="bio"
                value={formData.bio}
                onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
                placeholder="Share your story, experience, and what you're passionate about..."
                rows={5}
                className="resize-none"
              />
              <p className="text-sm text-muted-foreground">
                {formData.bio.length}/500 characters
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="website">Personal Website</Label>
              <div className="flex items-center gap-2">
                <Globe className="h-4 w-4 text-muted-foreground" />
                <Input
                  id="website"
                  type="url"
                  value={formData.website}
                  onChange={(e) => setFormData(prev => ({ ...prev, website: e.target.value }))}
                  placeholder="https://yourwebsite.com"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Skills Section */}
        <Card>
          <CardHeader>
            <CardTitle>Skills & Expertise</CardTitle>
            <CardDescription>
              Add skills that showcase your professional abilities
            </CardDescription>
          </CardHeader>
          <CardContent>
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
                {formData.skills.map((skill, index) => (
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
          </CardContent>
        </Card>

        {/* Portfolio Links */}
        <Card>
          <CardHeader>
            <CardTitle>Portfolio Links</CardTitle>
            <CardDescription>
              Share your work on music and creative platforms
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {portfolioPlatforms.map((platform) => (
              <div key={platform.key} className="space-y-2">
                <Label htmlFor={`portfolio-${platform.key}`}>
                  {platform.label}
                </Label>
                <Input
                  id={`portfolio-${platform.key}`}
                  type="url"
                  value={formData.portfolio_links[platform.key] || ''}
                  onChange={(e) => updatePortfolioLink(platform.key, e.target.value)}
                  placeholder={platform.placeholder}
                />
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Social Links */}
        <Card>
          <CardHeader>
            <CardTitle>Social Media</CardTitle>
            <CardDescription>
              Connect your social media profiles
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
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
                    value={formData.social_links[platform.key] || ''}
                    onChange={(e) => updateSocialLink(platform.key, e.target.value)}
                    placeholder={platform.placeholder}
                  />
                </div>
              )
            })}
          </CardContent>
        </Card>

        <div className="flex justify-end gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => window.location.href = `/profiles/${profile.username}`}
          >
            View Profile
          </Button>
          <Button type="submit" disabled={saving} className="gap-2">
            <Save className="h-4 w-4" />
            {saving ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </form>
    </div>
  )
}