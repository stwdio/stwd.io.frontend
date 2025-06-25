import { supabase } from '@/lib/supabase'
import { redirect } from 'next/navigation'
import { AdminDashboard } from '@/components/admin-dashboard'

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
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <p className="text-muted-foreground">
          Manage studio verifications, claims, and platform oversight
        </p>
      </div>
      
      <AdminDashboard />
    </div>
  )
} 