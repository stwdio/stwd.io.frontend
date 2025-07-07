'use client'

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { User, Session } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/client'

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

interface AuthState {
  user: User | null
  session: Session | null
  profile: Profile | null
  loading: boolean
  initialized: boolean
  error: string | null
}

interface AuthContextType extends AuthState {
  signOut: () => Promise<void>
  refreshProfile: () => Promise<void>
  clearError: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

interface AuthProviderProps {
  children: React.ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [state, setState] = useState<AuthState>({
    user: null,
    session: null,
    profile: null,
    loading: true,
    initialized: false,
    error: null,
  })

  const supabase = createClient()

  const fetchProfile = useCallback(async (userId: string): Promise<Profile | null> => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', userId)
        .single()

      if (error) {
        console.error('Error fetching profile:', error)
        return null
      }

      return data
    } catch (error) {
      console.error('Error in fetchProfile:', error)
      return null
    }
  }, [supabase])

  const refreshProfile = useCallback(async () => {
    if (!state.user) return

    setState(prev => ({ ...prev, loading: true, error: null }))
    
    try {
      const profile = await fetchProfile(state.user.id)
      setState(prev => ({ 
        ...prev, 
        profile, 
        loading: false 
      }))
    } catch (error) {
      setState(prev => ({ 
        ...prev, 
        error: 'Failed to refresh profile', 
        loading: false 
      }))
    }
  }, [state.user, fetchProfile])

  const signOut = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }))
      
      const { error } = await supabase.auth.signOut()
      
      if (error) {
        setState(prev => ({ 
          ...prev, 
          error: 'Failed to sign out', 
          loading: false 
        }))
      } else {
        setState({
          user: null,
          session: null,
          profile: null,
          loading: false,
          initialized: true,
          error: null,
        })
      }
    } catch (error) {
      setState(prev => ({ 
        ...prev, 
        error: 'Failed to sign out', 
        loading: false 
      }))
    }
  }, [supabase])

  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }))
  }, [])

  useEffect(() => {
    let mounted = true

    // Get initial session
    const getInitialSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession()
        
        if (error) {
          console.error('Error getting session:', error)
          if (mounted) {
            setState(prev => ({ 
              ...prev, 
              error: 'Failed to get session',
              loading: false,
              initialized: true 
            }))
          }
          return
        }

        if (session?.user && mounted) {
          const profile = await fetchProfile(session.user.id)
          setState({
            user: session.user,
            session,
            profile,
            loading: false,
            initialized: true,
            error: null,
          })
        } else if (mounted) {
          setState({
            user: null,
            session: null,
            profile: null,
            loading: false,
            initialized: true,
            error: null,
          })
        }
      } catch (error) {
        console.error('Error in getInitialSession:', error)
        if (mounted) {
          setState(prev => ({ 
            ...prev, 
            error: 'Failed to initialize auth',
            loading: false,
            initialized: true 
          }))
        }
      }
    }

    getInitialSession()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event: string, session: Session | null) => {
        if (!mounted) return

        console.log('Auth state change:', event, session?.user?.id)

        if (event === 'SIGNED_IN' && session?.user) {
          setState(prev => ({ ...prev, loading: true, error: null }))
          const profile = await fetchProfile(session.user.id)
          setState({
            user: session.user,
            session,
            profile,
            loading: false,
            initialized: true,
            error: null,
          })
        } else if (event === 'SIGNED_OUT') {
          setState({
            user: null,
            session: null,
            profile: null,
            loading: false,
            initialized: true,
            error: null,
          })
        } else if (event === 'TOKEN_REFRESHED' && session?.user) {
          setState(prev => ({
            ...prev,
            user: session.user,
            session,
          }))
        }
      }
    )

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [supabase, fetchProfile])

  const contextValue: AuthContextType = {
    ...state,
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
      return '/dashboard'
    case 'owner':
      return '/dashboard/owner'
    case 'admin':
      return '/dashboard/admin'
    default:
      return '/dashboard'
  }
}