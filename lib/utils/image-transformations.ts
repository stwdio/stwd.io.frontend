/**
 * Utility functions for Supabase image transformations
 * https://supabase.com/docs/guides/storage/serving/image-transformations
 */

export interface ImageTransformOptions {
  width?: number
  height?: number
  resize?: 'contain' | 'cover' | 'fill'
  quality?: number
  format?: 'origin' // Only 'origin' is supported to opt out of WebP
}

/**
 * Transform a Supabase storage URL with image optimization parameters
 * @param url - The original Supabase storage URL
 * @param options - Transformation options
 * @returns Transformed URL with render parameters
 */
export function getOptimizedImageUrl(
  url: string | null | undefined,
  options: ImageTransformOptions = {}
): string | null {
  if (!url) return null
  
  // Check if it's a Supabase storage URL
  if (!url.includes('supabase.co/storage/v1/object/public/')) {
    return url
  }
  
  // Default options
  const {
    width,
    height,
    resize = 'cover',
    quality = 100, // Maximum quality by default
    format
  } = options
  
  // Build transformation parameters
  const params = new URLSearchParams()
  
  if (width) params.append('width', width.toString())
  if (height) params.append('height', height.toString())
  params.append('resize', resize)
  params.append('quality', quality.toString())
  // Only add format if explicitly opting out of WebP
  if (format === 'origin') params.append('format', format)
  
  // Replace /object/public/ with /render/image/public/
  const transformedUrl = url.replace(
    '/storage/v1/object/public/',
    '/storage/v1/render/image/public/'
  )
  
  // Add parameters
  const separator = transformedUrl.includes('?') ? '&' : '?'
  return `${transformedUrl}${separator}${params.toString()}`
}

/**
 * Get optimized image URL based on common use cases
 */
export const imagePresets = {
  // Avatar images - small square images
  avatar: (url: string | null | undefined) => 
    getOptimizedImageUrl(url, { 
      width: 160, // 2x for retina displays
      height: 160, 
      resize: 'cover',
      quality: 95
    }),
  
  // Chat thumbnails - small images that maintain aspect ratio
  chatThumbnail: (url: string | null | undefined) => 
    getOptimizedImageUrl(url, { 
      width: 160, // 2x for retina displays on 80px avatars
      height: 160,
      resize: 'contain', // Use contain to prevent stretching
      quality: 95
    }),
  
  // Card thumbnails - medium sized images for cards
  cardThumbnail: (url: string | null | undefined) => 
    getOptimizedImageUrl(url, { 
      width: 600, // 2x for retina displays on 300px cards
      height: 400, 
      resize: 'cover',
      quality: 95
    }),
  
  // Studio detail hero images - larger images
  studioHero: (url: string | null | undefined) => 
    getOptimizedImageUrl(url, { 
      width: 1600, 
      height: 900, // 16:9 aspect ratio
      resize: 'cover',
      quality: 100 // Maximum quality for hero images
    }),
  
  // Gallery thumbnails
  galleryThumbnail: (url: string | null | undefined) => 
    getOptimizedImageUrl(url, { 
      width: 600, // Much larger for better quality
      height: 600, // Square for gallery grid
      resize: 'cover',
      quality: 95 
    }),
  
  // Full gallery images
  galleryFull: (url: string | null | undefined) => 
    getOptimizedImageUrl(url, { 
      width: 2000,
      quality: 100 // Maximum quality for full-size viewing
    })
}

/**
 * Calculate responsive image sizes based on viewport
 * This helps determine the right image size to request
 */
export function getResponsiveImageSize(
  containerWidth: number,
  pixelDensity: number = window.devicePixelRatio || 1
): number {
  // Account for pixel density (retina displays)
  const actualWidth = Math.ceil(containerWidth * pixelDensity)
  
  // Round up to nearest 100px to improve caching
  return Math.ceil(actualWidth / 100) * 100
}