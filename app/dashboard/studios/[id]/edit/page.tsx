"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { StudioFormStandalone } from "@/components/studio-form-standalone"
import { StudioFormSkeleton } from '@/components/skeletons'

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
  photo_urls?: string[]
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
  const supabase = createClient()

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
          router.push("/profile/dashboard")
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
    // Navigate back to Owner Dashboard after successful save
    router.push("/profile/dashboard")
  }

  if (loading) {
    return <StudioFormSkeleton />
  }

  if (error) {
    return (
      <div className="text-center text-destructive p-6">{error}</div>
    )
  }

  if (!studio || !profile) {
    return (
      <div className="text-center p-6">Studio not found</div>
    )
  }

  return (
    <div className="w-full p-6">
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
  )
} 