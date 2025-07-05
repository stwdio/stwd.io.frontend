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
