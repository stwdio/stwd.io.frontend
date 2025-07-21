import { createServerComponentClient } from '@/lib/supabase/server'
import { CreatorDashboard } from '@/components/creator-dashboard'

export async function CreatorDashboardServer() {
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
  
  // Pass the profile to the client component
  return <CreatorDashboard initialProfile={profile} />
}