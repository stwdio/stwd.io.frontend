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
      // Get the studio ID from params
      const resolvedParams = await params
      const id = resolvedParams.id
      setStudioId(id)

      // Check authentication
      const {
        data: { session },
      } = await supabase.auth.getSession()

      if (!session) {
        router.push("/")
        return
      }

      // Get the user's profile
      const { data: profileData } = await supabase
        .from("profiles")
        .select("id")
        .eq("user_id", session.user.id)
        .single()

      if (!profileData) {
        router.push("/")
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
      if (studioData.owner_id !== profileData.id) {
        router.push("/dashboard")
        return
      }

      setStudio(studioData)
      setLoading(false)
    }

    initializePage()
  }, [params, router])

  const handleSaved = () => {
    // Navigate back to the studio details page after successful save
    if (studioId) {
      router.push(`/studios/${studioId}`)
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">Loading...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center text-red-500">{error}</div>
      </div>
    )
  }

  if (!studio || !profile) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">Studio not found</div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Edit Studio</h1>
          <p className="text-gray-400 mt-2">Update your studio details, amenities, and settings.</p>
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
