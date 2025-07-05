'use client'

import React, { useState, useRef, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Camera, Upload, X, Loader2, AlertCircle } from 'lucide-react'
import { toast } from 'sonner'
import { uploadStudioImage, deleteStudioImage } from '@/lib/actions/studios'
import { getTransformedImageUrl } from '@/lib/utils'

interface StudioPhotoUploaderProps {
  studioId: number
  photoUrls: string[]
  onPhotosUpdate: (urls: string[]) => void
  maxPhotos?: number
  disabled?: boolean
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
  const [uploadProgress, setUploadProgress] = useState<{total: number, completed: number}>({ total: 0, completed: 0 })
  
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileValidation = useCallback((files: FileList | File[]) => {
    const fileArray = Array.from(files)
    const validFiles: File[] = []
    let hasErrors = false

    // Check if adding these files would exceed the limit
    if (photoUrls.length + fileArray.length > maxPhotos) {
      toast.error(`Cannot upload ${fileArray.length} files. Maximum ${maxPhotos} images allowed (${photoUrls.length} already uploaded)`)
      return []
    }

    fileArray.forEach((file, index) => {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast.error(`File "${file.name}" is not an image`)
        hasErrors = true
        return
      }

      // Validate file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        toast.error(`File "${file.name}" is too large. Maximum 5MB allowed`)
        hasErrors = true
        return
      }

      validFiles.push(file)
    })

    if (validFiles.length === 0 && hasErrors) {
      return []
    }

    if (validFiles.length < fileArray.length) {
      toast.warning(`${validFiles.length} of ${fileArray.length} files will be uploaded`)
    }

    return validFiles
  }, [photoUrls.length, maxPhotos])

  const uploadFiles = useCallback(async (files: File[]) => {
    if (files.length === 0) return

    try {
      setIsUploading(true)
      setUploadProgress({ total: files.length, completed: 0 })
      
      const uploadPromises = files.map(async (file, index) => {
        try {
          const result = await uploadStudioImage(studioId, file)
          
          if (result.success && result.data) {
            setUploadProgress(prev => ({ ...prev, completed: prev.completed + 1 }))
            return result.data
          } else {
            toast.error(`Failed to upload "${file.name}": ${result.error}`)
            return null
          }
        } catch (error) {
          console.error(`Error uploading ${file.name}:`, error)
          toast.error(`Failed to upload "${file.name}"`)
          return null
        }
      })

      const results = await Promise.all(uploadPromises)
      const successfulUploads = results.filter(url => url !== null) as string[]
      
      if (successfulUploads.length > 0) {
        // Update local state with new URLs
        const newUrls = [...photoUrls, ...successfulUploads]
        onPhotosUpdate(newUrls)
        
        toast.success(`Successfully uploaded ${successfulUploads.length} image${successfulUploads.length > 1 ? 's' : ''}!`)
      }

      if (successfulUploads.length < files.length) {
        const failedCount = files.length - successfulUploads.length
        toast.error(`${failedCount} image${failedCount > 1 ? 's' : ''} failed to upload`)
      }
      
      // Clear file input
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    } catch (error) {
      console.error('Error uploading files:', error)
      toast.error('Failed to upload images')
    } finally {
      setIsUploading(false)
      setUploadProgress({ total: 0, completed: 0 })
    }
  }, [studioId, photoUrls, onPhotosUpdate])

  const handleFileSelect = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (!files || files.length === 0) return

    const validFiles = handleFileValidation(files)
    if (validFiles.length > 0) {
      await uploadFiles(validFiles)
    }
  }, [handleFileValidation, uploadFiles])

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
    e.stopPropagation()
  }, [])

  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    const files = Array.from(e.dataTransfer.files)
    if (files.length === 0) return

    const validFiles = handleFileValidation(files)
    if (validFiles.length > 0) {
      await uploadFiles(validFiles)
    }
  }, [handleFileValidation, uploadFiles])

  const remainingSlots = maxPhotos - photoUrls.length

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
              multiple
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
                  Drop your images here, or{' '}
                  <span className="text-primary font-semibold">browse</span>
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  PNG, JPG, GIF up to 5MB each • {photoUrls.length}/{maxPhotos} images
                  {remainingSlots > 0 && (
                    <span className="text-primary font-medium"> • {remainingSlots} slots available</span>
                  )}
                </p>
              </div>
            </div>
            
            {isUploading && (
              <div className="absolute inset-0 bg-white/80 flex items-center justify-center rounded-lg">
                <div className="flex flex-col items-center gap-3">
                  <div className="flex items-center gap-2">
                    <Loader2 className="h-5 w-5 animate-spin text-primary" />
                    <span className="text-sm font-medium">
                      Uploading {uploadProgress.completed}/{uploadProgress.total} images...
                    </span>
                  </div>
                  <div className="w-48 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-primary h-2 rounded-full transition-all duration-300" 
                      style={{ width: `${(uploadProgress.completed / uploadProgress.total) * 100}%` }}
                    />
                  </div>
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
                  Upload high-quality photos to showcase your studio. You can select or drag & drop multiple images at once (up to {maxPhotos} total).
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Helpful Tips */}
      {photoUrls.length > 0 && photoUrls.length < maxPhotos && (
        <Card className="bg-green-50 border-green-200">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-green-100 rounded-full">
                <Camera className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <h4 className="font-medium text-green-900">Looking great!</h4>
                <p className="text-sm text-green-700 mt-1">
                  You can upload {remainingSlots} more image{remainingSlots > 1 ? 's' : ''} to showcase different angles and features of your studio.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
} 