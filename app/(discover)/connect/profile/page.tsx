'use client'

import { useAuth } from '@/lib/auth/auth-context'
import { redirect } from 'next/navigation'

export default function ProfilePage() {
  const { profile } = useAuth()
  
  if (profile?.username) {
    redirect(`/profiles/${profile.username}`)
  }
  
  return (
    <div className="flex flex-col flex-1 px-4 py-3 sm:px-6 sm:py-4">
      <p className="text-muted-foreground">Loading profile...</p>
    </div>
  )
}