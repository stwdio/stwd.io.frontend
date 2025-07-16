'use client'

import { useState } from 'react'
import Image from 'next/image'
import { cn } from '@/lib/utils'
import { Skeleton } from '@/components/ui/skeleton'

interface StudioImageWithSkeletonProps {
  src?: string | null
  alt: string
  className?: string
  fill?: boolean
  width?: number
  height?: number
  priority?: boolean
}

export function StudioImageWithSkeleton({ 
  src, 
  alt, 
  className, 
  fill = false,
  width = 300,
  height = 200,
  priority = false,
  ...props 
}: StudioImageWithSkeletonProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)
  
  // Use the same placeholder pattern as the old app
  const placeholderSrc = `/placeholder.svg?height=${height}&width=${width}`
  const imageSrc = src || placeholderSrc

  return (
    <div className="relative w-full h-full">
      {/* Skeleton shown while image is loading */}
      {isLoading && !hasError && (
        <Skeleton className="absolute inset-0 w-full h-full z-10" />
      )}
      
      {/* Actual image */}
      <Image
        src={imageSrc}
        alt={alt}
        fill={fill}
        width={!fill ? width : undefined}
        height={!fill ? height : undefined}
        className={cn(
          "object-cover transition-opacity duration-300",
          isLoading && !hasError ? "opacity-0" : "opacity-100",
          className
        )}
        priority={priority}
        onLoad={() => setIsLoading(false)}
        onError={() => {
          setHasError(true)
          setIsLoading(false)
        }}
        {...props}
      />
    </div>
  )
}