"use client"

import { ThemeProvider } from "next-themes"
import { usePathname } from "next/navigation"
import { FloatingCartButton } from "@/components/floating-cart-button"
import { SiteHeader } from "@/components/site-header"
import { AuthModal } from "@/components/auth/auth-modal"
import { useAuthModal } from "@/lib/hooks/use-auth-modal"

export function ClientLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const authModal = useAuthModal()
  
  // Pages that should NOT have the header
  const noHeaderRoutes = [
    '/', // Landing page
    '/auth/login', // Authentication pages
    '/auth/callback',
    '/auth/signup',
    '/onboarding', // Onboarding flow
  ]
  
  const shouldShowHeader = !noHeaderRoutes.includes(pathname)
  const shouldShowCartButton = pathname.startsWith('/discover') || pathname.startsWith('/lists')

  return (
    <ThemeProvider 
      attribute="class" 
      defaultTheme="light" 
      enableSystem={true}
      disableTransitionOnChange
    >
      <div className="h-screen flex flex-col">
        {/* Minimalist header with user profile dropdown */}
        {shouldShowHeader && <SiteHeader />}
        
        {/* Main content area - full width */}
        <main className="flex-1 min-h-0">
          {children}
        </main>
        
        {/* Floating cart button for relevant pages */}
        {shouldShowCartButton && <FloatingCartButton />}
        
        {/* Auth modal for guest users */}
        <AuthModal 
          open={authModal.isOpen} 
          onOpenChange={authModal.close}
          title={authModal.title}
          description={authModal.description}
        />
      </div>
    </ThemeProvider>
  )
} 