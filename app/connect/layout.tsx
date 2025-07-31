import { ReactNode } from 'react'
import { MainSectionNavigation } from '@/components/navigation/main-section-navigation'
import { FloatingGroupChatButton } from '@/components/floating-group-chat-button'

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
      
      {/* Floating group chat button for connections page */}
      <FloatingGroupChatButton />
    </div>
  )
}