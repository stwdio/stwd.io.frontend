"use client"

import * as React from "react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth/auth-context"
import { Skeleton } from '@/components/ui/skeleton'
import {
  IconBuilding,
  IconSearch,
  IconSettings,
  IconMessage,
  IconDashboard,
  IconPlus,
  IconUser,
  IconLogout,
  IconBookmark,
} from "@tabler/icons-react"
import { generateIdenticon } from "@/lib/identicon"

import { NavMain } from "@/components/nav-main"
import { NavUser } from "@/components/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarRail,
  useSidebar,
} from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import Link from "next/link"

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { user, profile, loading, signOut } = useAuth()
  const router = useRouter()
  const { isMobile, setOpenMobile } = useSidebar()

  const handleSignOut = async () => {
    await signOut()
    router.push('/auth/login')
  }

  const handleMobileNavClick = () => {
    if (isMobile) {
      setOpenMobile(false)
    }
  }

  // State for avatar to avoid hydration mismatch
  const [avatarSrc, setAvatarSrc] = useState<string | null>(null)

  useEffect(() => {
    // Generate avatar on client side only
    if (profile?.user_id) {
      setAvatarSrc(generateIdenticon(profile.user_id))
    }
  }, [profile?.user_id])

  const getDisplayName = () => {
    if (!profile) return "User"
    if (profile.username) return profile.username
    if (profile.first_name && profile.last_name) {
      return `${profile.first_name} ${profile.last_name}`
    }
    return profile.first_name || "User"
  }

  // Navigation items based on role
  const getNavItems = () => {
    const baseItems = [
      {
        title: "Browse Studios",
        url: "/browse",
        icon: IconSearch,
      },
    ]

    // Add My Lists for creators only
    if (profile?.role === 'creator') {
      baseItems.push({
        title: "My Lists",
        url: "/lists",
        icon: IconBookmark,
      })
    }

    return baseItems
  }

  const getUserData = () => ({
    name: getDisplayName(),
    email: user?.email || "",
    avatar: avatarSrc || "",
    role: profile?.role || "creator",
  })

  if (loading) {
    return (
      <Sidebar collapsible="icon" {...props}>
        <SidebarContent>
          <div className="p-4 space-y-4">
            <div className="flex items-center space-x-3">
              <Skeleton className="h-8 w-8 rounded-full" />
              <Skeleton className="h-4 w-24" />
            </div>
            <div className="space-y-2">
              {Array.from({ length: 5 }, (_, i) => (
                <div key={i} className="flex items-center space-x-2">
                  <Skeleton className="h-4 w-4" />
                  <Skeleton className="h-4 w-20" />
                </div>
              ))}
            </div>
          </div>
        </SidebarContent>
        <SidebarRail />
      </Sidebar>
    )
  }

  if (!user) {
    // Show a minimal sidebar for non-authenticated users instead of redirecting
    return (
      <Sidebar collapsible="icon" {...props}>
        <SidebarHeader>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton
                asChild
                className="data-[slot=sidebar-menu-button]:!p-1.5"
              >
                <a href="/browse" onClick={handleMobileNavClick}>
                  <IconBuilding className="!size-5" />
                  <span className="text-base font-semibold">stwd.io</span>
                </a>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarHeader>
        
        <SidebarContent>
          <div className="p-4 text-center">
            <p className="text-muted-foreground text-sm mb-4">
              Sign in to access all features
            </p>
            <Button asChild className="w-full">
              <a href="/auth/login" onClick={handleMobileNavClick}>Sign In</a>
            </Button>
          </div>
        </SidebarContent>
        <SidebarRail />
      </Sidebar>
    )
  }

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:!p-1.5"
            >
              <a href="/browse" onClick={handleMobileNavClick}>
                <IconBuilding className="!size-5" />
                <span className="text-base font-semibold">stwd.io</span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      
      <SidebarContent>
        <NavMain items={getNavItems()} />
      </SidebarContent>
      
      <SidebarFooter>
        <div className="p-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="w-full justify-start p-2 group-data-[collapsible=icon]:justify-center">
                <div className="flex items-center gap-3 group-data-[collapsible=icon]:gap-0">
                  <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center overflow-hidden">
                    {avatarSrc ? (
                      <img 
                        src={avatarSrc} 
                        alt="Avatar" 
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <IconUser className="h-4 w-4 text-muted-foreground" />
                    )}
                  </div>
                  <div className="flex flex-col items-start text-sm group-data-[collapsible=icon]:hidden">
                    <span className="font-medium">{getDisplayName()}</span>
                    <span className="text-xs text-muted-foreground capitalize">
                      {profile?.role || 'creator'}
                    </span>
                  </div>
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-56">
              <DropdownMenuItem asChild>
                <Link href="/profile/dashboard" className="flex items-center" onClick={handleMobileNavClick}>
                  <IconDashboard className="mr-2 h-4 w-4" />
                  Dashboard
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/profile/messages" className="flex items-center" onClick={handleMobileNavClick}>
                  <IconMessage className="mr-2 h-4 w-4" />
                  Messages
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/profile/settings" className="flex items-center" onClick={handleMobileNavClick}>
                  <IconSettings className="mr-2 h-4 w-4" />
                  Settings
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleSignOut}>
                <IconLogout className="mr-2 h-4 w-4" />
                Sign Out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
