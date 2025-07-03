'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { CreatorDashboard } from '@/components/creator-dashboard'
import { OwnerDashboard } from '@/components/owner-dashboard'
import { AdminDashboard } from '@/components/admin-dashboard'

interface Profile {
  id: number
  user_id: string
  role: "creator" | "owner" | "admin" | null
  first_name: string | null
  last_name: string | null
  username: string
  avatar_url: string | null
}

export default function ProfileDashboardPage() {
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [authorized, setAuthorized] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Get current session
        const { data: { session }, error: sessionError } = await supabase.auth.getSession()
        
        if (sessionError || !session?.user) {
          router.replace('/auth/login')
          return
        }

        setUser(session.user)

        // Get user profile
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('user_id', session.user.id)
          .single()

        if (profileError || !profile) {
          console.error('Profile error:', profileError)
          router.replace('/browse')
          return
        }

        // Check if user has a role
        if (!profile.role) {
          router.replace('/onboarding')
          return
        }

        setProfile(profile)
        setAuthorized(true)
      } catch (error) {
        console.error('Auth check error:', error)
        router.replace('/auth/login')
      } finally {
        setLoading(false)
      }
    }

    checkAuth()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event: any, session: any) => {
      if (event === 'SIGNED_OUT' || !session) {
        router.replace('/auth/login')
      } else if (event === 'SIGNED_IN' && session) {
        // Re-check authorization
        checkAuth()
      }
    })

    return () => subscription.unsubscribe()
  }, [router, supabase])

  // Render role-specific dashboard content
  const renderDashboardContent = () => {
    if (!profile?.role) return null

    switch (profile.role) {
      case 'creator':
        return <CreatorDashboard />
      case 'owner':
        return <OwnerDashboard />
      case 'admin':
        return <AdminDashboard />
      default:
        return (
          <div className="flex items-center justify-center h-32">
            <p className="text-muted-foreground">Unknown role: {profile.role}</p>
          </div>
        )
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-32 p-6">
        <div className="w-6 h-6 border-2 border-foreground border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!authorized) {
    return null // Will redirect
  }

  return (
    <div className="p-6">
      {renderDashboardContent()}
    </div>
  )
} 