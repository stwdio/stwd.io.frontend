'use client'

import { ReactNode } from 'react'
import { Button } from '@/components/ui/button'
import { IconArrowLeft } from '@tabler/icons-react'

interface ConnectLayoutProps {
  sidebar: ReactNode
  content: ReactNode
  emptyState: ReactNode
  selectedId: number | null
  isMobile?: boolean
  mobileTitle?: string
  onBackToList?: () => void
}

export function ConnectLayout({ 
  sidebar,
  content,
  emptyState,
  selectedId,
  mobileTitle = 'Messages',
  onBackToList
}: ConnectLayoutProps) {
  return (
    <div className="h-full flex flex-col">
      {/* Desktop Layout */}
      <div className="hidden md:flex h-full min-h-0">
        {/* Sidebar */}
        <div className="w-96 border-r bg-muted/10 flex flex-col h-full">
          <div className="flex-1 overflow-hidden min-h-0 h-full">
            {sidebar}
          </div>
        </div>
        
        {/* Main Content */}
        <div className="flex-1 flex flex-col min-w-0">
          {selectedId ? content : emptyState}
        </div>
      </div>
      
      {/* Mobile Layout - Show list or conversation */}
      <div className="md:hidden h-full flex flex-col">
        {selectedId ? (
          <>
            {/* Mobile conversation view with back button */}
            <div className="p-4 border-b flex items-center gap-2">
              <Button 
                variant="ghost" 
                size="icon"
                onClick={onBackToList}
              >
                <IconArrowLeft className="h-5 w-5" />
              </Button>
              <h2 className="font-semibold truncate flex-1">
                {mobileTitle}
              </h2>
            </div>
            <div className="flex-1 min-h-0">
              {content}
            </div>
          </>
        ) : (
          <>
            {/* Mobile conversation list */}
            <div className="flex-1 overflow-hidden">
              {sidebar}
            </div>
          </>
        )}
      </div>
    </div>
  )
}