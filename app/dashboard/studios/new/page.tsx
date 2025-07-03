"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { StudioFormStandalone } from "@/components/studio-form-standalone"

export default function NewStudioPage() {
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const initializePage = async () => {
      try {
        // Check authentication
        const { data: { session } } = await supabase.auth.getSession()

        if (!session) {
          router.push("/auth/login")
          return
        }

        // Get the user's profile
        const { data: profileData } = await supabase
          .from("profiles")
          .select("*")
          .eq("user_id", session.user.id)
          .single()

        if (!profileData) {
          router.push("/auth/login")
          return
        }

        if (profileData.role !== 'owner' && profileData.role !== 'admin') {
          router.push("/browse")
          return
        }

        setProfile(profileData)
        setLoading(false)
      } catch (error) {
        console.error('Error initializing page:', error)
        setError("Failed to load page")
        setLoading(false)
      }
    }

    initializePage()
  }, [router])

  const handleSaved = () => {
    // Navigate back to Owner Dashboard after successful save
    router.push("/profile/dashboard")
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center text-destructive p-6">{error}</div>
    )
  }

  if (!profile) {
    return (
      <div className="text-center p-6">Access denied</div>
    )
  }

  return (
    <div className="w-full p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Add New Studio</h1>
        <p className="text-muted-foreground mt-2">Create a new recording studio listing.</p>
      </div>

      <StudioFormStandalone 
        studio={null} 
        onSaved={handleSaved} 
        ownerId={profile.id}
        showActions={true}
      />
    </div>
  )
} 