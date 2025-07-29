'use client'

import { cn } from '@/lib/utils'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

export function MainSectionNavigation() {
  const pathname = usePathname()
  
  // Determine which main section we're in
  const isDiscoverSection = pathname?.startsWith('/discover') || pathname?.startsWith('/profiles')
  const isConnectSection = pathname?.startsWith('/connect') || pathname?.startsWith('/chat')
  
  // Determine active sub-navigation states
  const isStudiosActive = pathname?.startsWith('/discover/studios') || pathname === '/discover'
  const isPeopleActive = pathname?.startsWith('/discover/people') || pathname?.startsWith('/profiles')
  const isChatActive = pathname?.startsWith('/connect/chat') || pathname?.startsWith('/chat')
  const isQuotesActive = pathname?.startsWith('/connect/quotes')
  
  return (
    <div className="hidden lg:block flex-shrink-0 bg-background">
      <div className="w-full px-4 sm:px-6">
        {/* Sub Navigation based on section */}
        {isDiscoverSection && (
          <div className="flex items-center gap-6 text-4xl py-4">
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
          </div>
        )}
        
        {isConnectSection && (
          <div className="flex items-center gap-6 text-4xl py-4">
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
              href="/connect/quotes"
              className={cn(
                "transition-all",
                isQuotesActive 
                  ? "font-bold underline" 
                  : "font-light text-muted-foreground hover:text-foreground"
              )}
            >
              QUOTES
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}