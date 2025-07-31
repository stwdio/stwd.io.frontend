'use client'

import { useState } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/lib/auth/auth-context"
import { IconBriefcase, IconHome, IconLogout, IconMenu2, IconMessage, IconSearch, IconSettings, IconUser } from "@tabler/icons-react"
import Link from "next/link"
import { useRouter, usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { imagePresets } from "@/lib/utils/image-transformations"
import { MobileSidebar } from "@/components/mobile-sidebar"

interface SiteHeaderProps {
  className?: string
}

export function SiteHeader({ className }: SiteHeaderProps) {
  const { user, profile, professionalRoles, signOut } = useAuth()
  const router = useRouter()
  const pathname = usePathname()
  const isAuthenticated = !!user
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const handleSignOut = async () => {
    await signOut()
    router.push('/auth/login')
  }

  // Get the user's display name
  const displayName = profile?.first_name && profile?.last_name
    ? `${profile.first_name} ${profile.last_name}`
    : profile?.username || 'User'

  // Get the user's professional role for the badge
  const professionalRole = professionalRoles?.[0]?.role?.name

  // Generate avatar URL with optimization (using 80x80 for header avatars)
  const avatarUrl = imagePresets.avatar(profile?.avatar_url) || (profile ? 
    `https://api.dicebear.com/9.x/thumbs/svg?seed=${profile.user_id}&backgroundColor=ffffff&shapeColor=000000`
    : null)

  // Check if user is a studio owner or admin
  const isOwnerOrAdmin = profile?.system_role === 'owner' || profile?.system_role === 'admin'

  return (
    <header className={cn(
      "flex h-20 lg:h-24 shrink-0 items-center gap-2 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-40",
      className
    )}>
      <div className="flex w-full items-center justify-between">
        <div className="w-full px-4 sm:px-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            {/* Hamburger menu for mobile */}
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={() => setSidebarOpen(true)}
            >
              <IconMenu2 className="h-5 w-5" />
              <span className="sr-only">Open menu</span>
            </Button>

            {/* Logo or DISCOVER text based on route */}
            {pathname?.startsWith('/discover') || pathname?.startsWith('/connect') || pathname?.startsWith('/profiles') || pathname?.startsWith('/settings') ? (
              <>
                {/* Mobile version - show logo */}
                <Link href="/" className="lg:hidden text-xl font-bold">
                  stwd.io
                </Link>
                
                {/* Desktop version - full DISCOVER | CONNECT | SETTINGS */}
                <div className="hidden lg:flex items-center gap-4">
                  <Link 
                    href="/discover/studios" 
                    className={cn(
                      "text-6xl tracking-tight transition-all",
                      pathname?.startsWith('/discover') || pathname?.startsWith('/profiles')
                        ? "font-bold underline" 
                        : "font-light text-muted-foreground hover:text-foreground"
                    )}
                  >
                    DISCOVER
                  </Link>
                  <span className="text-6xl font-light text-muted-foreground">|</span>
                  <Link 
                    href="/connect/chat" 
                    className={cn(
                      "text-6xl tracking-tight transition-all",
                      pathname?.startsWith('/connect')
                        ? "font-bold underline" 
                        : "font-light text-muted-foreground hover:text-foreground"
                    )}
                  >
                    CONNECT
                  </Link>
                  {/* Dynamically show settings when in settings section */}
                  {pathname?.startsWith('/settings') && (
                    <>
                      <span className="text-6xl font-light text-muted-foreground">|</span>
                      <Link 
                        href="/settings"
                        className={cn(
                          "text-6xl tracking-tight transition-all",
                          "font-bold underline"
                        )}
                      >
                        SETTINGS
                      </Link>
                    </>
                  )}
                </div>
              </>
            ) : (
              <Link href="/" className="text-xl font-bold">
                stwd.io
              </Link>
            )}
          </div>

          {/* User profile section on the right - hidden on mobile */}
          {isAuthenticated && profile ? (
          <div className="hidden lg:block">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-3 hover:opacity-80 transition-opacity focus:outline-none">
                <div className="flex items-center gap-3">
                  {/* User info - hidden on mobile, visible on tablet and up */}
                  <div className="hidden sm:flex flex-col items-end">
                    <span className="text-sm font-medium">{displayName}</span>
                    {professionalRole && (
                      <Badge variant="secondary" className="text-xs">
                        {professionalRole}
                      </Badge>
                    )}
                  </div>
                  
                  {/* Avatar - always visible */}
                  <Avatar className="h-18 w-18">
                    <AvatarImage src={avatarUrl || undefined} alt={displayName} />
                    <AvatarFallback>{displayName.charAt(0)}</AvatarFallback>
                  </Avatar>
                </div>
              </button>
            </DropdownMenuTrigger>
            
            <DropdownMenuContent align="end" className="w-56">
              {/* User info in dropdown for mobile */}
              <div className="sm:hidden px-2 py-1.5">
                <div className="text-sm font-medium">{displayName}</div>
                {professionalRole && (
                  <Badge variant="secondary" className="text-xs mt-1">
                    {professionalRole}
                  </Badge>
                )}
              </div>
              <DropdownMenuSeparator className="sm:hidden" />
              
              {/* Menu items */}
              <DropdownMenuItem asChild>
                <Link href={`/profiles/${profile.username}`} className="cursor-pointer">
                  <IconUser className="mr-2 h-4 w-4" />
                  Profile
                </Link>
              </DropdownMenuItem>
              
              <DropdownMenuItem asChild>
                <Link href="/settings/account" className="cursor-pointer">
                  <IconSettings className="mr-2 h-4 w-4" />
                  Settings
                </Link>
              </DropdownMenuItem>
              
              {isOwnerOrAdmin && (
                <DropdownMenuItem asChild>
                  <Link href="/workspace" className="cursor-pointer">
                    <IconBriefcase className="mr-2 h-4 w-4" />
                    Dashboard
                  </Link>
                </DropdownMenuItem>
              )}
              
              <DropdownMenuSeparator />
              
              <DropdownMenuItem onClick={handleSignOut} className="cursor-pointer">
                <IconLogout className="mr-2 h-4 w-4" />
                Sign Out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          </div>
          ) : (
            /* Guest user - show sign in link on desktop only */
            <Link 
              href="/auth/login" 
              className="hidden lg:inline-block text-sm font-medium hover:opacity-80 transition-opacity"
            >
              Sign In
            </Link>
          )}
        </div>
      </div>

      {/* Mobile Sidebar */}
      <MobileSidebar open={sidebarOpen} onOpenChange={setSidebarOpen} />
    </header>
  )
}
