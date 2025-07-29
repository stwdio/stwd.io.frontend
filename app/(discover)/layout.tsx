import { ReactNode } from 'react'
import { MainSectionNavigation } from '@/components/navigation/main-section-navigation'
import { FloatingCartButton } from '@/components/floating-cart-button'

export default function DiscoverLayout({
  children,
}: {
  children: ReactNode
}) {
  return (
    <div className="flex flex-col h-full">
      {/* Main navigation header */}
      <MainSectionNavigation />
      
      {/* Dynamic content area */}
      <div className="flex-1 overflow-hidden">
        {children}
      </div>
      
      {/* Floating cart button for quote basket */}
      <FloatingCartButton />
    </div>
  )
}