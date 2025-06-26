"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"
import { StudioFormStandalone } from "@/components/studio-form-standalone"

interface Studio {
  id: number
  name: string
  description: string | null
  hourly_rate: number
  published: boolean
  gear: any
  owner_id: number
  created_at: string
  location: string
}

interface EditStudioPageProps {
  params: Promise<{ id: string }>
}

export default function EditStudioPage({ params }: EditStudioPageProps) {
  const [studioId, setStudioId] = useState<string | null>(null)
  const [studio, setStudio] = useState<Studio | null>(null)
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    const initializePage = async () => {
      try {
        // Get the studio ID from params
        const resolvedParams = await params
        const id = resolvedParams.id
        setStudioId(id)

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

        setProfile(profileData)

        // Fetch studio details
        const { data: studioData, error: studioError } = await supabase
          .from("studios")
          .select("*")
          .eq("id", id)
          .single()

        if (studioError || !studioData) {
          setError("Studio not found")
          setLoading(false)
          return
        }

        // Verify ownership
        if (studioData.owner_id !== profileData.id && profileData.role !== 'admin') {
          router.push("/dashboard/studios")
          return
        }

        setStudio(studioData)
        setLoading(false)
      } catch (error) {
        console.error('Error initializing page:', error)
        setError("Failed to load studio")
        setLoading(false)
      }
    }

    initializePage()
  }, [params, router])

  const handleSaved = () => {
    // Navigate back to My Studios after successful save
    router.push("/dashboard/studios")
  }

  if (loading) {
    return (
      <div className="container mx-auto py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading studio...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto py-8">
        <div className="text-center text-destructive">{error}</div>
      </div>
    )
  }

  if (!studio || !profile) {
    return (
      <div className="container mx-auto py-8">
        <div className="text-center">Studio not found</div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Edit Studio</h1>
          <p className="text-muted-foreground mt-2">Update your studio details, amenities, and settings.</p>
        </div>

        <StudioFormStandalone 
          studio={studio} 
          onSaved={handleSaved} 
          ownerId={profile.id}
          showActions={true}
        />
      </div>
    </div>
  )
} 