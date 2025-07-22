'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import { User, Session } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

interface Profile {
  id: number
  user_id: string
  system_role: 'user' | 'admin' | null
  first_name: string | null
  last_name: string | null
  middle_name: string | null
  username: string
  avatar_url: string | null
  stripe_customer_id: string | null
  created_at: string
  updated_at: string
}

interface ProfessionalRole {
  role_id: number
  role: {
    id: number
    name: string
    slug: string
    description: string | null
  }
}

interface AuthContextType {
  user: User | null
  session: Session | null
  profile: Profile | null
  professionalRoles: ProfessionalRole[]
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
  initialRoles?: ProfessionalRole[]
}

/**
 * AuthProvider that accepts server-side data as props
 * This eliminates the race condition by starting with complete data
 */
export function AuthProvider({
  children,
  initialUser,
  initialProfile,
  initialRoles = [],
}: AuthProviderProps) {
  // 1. Initialize state directly from server-provided props. NO FETCHING.
  const [user, setUser] = useState<User | null>(initialUser)
  const [session, setSession] = useState<Session | null>(null)
  const [profile, setProfile] = useState<Profile | null>(initialProfile)
  const [professionalRoles, setProfessionalRoles] = useState<ProfessionalRole[]>(initialRoles)

  // 2. Loading is FALSE initially because we already have the data.
  // It only becomes true during client-side auth operations (login/logout).
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const router = useRouter()
  const supabase = createClient()

  // 3. This useEffect only listens for auth STATE CHANGES (e.g., SIGNED_IN, SIGNED_OUT)
  // that happen on the client. It does NOT run on initial page load to fetch data.
  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user && session.user.id !== user?.id) {
        setLoading(true)
        setUser(session.user)
        setSession(session)
        // Fetch a fresh profile on sign-in
        try {
          const { data: profileData, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('user_id', session.user.id)
            .single()

          if (!profileError && profileData) {
            setProfile(profileData)
            
            // Fetch professional roles
            const { data: rolesData } = await supabase
              .from('profile_roles')
              .select(`
                role_id,
                role:roles(*)
              `)
              .eq('profile_id', profileData.id)
            
            if (rolesData) {
              setProfessionalRoles(rolesData as unknown as ProfessionalRole[])
            }
          } else {
            console.error('Profile fetch error after sign in:', profileError)
          }
        } finally {
          setLoading(false)
        }
      } else if (event === 'SIGNED_OUT') {
        setUser(null)
        setSession(null)
        setProfile(null)
        setProfessionalRoles([])
        router.push('/auth/login')
      } else if (event === 'TOKEN_REFRESHED' && session) {
        setSession(session)
        if (session.user) {
          setUser(session.user)
        }
      }
    })

    return () => subscription.unsubscribe()
  }, [user?.id, router, supabase])

  const refreshProfile = async () => {
    if (!user?.id) return

    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single()
      
      if (!error && data) {
        setProfile(data)
        
        // Fetch professional roles
        const { data: rolesData } = await supabase
          .from('profile_roles')
          .select(`
            role_id,
            role:roles(*)
          `)
          .eq('profile_id', data.id)
        
        if (rolesData) {
          setProfessionalRoles(rolesData as unknown as ProfessionalRole[])
        }
      }

      if (error) {
        console.error('Error refreshing profile:', error)
        setError('Failed to refresh profile')
        return
      }

      setProfile(data)
      setError(null)
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
      // State cleanup handled by onAuthStateChange
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
    professionalRoles,
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
    '/discover',
    '/studios',
    '/profiles',
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
      return '/discover'
    case 'owner':
      return '/profile/dashboard'
    case 'admin':
      return '/profile/dashboard'
    default:
      return '/discover'
  }
}