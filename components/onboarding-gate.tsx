"use client"

import { useEffect, useState } from "react"
import { useRouter, usePathname } from "next/navigation"
import { supabase } from "@/lib/supabase"

interface OnboardingGateProps {
  children: React.ReactNode
}

export function OnboardingGate({ children }: OnboardingGateProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  const [needsOnboarding, setNeedsOnboarding] = useState(false)
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    const checkOnboardingStatus = async () => {
      try {
        // Skip gate for auth and onboarding pages, but still check initial session
        if (pathname.startsWith("/auth") || pathname === "/onboarding") {
          setIsLoading(false)
          return
        }

        const { data: { session } } = await supabase.auth.getSession()
        
        if (!session?.user) {
          // Not authenticated, let them through
          setIsLoading(false)
          setUser(null)
          setNeedsOnboarding(false)
          return
        }

        setUser(session.user)

        // User is authenticated, check if they have completed onboarding
        const { data: profile, error } = await supabase
          .from("profiles")
          .select("role")
          .eq("user_id", session.user.id)
          .single()

        if (error && error.code !== "PGRST116") {
          console.error("Error checking profile:", error)
          setIsLoading(false)
          return
        }

        // If user has no role (NULL), they need to complete onboarding
        if (!profile?.role) {
          setNeedsOnboarding(true)
          router.replace("/onboarding")
          return
        }
        setNeedsOnboarding(false)
        setIsLoading(false)
      } catch (err) {
        console.error("Unexpected error in onboarding gate:", err)
        setIsLoading(false)
      }
    }

    checkOnboardingStatus()

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event: string, session: any) => {
      if (event === "SIGNED_IN" && session) {
        setUser(session.user)
        
        // Check profile and route regardless of current page
        const { data: profile } = await supabase
          .from("profiles")
          .select("role")
          .eq("user_id", session.user.id)
          .single()

        if (!profile?.role) {
          setNeedsOnboarding(true)
          router.replace("/onboarding")
        } else {
          setNeedsOnboarding(false)
          setIsLoading(false)
          router.replace("/browse")
        }
      } else if (event === "SIGNED_OUT") {
        setUser(null)
        setIsLoading(false)
        setNeedsOnboarding(false)
      }
    })

    return () => subscription.unsubscribe()
  }, [pathname, router])

  // Show loading while checking auth status
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-foreground border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  // Show loading while redirecting to onboarding
  if (needsOnboarding && pathname !== "/onboarding") {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-foreground">Redirecting to onboarding...</div>
      </div>
    )
  }

  return <>{children}</>
} 