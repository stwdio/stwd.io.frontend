import { createServerComponentClient } from '@/lib/supabase/server'
import { OwnerDashboard } from '@/components/owner-dashboard'

export async function OwnerDashboardServer() {
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
    
  if (!profile) return null
  
  // Fetch owned studios count for initial state
  const { count: studiosCount } = await supabase
    .from('studios')
    .select('*', { count: 'exact', head: true })
    .eq('owner_id', profile.id)
  
  // Pass the profile and initial data to the client component
  return <OwnerDashboard initialProfile={profile} initialStudiosCount={studiosCount || 0} />
}