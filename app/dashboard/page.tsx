'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function DashboardRedirect() {
  const router = useRouter()
  
  useEffect(() => {
    // All users now go to the unified chat hub
    router.replace('/chat')
  }, [router])

  return null
}
