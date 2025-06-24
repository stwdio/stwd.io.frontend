"use client"

import React, { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { User, Settings, LogOut, LayoutDashboard, ShoppingCart } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { generateIdenticon } from "@/lib/identicon"
import { useQuoteBasket } from "@/lib/store/quote-basket"
import { QuoteBasketDialog } from "@/components/quote-basket-dialog"

interface Profile {
  id: number
  user_id: string
  role: "creator" | "owner" | "admin" | null
  stripe_customer_id: string | null
  first_name: string | null
  middle_name: string | null
  last_name: string | null
  username: string
  avatar_url: string | null
}

export function Header() {
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const { studios, toggleBasket } = useQuoteBasket()

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }: { data: { session: any } }) => {
      setUser(session?.user ?? null)
      if (session?.user) {
        fetchProfile(session.user.id)
      }
    })

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event: string, session: any) => {
      setUser(session?.user ?? null)
      if (session?.user) {
        fetchProfile(session.user.id)
      } else {
        setProfile(null)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase.from("profiles").select("*").eq("user_id", userId).single()

      if (error && error.code !== "PGRST116") {
        console.error("Profile fetch error:", error)
        return
      }

      if (data) {
        setProfile(data)
      } else {
        console.log("No profile found - should be created by trigger")
      }
    } catch (err) {
      console.error("Profile handling error:", err)
    }
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut()
  }

  const getAvatarSrc = () => {
    return generateIdenticon(profile?.user_id || "")
  }

  const getDisplayName = () => {
    // For frictionless signup, show username first
    if (profile?.username) {
      return profile.username
    }
    // Fallback to full name if available
    if (profile?.first_name && profile?.last_name) {
      return `${profile.first_name} ${profile.last_name}`
    }
    return profile?.first_name || "User"
  }

  const canAccessDashboard = profile?.role === "owner" || profile?.role === "admin"

  return (
    <header className="sticky top-0 z-50 w-full border-b border-gray-800 bg-black/95 backdrop-blur supports-[backdrop-filter]:bg-black/60">
      <div className="mx-auto max-w-7xl flex h-16 items-center justify-between px-4 w-full">
        <Link href="/" className="text-2xl font-bold text-white">
          stwd.io
        </Link>

        <nav className="hidden md:flex items-center space-x-6">
          <Link href="/browse" className="text-gray-300 hover:text-white transition-colors">
            Browse Studios
          </Link>
          {(profile?.role === "owner" || profile?.role === "admin") && (
            <Link href="/claim-studio" className="text-gray-300 hover:text-white transition-colors">
              Claim Studio
            </Link>
          )}
          <Link href="/about" className="text-gray-300 hover:text-white transition-colors">
            About
          </Link>
        </nav>

        <div className="flex items-center space-x-4">
          {user && (
            <Button
              variant="outline"
              size="sm"
              onClick={toggleBasket}
              className="relative bg-black text-white border-gray-700 hover:bg-gray-900"
            >
              <ShoppingCart className="h-4 w-4 mr-2" />
              Quote Basket
              {studios.length > 0 && (
                <Badge 
                  variant="default" 
                  className="absolute -top-2 -right-2 h-5 w-5 p-0 flex items-center justify-center text-xs"
                >
                  {studios.length}
                </Badge>
              )}
            </Button>
          )}
          
          {user ? (
            <div className="flex items-center space-x-3">
              <span className="text-gray-300 text-sm font-medium hidden md:block">
                {getDisplayName()}
              </span>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={getAvatarSrc() || "/placeholder.svg"} alt="User" />
                      <AvatarFallback>
                        <User className="h-5 w-5" />
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end">
                {canAccessDashboard && (
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard" className="flex items-center">
                      <LayoutDashboard className="mr-2 h-4 w-4" />
                      Dashboard
                    </Link>
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem asChild>
                  <Link href="/settings" className="flex items-center">
                    <Settings className="mr-2 h-4 w-4" />
                    Settings
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleSignOut} className="flex items-center">
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            </div>
          ) : (
            <Link href="/auth/login">
              <Button variant="outline" className="bg-black text-white border-gray-700 hover:bg-gray-900">
                Sign In
              </Button>
            </Link>
          )}
        </div>
      </div>
      
      <QuoteBasketDialog />
    </header>
  )
}
