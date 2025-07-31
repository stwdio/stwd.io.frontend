'use client'

import { cn } from '@/lib/utils'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

export function MainSectionNavigation() {
  const pathname = usePathname()
  
  // Determine which main section we're in
  const isDiscoverSection = pathname?.startsWith('/discover') || pathname?.startsWith('/profiles')
  const isConnectSection = pathname?.startsWith('/connect')
  const isSettingsSection = pathname?.startsWith('/settings')
  
  // Determine active sub-navigation states
  const isStudiosActive = pathname?.startsWith('/discover/studios') || pathname === '/discover'
  const isPeopleActive = pathname?.startsWith('/discover/people') || pathname?.startsWith('/profiles')
  const isChatActive = pathname?.startsWith('/connect/chat') || pathname === '/connect'
  const isConnectionsActive = pathname?.startsWith('/connect/connections')
  const isAccountActive = pathname?.startsWith('/settings/account') || pathname === '/settings'
  const isProfileActive = pathname?.startsWith('/settings/profile')
  const isProfessionalActive = pathname?.startsWith('/settings/professional')
  
  return (
    <div className="hidden lg:block flex-shrink-0 bg-background">
      <div className="w-full px-4 sm:px-6">
        {/* Sub Navigation based on section - single static component */}
        <div className="flex items-center gap-6 text-4xl py-4">
            {isDiscoverSection && (
              <>
                <Link
                  href="/discover/studios"
                  className={cn(
                    "transition-all",
                    isStudiosActive 
                      ? "font-bold underline" 
                      : "font-light text-muted-foreground hover:text-foreground"
                  )}
                >
                  STUDIOS
                </Link>
                <span className="text-4xl text-muted-foreground font-light">|</span>
                <Link
                  href="/discover/people"
                  className={cn(
                    "transition-all",
                    isPeopleActive 
                      ? "font-bold underline" 
                      : "font-light text-muted-foreground hover:text-foreground"
                  )}
                >
                  PEOPLE
                </Link>
              </>
            )}
            
            {isConnectSection && (
              <>
                <Link
                  href="/connect/chat"
                  className={cn(
                    "transition-all",
                    isChatActive 
                      ? "font-bold underline" 
                      : "font-light text-muted-foreground hover:text-foreground"
                  )}
                >
                  CHAT
                </Link>
                <span className="text-4xl text-muted-foreground font-light">|</span>
                <Link
                  href="/connect/connections"
                  className={cn(
                    "transition-all",
                    isConnectionsActive 
                      ? "font-bold underline" 
                      : "font-light text-muted-foreground hover:text-foreground"
                  )}
                >
                  CONNECTIONS
                </Link>
              </>
            )}

            {isSettingsSection && (
              <>
                <Link
                  href="/settings/account"
                  className={cn(
                    "transition-all",
                    isAccountActive 
                      ? "font-bold underline" 
                      : "font-light text-muted-foreground hover:text-foreground"
                  )}
                >
                  ACCOUNT
                </Link>
                <span className="text-4xl text-muted-foreground font-light">|</span>
                <Link
                  href="/settings/profile"
                  className={cn(
                    "transition-all",
                    isProfileActive 
                      ? "font-bold underline" 
                      : "font-light text-muted-foreground hover:text-foreground"
                  )}
                >
                  PROFILE
                </Link>
                <span className="text-4xl text-muted-foreground font-light">|</span>
                <Link
                  href="/settings/professional"
                  className={cn(
                    "transition-all",
                    isProfessionalActive 
                      ? "font-bold underline" 
                      : "font-light text-muted-foreground hover:text-foreground"
                  )}
                >
                  PROFESSIONAL
                </Link>
              </>
            )}
        </div>
      </div>
    </div>
  )
}