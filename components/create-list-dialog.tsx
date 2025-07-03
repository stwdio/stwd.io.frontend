'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { createList, CreateListData } from '@/lib/actions/lists'
import { toast } from 'sonner'

// Popular emoji options for lists
const EMOJI_OPTIONS = [
  '❤️', '⭐', '📝', '🎵', '🎙️', '🎸', '🎹', '🥁',
  '🎧', '🎤', '📻', '🎼', '🏆', '⚡', '🔥', '✨',
  '📌', '📋', '📂', '💫', '🌟', '🎯', '🚀', '💎'
]

interface CreateListDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onListCreated?: () => void
}

export default function CreateListDialog({ 
  open, 
  onOpenChange, 
  onListCreated 
}: CreateListDialogProps) {
  const [formData, setFormData] = useState<CreateListData>({
    name: '',
    iconEmoji: '📝',
    isPublic: false
  })
  const [isLoading, setIsLoading] = useState(false)
  const [nameError, setNameError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validate name
    const trimmedName = formData.name.trim()
    if (!trimmedName) {
      setNameError('List name is required')
      return
    }
    if (trimmedName.length > 100) {
      setNameError('List name must be 100 characters or less')
      return
    }
    
    setIsLoading(true)
    setNameError('')
    
    try {
      const result = await createList({
        ...formData,
        name: trimmedName
      })
      
      if (result.success) {
        toast.success('List created successfully!')
        onOpenChange(false)
        onListCreated?.()
        // Reset form
        setFormData({
          name: '',
          iconEmoji: '📝',
          isPublic: false
        })
      } else {
        toast.error(result.error || 'Failed to create list')
      }
    } catch (error) {
      console.error('Error creating list:', error)
      toast.error('An unexpected error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  const handleNameChange = (value: string) => {
    setFormData(prev => ({ ...prev, name: value }))
    if (nameError) {
      setNameError('')
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create New List</DialogTitle>
          <DialogDescription>
            Create a custom list to organize your favorite studios. 
            You can add studios to this list from anywhere on the platform.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="list-name">List Name</Label>
            <Input
              id="list-name"
              placeholder="e.g., EP Vocal Studios, Podcast Guest Recording"
              value={formData.name}
              onChange={(e) => handleNameChange(e.target.value)}
              maxLength={100}
              className={nameError ? 'border-red-500' : ''}
              disabled={isLoading}
            />
            {nameError && (
              <p className="text-sm text-red-500">{nameError}</p>
            )}
            <p className="text-xs text-muted-foreground">
              {formData.name.length}/100 characters
            </p>
          </div>

          <div className="space-y-2">
            <Label>List Icon</Label>
            <div className="grid grid-cols-8 gap-2">
              {EMOJI_OPTIONS.map((emoji) => (
                <button
                  key={emoji}
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, iconEmoji: emoji }))}
                  className={`
                    p-2 text-lg rounded border-2 transition-colors
                    ${formData.iconEmoji === emoji 
                      ? 'border-primary bg-primary/10' 
                      : 'border-border hover:border-primary/50'
                    }
                  `}
                  disabled={isLoading}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="is-public">Public List</Label>
              <p className="text-xs text-muted-foreground">
                Allow other users to discover and view this list
              </p>
            </div>
            <Switch
              id="is-public"
              checked={formData.isPublic}
              onCheckedChange={(checked) => 
                setFormData(prev => ({ ...prev, isPublic: checked }))
              }
              disabled={isLoading}
            />
          </div>

          <DialogFooter>
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading || !formData.name.trim()}>
              {isLoading ? 'Creating...' : 'Create List'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
} 