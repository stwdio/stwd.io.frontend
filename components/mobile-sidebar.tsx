'use client'

import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useAuth } from '@/lib/auth/auth-context'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { imagePresets } from '@/lib/utils/image-transformations'
import {
  IconBriefcase,
  IconLogout,
  IconMessage,
  IconSettings,
  IconUsers,
  IconQuote,
  IconBuildingStore,
  IconUserCircle
} from '@tabler/icons-react'

interface MobileSidebarProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function MobileSidebar({ open, onOpenChange }: MobileSidebarProps) {
  const { user, profile, professionalRoles, signOut } = useAuth()
  const router = useRouter()
  const pathname = usePathname()
  const isAuthenticated = !!user

  const handleSignOut = async () => {
    await signOut()
    onOpenChange(false)
    router.push('/auth/login')
  }

  const handleNavigation = (href: string) => {
    router.push(href)
    onOpenChange(false)
  }

  // Get the user's display name
  const displayName = profile?.first_name && profile?.last_name
    ? `${profile.first_name} ${profile.last_name}`
    : profile?.username || 'User'

  // Get the user's professional role for the badge
  const professionalRole = professionalRoles?.[0]?.role?.name

  // Generate avatar URL with optimization
  const avatarUrl = imagePresets.avatar(profile?.avatar_url) || (profile ? 
    `https://api.dicebear.com/9.x/thumbs/svg?seed=${profile.user_id}&backgroundColor=ffffff&shapeColor=000000`
    : null)

  // Check if user is a studio owner or admin
  const isOwnerOrAdmin = profile?.system_role === 'owner' || profile?.system_role === 'admin'

  const navigationItems = [
    {
      section: 'Discover',
      items: [
        { href: '/discover/studios', label: 'Studios', icon: IconBuildingStore },
        { href: '/discover/people', label: 'People', icon: IconUsers },
      ]
    },
    ...(isAuthenticated ? [{
      section: 'Connect',
      items: [
        { href: '/connect/chat', label: 'Messages', icon: IconMessage },
        { href: '/connect/quotes', label: 'Quotes', icon: IconQuote },
        { href: `/profiles/${profile?.username}`, label: 'My Profile', icon: IconUserCircle },
      ]
    }] : [])
  ]

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="left" className="w-80 p-0">
        <SheetHeader className="sr-only">
          <SheetTitle>Navigation Menu</SheetTitle>
        </SheetHeader>
        
        <div className="flex h-full flex-col">
          {/* User Profile Section */}
          {isAuthenticated && profile ? (
            <div className="border-b p-6">
              <div className="flex items-center gap-3">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={avatarUrl || undefined} alt={displayName} />
                  <AvatarFallback>{displayName.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="font-medium">{displayName}</div>
                  {professionalRole && (
                    <Badge variant="secondary" className="mt-1 text-xs">
                      {professionalRole}
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="border-b p-6">
              <Link href="/" className="text-xl font-bold">
                stwd.io
              </Link>
            </div>
          )}

          {/* Navigation Items */}
          <ScrollArea className="flex-1">
            <div className="p-4">
              {navigationItems.map((section, sectionIndex) => (
                <div key={section.section} className={cn(sectionIndex > 0 && "mt-6")}>
                  <h3 className="mb-2 px-2 text-sm font-semibold text-muted-foreground">
                    {section.section}
                  </h3>
                  <div className="space-y-1">
                    {section.items.map((item) => {
                      const Icon = item.icon
                      const isActive = pathname === item.href || 
                        (item.href !== '/discover/people' && pathname?.startsWith(item.href))
                      
                      return (
                        <Button
                          key={item.href}
                          variant={isActive ? "secondary" : "ghost"}
                          className={cn(
                            "w-full justify-start",
                            isActive && "font-medium"
                          )}
                          onClick={() => handleNavigation(item.href)}
                        >
                          <Icon className="mr-2 h-4 w-4" />
                          {item.label}
                        </Button>
                      )
                    })}
                  </div>
                </div>
              ))}

              {/* Admin/Owner Dashboard Link */}
              {isOwnerOrAdmin && (
                <div className="mt-6">
                  <h3 className="mb-2 px-2 text-sm font-semibold text-muted-foreground">
                    Workspace
                  </h3>
                  <Button
                    variant={pathname?.startsWith('/workspace') ? "secondary" : "ghost"}
                    className="w-full justify-start"
                    onClick={() => handleNavigation('/workspace')}
                  >
                    <IconBriefcase className="mr-2 h-4 w-4" />
                    Dashboard
                  </Button>
                </div>
              )}

              {/* Settings & Account */}
              {isAuthenticated && (
                <div className="mt-6">
                  <h3 className="mb-2 px-2 text-sm font-semibold text-muted-foreground">
                    Account
                  </h3>
                  <div className="space-y-1">
                    <Button
                      variant={pathname?.startsWith('/settings') ? "secondary" : "ghost"}
                      className="w-full justify-start"
                      onClick={() => handleNavigation('/settings/account')}
                    >
                      <IconSettings className="mr-2 h-4 w-4" />
                      Settings
                    </Button>
                    <Button
                      variant="ghost"
                      className="w-full justify-start text-red-600 hover:text-red-600 hover:bg-red-50"
                      onClick={handleSignOut}
                    >
                      <IconLogout className="mr-2 h-4 w-4" />
                      Sign Out
                    </Button>
                  </div>
                </div>
              )}

              {/* Sign In for Guests */}
              {!isAuthenticated && (
                <div className="mt-6">
                  <Button
                    variant="default"
                    className="w-full"
                    onClick={() => handleNavigation('/auth/login')}
                  >
                    Sign In
                  </Button>
                </div>
              )}
            </div>
          </ScrollArea>
        </div>
      </SheetContent>
    </Sheet>
  )
}