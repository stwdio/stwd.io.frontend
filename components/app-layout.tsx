'use client'

import { cn } from '@/lib/utils'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ReactNode } from 'react'

type NavigationItem = 'studios' | 'people' | 'chat' | 'workspace' | 'settings' | 'profile'

interface AppLayoutProps {
  children: ReactNode
  showSubNav?: boolean
  subNavContent?: ReactNode
}

export function AppLayout({ children, showSubNav, subNavContent }: AppLayoutProps) {
  const pathname = usePathname()
  
  // Determine active navigation based on pathname
  const getActiveNav = (): NavigationItem | null => {
    if (pathname?.startsWith('/discover')) {
      if (pathname.includes('/people')) return 'people'
      return 'studios'
    }
    if (pathname?.startsWith('/connect/chat')) return 'chat'
    if (pathname?.startsWith('/workspace')) return 'workspace'
    if (pathname?.startsWith('/settings')) return 'settings'
    if (pathname?.startsWith('/profiles')) return 'profile'
    return null
  }
  
  const activeNav = getActiveNav()
  
  // Determine which navigation items to show based on the page
  const showMainNav = ['studios', 'people', 'chat'].includes(activeNav || '')
  const showSettingsNav = activeNav === 'settings'
  const showWorkspaceNav = activeNav === 'workspace'
  
  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] lg:h-[calc(100vh-5rem)]">
      {/* Static top navigation */}
      <div className="border-b bg-background">
        <div className="px-4 sm:px-6 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {/* Main navigation (Studios, People, Chat) */}
              {showMainNav && (
                <div className="flex items-center gap-3 text-base">
                  <Link
                    href="/discover"
                    className={cn(
                      "font-medium transition-all",
                      activeNav === 'studios' 
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
                      activeNav === 'people' 
                        ? "text-foreground border-b-2 border-foreground" 
                        : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    PEOPLE
                  </Link>
                  
                  {/* People sub-navigation */}
                  {activeNav === 'people' && subNavContent}
                  
                  <span className="text-muted-foreground">|</span>
                  <Link
                    href="/connect/chat"
                    className={cn(
                      "font-medium transition-all",
                      activeNav === 'chat' 
                        ? "text-foreground border-b-2 border-foreground" 
                        : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    CHAT
                  </Link>
                </div>
              )}
              
              {/* Settings navigation */}
              {showSettingsNav && (
                <div className="flex items-center gap-3 text-base">
                  <h1 className="font-medium text-foreground">SETTINGS</h1>
                </div>
              )}
              
              {/* Workspace navigation */}
              {showWorkspaceNav && (
                <div className="flex items-center gap-3 text-base">
                  <h1 className="font-medium text-foreground">WORKSPACE</h1>
                </div>
              )}
              
              {/* Profile page */}
              {activeNav === 'profile' && (
                <div className="flex items-center gap-3 text-base">
                  <h1 className="font-medium text-foreground">PROFILE</h1>
                </div>
              )}
            </div>
            
            {/* Additional navigation content (search, filters, etc) */}
            {showSubNav && subNavContent}
          </div>
        </div>
      </div>
      
      {/* Dynamic content area with consistent padding */}
      <div className="flex-1 overflow-auto">
        <div className="px-4 sm:px-6 py-6">
          {children}
        </div>
      </div>
    </div>
  )
}