import { createServerComponentClient } from '@/lib/supabase/server'
import { AdminDashboard } from '@/components/admin-dashboard'

export async function AdminDashboardServer() {
  const supabase = await createServerComponentClient()
  
  // Get the current user
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null
  
  // Fetch profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('user_id', user.id)
    .single()
    
  if (!profile || profile.system_role !== 'admin') return null
  
  // Pass the profile to the client component
  return <AdminDashboard initialProfile={profile} />
}