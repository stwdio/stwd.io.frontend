'use client'

import React, { createContext, useContext, useEffect, useState, useRef } from 'react'
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
    error: null,
  })

  const stateRef = useRef(state)
  stateRef.current = state

  const supabase = createClient()

  const fetchProfile = async (userId: string): Promise<Profile | null> => {
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
  }

  const refreshProfile = async () => {
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
  }

  const signOut = async () => {
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
  }

  const clearError = () => {
    setState(prev => ({ ...prev, error: null }))
  }

  useEffect(() => {
    let mounted = true

    // Get initial session
    const getInitialSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession()
        
        if (error) {
          console.error('Error getting session:', error)
          if (mounted) {
            setState({
              user: null,
              session: null,
              profile: null,
              loading: false,
              error: 'Failed to get session'
            })
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
            error: null,
          })
        } else if (mounted) {
          setState({
            user: null,
            session: null,
            profile: null,
            loading: false,
            error: null,
          })
        }
      } catch (error) {
        console.error('Error in getInitialSession:', error)
        if (mounted) {
          setState({
            user: null,
            session: null,
            profile: null,
            loading: false,
            error: 'Failed to initialize auth'
          })
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
          // Don't show loading if we already have this user's data
          const currentState = stateRef.current
          const isSameUser = currentState.user?.id === session.user.id
          const hasProfile = currentState.profile?.user_id === session.user.id
          
          if (isSameUser && hasProfile) {
            // Just update the session, don't reload everything
            setState(prev => ({
              ...prev,
              session,
              error: null,
            }))
          } else {
            // New user or missing profile, load everything
            setState(prev => ({ ...prev, loading: true, error: null }))
            
            const profile = await fetchProfile(session.user.id)
            setState({
              user: session.user,
              session,
              profile,
              loading: false,
              error: null,
            })
          }
        } else if (event === 'SIGNED_OUT') {
          setState({
            user: null,
            session: null,
            profile: null,
            loading: false,
            error: null,
          })
        } else if (event === 'TOKEN_REFRESHED' && session?.user) {
          setState(prev => ({
            ...prev,
            user: session.user,
            session,
          }))
        } else if (event === 'INITIAL_SESSION' && session?.user) {
          // Handle tab refocus - don't reload if we already have the user's data
          const currentState = stateRef.current
          const isSameUser = currentState.user?.id === session.user.id
          const hasProfile = currentState.profile?.user_id === session.user.id
          
          if (!isSameUser || !hasProfile) {
            // Only load if we don't have the data
            const profile = await fetchProfile(session.user.id)
            setState({
              user: session.user,
              session,
              profile,
              loading: false,
              error: null,
            })
          }
        }
      }
    )

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [])

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
      return '/browse'
    case 'owner':
      return '/profile/dashboard'
    case 'admin':
      return '/profile/dashboard'
    default:
      return '/browse'
  }
}