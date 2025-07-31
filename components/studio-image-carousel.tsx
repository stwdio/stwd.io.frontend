'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Skeleton } from '@/components/ui/skeleton'
import { imagePresets } from '@/lib/utils/image-transformations'

interface StudioImageCarouselProps {
  images: (string | null)[]
  studioName: string
  className?: string
}

export function StudioImageCarousel({ images, studioName, className }: StudioImageCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [loadedImages, setLoadedImages] = useState<Set<number>>(new Set())
  const [imageErrors, setImageErrors] = useState<Set<number>>(new Set())

  // Preload adjacent images
  useEffect(() => {
    const preloadIndices = [
      currentIndex - 1,
      currentIndex,
      currentIndex + 1
    ].filter(i => i >= 0 && i < images.length)

    preloadIndices.forEach(index => {
      const imageUrl = images[index]
      if (imageUrl && !loadedImages.has(index) && !imageErrors.has(index)) {
        const img = new window.Image()
        img.src = imagePresets.galleryLarge(imageUrl)
        img.onload = () => {
          setLoadedImages(prev => new Set(prev).add(index))
        }
        img.onerror = () => {
          setImageErrors(prev => new Set(prev).add(index))
        }
      }
    })
  }, [currentIndex, images, loadedImages, imageErrors])

  const handlePrevious = () => {
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length)
  }

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % images.length)
  }

  const currentImage = images[currentIndex]
  const isCurrentImageLoaded = loadedImages.has(currentIndex) || imageErrors.has(currentIndex) || !currentImage

  return (
    <div className={cn("relative bg-black overflow-hidden h-full", className)}>
      <div className="relative h-full w-full overflow-hidden">
        {/* Show skeleton while loading */}
        {!isCurrentImageLoaded && currentImage && (
          <Skeleton className="absolute inset-0 w-full h-full" />
        )}
        
        {/* Render all images but only show current one */}
        {images.map((image, index) => {
          const isVisible = index === currentIndex
          const shouldRender = Math.abs(index - currentIndex) <= 1 || index === images.length - 1 || index === 0
          
          if (!shouldRender) return null
          
          return (
            <div
              key={index}
              className={cn(
                "absolute inset-0 transition-opacity duration-300",
                isVisible ? "opacity-100" : "opacity-0 pointer-events-none"
              )}
            >
              {image ? (
                <Image
                  src={imagePresets.galleryLarge(image)}
                  alt={`${studioName} ${index + 1}`}
                  fill
                  sizes="45vw"
                  className="object-cover"
                  priority={index === 0}
                  onLoad={() => {
                    setLoadedImages(prev => new Set(prev).add(index))
                  }}
                  onError={() => {
                    setImageErrors(prev => new Set(prev).add(index))
                  }}
                />
              ) : (
                <div className="w-full h-full bg-gray-800 flex items-center justify-center">
                  <div className="text-gray-500">
                    <svg
                      className="w-24 h-24"
                      fill="none"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="1"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                </div>
              )}
            </div>
          )
        })}
        
        {/* Navigation buttons */}
        {images.length > 1 && (
          <>
            <button
              onClick={handlePrevious}
              className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/80 hover:bg-white transition-colors flex items-center justify-center z-10"
              aria-label="Previous image"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              onClick={handleNext}
              className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/80 hover:bg-white transition-colors flex items-center justify-center z-10"
              aria-label="Next image"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </>
        )}
        
        {/* Image indicators */}
        {images.length > 1 && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-10">
            {images.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={cn(
                  "w-2 h-2 rounded-full transition-all",
                  index === currentIndex 
                    ? "bg-white w-8" 
                    : "bg-white/50 hover:bg-white/75"
                )}
                aria-label={`Go to image ${index + 1}`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}