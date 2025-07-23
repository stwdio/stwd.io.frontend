'use client'

import { cn } from '@/lib/utils'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

export function DiscoverNavigation() {
  const pathname = usePathname()
  
  // Determine active state
  const isStudiosActive = pathname === '/discover' || (pathname?.startsWith('/discover') && !pathname?.includes('/people'))
  const isPeopleActive = pathname?.includes('/people')
  const isChatActive = pathname?.startsWith('/chat')
  
  return (
    <div className="flex-shrink-0 bg-background border-b">
      <div className="px-4 sm:px-6 py-3">
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
      </div>
    </div>
  )
}