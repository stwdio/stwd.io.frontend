"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { User, Building } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/lib/auth/auth-context"

export default function OnboardingPage() {
  const [loading, setLoading] = useState(false)
  const { user, profile, loading: authLoading } = useAuth()
  const [mounted, setMounted] = useState(false)
  const router = useRouter()
  const { toast } = useToast()
  const supabase = createClient()

  useEffect(() => {
    setMounted(true)
    
    if (!authLoading) {
      if (!user) {
        // Not authenticated, redirect to login
        router.push("/auth/login")
        return
      }

      console.log("Onboarding: User authenticated:", user.id)
      
      // Check if user already has a role
      if (profile?.role) {
        // User already has a role, redirect appropriately
        console.log("User already has role:", profile.role)
        router.push(profile.role === "owner" ? "/profile/dashboard" : "/browse")
      }
    }
  }, [authLoading, user, profile, router])

  const handleRoleSelection = async (role: "creator" | "owner") => {
    if (!user) return

    setLoading(true)
    
    try {
      const { error } = await supabase
        .from("profiles")
        .update({ role })
        .eq("user_id", user.id)

      if (error) {
        console.error("Error updating role:", error)
        toast({
          title: "Error",
          description: "Failed to set your role. Please try again.",
          variant: "destructive",
        })
        setLoading(false)
        return
      }

      toast({
        title: "Welcome to stwd.io!",
        description: `Your account has been set up as a ${role}.`,
      })

      // Redirect based on role
      router.push(role === "owner" ? "/profile/dashboard" : "/browse")
    } catch (err) {
      console.error("Unexpected error:", err)
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  if (!mounted) {
    return (
      <div className="h-screen bg-black flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="h-screen bg-black flex items-center justify-center px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl w-full space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-white mb-4">
            Welcome to stwd.io! What are you here to do?
          </h1>
          <p className="text-gray-400 text-lg">
            Choose your role to get started with the platform
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 gap-8 max-w-3xl mx-auto">
          {/* Creator Card */}
          <Card className="bg-gray-900 border-gray-800 hover:border-gray-700 transition-all cursor-pointer group">
            <CardHeader className="text-center pb-4">
              <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-blue-500 transition-colors">
                <User className="w-8 h-8 text-white" />
              </div>
              <CardTitle className="text-white text-2xl font-bold">
                I'm a Creator
              </CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <CardDescription className="text-gray-300 text-base mb-6">
                I want to discover, book, and record in professional studios.
              </CardDescription>
              <Button
                onClick={() => handleRoleSelection("creator")}
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3"
              >
                {loading ? "Setting up..." : "Continue as Creator"}
              </Button>
            </CardContent>
          </Card>

          {/* Studio Owner Card */}
          <Card className="bg-gray-900 border-gray-800 hover:border-gray-700 transition-all cursor-pointer group">
            <CardHeader className="text-center pb-4">
              <div className="w-16 h-16 bg-purple-600 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-purple-500 transition-colors">
                <Building className="w-8 h-8 text-white" />
              </div>
              <CardTitle className="text-white text-2xl font-bold">
                I'm a Studio Owner
              </CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <CardDescription className="text-gray-300 text-base mb-6">
                I want to list my studio, manage bookings, and grow my business.
              </CardDescription>
              <Button
                onClick={() => handleRoleSelection("owner")}
                disabled={loading}
                className="w-full bg-purple-600 hover:bg-purple-700 text-white font-medium py-3"
              >
                {loading ? "Setting up..." : "Continue as Studio Owner"}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
} 