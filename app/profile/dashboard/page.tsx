import { Suspense } from 'react'
import { createServerComponentClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { CreatorDashboardServer } from './_components/creator-dashboard-server'
import { OwnerDashboardServer } from './_components/owner-dashboard-server'
import { AdminDashboardServer } from './_components/admin-dashboard-server'
import {
  CreatorDashboardSkeleton,
  OwnerDashboardSkeleton,
  AdminDashboardSkeleton
} from './_components/dashboard-skeletons'

export default async function ProfileDashboardPage() {
  const supabase = await createServerComponentClient()
  
  // Get current user
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/auth/login')
  }
  
  // Fetch profile first
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('user_id', user.id)
    .single()
  
  if (!profile) {
    redirect('/onboarding')
  }
  
  // Then fetch professional roles using profile.id
  const { data: professionalRoles } = await supabase
    .from('profile_roles')
    .select('*, role:roles(*)')
    .eq('profile_id', profile.id)
  
  const roles = professionalRoles || []
  
  // Check user roles
  const isStudioOwner = roles.some(pr => pr.role?.slug === 'studio-owner')
  const isAdmin = profile.system_role === 'admin'
  
  // Check if user owns any studios (only if they have studio owner role)
  let hasStudios = false
  if (isStudioOwner) {
    const { count } = await supabase
      .from('studios')
      .select('*', { count: 'exact', head: true })
      .eq('owner_id', profile.id)
    hasStudios = (count || 0) > 0
  }
  
  // Admin dashboard
  if (isAdmin) {
    return (
      <div className="flex-1 overflow-y-auto">
        <div className="p-6">
          <Suspense fallback={<AdminDashboardSkeleton />}>
            <AdminDashboardServer />
          </Suspense>
        </div>
      </div>
    )
  }
  
  // Studio owner with studios - show tabs
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
              <Suspense fallback={<CreatorDashboardSkeleton />}>
                <CreatorDashboardServer />
              </Suspense>
            </TabsContent>
            <TabsContent value="owner">
              <Suspense fallback={<OwnerDashboardSkeleton />}>
                <OwnerDashboardServer />
              </Suspense>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    )
  }
  
  // Default - creator dashboard
  return (
    <div className="flex-1 overflow-y-auto">
      <div className="p-6">
        <Suspense fallback={<CreatorDashboardSkeleton />}>
          <CreatorDashboardServer />
        </Suspense>
      </div>
    </div>
  )
}