"use client"

import React, { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { User, CheckCircle, AlertCircle, Music, Mic, Radio, Briefcase, Wrench, Users, Building } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { useToast } from "@/hooks/use-toast"
import { ProfileFormSkeleton } from '@/components/skeletons'
import { toast as sonnerToast } from "sonner"
import { useRoles, useUserRoles } from "@/lib/hooks/queries/roles"
import { Checkbox } from "@/components/ui/checkbox"

interface Profile {
  id: number
  user_id: string
  first_name: string | null
  middle_name: string | null
  last_name: string | null
  username: string
  system_role: "user" | "admin" | null
}

const roleIcons = {
  'musician': Music,
  'podcaster': Mic,
  'voice-actor': Radio,
  'a-and-r': Briefcase,
  'engineer': Wrench,
  'manager': Users,
  'studio-owner': Building,
} as const

export default function ProfileSettingsPage() {
  const router = useRouter()
  const { toast } = useToast()
  const supabase = createClient()
  
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  
  // Form state
  const [firstName, setFirstName] = useState("")
  const [middleName, setMiddleName] = useState("")
  const [lastName, setLastName] = useState("")
  const [username, setUsername] = useState("")
  const [usernameStatus, setUsernameStatus] = useState<"idle" | "checking" | "available" | "taken" | "invalid">("idle")
  const [initialUsername, setInitialUsername] = useState("")
  
  // Email and password state
  const [email, setEmail] = useState("")
  const [initialEmail, setInitialEmail] = useState("")
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPasswordSection, setShowPasswordSection] = useState(false)
  

  useEffect(() => {
    fetchProfile()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps
  
  // Set initial roles when userRoles are fetched
  useEffect(() => {
    if (userRoles.length > 0 && !rolesInitialized) {
      const roleIds = userRoles.map(ur => ur.role_id)
      setSelectedRoles(roleIds)
      setInitialRoles(roleIds)
      setRolesInitialized(true)
    }
  }, [userRoles, rolesInitialized])

  // Username validation with debouncing
  useEffect(() => {
    if (username === initialUsername) {
      setUsernameStatus("idle")
      return
    }
    
    if (username.length >= 3) {
      const timeoutId = setTimeout(() => {
        checkUsernameAvailability(username)
      }, 500)
      return () => clearTimeout(timeoutId)
    } else if (username.length > 0) {
      setUsernameStatus("invalid")
    } else {
      setUsernameStatus("idle")
    }
  }, [username, initialUsername])

  const fetchProfile = async () => {
    try {
        const { data: { session } } = await supabase.auth.getSession()
        
        if (!session?.user) {
          router.push("/auth/login")
          return
        }

        const { data, error } = await supabase
          .from("profiles")
          .select("*")
          .eq("user_id", session.user.id)
          .single()

    if (error || !data) {
      toast({
        title: "Error",
        description: "Could not load profile data",
        variant: "destructive",
      })
      return
    }

    setProfile(data)
    setFirstName(data.first_name || "")
    setMiddleName(data.middle_name || "")
    setLastName(data.last_name || "")
    setUsername(data.username)
    setInitialUsername(data.username)
    
    // Get email from auth session
    setEmail(session.user.email || "")
    setInitialEmail(session.user.email || "")
    } catch (error) {
      console.error("Error fetching profile:", error)
      toast({
        title: "Error",
        description: "Could not load profile data",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const checkUsernameAvailability = async (usernameToCheck: string) => {
    if (!usernameToCheck || usernameToCheck.length < 3) {
      setUsernameStatus("invalid")
      return
    }

    // Check format: lowercase letters, numbers, single underscores only
    const usernameRegex = /^[a-z0-9_]{3,}$/
    const hasDoubleUnderscore = usernameToCheck.includes('__')
    
    if (!usernameRegex.test(usernameToCheck) || hasDoubleUnderscore) {
      setUsernameStatus("invalid")
      return
    }

    setUsernameStatus("checking")

    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("username")
        .eq("username", usernameToCheck)
        .limit(1)

      if (error) {
        console.error("Username check error:", error)
        setUsernameStatus("idle")
        return
      }

      if (data && data.length > 0) {
        setUsernameStatus("taken")
      } else {
        setUsernameStatus("available")
      }
    } catch (err) {
      console.error("Username check exception:", err)
      setUsernameStatus("idle")
    }
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    try {
      if (!profile) {
        throw new Error("Profile not loaded")
      }

      // Validate username if it changed
      if (username !== initialUsername && usernameStatus !== "available") {
        toast({
          title: "Error",
          description: "Please choose a valid and available username",
          variant: "destructive",
        })
        setSaving(false)
        return
      }

      // Update profile in database
      const { error: profileError } = await supabase
        .from("profiles")
        .update({
          first_name: firstName.trim() || null,
          middle_name: middleName.trim() || null,
          last_name: lastName.trim() || null,
          username: username.trim().toLowerCase(),
        })
        .eq("id", profile.id)

      if (profileError) {
        throw profileError
      }
      
      // Update email if changed
      if (email !== initialEmail) {
        // Basic email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (!emailRegex.test(email.trim())) {
          toast({
            title: "Error",
            description: "Please enter a valid email address",
            variant: "destructive",
          })
          setSaving(false)
          return
        }
        
        const { error: emailError } = await supabase.auth.updateUser({
          email: email.trim()
        })
        
        if (emailError) {
          throw emailError
        }
        
        toast({
          title: "Verification Email Sent",
          description: "Please check your new email address to verify the change.",
        })
      }
      
      // Update password if provided
      if (newPassword) {
        if (newPassword !== confirmPassword) {
          toast({
            title: "Error",
            description: "New passwords do not match",
            variant: "destructive",
          })
          setSaving(false)
          return
        }
        
        if (newPassword.length < 6) {
          toast({
            title: "Error",
            description: "Password must be at least 6 characters",
            variant: "destructive",
          })
          setSaving(false)
          return
        }
        
        // Verify current password first
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email: initialEmail,
          password: currentPassword
        })
        
        if (signInError) {
          toast({
            title: "Error",
            description: "Current password is incorrect",
            variant: "destructive",
          })
          setSaving(false)
          return
        }
        
        // Update to new password
        const { error: passwordError } = await supabase.auth.updateUser({
          password: newPassword
        })
        
        if (passwordError) {
          throw passwordError
        }
        
        // Clear password fields
        setCurrentPassword("")
        setNewPassword("")
        setConfirmPassword("")
        setShowPasswordSection(false)
      }

      // Update auth user metadata if names are provided
      const displayName = firstName.trim() && lastName.trim() 
        ? `${firstName.trim()} ${lastName.trim()}`
        : firstName.trim() || username.trim()

      await supabase.auth.updateUser({
        data: {
          display_name: displayName,
        },
      })

      // Update professional roles if changed
      const rolesChanged = JSON.stringify(selectedRoles.sort()) !== JSON.stringify(initialRoles.sort())
      if (rolesChanged) {
        // Delete existing roles
        await supabase
          .from("profile_roles")
          .delete()
          .eq("profile_id", profile.id)
        
        // Insert new roles if any selected
        if (selectedRoles.length > 0) {
          const roleInserts = selectedRoles.map(roleId => ({
            profile_id: profile.id,
            role_id: roleId,
          }))
          
          const { error: rolesError } = await supabase
            .from("profile_roles")
            .insert(roleInserts)
          
          if (rolesError) {
            throw rolesError
          }
        }
        
        // Update initial roles state
        setInitialRoles(selectedRoles)
        await refetchUserRoles()
      }

      // Update local state
      setProfile(prev => prev ? {
        ...prev,
        first_name: firstName.trim() || null,
        middle_name: middleName.trim() || null,
        last_name: lastName.trim() || null,
        username: username.trim().toLowerCase(),
      } : null)
      
      setInitialUsername(username.trim().toLowerCase())
      setInitialEmail(email.trim())

      toast({
        title: "Success",
        description: "Profile updated successfully!",
      })
    } catch (error) {
      console.error("Error updating profile:", error)
      toast({
        title: "Error",
        description: "Could not update profile. Please try again.",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return <ProfileFormSkeleton />
  }

  return (
    <div className="p-6">
      <div className="max-w-2xl">
        <div className="flex items-center gap-4 mb-8">
          <User className="h-8 w-8" />
          <div>
            <h2 className="text-2xl font-bold">Profile Settings</h2>
            <p className="text-muted-foreground">Manage your personal information</p>
          </div>
        </div>

        <Card>
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
              <CardDescription>
                Update your profile details. Your username is what others will see on the platform.
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-6">
              <form onSubmit={handleSave} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">
                      First Name
                    </Label>
                    <Input
                      id="firstName"
                      type="text"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      placeholder="Enter your first name"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="middleName">
                      Middle Name
                    </Label>
                    <Input
                      id="middleName"
                      type="text"
                      value={middleName}
                      onChange={(e) => setMiddleName(e.target.value)}
                      placeholder="Enter your middle name"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="lastName">
                      Last Name
                    </Label>
                    <Input
                      id="lastName"
                      type="text"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      placeholder="Enter your last name"
                    />
                  </div>
                </div>

                <Separator />

                <div className="space-y-2">
                  <Label htmlFor="username">
                    Username
                  </Label>
                  <Input
                    id="username"
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value.toLowerCase())}
                    placeholder="Your unique username"
                    required
                  />
                  
                  {/* Username validation feedback */}
                  {username !== initialUsername && (
                    <div className="mt-2">
                      {usernameStatus === "checking" && (
                        <p className="text-sm text-muted-foreground flex items-center gap-2">
                          <span className="animate-spin rounded-full h-3 w-3 border-b border-muted-foreground inline-block"></span>
                          Checking availability...
                        </p>
                      )}
                      {usernameStatus === "available" && (
                        <p className="text-sm text-green-600 flex items-center gap-2">
                          <CheckCircle className="h-3 w-3" />
                          Username available!
                        </p>
                      )}
                      {usernameStatus === "taken" && (
                        <p className="text-sm text-destructive flex items-center gap-2">
                          <AlertCircle className="h-3 w-3" />
                          Username already taken
                        </p>
                      )}
                      {usernameStatus === "invalid" && (
                        <p className="text-sm text-destructive flex items-center gap-2">
                          <AlertCircle className="h-3 w-3" />
                          Username must be 3+ characters, lowercase letters, numbers, single underscores only
                        </p>
                      )}
                    </div>
                  )}
                </div>

                <Separator />

                <div className="space-y-2">
                  <Label htmlFor="email">
                    Email Address
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Your email address"
                    required
                  />
                  {email !== initialEmail && (
                    <p className="text-sm text-muted-foreground">
                      You'll need to verify your new email address after saving.
                    </p>
                  )}
                </div>

                <Separator />

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label>Password</Label>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setShowPasswordSection(!showPasswordSection)}
                    >
                      {showPasswordSection ? "Cancel" : "Change Password"}
                    </Button>
                  </div>
                  
                  {showPasswordSection && (
                    <div className="space-y-4 border rounded-lg p-4">
                      <div className="space-y-2">
                        <Label htmlFor="currentPassword">
                          Current Password
                        </Label>
                        <Input
                          id="currentPassword"
                          type="password"
                          value={currentPassword}
                          onChange={(e) => setCurrentPassword(e.target.value)}
                          placeholder="Enter your current password"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="newPassword">
                          New Password
                        </Label>
                        <Input
                          id="newPassword"
                          type="password"
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          placeholder="Enter your new password"
                        />
                        <p className="text-sm text-muted-foreground">
                          Must be at least 6 characters
                        </p>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="confirmPassword">
                          Confirm New Password
                        </Label>
                        <Input
                          id="confirmPassword"
                          type="password"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          placeholder="Confirm your new password"
                        />
                        {newPassword && confirmPassword && newPassword !== confirmPassword && (
                          <p className="text-sm text-destructive">
                            Passwords do not match
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                <Separator />
                
                {/* Professional Roles Section */}
                <div className="space-y-4">
                  <div>
                    <Label className="text-base font-medium">Professional Roles</Label>
                    <p className="text-sm text-muted-foreground mt-1">
                      Select all roles that describe your professional identity
                    </p>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {availableRoles.map((role) => {
                      const Icon = roleIcons[role.slug as keyof typeof roleIcons] || Users
                      const isSelected = selectedRoles.includes(role.id)
                      
                      return (
                        <div
                          key={role.id}
                          className={`flex items-start space-x-3 p-3 rounded-lg border transition-all ${
                            isSelected 
                              ? 'bg-primary/10 border-primary' 
                              : 'hover:bg-muted/50 border-border'
                          }`}
                        >
                          <Checkbox
                            id={`role-${role.id}`}
                            checked={isSelected}
                            onCheckedChange={() => {
                              setSelectedRoles(prev => 
                                prev.includes(role.id)
                                  ? prev.filter(id => id !== role.id)
                                  : [...prev, role.id]
                              )
                            }}
                            className="mt-0.5"
                          />
                          <div className="flex-1">
                            <Label 
                              htmlFor={`role-${role.id}`}
                              className="flex items-center gap-2 cursor-pointer"
                            >
                              <Icon className="h-4 w-4 text-muted-foreground" />
                              <span className="font-medium">{role.name}</span>
                            </Label>
                            {role.description && (
                              <p className="text-xs text-muted-foreground mt-1">
                                {role.description}
                              </p>
                            )}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>

                <Separator />

                <div className="flex justify-end gap-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => router.back()}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={
                      saving || 
                      (username !== initialUsername && usernameStatus !== "available") ||
                      (showPasswordSection && (!currentPassword || !newPassword || !confirmPassword || newPassword !== confirmPassword))
                    }
                  >
                    {saving ? "Saving..." : "Save Changes"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    )
} 