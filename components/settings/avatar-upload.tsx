'use client'

import { useState, useRef, useCallback } from 'react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Camera, Upload, X, Loader2, User } from 'lucide-react'
import { toast } from 'sonner'
import { uploadAvatar, deleteAvatar } from '@/lib/actions/avatars'
import { imagePresets } from '@/lib/utils/image-transformations'

interface AvatarUploadProps {
  currentAvatarUrl?: string | null
  userId: string
  onAvatarUpdate?: (url: string | null) => void
}

export function AvatarUpload({ currentAvatarUrl, userId, onAvatarUpdate }: AvatarUploadProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  // Generate default avatar URL
  const defaultAvatarUrl = `https://api.dicebear.com/9.x/thumbs/svg?seed=${userId}&backgroundColor=ffffff&shapeColor=000000`
  const avatarUrl = imagePresets.avatar(currentAvatarUrl) || defaultAvatarUrl

  const handleFileSelect = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
      toast.error('Please upload a JPEG, PNG, GIF, or WebP image')
      return
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be less than 5MB')
      return
    }

    setIsUploading(true)
    
    try {
      const result = await uploadAvatar(file)
      
      if (result.success && result.data) {
        toast.success('Avatar uploaded successfully!')
        onAvatarUpdate?.(result.data)
      } else {
        toast.error(result.error || 'Failed to upload avatar')
      }
    } catch (error) {
      console.error('Avatar upload error:', error)
      toast.error('An unexpected error occurred')
    } finally {
      setIsUploading(false)
      // Reset the input
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }, [onAvatarUpdate])

  const handleDelete = useCallback(async () => {
    if (!currentAvatarUrl) return
    
    setIsDeleting(true)
    
    try {
      const result = await deleteAvatar()
      
      if (result.success) {
        toast.success('Avatar removed successfully!')
        onAvatarUpdate?.(null)
      } else {
        toast.error(result.error || 'Failed to remove avatar')
      }
    } catch (error) {
      console.error('Avatar delete error:', error)
      toast.error('An unexpected error occurred')
    } finally {
      setIsDeleting(false)
    }
  }, [currentAvatarUrl, onAvatarUpdate])

  return (
    <div className="space-y-4">
      <Label>Profile Picture</Label>
      
      <div className="flex items-center gap-6">
        {/* Avatar Preview */}
        <div className="relative">
          <Avatar className="h-24 w-24">
            <AvatarImage src={avatarUrl} alt="Profile picture" />
            <AvatarFallback>
              <User className="h-12 w-12" />
            </AvatarFallback>
          </Avatar>
          
          {/* Upload overlay */}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading || isDeleting}
            className="absolute inset-0 flex items-center justify-center bg-black/60 opacity-0 hover:opacity-100 transition-opacity rounded-full cursor-pointer disabled:cursor-not-allowed"
          >
            {isUploading ? (
              <Loader2 className="h-6 w-6 text-white animate-spin" />
            ) : (
              <Camera className="h-6 w-6 text-white" />
            )}
          </button>
        </div>

        {/* Upload/Delete buttons */}
        <div className="space-y-2">
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading || isDeleting}
            >
              {isUploading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="mr-2 h-4 w-4" />
                  Upload Photo
                </>
              )}
            </Button>
            
            {currentAvatarUrl && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleDelete}
                disabled={isUploading || isDeleting}
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Removing...
                  </>
                ) : (
                  <>
                    <X className="mr-2 h-4 w-4" />
                    Remove
                  </>
                )}
              </Button>
            )}
          </div>
          
          <p className="text-xs text-muted-foreground">
            JPG, PNG, GIF or WebP. Max 5MB.
          </p>
        </div>
      </div>

      {/* Hidden file input */}
      <Input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
        onChange={handleFileSelect}
        className="hidden"
        disabled={isUploading || isDeleting}
      />
    </div>
  )
}