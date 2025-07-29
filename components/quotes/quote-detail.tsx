'use client'

import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { MessageSquare, Clock, CheckCircle, XCircle } from 'lucide-react'
import Link from 'next/link'
import { formatDistanceToNow } from 'date-fns'

interface Quote {
  id: string
  created_at: string
  status: 'pending' | 'responded' | 'declined'
  project_type: string
  budget_range?: string
  custom_message?: string
  studio: {
    id: number
    name: string
    slug?: string
    location: string
    photo_urls?: string[]
  }
  response?: {
    id: string
    price?: number
    message: string
    created_at: string
  }
  conversation_id?: string
}

interface QuoteDetailProps {
  quote: Quote
}

export function QuoteDetail({ quote }: QuoteDetailProps) {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-4 w-4" />
      case 'responded':
        return <CheckCircle className="h-4 w-4" />
      case 'declined':
        return <XCircle className="h-4 w-4" />
      default:
        return null
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'secondary'
      case 'responded':
        return 'default'
      case 'declined':
        return 'destructive'
      default:
        return 'secondary'
    }
  }

  return (
    <div className="h-full flex flex-col bg-background">
      {/* Header section */}
      <div className="flex-shrink-0 border-b bg-background">
        <div className="p-6">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-4">
              {quote.studio.photo_urls?.[0] && (
                <img 
                  src={quote.studio.photo_urls[0]} 
                  alt={quote.studio.name}
                  className="h-20 w-20 rounded-lg object-cover"
                />
              )}
              <div>
                <h1 className="text-2xl font-bold">{quote.studio.name}</h1>
                {quote.studio.location && (
                  <p className="text-muted-foreground">{quote.studio.location}</p>
                )}
              </div>
            </div>
            <Badge variant={getStatusColor(quote.status)} className="flex items-center gap-1">
              {getStatusIcon(quote.status)}
              {quote.status.charAt(0).toUpperCase() + quote.status.slice(1)}
            </Badge>
          </div>
        </div>
      </div>
      
      {/* Scrollable content area */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-6 space-y-8">
            <div>
              <h3 className="font-semibold mb-2">Quote Details</h3>
              <div className="space-y-3">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Project Type</p>
                  <p>{quote.project_type}</p>
                </div>
                
                {quote.budget_range && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Budget Range</p>
                    <p>{quote.budget_range}</p>
                  </div>
                )}
                
                {quote.custom_message && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Your Message</p>
                    <p className="whitespace-pre-wrap">{quote.custom_message}</p>
                  </div>
                )}
                
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Requested</p>
                  <p>{formatDistanceToNow(new Date(quote.created_at), { addSuffix: true })}</p>
                </div>
              </div>
            </div>
            
            {quote.response && (
              <div className="border-t pt-6">
                <h3 className="font-semibold mb-2">Studio Response</h3>
                <div className="space-y-3">
                  {quote.response.price && (
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Quoted Price</p>
                      <p className="text-2xl font-bold">${quote.response.price}/hour</p>
                    </div>
                  )}
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Message</p>
                    <p className="whitespace-pre-wrap">{quote.response.message}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Responded</p>
                    <p>{formatDistanceToNow(new Date(quote.response.created_at), { addSuffix: true })}</p>
                  </div>
                </div>
              </div>
            )}
            
          <div className="flex gap-3 pt-4">
            {quote.conversation_id ? (
              <Button asChild className="flex-1">
                <Link href={`/connect/chat?conversation=${quote.conversation_id}`}>
                  <MessageSquare className="h-4 w-4 mr-2" />
                  View Conversation
                </Link>
              </Button>
            ) : quote.status === 'responded' && (
              <Button disabled className="flex-1">
                Conversation Starting...
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}