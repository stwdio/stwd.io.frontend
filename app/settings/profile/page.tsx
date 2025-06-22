"use client"

import React, { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { User, CheckCircle, AlertCircle } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { useToast } from "@/hooks/use-toast"

interface Profile {
  id: number
  user_id: string
  first_name: string | null
  middle_name: string | null
  last_name: string | null
  username: string
  role: "creator" | "owner" | "admin" | null
}

export default function ProfileSettingsPage() {
  const router = useRouter()
  const { toast } = useToast()
  
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  
  // Form state
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [username, setUsername] = useState("")
  const [usernameStatus, setUsernameStatus] = useState<"idle" | "checking" | "available" | "taken" | "invalid">("idle")
  const [initialUsername, setInitialUsername] = useState("")

  useEffect(() => {
    fetchProfile()
  }, [])

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
      setLastName(data.last_name || "")
      setUsername(data.username)
      setInitialUsername(data.username)
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
          last_name: lastName.trim() || null,
          username: username.trim().toLowerCase(),
        })
        .eq("id", profile.id)

      if (profileError) {
        throw profileError
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

      // Update local state
      setProfile(prev => prev ? {
        ...prev,
        first_name: firstName.trim() || null,
        last_name: lastName.trim() || null,
        username: username.trim().toLowerCase(),
      } : null)
      
      setInitialUsername(username.trim().toLowerCase())

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
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-gray-400">Loading profile...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-2xl">
      <div className="flex items-center gap-4 mb-8">
        <User className="h-8 w-8" />
        <div>
          <h2 className="text-2xl font-bold">Profile Settings</h2>
          <p className="text-gray-400">Manage your personal information</p>
        </div>
      </div>

      <Card className="bg-gray-900 border-gray-800">
          <CardHeader>
            <CardTitle className="text-white">Personal Information</CardTitle>
            <CardDescription className="text-gray-400">
              Update your profile details. Your username is what others will see on the platform.
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-6">
            <form onSubmit={handleSave} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName" className="text-gray-300">
                    First Name
                  </Label>
                  <Input
                    id="firstName"
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="Enter your first name"
                    className="bg-gray-800 border-gray-700 text-white placeholder-gray-500"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="lastName" className="text-gray-300">
                    Last Name
                  </Label>
                  <Input
                    id="lastName"
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="Enter your last name"
                    className="bg-gray-800 border-gray-700 text-white placeholder-gray-500"
                  />
                </div>
              </div>

              <Separator className="bg-gray-800" />

              <div className="space-y-2">
                <Label htmlFor="username" className="text-gray-300">
                  Username
                </Label>
                <Input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value.toLowerCase())}
                  placeholder="Your unique username"
                  className="bg-gray-800 border-gray-700 text-white placeholder-gray-500"
                  required
                />
                
                {/* Username validation feedback */}
                {username !== initialUsername && (
                  <div className="mt-2">
                    {usernameStatus === "checking" && (
                      <p className="text-sm text-gray-400 flex items-center gap-2">
                        <div className="animate-spin rounded-full h-3 w-3 border-b border-gray-400"></div>
                        Checking availability...
                      </p>
                    )}
                    {usernameStatus === "available" && (
                      <p className="text-sm text-green-400 flex items-center gap-2">
                        <CheckCircle className="h-3 w-3" />
                        Username available!
                      </p>
                    )}
                    {usernameStatus === "taken" && (
                      <p className="text-sm text-red-400 flex items-center gap-2">
                        <AlertCircle className="h-3 w-3" />
                        Username already taken
                      </p>
                    )}
                    {usernameStatus === "invalid" && (
                      <p className="text-sm text-red-400 flex items-center gap-2">
                        <AlertCircle className="h-3 w-3" />
                        Username must be 3+ characters, lowercase letters, numbers, single underscores only
                      </p>
                    )}
                  </div>
                )}
              </div>

              <Separator className="bg-gray-800" />

              <div className="flex justify-end gap-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.back()}
                  className="border-gray-700 text-gray-300 hover:bg-gray-800"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={saving || (username !== initialUsername && usernameStatus !== "available")}
                  className="bg-white text-black hover:bg-gray-100"
                >
                  {saving ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
  )
} 