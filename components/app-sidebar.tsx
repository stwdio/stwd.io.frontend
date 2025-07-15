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
  IconMusic,
  IconMicrophone,
  IconBriefcase,
} from "@tabler/icons-react"

import { NavSection } from "@/components/nav-section"
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
import Link from "next/link"

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { user, profile, professionalRoles, loading, signOut } = useAuth()
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

  // Generate avatar URL using Dicebear
  const avatarSrc = profile?.avatar_url && profile.avatar_url.trim() !== ''
    ? profile.avatar_url
    : profile?.user_id 
      ? `https://api.dicebear.com/9.x/thumbs/svg?seed=${profile.user_id}&backgroundColor=ffffff&shapeColor=000000`
      : null

  const getDisplayName = () => {
    if (!profile) return "User"
    if (profile.username) return profile.username
    if (profile.first_name && profile.last_name) {
      return `${profile.first_name} ${profile.last_name}`
    }
    return profile.first_name || "User"
  }

  const getProfessionalRole = () => {
    if (!professionalRoles || professionalRoles.length === 0) return null
    return professionalRoles[0]?.role?.name || null
  }

  // Navigation items for Discover section
  const getDiscoverItems = () => [
    {
      title: "Studios",
      url: "/browse",
      icon: IconBuilding,
    },
    {
      title: "Artists",
      url: "/browse/artists",
      icon: IconMusic,
    },
    {
      title: "Engineers",
      url: "/browse/engineers",
      icon: IconMicrophone,
    },
    {
      title: "Industry",
      url: "/browse/industry",
      icon: IconBriefcase,
    },
  ]

  // Navigation items for Profile section
  const getProfileItems = () => [
    {
      title: "Messages",
      url: "/profile/messages",
      icon: IconMessage,
    },
    {
      title: "Lists",
      url: "/lists",
      icon: IconBookmark,
    },
    {
      title: "Dashboard",
      url: "/profile/dashboard",
      icon: IconDashboard,
    },
    {
      title: "Settings",
      url: "/profile/settings",
      icon: IconSettings,
    },
  ]

  const getUserData = () => ({
    name: getDisplayName(),
    email: user?.email || "",
    avatar: avatarSrc || "",
    role: profile?.system_role || "user",
    professionalRole: getProfessionalRole(),
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
    // Show the same layout as authenticated users
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
          <div className="flex flex-col h-full">
            {/* Discover Section */}
            <NavSection 
              title="Discover" 
              items={getDiscoverItems()} 
              onItemClick={handleMobileNavClick}
            />
            
            {/* Spacer to push profile section to bottom */}
            <div className="flex-1" />
            
            {/* Profile Section - same as logged in users */}
            <NavSection 
              title="Profile" 
              items={getProfileItems()} 
              onItemClick={handleMobileNavClick}
            />
            
            {/* Sign Out - only visible when collapsed (disabled for non-auth) */}
            <div className="hidden group-data-[collapsible=icon]:block px-3 pb-2">
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton disabled className="opacity-50 cursor-not-allowed">
                    <IconLogout className="h-4 w-4" />
                    <span className="sr-only">Sign Out</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </div>
          </div>
        </SidebarContent>
        
        <SidebarFooter>
          <div className="p-2">
            <div className="flex items-center gap-2 group-data-[collapsible=icon]:justify-center">
              {/* Guest avatar - clickable to go to sign up */}
              <a 
                href="/auth/login?signup=true" 
                className="flex items-center gap-3 p-2 rounded-md hover:bg-accent transition-colors group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:p-2 group-data-[collapsible=icon]:w-12 group-data-[collapsible=icon]:h-12"
                onClick={handleMobileNavClick}
              >
                <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center overflow-hidden flex-shrink-0 border border-black">
                  <img 
                    src="https://api.dicebear.com/9.x/thumbs/svg?seed=nouser&backgroundColor=ffffff&shapeColor=000000"
                    alt="Guest" 
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="flex flex-col items-start text-sm group-data-[collapsible=icon]:hidden">
                  <span className="font-medium">Guest</span>
                  <span className="text-xs text-muted-foreground">
                    Sign up to continue
                  </span>
                </div>
              </a>
              
              {/* Sign out button - disabled for non-auth users */}
              <Button
                variant="ghost"
                size="icon"
                disabled
                className="h-8 w-8 group-data-[collapsible=icon]:hidden opacity-50 cursor-not-allowed"
                title="Sign Out"
              >
                <IconLogout className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </SidebarFooter>
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
        <div className="flex flex-col h-full">
          {/* Discover Section */}
          <NavSection 
            title="Discover" 
            items={getDiscoverItems()} 
            onItemClick={handleMobileNavClick}
          />
          
          {/* Spacer to push profile section to bottom */}
          <div className="flex-1" />
          
          {/* Profile Section */}
          <NavSection 
            title="Profile" 
            items={getProfileItems()} 
            onItemClick={handleMobileNavClick}
          />
          
          {/* Sign Out - only visible when collapsed */}
          <div className="hidden group-data-[collapsible=icon]:block px-3 pb-2">
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton onClick={handleSignOut}>
                  <IconLogout className="h-4 w-4" />
                  <span className="sr-only">Sign Out</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </div>
        </div>
      </SidebarContent>
      
      <SidebarFooter>
        <div className="p-2">
          <div className="flex items-center gap-2 group-data-[collapsible=icon]:justify-center">
            {/* User info - clickable to go to profile */}
            <Link 
              href={`/profiles/${profile?.username}`} 
              className="flex items-center gap-3 p-2 rounded-md hover:bg-accent transition-colors group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:p-2 group-data-[collapsible=icon]:w-12 group-data-[collapsible=icon]:h-12"
              onClick={handleMobileNavClick}
            >
              <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center overflow-hidden flex-shrink-0 border border-black">
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
                <span className="text-xs text-muted-foreground">
                  {getProfessionalRole() || 'User'}
                </span>
              </div>
            </Link>
            
            {/* Sign out button - only visible when expanded */}
            <Button
              variant="ghost"
              size="icon"
              onClick={handleSignOut}
              className="h-8 w-8 group-data-[collapsible=icon]:hidden"
              title="Sign Out"
            >
              <IconLogout className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
