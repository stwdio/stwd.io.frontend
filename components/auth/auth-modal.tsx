'use client'
import { useRouter } from 'next/navigation'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { LogIn, UserPlus } from 'lucide-react'

interface AuthModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title?: string
  description?: string
}

export function AuthModal({ 
  open, 
  onOpenChange,
  title = "Sign in to continue",
  description = "You need to be signed in to perform this action."
}: AuthModalProps) {
  const router = useRouter()

  const handleSignIn = () => {
    // Store current path for redirect after auth
    const currentPath = window.location.pathname + window.location.search
    localStorage.setItem('redirectAfterAuth', currentPath)
    router.push('/auth/login')
  }

  const handleSignUp = () => {
    // Store current path for redirect after auth
    const currentPath = window.location.pathname + window.location.search
    localStorage.setItem('redirectAfterAuth', currentPath)
    router.push('/auth/login?signup=true')
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-3 pt-4">
          <Button 
            onClick={handleSignIn}
            className="w-full"
            size="lg"
          >
            <LogIn className="mr-2 h-4 w-4" />
            Sign In
          </Button>
          <Button 
            onClick={handleSignUp}
            variant="outline"
            className="w-full"
            size="lg"
          >
            <UserPlus className="mr-2 h-4 w-4" />
            Create Account
          </Button>
        </div>
        <p className="text-xs text-center text-muted-foreground pt-2">
          Join stwd.io to save studios, get quotes, and connect with the music community.
        </p>
      </DialogContent>
    </Dialog>
  )
}