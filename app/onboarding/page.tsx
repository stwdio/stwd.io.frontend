"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Music, Mic, Radio, Briefcase, Wrench, Users, Building, ChevronRight } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/lib/auth/auth-context"
import { useRouter } from "next/navigation"
import { useRoles } from "@/lib/hooks/queries/roles"

const roleIcons = {
  'musician': Music,
  'podcaster': Mic,
  'voice-actor': Radio,
  'a-and-r': Briefcase,
  'engineer': Wrench,
  'manager': Users,
  'studio-owner': Building,
} as const

export default function OnboardingPage() {
  const [loading, setLoading] = useState(false)
  const [selectedRoles, setSelectedRoles] = useState<number[]>([])
  const { user, profile, refreshProfile } = useAuth()
  const router = useRouter()
  const { toast } = useToast()
  const supabase = createClient()
  
  // Fetch available roles
  const { data: roles = [], isLoading: rolesLoading } = useRoles()

  const handleRoleToggle = (roleId: number) => {
    setSelectedRoles(prev => 
      prev.includes(roleId) 
        ? prev.filter(id => id !== roleId)
        : [...prev, roleId]
    )
  }

  const handleSubmit = async () => {
    if (!user || !profile || selectedRoles.length === 0) {
      toast({
        title: "Please select at least one role",
        description: "Choose the roles that best describe your professional identity.",
        variant: "destructive",
      })
      return
    }

    setLoading(true)
    
    try {
      // Insert selected roles
      const roleInserts = selectedRoles.map(roleId => ({
        profile_id: profile.id,
        role_id: roleId,
      }))

      const { error } = await supabase
        .from("profile_roles")
        .insert(roleInserts)

      if (error) {
        console.error("Error setting roles:", error)
        toast({
          title: "Error",
          description: "Failed to set your roles. Please try again.",
          variant: "destructive",
        })
        setLoading(false)
        return
      }

      // Refresh the profile to get the updated roles
      await refreshProfile()

      toast({
        title: "Welcome to stwd.io!",
        description: "Your professional roles have been set.",
      })

      // Determine dashboard based on roles
      const isStudioOwner = selectedRoles.some(id => 
        roles.find(r => r.id === id)?.slug === 'studio-owner'
      )
      
      router.replace(isStudioOwner ? '/profile/dashboard' : '/dashboard')
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

  if (rolesLoading) {
    return (
      <div className="h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-medium text-muted-foreground">Loading roles...</h2>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 sm:px-6 lg:px-8 py-12">
      <div className="max-w-3xl w-full space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-foreground mb-4">
            Welcome to stwd.io!
          </h1>
          <p className="text-muted-foreground text-lg mb-2">
            Select all the roles that describe your professional identity
          </p>
          <p className="text-sm text-muted-foreground">
            You can select multiple roles - many professionals wear different hats
          </p>
        </div>
        
        <Card className="border-border">
          <CardHeader>
            <CardTitle>Your Professional Roles</CardTitle>
            <CardDescription>
              Choose all that apply to you. You can update these later in your profile settings.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {roles.map((role) => {
                const Icon = roleIcons[role.slug as keyof typeof roleIcons] || Users
                const isSelected = selectedRoles.includes(role.id)
                
                return (
                  <div
                    key={role.id}
                    className={`flex items-start space-x-3 p-4 rounded-lg border transition-all cursor-pointer ${
                      isSelected 
                        ? 'bg-primary/10 border-primary' 
                        : 'hover:bg-muted/50 border-border'
                    }`}
                    onClick={() => handleRoleToggle(role.id)}
                  >
                    <Checkbox
                      id={`role-${role.id}`}
                      checked={isSelected}
                      onCheckedChange={() => handleRoleToggle(role.id)}
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
            </div>

            <div className="mt-8 flex justify-end">
              <Button
                onClick={handleSubmit}
                disabled={loading || selectedRoles.length === 0}
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