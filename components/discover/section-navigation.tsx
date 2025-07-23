'use client'

import { cn } from '@/lib/utils'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

export function SectionNavigation() {
  const pathname = usePathname()
  
  // Determine which section we're in
  const isDiscoverSection = pathname?.startsWith('/discover')
  const isConnectSection = pathname?.startsWith('/connect')
  
  // Determine active states for discover sub-navigation
  const isStudiosActive = pathname === '/discover/studios' || pathname === '/discover'
  const isPeopleActive = pathname === '/discover/people'
  
  // Determine active states for connect sub-navigation
  const isChatActive = pathname?.startsWith('/connect/chat')
  const isQuotesActive = pathname?.startsWith('/connect/quotes')
  const isProfileActive = pathname?.startsWith('/connect/profile')
  
  if (isDiscoverSection) {
    return (
      <div className="flex-shrink-0 bg-background py-4">
        <div className="w-full px-4 sm:px-6">
          <div className="flex items-center gap-6 text-4xl">
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
        </div>
      </div>
    )
  }
  
  if (isConnectSection) {
    return (
      <div className="flex-shrink-0 bg-background py-4">
        <div className="w-full px-4 sm:px-6">
          <div className="flex items-center gap-6 text-4xl">
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
            <span className="text-4xl text-muted-foreground font-light">|</span>
            <Link
              href="/connect/profile"
              className={cn(
                "transition-all",
                isProfileActive 
                  ? "font-bold underline" 
                  : "font-light text-muted-foreground hover:text-foreground"
              )}
            >
              PROFILE
            </Link>
          </div>
        </div>
      </div>
    )
  }
  
  return null
}