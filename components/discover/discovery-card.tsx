'use client'

import React from 'react'
import Link from 'next/link'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { cn } from '@/lib/utils'

export interface DiscoveryCardProps {
  href: string
  image?: string
  imageAlt?: string
  title: string
  subtitle?: React.ReactNode
  description?: string
  badges?: React.ReactNode
  socialProof?: React.ReactNode
  actions?: React.ReactNode
  metadata?: React.ReactNode
  className?: string
}

/**
 * Generic card component for displaying discoverable items (studios, people, etc.)
 * Provides a consistent layout while allowing flexible content
 */
export function DiscoveryCard({
  href,
  image,
  imageAlt,
  title,
  subtitle,
  description,
  badges,
  socialProof,
  actions,
  metadata,
  className
}: DiscoveryCardProps) {
  return (
    <Card className={cn("group hover:shadow-lg transition-all duration-200 overflow-hidden", className)}>
      <Link href={href} className="block">
        <CardHeader className="p-0">
          {/* Image Section */}
          <div className="relative aspect-[4/3] bg-muted overflow-hidden">
            {image ? (
              <img 
                src={image} 
                alt={imageAlt || title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Avatar className="h-32 w-32">
                  <AvatarFallback className="text-4xl">
                    {title.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              </div>
            )}
          </div>
        </CardHeader>
      </Link>
      
      <CardContent className="p-4 space-y-3">
        {/* Title and Subtitle */}
        <div>
          <h3 className="font-semibold text-lg line-clamp-1">{title}</h3>
          {subtitle && (
            <div className="text-sm text-muted-foreground mt-1">
              {subtitle}
            </div>
          )}
        </div>

        {/* Badges */}
        {badges && (
          <div className="flex flex-wrap gap-1">
            {badges}
          </div>
        )}

        {/* Description */}
        {description && (
          <p className="text-sm text-muted-foreground line-clamp-2">
            {description}
          </p>
        )}

        {/* Metadata (ratings, price, etc.) */}
        {metadata && (
          <div className="text-sm">
            {metadata}
          </div>
        )}

        {/* Social Proof */}
        {socialProof && (
          <div className="pt-2 border-t">
            {socialProof}
          </div>
        )}

        {/* Action Buttons */}
        {actions && (
          <div className="flex gap-2 pt-2">
            {actions}
          </div>
        )}
      </CardContent>
    </Card>
  )
}