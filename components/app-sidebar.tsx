"use client"

import * as React from "react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
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
} from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import Link from "next/link"

interface Profile {
  id: number
  user_id: string
  role: "creator" | "owner" | "admin" | null
  first_name: string | null
  last_name: string | null
  username: string
  avatar_url: string | null
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const getUser = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      setUser(session?.user ?? null)
      
      if (session?.user) {
        await fetchProfile(session.user.id)
      }
      setLoading(false)
    }

    getUser()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event: any, session: any) => {
      setUser(session?.user ?? null)
      if (session?.user) {
        await fetchProfile(session.user.id)
      } else {
        setProfile(null)
      }
    })

    return () => subscription.unsubscribe()
  }, [supabase])

  const fetchProfile = async (userId: string) => {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("user_id", userId)
      .single()

    if (data) {
      setProfile(data)
    }
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/auth/login')
  }

  const getDisplayName = () => {
    if (!profile) return "User"
    if (profile.username) return profile.username
    if (profile.first_name && profile.last_name) {
      return `${profile.first_name} ${profile.last_name}`
    }
    return profile.first_name || "User"
  }

  const getAvatarSrc = () => {
    return generateIdenticon(profile?.user_id || "")
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

    // Add My Lists for creators and admins
    if (profile?.role === 'creator' || profile?.role === 'admin') {
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
    avatar: getAvatarSrc(),
    role: profile?.role || "creator",
  })

  if (loading) {
    return (
      <Sidebar collapsible="offcanvas" {...props}>
        <SidebarContent>
          <div className="flex items-center justify-center h-20">
            <div className="w-6 h-6 border-2 border-foreground border-t-transparent rounded-full animate-spin" />
          </div>
        </SidebarContent>
      </Sidebar>
    )
  }

  if (!user) {
    // Show a minimal sidebar for non-authenticated users instead of redirecting
    return (
      <Sidebar collapsible="offcanvas" {...props}>
        <SidebarHeader>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton
                asChild
                className="data-[slot=sidebar-menu-button]:!p-1.5"
              >
                <a href="/">
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
              <a href="/auth/login">Sign In</a>
            </Button>
          </div>
        </SidebarContent>
      </Sidebar>
    )
  }

  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:!p-1.5"
            >
              <a href="/">
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
              <Button variant="ghost" className="w-full justify-start p-2">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center overflow-hidden">
                    <img 
                      src={getAvatarSrc()} 
                      alt="Avatar" 
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div className="flex flex-col items-start text-sm">
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
                <Link href="/profile/dashboard" className="flex items-center">
                  <IconDashboard className="mr-2 h-4 w-4" />
                  Dashboard
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/profile/messages" className="flex items-center">
                  <IconMessage className="mr-2 h-4 w-4" />
                  Messages
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/profile/settings" className="flex items-center">
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
    </Sidebar>
  )
}
