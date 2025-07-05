"use client"

import { ThemeProvider } from "next-themes"
import { usePathname } from "next/navigation"
import { useEffect, useState } from "react"
import { AppSidebar } from "@/components/app-sidebar"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { FloatingCartButton } from "@/components/floating-cart-button"

import { createClient } from "@/lib/supabase/client"

interface Profile {
  id: number
  user_id: string
  role: 'creator' | 'owner' | 'admin' | null
  first_name: string | null
  last_name: string | null
  username: string
  avatar_url: string | null
}

interface User {
  id: string
  email?: string
}

export function ClientLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()
  
  // Pages that should NOT have ANY navigation (including mobile)
  const noNavigationRoutes = [
    '/', // Landing page
    '/auth/login', // Authentication pages
    '/auth/callback',
    '/auth/signup',
    '/onboarding', // Onboarding flow
  ]
  
  // Pages that should have mobile navigation but not desktop sidebar
  const mobileOnlyRoutes = [
    '/browse',
    '/lists',
    '/dashboard',
    '/profile',
    '/studios'
  ]
  
  const shouldShowNavigation = !noNavigationRoutes.includes(pathname)
  const shouldShowDesktopSidebar = shouldShowNavigation && !noNavigationRoutes.includes(pathname)

  // Fetch user and profile data for mobile navigation
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const { data: { user: userData } } = await supabase.auth.getUser()
        setUser(userData)
        
        if (userData) {
          const { data: profileData } = await supabase
            .from('profiles')
            .select('*')
            .eq('user_id', userData.id)
            .single()
          
          setProfile(profileData)
        }
      } catch (error) {
        console.error('Error fetching user data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchUserData()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event: string, session: any) => {
        if (event === 'SIGNED_OUT' || !session) {
          setUser(null)
          setProfile(null)
        } else if (event === 'SIGNED_IN' && session) {
          setUser(session.user)
          // Fetch profile for newly signed in user
          const { data: profileData } = await supabase
            .from('profiles')
            .select('*')
            .eq('user_id', session.user.id)
            .single()
          setProfile(profileData)
        }
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  return (
    <ThemeProvider 
      attribute="class" 
      defaultTheme="light" 
      enableSystem={true}
      disableTransitionOnChange
    >
      {shouldShowDesktopSidebar ? (
        <SidebarProvider
          style={
            {
              "--sidebar-width": "calc(var(--spacing) * 72)",
              "--header-height": "calc(var(--spacing) * 12)",
            } as React.CSSProperties
          }
        >
          {/* Responsive Sidebar */}
          <AppSidebar variant="inset" />
          <SidebarInset>
            <div className="flex flex-1 flex-col">
              <div className="@container/main flex flex-1 flex-col">

                {children}
              </div>
            </div>
          </SidebarInset>
          <FloatingCartButton />
        </SidebarProvider>
      ) : (
        <div className="min-h-screen">
          {children}
        </div>
      )}
    </ThemeProvider>
  )
} 