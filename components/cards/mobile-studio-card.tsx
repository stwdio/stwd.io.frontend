"use client"

import React from 'react'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { 
  IconDots, 
  IconEdit, 
  IconEye, 
  IconTrash, 
  IconMapPin, 
  IconCurrencyDollar,
  IconCalendar
} from '@tabler/icons-react'
import { getPriceTierSymbol } from '@/lib/constants/currencies'

interface Studio {
  id: number
  name: string
  description: string
  location: string
  hourly_rate: number
  price_tier?: number
  published: boolean
  verification_status: string
  created_at: string
  slug?: string
}

interface MobileStudioCardProps {
  studio: Studio
  onEdit?: (studio: Studio) => void
  onView?: (studio: Studio) => void
  onDelete?: (studio: Studio) => void
  className?: string
}

export function MobileStudioCard({ 
  studio, 
  onEdit, 
  onView, 
  onDelete,
  className = ""
}: MobileStudioCardProps) {
  
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'published':
        return <Badge variant="default" className="text-xs">Published</Badge>
      case 'draft':
        return <Badge variant="secondary" className="text-xs">Draft</Badge>
      default:
        return <Badge variant="outline" className="text-xs">Draft</Badge>
    }
  }

  const getVerificationBadge = (status: string) => {
    switch (status) {
      case 'verified':
        return <Badge variant="default" className="text-xs bg-green-500">Verified</Badge>
      case 'pending':
        return <Badge variant="secondary" className="text-xs bg-yellow-500">Pending</Badge>
      case 'rejected':
        return <Badge variant="destructive" className="text-xs">Rejected</Badge>
      default:
        return <Badge variant="outline" className="text-xs">Unverified</Badge>
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  return (
    <Card className={`md:hidden ${className}`}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <CardTitle className="text-base font-semibold truncate">
              {studio.name}
            </CardTitle>
            <div className="flex items-center gap-1 mt-1 text-sm text-muted-foreground">
              <IconMapPin className="h-3 w-3 shrink-0" />
              <span className="truncate">{studio.location}</span>
            </div>
          </div>
          
          {/* Actions Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <IconDots className="h-4 w-4" />
                <span className="sr-only">Open menu</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40">
              {onView && (
                <DropdownMenuItem onClick={() => onView(studio)}>
                  <IconEye className="h-4 w-4 mr-2" />
                  View
                </DropdownMenuItem>
              )}
              {onEdit && (
                <DropdownMenuItem onClick={() => onEdit(studio)}>
                  <IconEdit className="h-4 w-4 mr-2" />
                  Edit
                </DropdownMenuItem>
              )}
              {onDelete && (
                <DropdownMenuItem 
                  onClick={() => onDelete(studio)}
                  className="text-red-600 focus:text-red-600"
                >
                  <IconTrash className="h-4 w-4 mr-2" />
                  Delete
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>

      <CardContent className="pt-0 space-y-3">
        {/* Key Information Row */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1 text-sm font-medium">
            <IconCurrencyDollar className="h-3 w-3 text-muted-foreground" />
            <span>{getPriceTierSymbol(studio.price_tier || 1)}</span>
          </div>
          
          <div className="flex items-center gap-2">
            {getStatusBadge(studio.published ? 'published' : 'draft')}
            {getVerificationBadge(studio.verification_status)}
          </div>
        </div>

        {/* Description */}
        {studio.description && (
          <p className="text-sm text-muted-foreground line-clamp-2">
            {studio.description}
          </p>
        )}

        {/* Created Date */}
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <IconCalendar className="h-3 w-3" />
          <span>Created {formatDate(studio.created_at)}</span>
        </div>

        {/* Primary Action Button */}
        <div className="pt-2">
          <Button 
            asChild 
            variant="outline" 
            size="sm" 
            className="w-full"
          >
            <Link href={`/workspace/studios/${studio.id}/edit`}>
              <IconEdit className="h-3 w-3 mr-2" />
              Edit Studio
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

// Mobile Inquiry Card Component
interface Inquiry {
  inquiry_id: number
  studio_id: number
  status: string
  response_message: string
  quote_amount: number
  responded_at: string
  created_at: string
  inquiries: {
    id: number
    project_type: string
    genre: string
    budget_range: string
    preferred_dates: string
    location_preference: string
    custom_message: string
    created_at: string
    profiles: {
      first_name: string
      last_name: string
      username: string
    }
  }
  studios: {
    name: string
  }
}

interface MobileInquiryCardProps {
  inquiry: Inquiry
  onRespond?: (inquiry: Inquiry) => void
  className?: string
}

export function MobileInquiryCard({ 
  inquiry, 
  onRespond,
  className = ""
}: MobileInquiryCardProps) {
  
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'responded':
        return <Badge variant="default" className="text-xs bg-green-500">Responded</Badge>
      case 'pending':
        return <Badge variant="secondary" className="text-xs bg-yellow-500">Pending</Badge>
      case 'declined':
        return <Badge variant="destructive" className="text-xs">Declined</Badge>
      default:
        return <Badge variant="outline" className="text-xs">New</Badge>
    }
  }

  const getCreatorName = (profiles: { first_name?: string; last_name?: string; username?: string }) => {
    if (profiles.first_name && profiles.last_name) {
      return `${profiles.first_name} ${profiles.last_name}`
    }
    return profiles.username || 'Unknown Creator'
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  return (
    <Card className={`md:hidden ${className}`}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <CardTitle className="text-base font-semibold">
              {inquiry.inquiries.project_type.replace('_', ' ').toUpperCase()}
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              from {getCreatorName(inquiry.inquiries.profiles)}
            </p>
          </div>
          {getStatusBadge(inquiry.status)}
        </div>
      </CardHeader>

      <CardContent className="pt-0 space-y-3">
        {/* Studio & Genre */}
        <div className="space-y-1">
          <div className="text-sm font-medium">{inquiry.studios.name}</div>
          <div className="text-sm text-muted-foreground">
            {inquiry.inquiries.genre && `Genre: ${inquiry.inquiries.genre}`}
          </div>
        </div>

        {/* Budget & Dates */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-muted-foreground">Budget:</span>
            <div className="font-medium">{inquiry.inquiries.budget_range}</div>
          </div>
          <div>
            <span className="text-muted-foreground">Dates:</span>
            <div className="font-medium text-xs">{inquiry.inquiries.preferred_dates}</div>
          </div>
        </div>

        {/* Message Preview */}
        {inquiry.inquiries.custom_message && (
          <div className="text-sm">
            <span className="text-muted-foreground">Message:</span>
            <p className="line-clamp-2 mt-1">{inquiry.inquiries.custom_message}</p>
          </div>
        )}

        {/* Created Date */}
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <IconCalendar className="h-3 w-3" />
          <span>Received {formatDate(inquiry.created_at)}</span>
        </div>

        {/* Response Section */}
        {inquiry.status === 'responded' && inquiry.response_message && (
          <div className="bg-muted/50 p-3 rounded-md text-sm">
            <span className="text-muted-foreground">Your response:</span>
            <p className="mt-1">{inquiry.response_message}</p>
            {inquiry.quote_amount > 0 && (
              <p className="mt-1 font-medium">Quote: ${inquiry.quote_amount}</p>
            )}
          </div>
        )}

        {/* Action Button */}
        {inquiry.status === 'pending' && onRespond && (
          <div className="pt-2">
            <Button 
              size="sm" 
              className="w-full"
              onClick={() => onRespond(inquiry)}
            >
              Respond to Inquiry
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
} 