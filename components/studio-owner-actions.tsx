"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Edit } from "lucide-react"
import { BookingWidget } from "@/components/booking-widget"
import { supabase } from "@/lib/supabase"

interface Studio {
  id: number
  name: string
  description: string
  location: string
  hourly_rate: number
  gear: any
  owner_id: number
  created_at: string
}

interface StudioOwnerActionsProps {
  studio: Studio
}

export function StudioOwnerActions({ studio }: StudioOwnerActionsProps) {
  const [isOwner, setIsOwner] = useState(false)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    checkOwnership()
  }, [studio.id])

  const checkOwnership = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        setIsOwner(false)
        setLoading(false)
        return
      }

      // Get the user's profile to check if they own this studio
      const { data: profile } = await supabase.from("profiles").select("id").eq("id", user.id).single()

      if (profile && studio.owner_id === profile.id) {
        setIsOwner(true)
      } else {
        setIsOwner(false)
      }
    } catch (error) {
      console.error("Error checking ownership:", error)
      setIsOwner(false)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">Loading...</div>
        </CardContent>
      </Card>
    )
  }

  if (isOwner) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Studio Management</CardTitle>
        </CardHeader>
        <CardContent>
          <Button onClick={() => router.push(`/dashboard/studios/${studio.id}/edit`)} className="w-full">
            <Edit className="h-4 w-4 mr-2" />
            Edit Studio
          </Button>
        </CardContent>
      </Card>
    )
  }

  return <BookingWidget studio={studio} />
}
