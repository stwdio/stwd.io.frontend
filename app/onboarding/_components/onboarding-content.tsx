'use client'

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Music, Mic, Radio, Briefcase, Wrench, Users, Building, ChevronRight } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { useToast } from "@/hooks/use-toast"
import { trackEvent } from '@/lib/analytics/ga-events'

const roleIcons = {
  'musician': Music,
  'podcaster': Mic,
  'voice-actor': Radio,
  'a-and-r': Briefcase,
  'engineer': Wrench,
  'manager': Users,
  'studio-owner': Building,
} as const

interface Role {
  id: number
  name: string
  slug: string
  description: string | null
}

interface OnboardingContentProps {
  roles: Role[]
  profileId: string
}

export function OnboardingContent({ roles, profileId }: OnboardingContentProps) {
  const [loading, setLoading] = useState(false)
  const [selectedRole, setSelectedRole] = useState<number | null>(null)
  const { toast } = useToast()
  const supabase = createClient()

  const handleRoleSelect = (roleId: number) => {
    const role = roles.find(r => r.id === roleId)
    if (role) {
      trackEvent.roleSelected(role.slug)
    }
    setSelectedRole(roleId)
  }

  const handleSubmit = async () => {
    if (!selectedRole) {
      toast({
        title: "Please select a role",
        description: "Choose the role that best describes your professional identity.",
        variant: "destructive",
      })
      return
    }

    setLoading(true)
    
    try {
      // Insert selected role
      const { error: roleError } = await supabase
        .from("profile_roles")
        .insert({
          profile_id: profileId,
          role_id: selectedRole,
        })

      if (roleError) {
        console.error("Error setting role:", roleError)
        toast({
          title: "Error",
          description: "Failed to set your role. Please try again.",
          variant: "destructive",
        })
        setLoading(false)
        return
      }

      // Update system_role to 'user' to mark onboarding complete
      const { error: profileError } = await supabase
        .from("profiles")
        .update({ system_role: 'user' })
        .eq('id', profileId)

      if (profileError) {
        console.error("Error updating profile:", profileError)
        toast({
          title: "Error",
          description: "Failed to complete onboarding. Please try again.",
          variant: "destructive",
        })
        setLoading(false)
        return
      }

      // Track onboarding completion
      const role = roles.find(r => r.id === selectedRole)
      if (role) {
        trackEvent.onboardingComplete(role.slug)
      }

      toast({
        title: "Welcome to stwd.io!",
        description: "Your professional role has been set.",
      })

      // Redirect to chat hub after onboarding
      // Force a hard navigation to refresh auth context
      window.location.href = '/chat'
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

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 sm:px-6 lg:px-8 py-12">
      <div className="max-w-3xl w-full space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-foreground mb-4">
            Welcome to stwd.io!
          </h1>
          <p className="text-muted-foreground text-lg mb-2">
            Select the role that best describes your professional identity
          </p>
          <p className="text-sm text-muted-foreground">
            Choose your primary role to get started
          </p>
        </div>
        
        <Card className="border-border">
          <CardHeader>
            <CardTitle>Your Professional Role</CardTitle>
            <CardDescription>
              Choose the role that best represents your primary activity on stwd.io.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <RadioGroup 
              value={selectedRole?.toString() || ""} 
              onValueChange={(value) => handleRoleSelect(parseInt(value))}
              className="space-y-4"
            >
              {roles.map((role) => {
                const Icon = roleIcons[role.slug as keyof typeof roleIcons] || Users
                const isSelected = selectedRole === role.id
                
                return (
                  <div
                    key={role.id}
                    className={`flex items-start space-x-3 p-4 rounded-lg border transition-all cursor-pointer ${
                      isSelected 
                        ? 'bg-primary/10 border-primary' 
                        : 'hover:bg-muted/50 border-border'
                    }`}
                    onClick={() => handleRoleSelect(role.id)}
                  >
                    <RadioGroupItem
                      value={role.id.toString()}
                      id={`role-${role.id}`}
                      className="mt-1"
                    />
                    <div className="flex-1">
                      <Label 
                        htmlFor={`role-${role.id}`}
                        className="flex items-center gap-3 cursor-pointer"
                      >
                        <Icon className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <div className="font-medium">{role.name}</div>
                          {role.description && (
                            <div className="text-sm text-muted-foreground">
                              {role.description}
                            </div>
                          )}
                        </div>
                      </Label>
                    </div>
                  </div>
                )
              })}
            </RadioGroup>

            <div className="mt-8 flex justify-end">
              <Button
                onClick={handleSubmit}
                disabled={loading || !selectedRole}
                size="lg"
                className="min-w-[200px]"
              >
                {loading ? (
                  "Setting up..."
                ) : (
                  <>
                    Continue
                    <ChevronRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}