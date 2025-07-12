"use client"

import { ThemeProvider } from "next-themes"
import { usePathname } from "next/navigation"
import { useState, useEffect } from "react"
import { AppSidebar } from "@/components/app-sidebar"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { FloatingCartButton } from "@/components/floating-cart-button"
import { SiteHeader } from "@/components/site-header"
import { useAuth } from "@/lib/auth/auth-context"

export function ClientLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const { user, profile } = useAuth()
  const [isLargeScreen, setIsLargeScreen] = useState(false)
  
  // Check if screen is 1080p (1920px) or larger for sidebar
  useEffect(() => {
    const checkScreenSize = () => {
      setIsLargeScreen(window.innerWidth >= 1920)
    }
    
    checkScreenSize()
    window.addEventListener('resize', checkScreenSize)
    return () => window.removeEventListener('resize', checkScreenSize)
  }, [])
  
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

  return (
    <ThemeProvider 
      attribute="class" 
      defaultTheme="light" 
      enableSystem={true}
      disableTransitionOnChange
    >
      {shouldShowDesktopSidebar ? (
        <SidebarProvider
          defaultOpen={isLargeScreen}
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
              <SiteHeader />
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