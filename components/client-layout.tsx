"use client"

import { ThemeProvider } from "next-themes"
import { usePathname } from "next/navigation"
import { AppSidebar } from "@/components/app-sidebar"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { FloatingCartButton } from "@/components/floating-cart-button"

export function ClientLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  
  // Pages that should NOT have the sidebar
  const noSidebarRoutes = [
    '/', // Landing page
    '/auth/login', // Authentication pages
    '/auth/callback',
    '/auth/signup',
    '/onboarding', // Onboarding flow
  ]
  
  const shouldShowSidebar = !noSidebarRoutes.includes(pathname)

  return (
    <ThemeProvider 
      attribute="class" 
      defaultTheme="light" 
      enableSystem={true}
      disableTransitionOnChange
    >
      {shouldShowSidebar ? (
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
              <div className="@container/main flex flex-1 flex-col">
                {children}
              </div>
            </div>
          </SidebarInset>
          <FloatingCartButton />
        </SidebarProvider>
      ) : (
        children
      )}
    </ThemeProvider>
  )
} 