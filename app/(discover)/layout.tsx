import { ReactNode } from 'react'
import { DiscoverNavigation } from '@/components/discover/discover-navigation'

export default function DiscoverLayout({
  children,
}: {
  children: ReactNode
}) {
  return (
    <div className="flex flex-col h-full">
      {/* Static navigation header that doesn't re-render */}
      <DiscoverNavigation />
      
      {/* Dynamic content area */}
      <div className="flex-1 overflow-hidden">
        {children}
      </div>
    </div>
  )
}