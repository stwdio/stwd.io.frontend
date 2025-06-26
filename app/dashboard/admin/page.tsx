import { supabase } from '@/lib/supabase'
import { redirect } from 'next/navigation'
import { AdminDashboard } from '@/components/admin-dashboard'
import { AppSidebar } from "@/components/app-sidebar"
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar"

export default async function AdminPage() {
  
  // Check authentication
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  
  if (authError || !user) {
    redirect('/auth/login')
  }
  
  // Check admin role
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('user_id', user.id)
    .single()
    
  if (!profile || profile.role !== 'admin') {
    redirect('/dashboard')
  }

  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 72)",
          "--header-height": "calc(var(--spacing) * 12)",
        } as React.CSSProperties
      }
    >
      <AppSidebar variant="inset" />
      <SidebarInset>
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col p-6">
            <AdminDashboard />
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
} 