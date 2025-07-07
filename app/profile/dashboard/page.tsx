'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth/auth-context'
import { CreatorDashboard } from '@/components/creator-dashboard'
import { OwnerDashboard } from '@/components/owner-dashboard'
import { AdminDashboard } from '@/components/admin-dashboard'

interface Profile {
  id: number
  user_id: string
  role: "creator" | "owner" | "admin" | null
  first_name: string | null
  last_name: string | null
  username: string
  avatar_url: string | null
}

export default function ProfileDashboardPage() {
  const { user, profile, loading } = useAuth()
  const [authorized, setAuthorized] = useState(false)
  const router = useRouter()

  useEffect(() => {
    if (!loading) {
      if (!user || !profile) {
        router.replace('/auth/login')
        return
      }

      // Check if user has a role
      if (!profile.role) {
        router.replace('/onboarding')
        return
      }

      setAuthorized(true)
    }
  }, [loading, user, profile, router])

  // Render role-specific dashboard content
  const renderDashboardContent = () => {
    if (!profile?.role) return null

    switch (profile.role) {
      case 'creator':
        return <CreatorDashboard />
      case 'owner':
        return <OwnerDashboard />
      case 'admin':
        return <AdminDashboard />
      default:
        return (
          <div className="flex items-center justify-center h-32">
            <p className="text-muted-foreground">Unknown role: {profile.role}</p>
          </div>
        )
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-32 p-6">
        <div className="w-6 h-6 border-2 border-foreground border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!authorized) {
    return null // Will redirect
  }

  return (
    <div className="p-6">
      {renderDashboardContent()}
    </div>
  )
} 