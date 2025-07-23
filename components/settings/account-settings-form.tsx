'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { useToast } from '@/hooks/use-toast'
import type { User } from '@supabase/supabase-js'

interface AccountSettingsFormProps {
  user: User
}

export function AccountSettingsForm({ user }: AccountSettingsFormProps) {
  const [email, setEmail] = useState(user.email || '')
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [isUpdatingEmail, setIsUpdatingEmail] = useState(false)
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false)
  const { toast } = useToast()
  
  const handleEmailUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsUpdatingEmail(true)
    
    try {
      // TODO: Implement email update
      toast({
        title: "Email update",
        description: "Check your new email for a confirmation link",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update email",
        variant: "destructive",
      })
    } finally {
      setIsUpdatingEmail(false)
    }
  }
  
  const handlePasswordUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (newPassword !== confirmPassword) {
      toast({
        title: "Error",
        description: "Passwords do not match",
        variant: "destructive",
      })
      return
    }
    
    setIsUpdatingPassword(true)
    
    try {
      // TODO: Implement password update
      toast({
        title: "Success",
        description: "Password updated successfully",
      })
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update password",
        variant: "destructive",
      })
    } finally {
      setIsUpdatingPassword(false)
    }
  }

  return (
    <div className="space-y-8">
      {/* Email Section */}
      <form onSubmit={handleEmailUpdate} className="space-y-4">
        <div>
          <h3 className="text-lg font-medium mb-4">Email Address</h3>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
        </div>
        
        <Button type="submit" disabled={isUpdatingEmail || email === user.email}>
          {isUpdatingEmail ? "Updating..." : "Update Email"}
        </Button>
      </form>
      
      <Separator />
      
      {/* Password Section */}
      <form onSubmit={handlePasswordUpdate} className="space-y-4">
        <div>
          <h3 className="text-lg font-medium mb-4">Change Password</h3>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="currentPassword">Current Password</Label>
              <Input
                id="currentPassword"
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="newPassword">New Password</Label>
              <Input
                id="newPassword"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm New Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>
          </div>
        </div>
        
        <Button 
          type="submit" 
          disabled={isUpdatingPassword || !currentPassword || !newPassword || !confirmPassword}
        >
          {isUpdatingPassword ? "Updating..." : "Update Password"}
        </Button>
      </form>
      
      <Separator />
      
      {/* Danger Zone */}
      <div>
        <h3 className="text-lg font-medium mb-4 text-destructive">Danger Zone</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Once you delete your account, there is no going back. Please be certain.
        </p>
        <Button variant="destructive">
          Delete Account
        </Button>
      </div>
    </div>
  )
}