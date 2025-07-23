'use client'

import { ReactNode } from 'react'
import { usePathname } from 'next/navigation'
import { SectionNavigation } from '@/components/discover/section-navigation'

export default function DiscoverLayout({
  children,
}: {
  children: ReactNode
}) {
  const pathname = usePathname()
  const showNavigation = pathname?.startsWith('/discover') || pathname?.startsWith('/connect')
  
  return (
    <div className="flex flex-col h-full">
      {/* Show navigation for both discover and connect routes */}
      {showNavigation && <SectionNavigation />}
      
      {/* Dynamic content area */}
      <div className="flex-1 overflow-hidden">
        {children}
      </div>
    </div>
  )
}