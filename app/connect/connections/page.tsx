import { redirect } from 'next/navigation'
import { createServerComponentClient } from '@/lib/supabase/server'
import { ConnectionsHubV2 } from '@/components/connections/connections-hub-v2'

export default async function ConnectionsPage() {
  const supabase = await createServerComponentClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/auth/login')
  }
  
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('user_id', user.id)
    .single()
  
  if (!profile) {
    redirect('/auth/login')
  }

  return <ConnectionsHubV2 />
}