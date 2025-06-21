"use client"

import type { Metadata } from "next"
import { redirect } from "next/navigation"
import { auth } from "@clerk/nextjs"

import { db } from "@/lib/db"
import { BookingWidget } from "@/components/booking-widget"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Edit } from "lucide-react"
import { useRouter } from "next/navigation"

interface Props {
  params: {
    id: string
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const studio = await db.studio.findUnique({
    where: {
      id: params.id,
    },
  })

  if (!studio) {
    redirect("/")
  }

  return {
    title: studio.name,
  }
}

const StudioIdPage = async ({ params }: Props) => {
  const { userId } = auth()

  if (!userId) {
    redirect("/")
  }

  const studio = await db.studio.findUnique({
    where: {
      id: params.id,
    },
  })

  if (!studio) {
    redirect("/")
  }

  const profile = await db.profile.findUnique({
    where: {
      userId,
    },
  })

  const router = useRouter()

  return (
    <div className="container pt-4">
      <h1 className="text-3xl font-bold">{studio.name}</h1>
      <p>{studio.description}</p>
      {/* Booking Widget or Edit Button */}
      {profile && studio.owner_id === profile.id ? (
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
      ) : (
        <BookingWidget studioId={studio.id} hourlyRate={studio.hourly_rate} />
      )}
    </div>
  )
}

export default StudioIdPage
