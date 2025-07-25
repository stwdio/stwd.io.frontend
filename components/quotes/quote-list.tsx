'use client'

import { Badge } from '@/components/ui/badge'
import { Clock, CheckCircle, XCircle } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { cn } from '@/lib/utils'

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

interface QuoteListProps {
  quotes: Quote[]
  selectedId: string | null
  onSelect: (id: string) => void
}

export function QuoteList({ quotes, selectedId, onSelect }: QuoteListProps) {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-3 w-3" />
      case 'responded':
        return <CheckCircle className="h-3 w-3" />
      case 'declined':
        return <XCircle className="h-3 w-3" />
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
    <div className="h-full overflow-y-auto">
      <div className="p-4 space-y-2">
        {quotes.map((quote) => (
          <div
            key={quote.id}
            onClick={() => onSelect(quote.id)}
            className={cn(
              "p-4 rounded-lg cursor-pointer transition-colors border",
              selectedId === quote.id 
                ? "bg-accent border-accent-foreground/20" 
                : "hover:bg-muted/50 border-transparent"
            )}
          >
            <div className="flex items-start justify-between mb-2">
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold truncate">{quote.studio.name}</h3>
                {quote.studio.location && (
                  <p className="text-sm text-muted-foreground truncate">{quote.studio.location}</p>
                )}
              </div>
              <Badge variant={getStatusColor(quote.status)} className="flex items-center gap-1 ml-2">
                {getStatusIcon(quote.status)}
                {quote.status}
              </Badge>
            </div>
            
            <p className="text-sm text-muted-foreground truncate mb-1">
              {quote.project_type}
            </p>
            
            {quote.response?.price && (
              <p className="text-sm font-semibold">${quote.response.price}/hour</p>
            )}
            
            <p className="text-xs text-muted-foreground">
              {formatDistanceToNow(new Date(quote.created_at), { addSuffix: true })}
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}