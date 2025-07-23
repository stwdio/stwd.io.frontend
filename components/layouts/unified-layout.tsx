'use client'

import { cn } from '@/lib/utils'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ReactNode } from 'react'

interface UnifiedLayoutProps {
  children: ReactNode
  // Optional nav content for pages with secondary navigation
  secondaryNav?: ReactNode
  // Optional action content for the right side of the nav (search, filters, etc)
  navActions?: ReactNode
}

export function UnifiedLayout({ children, secondaryNav, navActions }: UnifiedLayoutProps) {
  const pathname = usePathname()
  
  // Determine which main navigation to show
  const isDiscoverSection = pathname?.startsWith('/discover') || pathname === '/'
  const isChatSection = pathname?.startsWith('/chat')
  const isWorkspaceSection = pathname?.startsWith('/workspace')
  const isSettingsSection = pathname?.startsWith('/settings')
  const isProfileSection = pathname?.startsWith('/profiles')
  
  // Determine active state for discover sub-navigation
  const isStudiosActive = isDiscoverSection && !pathname?.includes('/people')
  const isPeopleActive = pathname?.includes('/people')
  const isChatActive = isChatSection
  
  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] lg:h-[calc(100vh-5rem)]">
      {/* Static navigation header */}
      <div className="flex-shrink-0 bg-background border-b">
        <div className="px-4 sm:px-6 py-3">
          <div className="flex items-center justify-between gap-4">
            {/* Left side navigation */}
            <div className="flex items-center gap-4">
              {/* Discover section navigation */}
              {(isDiscoverSection || isChatSection) && (
                <div className="flex items-center gap-3 text-base">
                  <Link
                    href="/discover"
                    className={cn(
                      "font-medium transition-all",
                      isStudiosActive 
                        ? "text-foreground border-b-2 border-foreground" 
                        : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    STUDIOS
                  </Link>
                  <span className="text-muted-foreground">|</span>
                  <Link
                    href="/discover/people"
                    className={cn(
                      "font-medium transition-all",
                      isPeopleActive 
                        ? "text-foreground border-b-2 border-foreground" 
                        : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    PEOPLE
                  </Link>
                  
                  {/* Secondary navigation (e.g., People sub-categories) */}
                  {secondaryNav}
                  
                  <span className="text-muted-foreground">|</span>
                  <Link
                    href="/chat"
                    className={cn(
                      "font-medium transition-all",
                      isChatActive 
                        ? "text-foreground border-b-2 border-foreground" 
                        : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    CHAT
                  </Link>
                </div>
              )}
              
              {/* Workspace section */}
              {isWorkspaceSection && (
                <h1 className="text-xl font-semibold">WORKSPACE</h1>
              )}
              
              {/* Settings section */}
              {isSettingsSection && (
                <h1 className="text-xl font-semibold">SETTINGS</h1>
              )}
              
              {/* Profile section */}
              {isProfileSection && (
                <h1 className="text-xl font-semibold">PROFILE</h1>
              )}
            </div>
            
            {/* Right side actions (search, filters, etc) */}
            {navActions && (
              <div className="flex-1 flex justify-end">
                {navActions}
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Dynamic content area with consistent padding */}
      <div className="flex-1 overflow-auto">
        <div className="w-full px-4 py-3 sm:px-6 sm:py-4">
          {children}
        </div>
      </div>
    </div>
  )
}