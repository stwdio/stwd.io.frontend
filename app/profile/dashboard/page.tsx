'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/lib/auth/auth-context'
import { CreatorDashboard } from '@/components/creator-dashboard'
import { OwnerDashboard } from '@/components/owner-dashboard'
import { AdminDashboard } from '@/components/admin-dashboard'
import { createClient } from '@/lib/supabase/client'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

export default function ProfileDashboardPage() {
  const { profile, professionalRoles } = useAuth()
  const [ownedStudiosCount, setOwnedStudiosCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  // Check if user actually owns any studios
  useEffect(() => {
    const checkStudioOwnership = async () => {
      if (!profile?.id) return
      
      const { count } = await supabase
        .from('studios')
        .select('*', { count: 'exact', head: true })
        .eq('owner_id', profile.id)
      
      setOwnedStudiosCount(count || 0)
      setLoading(false)
    }
    
    checkStudioOwnership()
  }, [profile?.id])

  const isStudioOwner = professionalRoles.some(pr => pr.role?.slug === 'studio-owner')
  const isAdmin = profile?.system_role === 'admin'
  const hasStudios = ownedStudiosCount > 0

  // If loading, show loading state
  if (loading) {
    return <div className="p-6">Loading...</div>
  }

  // Admin always sees admin dashboard
  if (isAdmin) {
    return (
      <div className="flex-1 overflow-y-auto">
        <div className="p-6">
          <AdminDashboard />
        </div>
      </div>
    )
  }

  // If user has studio owner role AND owns studios, show tabs
  if (isStudioOwner && hasStudios) {
    return (
      <div className="flex-1 overflow-y-auto">
        <div className="p-6">
          <Tabs defaultValue="creator" className="space-y-6">
            <TabsList>
              <TabsTrigger value="creator">Creator Dashboard</TabsTrigger>
              <TabsTrigger value="owner">Studio Owner Dashboard</TabsTrigger>
            </TabsList>
            <TabsContent value="creator">
              <CreatorDashboard />
            </TabsContent>
            <TabsContent value="owner">
              <OwnerDashboard />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    )
  }

  // Otherwise show creator dashboard
  return (
    <div className="flex-1 overflow-y-auto">
      <div className="p-6">
        <CreatorDashboard />
      </div>
    </div>
  )
}