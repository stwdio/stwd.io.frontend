'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { MinimalAuthLoading } from '@/components/skeletons'

export default function DashboardRedirect() {
  const router = useRouter()
  
  useEffect(() => {
    // Redirect to the new browse route
    router.replace('/browse')
  }, [router])

  return <MinimalAuthLoading />
}
