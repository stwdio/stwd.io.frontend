'use client'

import React, { useState, useRef, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Camera, Upload, X, Crop as CropIcon, Loader2, AlertCircle } from 'lucide-react'
import { toast } from 'sonner'
import ReactCrop, { Crop, PixelCrop } from 'react-image-crop'
import 'react-image-crop/dist/ReactCrop.css'
import { uploadStudioImage, deleteStudioImage } from '@/lib/actions/studios'

interface StudioPhotoUploaderProps {
  studioId: number
  photoUrls: string[]
  onPhotosUpdate: (urls: string[]) => void
  maxPhotos?: number
  disabled?: boolean
}

// Helper function to create a canvas from image and crop
function getCroppedImg(image: HTMLImageElement, crop: PixelCrop): Promise<Blob> {
  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')!

  // Browser canvas size limits (conservative values for compatibility)
  const MAX_CANVAS_SIZE = 16384 // 16K pixels max dimension
  const MAX_CANVAS_AREA = 268435456 // 16K x 16K max total pixels

  // Calculate target dimensions while respecting browser limits
  let targetWidth = crop.width
  let targetHeight = crop.height

  // Scale down if dimensions exceed limits
  if (targetWidth > MAX_CANVAS_SIZE || targetHeight > MAX_CANVAS_SIZE) {
    const scale = Math.min(MAX_CANVAS_SIZE / targetWidth, MAX_CANVAS_SIZE / targetHeight)
    targetWidth = Math.floor(targetWidth * scale)
    targetHeight = Math.floor(targetHeight * scale)
  }

  // Scale down if total area exceeds limit
  const totalPixels = targetWidth * targetHeight
  if (totalPixels > MAX_CANVAS_AREA) {
    const scale = Math.sqrt(MAX_CANVAS_AREA / totalPixels)
    targetWidth = Math.floor(targetWidth * scale)
    targetHeight = Math.floor(targetHeight * scale)
  }

  // Ensure minimum reasonable size (at least 400px wide for 16:9)
  const MIN_WIDTH = 400
  const MIN_HEIGHT = 225 // 400 * 9/16
  
  if (targetWidth < MIN_WIDTH) {
    targetWidth = MIN_WIDTH
    targetHeight = MIN_HEIGHT
  }

  // Set canvas dimensions to target size
  canvas.width = targetWidth
  canvas.height = targetHeight

  // Use high-quality scaling
  ctx.imageSmoothingEnabled = true
  ctx.imageSmoothingQuality = 'high'

  // Draw the cropped image scaled to target dimensions
  ctx.drawImage(
    image,
    crop.x,
    crop.y,
    crop.width,
    crop.height,
    0,
    0,
    targetWidth,
    targetHeight
  )

  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (!blob) {
        reject(new Error('Canvas is empty'))
        return
      }
      resolve(blob)
    }, 'image/webp', 0.85) // Convert to WebP with 85% quality
  })
}

// Helper function to convert File to HTMLImageElement
function createImageFromFile(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = reject
    img.src = URL.createObjectURL(file)
  })
}

export function StudioPhotoUploader({ 
  studioId, 
  photoUrls, 
  onPhotosUpdate, 
  maxPhotos = 10, 
  disabled = false 
}: StudioPhotoUploaderProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [crop, setCrop] = useState<Crop>({
    unit: '%',
    width: 100,
    height: 56.25, // 16:9 aspect ratio
    x: 0,
    y: 21.875, // Center vertically
  })
  const [croppedImage, setCroppedImage] = useState<string | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadingIds, setUploadingIds] = useState<Set<string>>(new Set())
  const [showCropDialog, setShowCropDialog] = useState(false)
  
  const fileInputRef = useRef<HTMLInputElement>(null)
  const imageRef = useRef<HTMLImageElement>(null)

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

  const handleFileSelect = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    if (handleFileValidation(file)) {
      setSelectedFile(file)
      setShowCropDialog(true)
    }
  }, [handleFileValidation])

  const handleCropComplete = useCallback(async (crop: PixelCrop) => {
    if (!selectedFile || !imageRef.current) return

    try {
      setIsUploading(true)
      
      // Create cropped image
      const croppedBlob = await getCroppedImg(imageRef.current, crop)
      
      // Convert to ArrayBuffer for upload
      const arrayBuffer = await croppedBlob.arrayBuffer()
      
      // Generate unique filename
      const timestamp = Date.now()
      const fileName = `${timestamp}_${selectedFile.name.replace(/\.[^/.]+$/, '')}.webp`
      
      // Upload to Supabase
      const result = await uploadStudioImage(studioId, fileName, arrayBuffer)
      
      if (result.success && result.data) {
        // Update local state
        const newUrls = [...photoUrls, result.data]
        onPhotosUpdate(newUrls)
        
        toast.success('Image uploaded successfully!')
        setShowCropDialog(false)
        setSelectedFile(null)
        setCroppedImage(null)
        
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
  }, [selectedFile, studioId, photoUrls, onPhotosUpdate])

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

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    const file = e.dataTransfer.files[0]
    if (file && handleFileValidation(file)) {
      setSelectedFile(file)
      setShowCropDialog(true)
    }
  }, [handleFileValidation])

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
            Upload up to {maxPhotos} photos to showcase your studio. All images will be cropped to 16:9 aspect ratio.
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
                <p className="text-lg font-medium">Drop images here or click to upload</p>
                <p className="text-sm text-muted-foreground">
                  {photoUrls.length} / {maxPhotos} images uploaded
                </p>
              </div>
              
              <Button 
                variant="outline" 
                size="sm" 
                disabled={disabled || photoUrls.length >= maxPhotos}
                onClick={(e) => {
                  e.stopPropagation()
                  fileInputRef.current?.click()
                }}
              >
                Select Images
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Photo Gallery */}
      {photoUrls.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Uploaded Photos</CardTitle>
            <CardDescription>
              These photos will be displayed on your studio page. You can delete any photo by clicking the X button.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {photoUrls.map((url, index) => {
                const imageId = url.split('/').pop() || url
                const isDeleting = uploadingIds.has(imageId)
                
                return (
                  <div key={url} className="relative group">
                    <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden">
                      <img
                        src={url}
                        alt={`Studio photo ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                      
                      {/* Delete button */}
                      {!disabled && (
                        <button
                          onClick={() => handleDeleteImage(url)}
                          disabled={isDeleting}
                          className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity disabled:opacity-50"
                          title="Delete photo"
                        >
                          {isDeleting ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <X className="h-4 w-4" />
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Crop Dialog */}
      <Dialog open={showCropDialog} onOpenChange={setShowCropDialog}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Crop Your Image</DialogTitle>
            <DialogDescription>
              Crop your image to 16:9 aspect ratio. This ensures consistent display across the platform.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            {selectedFile && (
              <div className="relative">
                <ReactCrop
                  crop={crop}
                  onChange={(newCrop) => setCrop(newCrop)}
                  aspect={16 / 9}
                  minWidth={200}
                  minHeight={112.5}
                  className="max-h-[400px]"
                >
                  <img
                    ref={imageRef}
                    src={URL.createObjectURL(selectedFile)}
                    alt="Crop preview"
                    className="max-h-[400px] w-full object-contain"
                  />
                </ReactCrop>
              </div>
            )}
            
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setShowCropDialog(false)
                  setSelectedFile(null)
                  setCroppedImage(null)
                }}
                disabled={isUploading}
              >
                Cancel
              </Button>
              <Button
                onClick={() => {
                  if (imageRef.current && selectedFile) {
                    const pixelCrop: PixelCrop = {
                      unit: 'px',
                      x: (crop.x / 100) * imageRef.current.naturalWidth,
                      y: (crop.y / 100) * imageRef.current.naturalHeight,
                      width: (crop.width / 100) * imageRef.current.naturalWidth,
                      height: (crop.height / 100) * imageRef.current.naturalHeight,
                    }
                    handleCropComplete(pixelCrop)
                  }
                }}
                disabled={isUploading || !selectedFile}
              >
                {isUploading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <CropIcon className="h-4 w-4 mr-2" />
                    Crop & Upload
                  </>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
} 