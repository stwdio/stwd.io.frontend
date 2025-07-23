import { Suspense } from 'react'
import { redirect } from 'next/navigation'
import { createServerComponentClient } from '@/lib/supabase/server'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { UnifiedLayout } from '@/components/layouts/unified-layout'
import { WorkspaceStudios } from './_components/workspace-studios'
import { WorkspaceLeads } from './_components/workspace-leads'
import { WorkspaceBookings } from './_components/workspace-bookings'
import { WorkspaceAnalytics } from './_components/workspace-analytics'
import { WorkspaceVerification } from './_components/workspace-verification'
import { WorkspaceUsers } from './_components/workspace-users'
import { 
  WorkspaceStudiosSkeleton,
  WorkspaceLeadsSkeleton,
  WorkspaceBookingsSkeleton 
} from './_components/workspace-skeletons'

export default async function WorkspacePage() {
  const supabase = await createServerComponentClient()
  
  // Get current user
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/auth/login')
  }
  
  // Fetch profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('user_id', user.id)
    .single()
  
  // Only owners and admins can access workspace
  if (!profile || !['owner', 'admin'].includes(profile.system_role || '')) {
    redirect('/chat')
  }
  
  const isAdmin = profile.system_role === 'admin'

  return (
    <UnifiedLayout>
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Workspace</h1>
          <p className="text-muted-foreground mt-2">
            Manage your studios, leads, and bookings in one place
          </p>
        </div>
        
        <Tabs defaultValue="studios" className="space-y-4">
        <TabsList>
          <TabsTrigger value="studios">My Studios</TabsTrigger>
          <TabsTrigger value="leads">Incoming Leads</TabsTrigger>
          <TabsTrigger value="bookings">Bookings</TabsTrigger>
          {isAdmin && (
            <>
              <TabsTrigger value="analytics">Platform Analytics</TabsTrigger>
              <TabsTrigger value="verification">Verification Queue</TabsTrigger>
              <TabsTrigger value="users">User Management</TabsTrigger>
            </>
          )}
        </TabsList>
        
        <TabsContent value="studios" className="space-y-4">
          <Suspense fallback={<WorkspaceStudiosSkeleton />}>
            <WorkspaceStudios userId={user.id} />
          </Suspense>
        </TabsContent>
        
        <TabsContent value="leads" className="space-y-4">
          <Suspense fallback={<WorkspaceLeadsSkeleton />}>
            <WorkspaceLeads userId={user.id} />
          </Suspense>
        </TabsContent>
        
        <TabsContent value="bookings" className="space-y-4">
          <Suspense fallback={<WorkspaceBookingsSkeleton />}>
            <WorkspaceBookings userId={user.id} />
          </Suspense>
        </TabsContent>
        
        {isAdmin && (
          <>
            <TabsContent value="analytics" className="space-y-4">
              <WorkspaceAnalytics />
            </TabsContent>
            
            <TabsContent value="verification" className="space-y-4">
              <WorkspaceVerification />
            </TabsContent>
            
            <TabsContent value="users" className="space-y-4">
              <WorkspaceUsers />
            </TabsContent>
          </>
        )}
      </Tabs>
      </div>
    </UnifiedLayout>
  )
}