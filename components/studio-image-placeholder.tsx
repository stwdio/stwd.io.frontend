import Image from "next/image"
import { cn } from "@/lib/utils"

interface StudioImageProps {
  src?: string | null
  alt: string
  className?: string
  fill?: boolean
  width?: number
  height?: number
  priority?: boolean
}

export function StudioImage({ 
  src, 
  alt, 
  className, 
  fill = false,
  width = 300,
  height = 200,
  priority = false,
  ...props 
}: StudioImageProps) {
  // Use the same placeholder pattern as the old app
  const placeholderSrc = fill 
    ? `/placeholder.svg?height=${height}&width=${width}`
    : `/placeholder.svg?height=${height}&width=${width}`

  return (
    <Image
      src={src || placeholderSrc}
      alt={alt}
      fill={fill}
      width={!fill ? width : undefined}
      height={!fill ? height : undefined}
      className={cn("object-cover", className)}
      priority={priority}
      {...props}
    />
  )
} 