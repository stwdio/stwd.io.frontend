'use client'

import { usePathname } from 'next/navigation'
import { ReactNode } from 'react'

export function SettingsPageContent({ children }: { children: ReactNode }) {
  const pathname = usePathname()
  
  // Determine which settings sub-page we're on
  const getSubView = () => {
    if (pathname?.includes('/profile')) return 'Profile'
    if (pathname?.includes('/professional')) return 'Professional'
    return 'Account' // default to account
  }
  
  const subView = getSubView()
  
  return (
    <div className="h-full flex flex-col">
      {/* Mobile header */}
      <div className="flex-shrink-0 bg-background lg:hidden">
        <div className="w-full px-4 sm:px-6">
          <div className="py-4">
            <h2 className="text-3xl font-bold">SETTINGS</h2>
            <h3 className="text-xl font-medium uppercase text-muted-foreground">
              {subView}
            </h3>
          </div>
        </div>
      </div>

      {/* Main content area */}
      <div className="flex-1 overflow-hidden">
        <div className="h-full overflow-auto">
          <div className="w-full h-full">
            {children}
          </div>
        </div>
      </div>
    </div>
  )
}