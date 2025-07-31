import { ReactNode } from 'react'
import { MainSectionNavigation } from '@/components/navigation/main-section-navigation'

export default function ConnectLayout({
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
    </div>
  )
}