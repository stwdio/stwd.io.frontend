'use client'

import { useAuth } from '@/lib/auth/auth-context'
import { CreatorDashboard } from '@/components/creator-dashboard'
import { OwnerDashboard } from '@/components/owner-dashboard'
import { AdminDashboard } from '@/components/admin-dashboard'

export default function ProfileDashboardPage() {
  const { profile } = useAuth()

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

  return (
    <div className="p-6">
      {renderDashboardContent()}
    </div>
  )
}