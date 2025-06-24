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
        console.log("Checking onboarding status for path:", pathname)
        
        // Skip gate for auth and onboarding pages
        if (pathname.startsWith("/auth") || pathname === "/onboarding") {
          console.log("Skipping gate for auth/onboarding page")
          setIsLoading(false)
          return
        }

        const { data: { session } } = await supabase.auth.getSession()
        console.log("Session check:", !!session)
        
        if (!session?.user) {
          // Not authenticated, let them through
          console.log("No session, allowing through")
          setIsLoading(false)
          setUser(null)
          setNeedsOnboarding(false)
          return
        }

        setUser(session.user)
        console.log("User authenticated:", session.user.id)

        // User is authenticated, check if they have completed onboarding
        const { data: profile, error } = await supabase
          .from("profiles")
          .select("role")
          .eq("user_id", session.user.id)
          .single()

        console.log("Profile check:", { profile, error })

        if (error && error.code !== "PGRST116") {
          console.error("Error checking profile:", error)
          setIsLoading(false)
          return
        }

        // If user has no role (NULL), they need to complete onboarding
        if (!profile?.role) {
          console.log("User needs onboarding - role is:", profile?.role)
          setNeedsOnboarding(true)
          router.replace("/onboarding")
          return
        }

        console.log("User has role:", profile.role, "- allowing through")
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
      console.log("Auth state change:", event, !!session)
      
      if (event === "SIGNED_IN" && session) {
        setUser(session.user)
        // Only recheck if we're not on auth or onboarding pages
        if (!pathname.startsWith("/auth") && pathname !== "/onboarding") {
          await checkOnboardingStatus()
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
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  // Show loading while redirecting to onboarding
  if (needsOnboarding && pathname !== "/onboarding") {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white">Redirecting to onboarding...</div>
      </div>
    )
  }

  return <>{children}</>
} 