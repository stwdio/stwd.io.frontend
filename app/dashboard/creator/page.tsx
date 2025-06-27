'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { AppSidebar } from "@/components/app-sidebar"
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar"
import { CreatorDashboard } from '@/components/creator-dashboard'

interface Profile {
  id: number
  user_id: string
  role: "creator" | "owner" | "admin" | null
  first_name: string | null
  last_name: string | null
  username: string
  avatar_url: string | null
}

export default function CreatorDashboardPage() {
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [authorized, setAuthorized] = useState(false)
  const router = useRouter()

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
          router.replace('/dashboard')
          return
        }

        // Check if user is a creator
        if (profile.role !== 'creator') {
          console.error('Access denied: User is not a creator')
          router.replace('/dashboard')
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
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_OUT' || !session) {
        router.replace('/auth/login')
      } else if (event === 'SIGNED_IN' && session) {
        // Re-check authorization
        checkAuth()
      }
    })

    return () => subscription.unsubscribe()
  }, [router])

  if (loading) {
    return (
      <SidebarProvider
        style={
          {
            "--sidebar-width": "calc(var(--spacing) * 72)",
            "--header-height": "calc(var(--spacing) * 12)",
          } as React.CSSProperties
        }
      >
        <AppSidebar variant="inset" />
        <SidebarInset>
          <div className="flex flex-1 flex-col">
            <div className="@container/main flex flex-1 flex-col p-6">
              <div className="flex items-center justify-center h-32">
                <div className="w-6 h-6 border-2 border-foreground border-t-transparent rounded-full animate-spin" />
              </div>
            </div>
          </div>
        </SidebarInset>
      </SidebarProvider>
    )
  }

  if (!authorized) {
    return null // Will redirect
  }

  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 72)",
          "--header-height": "calc(var(--spacing) * 12)",
        } as React.CSSProperties
      }
    >
      <AppSidebar variant="inset" />
      <SidebarInset>
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col p-6">
            <CreatorDashboard />
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
} 