'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ConnectLayout } from '@/components/connect/connect-layout'
import { QuoteList } from './quote-list'
import { QuoteDetail } from './quote-detail'
import { EmptyQuotes } from './empty-quotes'
import { createClient } from '@/lib/supabase/client'
import { Input } from '@/components/ui/input'
import { IconSearch } from '@tabler/icons-react'
import type { Database } from '@/lib/types/database'

type Profile = Database['public']['Tables']['profiles']['Row']

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

interface QuotesHubProps {
  userId: string
  profile: Profile
  initialQuotes: Quote[]
  initialSelectedQuoteId?: string
}

export function QuotesHub({ 
  userId, 
  profile, 
  initialQuotes,
  initialSelectedQuoteId
}: QuotesHubProps) {
  const [quotes, setQuotes] = useState(initialQuotes)
  const [searchQuery, setSearchQuery] = useState('')
  // Auto-select the first quote if none selected
  const [selectedQuoteId, setSelectedQuoteId] = useState<string | null>(
    initialSelectedQuoteId || (initialQuotes.length > 0 ? initialQuotes[0].id : null)
  )
  const supabase = createClient()
  const router = useRouter()
  
  // Filter quotes based on search query
  const filteredQuotes = quotes.filter(quote => {
    if (!searchQuery) return true
    const searchLower = searchQuery.toLowerCase()
    return (
      quote.studio.name.toLowerCase().includes(searchLower) ||
      quote.project_type.toLowerCase().includes(searchLower) ||
      quote.studio.location?.toLowerCase().includes(searchLower) ||
      quote.custom_message?.toLowerCase().includes(searchLower)
    )
  })

  const selectedQuote = quotes.find(q => q.id === selectedQuoteId) || null

  const handleQuoteSelect = (quoteId: string) => {
    setSelectedQuoteId(quoteId)
    // Find the quote to get the studio slug
    const quote = quotes.find(q => q.id === quoteId)
    if (quote && quote.studio.slug) {
      // Update URL with studio slug
      window.history.replaceState(null, '', `/connect/quotes?studio=${quote.studio.slug}`)
    } else {
      // Fallback to quote ID if no slug
      window.history.replaceState(null, '', `/connect/quotes?quote=${quoteId}`)
    }
  }

  const sidebar = (
    <div className="h-full flex flex-col">
      {/* Search bar */}
      <div className="p-4 border-b">
        <div className="relative">
          <IconSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            type="search"
            placeholder="Find Quotes..."
            className="pl-10 w-full"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>
      
      {/* Quote list */}
      <div className="flex-1 overflow-hidden">
        <QuoteList
          quotes={filteredQuotes}
          selectedId={selectedQuoteId}
          onSelect={handleQuoteSelect}
        />
      </div>
    </div>
  )

  const content = selectedQuote ? (
    <QuoteDetail quote={selectedQuote} />
  ) : null

  const emptyState = <EmptyQuotes userRole={profile.system_role || undefined} />

  return (
    <div className="h-full flex flex-col">
      {/* Mobile header */}
      <div className="lg:hidden flex-shrink-0 bg-background">
        <div className="w-full px-4 sm:px-6">
          <div className="flex items-center justify-between py-4">
            <div>
              <h2 className="text-3xl font-bold">CONNECT</h2>
              <h3 className="text-xl font-medium uppercase text-muted-foreground">
                Quotes
              </h3>
            </div>
          </div>
        </div>
      </div>
      
      {/* Quotes content */}
      <div className="flex-1 overflow-hidden">
        <ConnectLayout
          sidebar={sidebar}
          content={content}
          emptyState={emptyState}
          selectedId={selectedQuoteId ? parseInt(selectedQuoteId) : null}
          mobileTitle={selectedQuote?.studio.name || 'Quotes'}
          onBackToList={() => {
            setSelectedQuoteId(null)
          }}
        />
      </div>
    </div>
  )
}