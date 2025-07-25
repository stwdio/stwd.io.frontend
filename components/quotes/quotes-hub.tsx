'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ConnectLayout } from '@/components/connect/connect-layout'
import { QuoteList } from './quote-list'
import { QuoteDetail } from './quote-detail'
import { EmptyQuotes } from './empty-quotes'
import { createClient } from '@/lib/supabase/client'
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
  const [selectedQuoteId, setSelectedQuoteId] = useState<string | null>(
    initialSelectedQuoteId || (initialQuotes.length > 0 ? initialQuotes[0].id : null)
  )
  const supabase = createClient()
  const router = useRouter()
  
  const selectedQuote = quotes.find(q => q.id === selectedQuoteId) || null

  const handleQuoteSelect = (quoteId: string) => {
    setSelectedQuoteId(quoteId)
    // Update URL without full page reload
    window.history.replaceState(null, '', `/connect/quotes?quote=${quoteId}`)
  }

  const sidebar = (
    <QuoteList
      quotes={quotes}
      selectedId={selectedQuoteId}
      onSelect={handleQuoteSelect}
    />
  )

  const content = selectedQuote ? (
    <QuoteDetail quote={selectedQuote} />
  ) : null

  const emptyState = <EmptyQuotes userRole={profile.system_role || undefined} />

  return (
    <ConnectLayout
      sidebar={sidebar}
      content={content}
      emptyState={emptyState}
      selectedId={selectedQuoteId ? parseInt(selectedQuoteId) : null}
      mobileTitle={selectedQuote?.studio.name || 'Quotes'}
    />
  )
}