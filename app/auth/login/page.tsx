"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"
import { Auth } from "@supabase/auth-ui-react"
import { ThemeSupa } from "@supabase/auth-ui-shared"

export default function LoginPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check if user is already authenticated
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      
      if (session?.user) {
        // User is authenticated, check onboarding status
        await checkOnboardingStatus(session.user.id)
      } else {
        setLoading(false)
      }
    }

    checkUser()

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        await checkOnboardingStatus(session.user.id)
      }
    })

    return () => subscription.unsubscribe()
  }, [router])

  const checkOnboardingStatus = async (userId: string) => {
    try {
      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("user_id", userId)
        .single()
      
      if (!profile?.role) {
        router.push("/onboarding")
      } else {
        // Redirect based on role
        router.push(profile.role === "owner" ? "/dashboard" : "/browse")
      }
    } catch (error) {
      console.error("Error checking onboarding status:", error)
      // If profile doesn't exist, they need onboarding
      router.push("/onboarding")
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-white mb-2">Welcome back</h1>
          <p className="text-gray-400">Sign in to your account</p>
        </div>
        
        <div className="bg-gray-900 p-8 rounded-lg border border-gray-800">
          <Auth
            supabaseClient={supabase}
            appearance={{ 
              theme: ThemeSupa,
              style: {
                button: {
                  background: 'white',
                  color: 'black',
                  borderRadius: '8px',
                  border: 'none',
                  padding: '12px 24px',
                  fontSize: '14px',
                  fontWeight: '500',
                },
                anchor: {
                  color: '#60a5fa',
                  textDecoration: 'none',
                },
                container: {
                  backgroundColor: 'transparent',
                },
                input: {
                  backgroundColor: '#1f2937',
                  border: '1px solid #374151',
                  borderRadius: '8px',
                  color: 'white',
                  padding: '12px',
                },
                label: {
                  color: '#d1d5db',
                  fontSize: '14px',
                  fontWeight: '500',
                },
                message: {
                  color: '#ef4444',
                  fontSize: '14px',
                }
              }
            }}
            providers={['google']}
            redirectTo={`${window.location.origin}/auth/callback`}
            onlyThirdPartyProviders={false}
            magicLink={true}
            showLinks={true}
          />
        </div>
      </div>
    </div>
  )
} 