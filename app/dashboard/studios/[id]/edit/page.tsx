import { Suspense } from 'react'
import { createServerComponentClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import { StudioFormStandalone } from '@/components/studio-form-standalone'
import { StudioFormSkeleton } from '@/components/skeletons'

interface EditStudioPageProps {
  params: Promise<{ id: string }>
}

// Async component to load studio data
async function StudioEditContent({ studioId }: { studioId: string }) {
  const supabase = await createServerComponentClient()
  
  // Get current user
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/auth/login')
  }
  
  // Get user profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('user_id', user.id)
    .single()
    
  if (!profile) {
    redirect('/onboarding')
  }
  
  // Fetch studio details
  const { data: studio, error } = await supabase
    .from('studios')
    .select('*')
    .eq('id', studioId)
    .single()
    
  if (error || !studio) {
    notFound()
  }
  
  // Verify ownership
  if (studio.owner_id !== profile.id && profile.system_role !== 'admin') {
    redirect('/profile/dashboard')
  }
  
  return (
    <StudioFormStandalone 
      studio={studio} 
      ownerId={profile.id}
      showActions={true}
    />
  )
}

export default async function EditStudioPage({ params }: EditStudioPageProps) {
  const { id } = await params
  
  return (
    <div className="w-full p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Edit Studio</h1>
        <p className="text-muted-foreground mt-2">Update your studio details, amenities, and settings.</p>
      </div>

      <Suspense fallback={<StudioFormSkeleton />}>
        <StudioEditContent studioId={id} />
      </Suspense>
    </div>
  )
}