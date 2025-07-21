import { Suspense } from 'react'
import { createServerComponentClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { OnboardingContent } from './_components/onboarding-content'
import { OnboardingPageSkeleton } from './_components/onboarding-skeleton'

// Async component to fetch roles data
async function OnboardingDataWrapper() {
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
    // Profile should exist but if not, create one
    const { data: newProfile } = await supabase
      .from('profiles')
      .insert({
        id: user.id,
        email: user.email,
        name: user.user_metadata?.full_name || null,
      })
      .select()
      .single()
      
    if (!newProfile) {
      throw new Error('Failed to create profile')
    }
  }
  
  // Check if user already has professional roles
  const { data: existingRoles } = await supabase
    .from('profile_roles')
    .select('*, role:roles(*)')
    .eq('profile_id', profile.id)
    .limit(1)
  
  // If user already has a role, redirect to dashboard
  if (existingRoles && existingRoles.length > 0) {
    const isStudioOwner = existingRoles.some(pr => pr.role?.slug === 'studio-owner')
    redirect(isStudioOwner ? '/profile/dashboard' : '/dashboard')
  }
  
  // Fetch available roles
  const { data: roles } = await supabase
    .from('roles')
    .select('*')
    .order('name')
    
  if (!roles || roles.length === 0) {
    throw new Error('No roles available')
  }
  
  return <OnboardingContent roles={roles} profileId={profile?.id || user.id} />
}

export default function OnboardingPage() {
  return (
    <Suspense fallback={<OnboardingPageSkeleton />}>
      <OnboardingDataWrapper />
    </Suspense>
  )
}