'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { useToast } from '@/hooks/use-toast'
import { createClient } from '@/lib/supabase/client'
import { CheckCircle, AlertCircle } from 'lucide-react'
import { AvatarUpload } from '@/components/settings/avatar-upload'
import type { Database } from '@/lib/types/database'

type Profile = Database['public']['Tables']['profiles']['Row']

interface ProfileSettingsFormProps {
  profile: Profile
}

export function ProfileSettingsForm({ profile }: ProfileSettingsFormProps) {
  const router = useRouter()
  const { toast } = useToast()
  const supabase = createClient()
  
  const [saving, setSaving] = useState(false)
  const [firstName, setFirstName] = useState(profile.first_name || '')
  const [middleName, setMiddleName] = useState(profile.middle_name || '')
  const [lastName, setLastName] = useState(profile.last_name || '')
  const [username, setUsername] = useState(profile.username || '')
  const [bio, setBio] = useState(profile.bio || '')
  const [website, setWebsite] = useState(profile.website || '')
  const [avatarUrl, setAvatarUrl] = useState(profile.avatar_url)
  
  const [initialUsername] = useState(profile.username)
  const [usernameStatus, setUsernameStatus] = useState<'idle' | 'checking' | 'available' | 'taken' | 'invalid'>('idle')

  // Username validation with debouncing
  useEffect(() => {
    if (username === initialUsername) {
      setUsernameStatus('idle')
      return
    }
    
    if (username.length >= 3) {
      const timeoutId = setTimeout(() => {
        checkUsernameAvailability(username)
      }, 500)
      return () => clearTimeout(timeoutId)
    } else if (username.length > 0) {
      setUsernameStatus('invalid')
    } else {
      setUsernameStatus('idle')
    }
  }, [username, initialUsername])

  const checkUsernameAvailability = async (usernameToCheck: string) => {
    if (!usernameToCheck || usernameToCheck.length < 3) {
      setUsernameStatus('invalid')
      return
    }

    const usernameRegex = /^[a-z0-9_]{3,}$/
    const hasDoubleUnderscore = usernameToCheck.includes('__')
    
    if (!usernameRegex.test(usernameToCheck) || hasDoubleUnderscore) {
      setUsernameStatus('invalid')
      return
    }

    setUsernameStatus('checking')

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('username')
        .eq('username', usernameToCheck)
        .limit(1)

      if (error) {
        console.error('Username check error:', error)
        setUsernameStatus('idle')
        return
      }

      if (data && data.length > 0) {
        setUsernameStatus('taken')
      } else {
        setUsernameStatus('available')
      }
    } catch (err) {
      console.error('Username check exception:', err)
      setUsernameStatus('idle')
    }
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    try {
      if (username !== initialUsername && usernameStatus !== 'available') {
        toast({
          title: 'Error',
          description: 'Please choose a valid and available username',
          variant: 'destructive',
        })
        setSaving(false)
        return
      }

      // Validate website URL if provided
      if (website && !website.match(/^https?:\/\/.+/)) {
        toast({
          title: 'Error',
          description: 'Website must start with http:// or https://',
          variant: 'destructive',
        })
        setSaving(false)
        return
      }

      const { error } = await supabase
        .from('profiles')
        .update({
          first_name: firstName.trim() || null,
          middle_name: middleName.trim() || null,
          last_name: lastName.trim() || null,
          username: username.trim().toLowerCase(),
          bio: bio.trim() || null,
          website: website.trim() || null,
          avatar_url: avatarUrl,
        })
        .eq('id', profile.id)

      if (error) {
        throw error
      }

      toast({
        title: 'Success',
        description: 'Profile updated successfully!',
      })
      
      router.refresh()
    } catch (error) {
      console.error('Error updating profile:', error)
      toast({
        title: 'Error',
        description: 'Could not update profile. Please try again.',
        variant: 'destructive',
      })
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSave} className="space-y-6">
      {/* Avatar Upload */}
      <AvatarUpload
        currentAvatarUrl={avatarUrl}
        userId={profile.user_id}
        onAvatarUpdate={setAvatarUrl}
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label htmlFor="firstName">First Name</Label>
          <Input
            id="firstName"
            type="text"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            placeholder="Enter your first name"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="middleName">Middle Name</Label>
          <Input
            id="middleName"
            type="text"
            value={middleName}
            onChange={(e) => setMiddleName(e.target.value)}
            placeholder="Enter your middle name"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="lastName">Last Name</Label>
          <Input
            id="lastName"
            type="text"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            placeholder="Enter your last name"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="username">Username</Label>
        <Input
          id="username"
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value.toLowerCase())}
          placeholder="Your unique username"
          required
        />
        
        {username !== initialUsername && (
          <div className="mt-2">
            {usernameStatus === 'checking' && (
              <p className="text-sm text-muted-foreground flex items-center gap-2">
                <span className="animate-spin rounded-full h-3 w-3 border-b border-muted-foreground inline-block"></span>
                Checking availability...
              </p>
            )}
            {usernameStatus === 'available' && (
              <p className="text-sm text-green-600 flex items-center gap-2">
                <CheckCircle className="h-3 w-3" />
                Username available!
              </p>
            )}
            {usernameStatus === 'taken' && (
              <p className="text-sm text-destructive flex items-center gap-2">
                <AlertCircle className="h-3 w-3" />
                Username already taken
              </p>
            )}
            {usernameStatus === 'invalid' && (
              <p className="text-sm text-destructive flex items-center gap-2">
                <AlertCircle className="h-3 w-3" />
                Must be 3+ characters, lowercase letters, numbers, single underscores only
              </p>
            )}
          </div>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="bio">Bio</Label>
        <Textarea
          id="bio"
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          placeholder="Tell us about yourself"
          rows={4}
        />
        <p className="text-sm text-muted-foreground">
          Brief description for your profile. Max 500 characters.
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="website">Website</Label>
        <Input
          id="website"
          type="url"
          value={website}
          onChange={(e) => setWebsite(e.target.value)}
          placeholder="https://yourwebsite.com"
        />
      </div>

      <div className="flex justify-end gap-4 pt-4">
        <Button
          type="submit"
          disabled={
            saving || 
            (username !== initialUsername && usernameStatus !== 'available')
          }
        >
          {saving ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>
    </form>
  )
}