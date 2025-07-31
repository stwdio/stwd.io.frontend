import { redirect } from 'next/navigation'
import { createServerComponentClient } from '@/lib/supabase/server'
import { ConnectionsHubV2 } from '@/components/connections/connections-hub-v2'
import { Suspense } from 'react'
import { ConnectionsHubSkeleton } from '@/components/connections/connections-hub-skeleton'

async function ConnectionsPageContent() {
  // User is already validated in parent
  return <ConnectionsHubV2 />
}

export default async function ConnectionsPage() {
  // Do minimal auth check here
  const supabase = await createServerComponentClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    redirect('/auth/login')
  }

  // Show skeleton immediately while component loads
  return (
    <Suspense fallback={<ConnectionsHubSkeleton />}>
      <ConnectionsPageContent />
    </Suspense>
  )
}