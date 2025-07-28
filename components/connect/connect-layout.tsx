'use client'

import { useState, ReactNode } from 'react'
import { Button } from '@/components/ui/button'
import { IconMenu2 } from '@tabler/icons-react'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'

interface ConnectLayoutProps {
  sidebar: ReactNode
  content: ReactNode
  emptyState: ReactNode
  selectedId: number | null
  isMobile?: boolean
  mobileTitle?: string
}

export function ConnectLayout({ 
  sidebar,
  content,
  emptyState,
  selectedId,
  mobileTitle = 'Messages'
}: ConnectLayoutProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

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
      
      {/* Mobile Layout */}
      <div className="md:hidden h-full">
        {selectedId ? (
          <div className="flex flex-col h-full">
            <div className="p-4 border-b flex items-center gap-2">
              <Sheet open={isSidebarOpen} onOpenChange={setIsSidebarOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <IconMenu2 className="h-5 w-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-96 p-0">
                  <div className="h-full flex flex-col">
                    <div className="flex-1 overflow-hidden min-h-0">
                      {sidebar}
                    </div>
                  </div>
                </SheetContent>
              </Sheet>
              
              <h2 className="font-semibold truncate">
                {mobileTitle}
              </h2>
            </div>
            
            <div className="flex-1 min-h-0">
              {content}
            </div>
          </div>
        ) : (
          <div className="h-full flex flex-col">
            <div className="p-4 border-b">
              <Button 
                onClick={() => setIsSidebarOpen(true)}
                className="w-full"
                variant="outline"
              >
                <IconMenu2 className="mr-2 h-4 w-4" />
                View All
              </Button>
            </div>
            
            {emptyState}
            
            <Sheet open={isSidebarOpen} onOpenChange={setIsSidebarOpen}>
              <SheetTrigger className="sr-only" />
              <SheetContent side="left" className="w-80 p-0">
                <div className="h-full flex flex-col">
                  <div className="flex-1 overflow-hidden min-h-0">
                    {sidebar}
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        )}
      </div>
    </div>
  )
}