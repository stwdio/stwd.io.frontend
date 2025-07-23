'use client'

import { Button } from '@/components/ui/button'
import { Quote } from 'lucide-react'
import { useQuoteBasket } from '@/lib/store/quote-basket'
import { toast } from 'sonner'

interface Studio {
  id: number
  name: string
  description: string
  location: string
  hourly_rate: number
}

interface AddListToQuoteButtonProps {
  studios: Studio[]
}

export function AddListToQuoteButton({ studios }: AddListToQuoteButtonProps) {
  const { addStudio } = useQuoteBasket()

  const handleAddToQuote = () => {
    let addedCount = 0
    
    studios.forEach(studio => {
      // Transform the studio object to match the quote basket interface
      const studioForBasket = {
        id: studio.id,
        name: studio.name,
        description: studio.description,
        location: studio.location,
        hourly_rate: studio.hourly_rate,
        verification_status: 'verified' // Assume studios in lists are verified
      }
      
      // Add studio to basket (addStudio handles duplicates)
      addStudio(studioForBasket)
      addedCount++
    })
    
    // Additional success toast for the list operation
    if (addedCount > 0) {
      toast.success(`Added ${addedCount} studios from list to quote basket!`)
    }
  }

  if (studios.length === 0) return null

  return (
    <Button onClick={handleAddToQuote} size="sm" className="gap-2 md:h-10 md:px-4 md:py-2">
      <Quote className="h-4 w-4" />
      <span className="hidden sm:inline">Quote Basket</span>
      <span className="sm:hidden">Quote Basket</span>
    </Button>
  )
} 