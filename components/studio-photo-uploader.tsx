'use client'

import React, { useState, useRef, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Camera, Upload, X, Loader2, AlertCircle } from 'lucide-react'
import { toast } from 'sonner'
import { uploadStudioImage, deleteStudioImage } from '@/lib/actions/studios'

interface StudioPhotoUploaderProps {
  studioId: number
  photoUrls: string[]
  onPhotosUpdate: (urls: string[]) => void
  maxPhotos?: number
  disabled?: boolean
}

// Helper function to get transformed image URL with 16:9 aspect ratio
function getTransformedImageUrl(originalUrl: string, width: number = 800): string {
  if (!originalUrl.includes('supabase')) {
    return originalUrl
  }

  // Calculate height for 16:9 aspect ratio
  const height = Math.round(width * 9 / 16)
  
  // Extract the file path from the URL
  const urlParts = originalUrl.split('/storage/v1/object/public/studio-photos/')
  if (urlParts.length < 2) {
    return originalUrl
  }
  
  const filePath = urlParts[1]
  const baseUrl = urlParts[0] + '/storage/v1/object/public/studio-photos/'
  
  // Add transformation parameters
  return `${baseUrl}${filePath}?width=${width}&height=${height}&resize=cover&quality=85`
}

export function StudioPhotoUploader({ 
  studioId, 
  photoUrls, 
  onPhotosUpdate, 
  maxPhotos = 10, 
  disabled = false 
}: StudioPhotoUploaderProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [uploadingIds, setUploadingIds] = useState<Set<string>>(new Set())
  
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileValidation = useCallback((file: File) => {
    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file')
      return false
    }

    // Validate file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size must be less than 5MB')
      return false
    }

    // Check photo limit
    if (photoUrls.length >= maxPhotos) {
      toast.error(`Maximum ${maxPhotos} images allowed`)
      return false
    }

    return true
  }, [photoUrls.length, maxPhotos])

  const handleFileSelect = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    if (!handleFileValidation(file)) return

    try {
      setIsUploading(true)
      
      // Upload original file directly to Supabase
      const result = await uploadStudioImage(studioId, file)
      
      if (result.success && result.data) {
        // Update local state
        const newUrls = [...photoUrls, result.data]
        onPhotosUpdate(newUrls)
        
        toast.success('Image uploaded successfully!')
        
        // Clear file input
        if (fileInputRef.current) {
          fileInputRef.current.value = ''
        }
      } else {
        toast.error(result.error || 'Failed to upload image')
      }
    } catch (error) {
      console.error('Error uploading image:', error)
      toast.error('Failed to upload image')
    } finally {
      setIsUploading(false)
    }
  }, [studioId, photoUrls, onPhotosUpdate, handleFileValidation])

  const handleDeleteImage = useCallback(async (imageUrl: string) => {
    const imageId = imageUrl.split('/').pop() || imageUrl
    setUploadingIds(prev => new Set(prev).add(imageId))

    try {
      const result = await deleteStudioImage(studioId, imageUrl)
      
      if (result.success) {
        // Update local state
        const newUrls = photoUrls.filter(url => url !== imageUrl)
        onPhotosUpdate(newUrls)
        
        toast.success('Image deleted successfully!')
      } else {
        toast.error(result.error || 'Failed to delete image')
      }
    } catch (error) {
      console.error('Error deleting image:', error)
      toast.error('Failed to delete image')
    } finally {
      setUploadingIds(prev => {
        const newSet = new Set(prev)
        newSet.delete(imageId)
        return newSet
      })
    }
  }, [studioId, photoUrls, onPhotosUpdate])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
  }, [])

  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault()
    const file = e.dataTransfer.files[0]
    if (!file || !handleFileValidation(file)) return

    try {
      setIsUploading(true)
      
      // Upload original file directly to Supabase
      const result = await uploadStudioImage(studioId, file)
      
      if (result.success && result.data) {
        // Update local state
        const newUrls = [...photoUrls, result.data]
        onPhotosUpdate(newUrls)
        
        toast.success('Image uploaded successfully!')
      } else {
        toast.error(result.error || 'Failed to upload image')
      }
    } catch (error) {
      console.error('Error uploading image:', error)
      toast.error('Failed to upload image')
    } finally {
      setIsUploading(false)
    }
  }, [studioId, photoUrls, onPhotosUpdate, handleFileValidation])

  return (
    <div className="space-y-6">
      {/* Upload Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Camera className="h-5 w-5" />
            Studio Photos
          </CardTitle>
          <CardDescription>
            Upload up to {maxPhotos} photos to showcase your studio. Images will be automatically optimized and displayed in 16:9 aspect ratio.
            <br />
            <span className="text-sm text-muted-foreground">
              Recommended: High-quality images showing different angles of your studio. Max 5MB per image.
            </span>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div
            className={`relative border-2 border-dashed border-gray-300 rounded-lg p-8 text-center transition-colors ${
              disabled ? 'bg-gray-100 cursor-not-allowed' : 'hover:border-primary cursor-pointer'
            }`}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            onClick={() => !disabled && fileInputRef.current?.click()}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              disabled={disabled}
              className="hidden"
            />
            
            <div className="flex flex-col items-center gap-4">
              <div className="p-3 bg-primary/10 rounded-full">
                <Upload className="h-8 w-8 text-primary" />
              </div>
              
              <div>
                <p className="text-lg font-medium">
                  Drop your image here, or{' '}
                  <span className="text-primary font-semibold">browse</span>
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  PNG, JPG, GIF up to 5MB • {photoUrls.length}/{maxPhotos} images
                </p>
              </div>
            </div>
            
            {isUploading && (
              <div className="absolute inset-0 bg-white/80 flex items-center justify-center rounded-lg">
                <div className="flex items-center gap-2">
                  <Loader2 className="h-5 w-5 animate-spin text-primary" />
                  <span className="text-sm font-medium">Uploading...</span>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Image Gallery */}
      {photoUrls.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Uploaded Photos</CardTitle>
            <CardDescription>
              All images are displayed in 16:9 aspect ratio as they appear to users
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {photoUrls.map((url, index) => {
                const imageId = url.split('/').pop() || url
                const isDeleting = uploadingIds.has(imageId)
                
                return (
                  <div key={url} className="relative group">
                    <div className="relative aspect-video bg-gray-100 rounded-lg overflow-hidden">
                      <img
                        src={getTransformedImageUrl(url, 400)}
                        alt={`Studio photo ${index + 1}`}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                      
                      {isDeleting && (
                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                          <div className="flex items-center gap-2 text-white">
                            <Loader2 className="h-4 w-4 animate-spin" />
                            <span className="text-sm">Deleting...</span>
                          </div>
                        </div>
                      )}
                    </div>
                    
                    <Button
                      variant="destructive"
                      size="sm"
                      className="absolute -top-2 -right-2 h-8 w-8 rounded-full p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => handleDeleteImage(url)}
                      disabled={isDeleting || disabled}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Upload Progress Info */}
      {photoUrls.length === 0 && (
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-blue-100 rounded-full">
                <AlertCircle className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <h4 className="font-medium text-blue-900">No photos uploaded yet</h4>
                <p className="text-sm text-blue-700 mt-1">
                  Upload high-quality photos to showcase your studio. Images will be automatically optimized and cropped to 16:9 aspect ratio for consistent display.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
} 