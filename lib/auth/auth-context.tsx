'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import { User, Session } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

interface Profile {
  id: number
  user_id: string
  role: 'creator' | 'owner' | 'admin' | null
  first_name: string | null
  last_name: string | null
  username: string
  avatar_url: string | null
  stripe_customer_id: string | null
  created_at: string
  updated_at: string
}

interface AuthContextType {
  user: User | null
  session: Session | null
  profile: Profile | null
  loading: boolean
  error: string | null
  signOut: () => Promise<void>
  refreshProfile: () => Promise<void>
  clearError: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

interface AuthProviderProps {
  children: React.ReactNode
  initialUser: User | null
  initialProfile: Profile | null
}

/**
 * CRITICAL CHANGES:
 * 1. Accepts initialUser and initialProfile from server
 * 2. NO async operations in useEffect on mount
 * 3. Only listens for auth state CHANGES, not initial state
 * 4. Eliminates the race condition entirely
 */
export function AuthProvider({ 
  children, 
  initialUser, 
  initialProfile 
}: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(initialUser)
  const [session, setSession] = useState<Session | null>(null)
  const [profile, setProfile] = useState<Profile | null>(initialProfile)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createClient()

  // Only listen for auth state CHANGES, not initial load
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        // Only update if there's an actual change
        if (event === 'SIGNED_IN' && session?.user && session.user.id !== user?.id) {
          setUser(session.user)
          setSession(session)
          // Fetch profile only on actual sign in, not on refresh
          await refreshProfile()
        } else if (event === 'SIGNED_OUT') {
          setUser(null)
          setSession(null)
          setProfile(null)
          router.push('/auth/login')
        } else if (event === 'USER_UPDATED' && session) {
          setUser(session.user)
          setSession(session)
        } else if (event === 'TOKEN_REFRESHED' && session) {
          setSession(session)
        }
      }
    )

    return () => subscription.unsubscribe()
  }, [user?.id]) // Only re-subscribe if user ID changes

  const refreshProfile = async () => {
    if (!user?.id) return

    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single()

      if (error) {
        console.error('Error fetching profile:', error)
        setError('Failed to refresh profile')
        return
      }

      setProfile(data)
      setError(null)
    } catch (error) {
      console.error('Unexpected error:', error)
      setError('Failed to refresh profile')
    } finally {
      setLoading(false)
    }
  }

  const signOut = async () => {
    try {
      setLoading(true)
      setError(null)
      const { error } = await supabase.auth.signOut()
      if (error) {
        setError('Failed to sign out')
        console.error('Error signing out:', error)
      }
      // State updates handled by onAuthStateChange
    } catch (error) {
      console.error('Error signing out:', error)
      setError('Failed to sign out')
    } finally {
      setLoading(false)
    }
  }

  const clearError = () => {
    setError(null)
  }

  const contextValue: AuthContextType = {
    user,
    session,
    profile,
    loading,
    error,
    signOut,
    refreshProfile,
    clearError,
  }

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

// Helper functions for route protection
export const isPublicRoute = (pathname: string): boolean => {
  const publicRoutes = [
    '/',
    '/auth/login',
    '/auth/callback',
    '/auth/signup', 
    '/browse',
    '/studios',
  ]
  
  return publicRoutes.some(route => {
    if (route === '/') return pathname === '/'
    if (route === '/studios') return pathname.startsWith('/studios/')
    return pathname.startsWith(route)
  })
}

export const getDefaultDashboard = (role: string): string => {
  switch (role) {
    case 'creator':
      return '/browse'
    case 'owner':
      return '/profile/dashboard'
    case 'admin':
      return '/profile/dashboard'
    default:
      return '/browse'
  }
}