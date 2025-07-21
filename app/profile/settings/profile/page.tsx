import { Suspense } from 'react'
import { createServerComponentClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { ProfileSettingsForm } from './_components/profile-settings-form'
import { ProfileFormSkeleton } from '@/components/skeletons'

// Async component to fetch profile data
async function ProfileSettingsContent() {
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
  
  return (
    <ProfileSettingsForm
      initialProfile={profile}
      initialEmail={user.email || ''}
    />
  )
}

export default function ProfileSettingsPage() {
  return (
    <Suspense fallback={<ProfileFormSkeleton />}>
      <ProfileSettingsContent />
    </Suspense>
  )
}