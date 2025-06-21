"use client"

import { redirect } from "next/navigation"
import { auth, currentUser } from "@clerk/nextjs"
import { db } from "@/lib/db"
import { StudioFormStandalone } from "@/components/studio-form-standalone"

interface StudioEditPageProps {
  params: {
    id: string
  }
}

const StudioEditPage = async ({ params }: StudioEditPageProps) => {
  const { userId } = auth()
  const profile = await currentUser()

  if (!userId || !profile) {
    return redirect("/")
  }

  const studio = await db.studio.findUnique({
    where: {
      id: params.id,
      userId,
    },
  })

  if (!studio) {
    return redirect("/dashboard")
  }

  const handleStudioSaved = () => {
    redirect("/dashboard/studios")
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Edit Studio</h1>
      </div>
      <div className="space-y-4 pt-4">
        <StudioFormStandalone studio={studio} onSaved={handleStudioSaved} ownerId={profile?.id} />
      </div>
    </div>
  )
}

export default StudioEditPage
