'use client'

import { ReactNode } from 'react'
import { usePathname } from 'next/navigation'
import { SectionNavigation } from '@/components/discover/section-navigation'
import { FloatingCartButton } from '@/components/floating-cart-button'

export default function DiscoverLayout({
  children,
}: {
  children: ReactNode
}) {
  const pathname = usePathname()
  // Don't show navigation on studio detail pages
  const isStudioDetailPage = pathname?.match(/^\/discover\/studios\/[^\/]+$/)
  const showNavigation = (pathname?.startsWith('/discover') || pathname?.startsWith('/connect')) && !isStudioDetailPage
  
  return (
    <div className="flex flex-col h-full">
      {/* Show navigation for both discover and connect routes, but not on studio detail pages */}
      {showNavigation && <SectionNavigation />}
      
      {/* Dynamic content area */}
      <div className="flex-1 overflow-hidden">
        {children}
      </div>
      
      {/* Floating cart button for quote basket */}
      <FloatingCartButton />
    </div>
  )
}