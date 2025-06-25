"use client"

import * as React from "react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import {
  IconBuilding,
  IconSearch,
  IconSettings,
  IconMessage,
  IconDashboard,
  IconPlus,
  IconShoppingCart,
  IconUser,
  IconLogout,
} from "@tabler/icons-react"
import { supabase } from "@/lib/supabase"
import { generateIdenticon } from "@/lib/identicon"
import { useQuoteBasket } from "@/lib/store/quote-basket"

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
} from "@/components/ui/sidebar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

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
  const { studios: basketStudios, toggleBasket } = useQuoteBasket()
  const router = useRouter()

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

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      setUser(session?.user ?? null)
      if (session?.user) {
        await fetchProfile(session.user.id)
      } else {
        setProfile(null)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

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
        url: "/dashboard",
        icon: IconSearch,
      },
      {
        title: "Messages",
        url: "/messages",
        icon: IconMessage,
      },
    ]

    if (profile?.role === "owner" || profile?.role === "admin") {
      baseItems.splice(1, 0, {
        title: "My Studios",
        url: "/dashboard/studios",
        icon: IconBuilding,
      })
    }

    if (profile?.role === "creator") {
      baseItems.splice(1, 0, {
        title: "My Inquiries",
        url: "/dashboard/my-inquiries",
        icon: IconDashboard,
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
    return null
  }

  if (!user) {
    // If not logged in, show minimal sidebar or redirect
    router.push('/auth/login')
    return null
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
        
        {/* Creator-specific features */}
        {profile?.role === "creator" && (
          <div className="mt-4 px-3">
            <Button
              variant="outline"
              size="sm"
              onClick={toggleBasket}
              className="w-full justify-start relative"
            >
              <IconShoppingCart className="h-4 w-4 mr-2" />
              Quote Basket
              {basketStudios.length > 0 && (
                <Badge 
                  variant="default" 
                  className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-xs"
                >
                  {basketStudios.length}
                </Badge>
              )}
            </Button>
          </div>
        )}

        {/* Owner-specific features */}
        {(profile?.role === "owner" || profile?.role === "admin") && (
          <div className="mt-4 px-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push('/dashboard/studios/new')}
              className="w-full justify-start"
            >
              <IconPlus className="h-4 w-4 mr-2" />
              Add Studio
            </Button>
          </div>
        )}
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
              {(profile?.role === "owner" || profile?.role === "admin") && (
                <DropdownMenuItem onClick={() => router.push('/dashboard/owner')}>
                  <IconDashboard className="mr-2 h-4 w-4" />
                  Owner Dashboard
                </DropdownMenuItem>
              )}
              <DropdownMenuItem onClick={() => router.push('/settings')}>
                <IconSettings className="mr-2 h-4 w-4" />
                Settings
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
