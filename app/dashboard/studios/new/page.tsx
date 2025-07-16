import { Suspense } from 'react'
import { createServerComponentClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { StudioDraftForm } from '@/components/studio-draft-form'
import { StudioFormSkeleton } from '@/components/skeletons'

// Async component to verify permissions
async function NewStudioContent() {
  const supabase = await createServerComponentClient()
  
  // Get current user
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/auth/login')
  }
  
  // Get user profile and check permissions
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('user_id', user.id)
    .single()
    
  if (!profile) {
    redirect('/onboarding')
  }
  
  // Check if user has professional role for studio owner
  const { data: professionalRoles } = await supabase
    .from('professional_roles')
    .select('*, role:roles(*)')
    .eq('profile_id', profile.id)
    
  const isStudioOwner = professionalRoles?.some(pr => pr.role?.slug === 'studio-owner')
  const isAdmin = profile.system_role === 'admin'
  
  if (!isStudioOwner && !isAdmin) {
    redirect('/browse')
  }
  
  return <StudioDraftForm />
}

export default function NewStudioPage() {
  return (
    <div className="w-full p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Add New Studio</h1>
        <p className="text-muted-foreground mt-2">Create a new recording studio listing.</p>
      </div>

      <Suspense fallback={<StudioFormSkeleton />}>
        <NewStudioContent />
      </Suspense>
    </div>
  )
}