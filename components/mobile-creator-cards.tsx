"use client"

import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  IconMessage, 
  IconEye, 
  IconCalendar,
  IconCurrencyDollar,
  IconMapPin,
  IconUser
} from '@tabler/icons-react'

// Creator Inquiry Card
interface Inquiry {
  id: number
  project_type: string
  genre: string
  budget_range: string
  preferred_dates: string
  location_preference: string
  custom_message: string
  created_at: string
  updated_at: string
}

interface MobileInquiryCardProps {
  inquiry: Inquiry
  responseCount: number
  onView: (inquiry: Inquiry) => void
  getProjectTypeLabel: (type: string) => string
}

export function MobileInquiryCard({ 
  inquiry, 
  responseCount, 
  onView,
  getProjectTypeLabel 
}: MobileInquiryCardProps) {
  
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  return (
    <Card className="md:hidden">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <CardTitle className="text-base font-semibold">
              {getProjectTypeLabel(inquiry.project_type)}
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              {inquiry.genre || 'Genre not specified'}
            </p>
          </div>
          <Badge variant="secondary" className="text-xs">
            {responseCount} studio{responseCount !== 1 ? 's' : ''}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="pt-0 space-y-3">
        {/* Budget & Dates */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-muted-foreground">Budget:</span>
            <div className="font-medium">{inquiry.budget_range || 'Not specified'}</div>
          </div>
          <div>
            <span className="text-muted-foreground">Dates:</span>
            <div className="font-medium text-xs">{inquiry.preferred_dates || 'Flexible'}</div>
          </div>
        </div>

        {/* Location */}
        {inquiry.location_preference && (
          <div className="text-sm">
            <span className="text-muted-foreground">Location:</span>
            <div className="font-medium">{inquiry.location_preference}</div>
          </div>
        )}

        {/* Message Preview */}
        {inquiry.custom_message && (
          <div className="text-sm">
            <span className="text-muted-foreground">Message:</span>
            <p className="line-clamp-2 mt-1">{inquiry.custom_message}</p>
          </div>
        )}

        {/* Created Date */}
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <IconCalendar className="h-3 w-3" />
          <span>Submitted {formatDate(inquiry.created_at)}</span>
        </div>

        {/* Action Button */}
        <div className="pt-2">
          <Button 
            variant="outline"
            size="sm" 
            className="w-full"
            onClick={() => onView(inquiry)}
          >
            <IconEye className="h-3 w-3 mr-2" />
            View Details
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

// Creator Response Card
interface InquiryResponse {
  inquiry_id: number
  studio_id: number
  status: string
  response_message: string
  quote_amount: number
  responded_at: string
  created_at: string
  studios: {
    id: number
    name: string
    location: string
    hourly_rate: number
    profiles: {
      first_name: string
      last_name: string
      username: string
    }
  }
}

interface MobileResponseCardProps {
  response: InquiryResponse
  inquiry: Inquiry | undefined
  onViewConversation: (inquiryId: number, studioId: number) => void
  getProjectTypeLabel: (type: string) => string
  getStatusBadge: (status: string) => React.ReactNode
  getStudioOwnerName: (profiles: any) => string
}

export function MobileResponseCard({ 
  response, 
  inquiry,
  onViewConversation,
  getProjectTypeLabel,
  getStatusBadge,
  getStudioOwnerName
}: MobileResponseCardProps) {
  
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  return (
    <Card className="md:hidden">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <CardTitle className="text-base font-semibold truncate">
              {response.studios.name}
            </CardTitle>
            <div className="flex items-center gap-1 mt-1 text-sm text-muted-foreground">
              <IconMapPin className="h-3 w-3 shrink-0" />
              <span className="truncate">{response.studios.location}</span>
            </div>
          </div>
          {getStatusBadge(response.status)}
        </div>
      </CardHeader>

      <CardContent className="pt-0 space-y-3">
        {/* Owner & Project Type */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-muted-foreground">Owner:</span>
            <div className="font-medium">{getStudioOwnerName(response.studios.profiles)}</div>
          </div>
          <div>
            <span className="text-muted-foreground">Project:</span>
            <div className="font-medium text-xs">{inquiry ? getProjectTypeLabel(inquiry.project_type) : 'Unknown'}</div>
          </div>
        </div>

        {/* Quote */}
        {response.quote_amount > 0 && (
          <div className="flex items-center gap-1 text-sm font-medium">
            <IconCurrencyDollar className="h-3 w-3 text-muted-foreground" />
            <span>Quote: ${response.quote_amount.toFixed(2)}</span>
          </div>
        )}

        {/* Response Message */}
        {response.response_message && (
          <div className="bg-muted/50 p-3 rounded-md text-sm">
            <span className="text-muted-foreground">Response:</span>
            <p className="mt-1 line-clamp-3">{response.response_message}</p>
          </div>
        )}

        {/* Response Date */}
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <IconCalendar className="h-3 w-3" />
          <span>Responded {response.responded_at ? formatDate(response.responded_at) : 'Not yet responded'}</span>
        </div>

        {/* Action Button */}
        {response.status === 'responded' && (
          <div className="pt-2">
            <Button 
              variant="outline"
              size="sm" 
              className="w-full"
              onClick={() => onViewConversation(response.inquiry_id, response.studio_id)}
            >
              <IconMessage className="h-3 w-3 mr-2" />
              View Conversation
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

// Creator Booking Card
interface Booking {
  id: number
  start_time: string
  end_time: string
  status: string
  total_paid: number
  created_at: string
  studios: {
    name: string
    location: string
  }
}

interface MobileBookingCardProps {
  booking: Booking
  getStatusBadge: (status: string) => React.ReactNode
}

export function MobileBookingCard({ 
  booking,
  getStatusBadge
}: MobileBookingCardProps) {
  
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    })
  }

  return (
    <Card className="md:hidden">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <CardTitle className="text-base font-semibold truncate">
              {booking.studios.name}
            </CardTitle>
            <div className="flex items-center gap-1 mt-1 text-sm text-muted-foreground">
              <IconMapPin className="h-3 w-3 shrink-0" />
              <span className="truncate">{booking.studios.location}</span>
            </div>
          </div>
          {getStatusBadge(booking.status)}
        </div>
      </CardHeader>

      <CardContent className="pt-0 space-y-3">
        {/* Date & Time */}
        <div className="space-y-2">
          <div className="text-sm">
            <span className="text-muted-foreground">Date:</span>
            <div className="font-medium">{formatDate(booking.start_time)}</div>
          </div>
          <div className="text-sm">
            <span className="text-muted-foreground">Time:</span>
            <div className="font-medium">
              {formatTime(booking.start_time)} - {formatTime(booking.end_time)}
            </div>
          </div>
        </div>

        {/* Amount */}
        <div className="flex items-center gap-1 text-sm font-medium">
          <IconCurrencyDollar className="h-3 w-3 text-muted-foreground" />
          <span>{booking.total_paid ? `$${booking.total_paid.toFixed(2)}` : 'Pending payment'}</span>
        </div>

        {/* Booked Date */}
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <IconCalendar className="h-3 w-3" />
          <span>Booked {formatDate(booking.created_at)}</span>
        </div>
      </CardContent>
    </Card>
  )
} 