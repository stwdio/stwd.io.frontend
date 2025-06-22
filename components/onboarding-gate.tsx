"use client"

import { useEffect, useState } from "react"
import { useRouter, usePathname } from "next/navigation"
import { supabase } from "@/lib/supabase"

interface OnboardingGateProps {
  children: React.ReactNode
}

export function OnboardingGate({ children }: OnboardingGateProps) {
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    const checkOnboardingStatus = async () => {
      try {
        // Skip gate for auth and onboarding pages
        if (pathname.startsWith("/auth") || pathname === "/onboarding") {
          setIsLoading(false)
          return
        }

        const { data: { session } } = await supabase.auth.getSession()
        
        if (!session) {
          // Not authenticated, let them through (auth will be handled by individual pages)
          setIsLoading(false)
          return
        }

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
          // Use replace instead of push to avoid back button issues
          router.replace("/onboarding")
          return
        }

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
        // Recheck onboarding status when user signs in
        checkOnboardingStatus()
      } else if (event === "SIGNED_OUT") {
        // Reset state when user signs out
        setIsLoading(false)
      }
    })

    return () => subscription.unsubscribe()
  }, [pathname, router])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return <>{children}</>
} 