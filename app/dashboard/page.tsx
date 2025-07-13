'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth/auth-context'
import { MinimalAuthLoading } from '@/components/skeletons'

export default function DashboardRedirect() {
  const router = useRouter()
  const { profile, professionalRoles, loading } = useAuth()
  
  useEffect(() => {
    if (loading) return
    
    // Check if user has studio owner role
    const isStudioOwner = professionalRoles.some(pr => pr.role?.slug === 'studio-owner')
    
    // Redirect to appropriate dashboard
    if (isStudioOwner || profile?.system_role === 'admin') {
      router.replace('/profile/dashboard')
    } else {
      // Regular creators go to creator dashboard
      router.replace('/profile/dashboard')
    }
  }, [router, profile, professionalRoles, loading])

  return <MinimalAuthLoading />
}
