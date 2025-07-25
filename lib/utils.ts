import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Get transformed image URL with 16:9 aspect ratio using Supabase Image Transformation
 * @param originalUrl - The original image URL from Supabase Storage
 * @param width - Desired width (height will be calculated for 16:9 aspect ratio)
 * @returns Transformed image URL with proper aspect ratio
 */
export function getTransformedImageUrl(originalUrl: string, width: number = 800): string {
  if (!originalUrl || !originalUrl.includes('supabase')) {
    return originalUrl
  }

  // Calculate height for 16:9 aspect ratio
  const height = Math.round(width * 9 / 16)
  
  // Replace /object/public/ with /render/image/public/ for Supabase transformations
  const transformedUrl = originalUrl.replace(
    '/storage/v1/object/public/',
    '/storage/v1/render/image/public/'
  )
  
  // Add transformation parameters
  const params = new URLSearchParams({
    width: width.toString(),
    height: height.toString(),
    resize: 'cover',
    quality: '95' // High quality
  })
  
  const separator = transformedUrl.includes('?') ? '&' : '?'
  return `${transformedUrl}${separator}${params.toString()}`
}

/**
 * Get the primary image URL for a studio (first image in photo_urls array)
 * @param photoUrls - Array of photo URLs from the studio
 * @param width - Desired width for transformation
 * @returns Primary image URL or null if no images
 */
export function getStudioPrimaryImageUrl(photoUrls: string[] | null | undefined, width: number = 800): string | null {
  if (!photoUrls || photoUrls.length === 0) {
    return null
  }
  
  return getTransformedImageUrl(photoUrls[0], width)
}

/**
 * Get optimized avatar image URL
 * @param originalUrl - The original image URL
 * @param size - Size in pixels (used for both width and height)
 * @returns Optimized square avatar image URL
 */
export function getAvatarImageUrl(originalUrl: string | null | undefined, size: number = 80): string | null {
  if (!originalUrl) return null
  
  // For non-Supabase URLs, return as-is
  if (!originalUrl.includes('supabase.co/storage/v1/object/public/')) {
    return originalUrl
  }
  
  // Replace /object/public/ with /render/image/public/ for Supabase transformations
  const transformedUrl = originalUrl.replace(
    '/storage/v1/object/public/',
    '/storage/v1/render/image/public/'
  )
  
  // Add transformation parameters for square avatar
  const params = new URLSearchParams({
    width: size.toString(),
    height: size.toString(),
    resize: 'cover',
    quality: '95' // High quality for avatars
  })
  
  const separator = transformedUrl.includes('?') ? '&' : '?'
  return `${transformedUrl}${separator}${params.toString()}`
}
