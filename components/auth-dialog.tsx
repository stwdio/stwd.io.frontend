"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { supabase } from "@/lib/supabase"
import { useToast } from "@/hooks/use-toast"

interface AuthDialogProps {
  onClose: () => void
}

export function AuthDialog({ onClose }: AuthDialogProps) {
  const [loading, setLoading] = useState(false)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [fullName, setFullName] = useState("")
  const [connectionStatus, setConnectionStatus] = useState<string>("checking")
  const { toast } = useToast()

  useEffect(() => {
    // Test Supabase connection on component mount
    const testConnection = async () => {
      try {
        console.log("Testing Supabase connection...")
        console.log("Supabase URL:", process.env.NEXT_PUBLIC_SUPABASE_URL)
        console.log("Has Anon Key:", !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)

        const { data, error } = await supabase.from("profiles").select("count").limit(1)

        if (error) {
          console.error("Connection test failed:", error)
          setConnectionStatus(`Error: ${error.message}`)
        } else {
          console.log("Connection test successful:", data)
          setConnectionStatus("Connected")
        }
      } catch (err) {
        console.error("Connection test exception:", err)
        setConnectionStatus(`Exception: ${err}`)
      }
    }

    testConnection()
  }, [])

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    console.log("Attempting to sign in with:", email)
    console.log("Connection status:", connectionStatus)

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      console.log("Sign in response:", { data, error })

      if (error) {
        console.error("Sign in error:", error)
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive",
        })
      } else {
        console.log("Sign in successful:", data)
        toast({
          title: "Success",
          description: "Signed in successfully!",
        })
        onClose()
      }
    } catch (err) {
      console.error("Unexpected sign in error:", err)
      toast({
        title: "Error",
        description: "An unexpected error occurred during sign in.",
        variant: "destructive",
      })
    }

    setLoading(false)
  }

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          },
        },
      })

      if (error) {
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive",
        })
        setLoading(false)
        return
      }

      toast({
        title: "Success",
        description: data.user?.email_confirmed_at
          ? "Account created successfully!"
          : "Account created! Please check your email to verify your account.",
      })

      onClose()
    } catch (err) {
      console.error("Signup error:", err)
      toast({
        title: "Error",
        description: "An unexpected error occurred during signup.",
        variant: "destructive",
      })
    }

    setLoading(false)
  }

  return (
    <div className="space-y-6">
      <DialogHeader>
        <DialogTitle className="text-center text-2xl font-bold">Welcome To Stwd.io</DialogTitle>
        {connectionStatus !== "Connected" && (
          <div className="text-sm text-center text-muted-foreground">Connection: {connectionStatus}</div>
        )}
      </DialogHeader>

      <Tabs defaultValue="signin" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="signin">Sign In</TabsTrigger>
          <TabsTrigger value="signup">Sign Up</TabsTrigger>
        </TabsList>

        <TabsContent value="signin" className="space-y-4">
          <form onSubmit={handleSignIn} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="signin-email">Email</Label>
              <Input id="signin-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="signin-password">Password</Label>
              <Input
                id="signin-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading || connectionStatus !== "Connected"}>
              {loading ? "Signing In..." : "Sign In"}
            </Button>
          </form>
        </TabsContent>

        <TabsContent value="signup" className="space-y-4">
          <form onSubmit={handleSignUp} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="signup-name">Full Name</Label>
              <Input
                id="signup-name"
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="signup-email">Email</Label>
              <Input id="signup-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="signup-password">Password</Label>
              <Input
                id="signup-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading || connectionStatus !== "Connected"}>
              {loading ? "Creating Account..." : "Create Account"}
            </Button>
          </form>
        </TabsContent>
      </Tabs>
    </div>
  )
}
