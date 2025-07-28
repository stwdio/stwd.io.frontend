'use client'

import { usePathname } from 'next/navigation'
import { useQuoteBasket } from '@/lib/store/quote-basket'
import { useAuth } from '@/lib/auth/auth-context'
import { ShoppingCart } from 'lucide-react'
import { QuoteBasketDialog } from '@/components/quote-basket-dialog'

export function FloatingCartButton() {
  const { profile, loading, professionalRoles } = useAuth()
  const { studios: basketStudios, toggleBasket } = useQuoteBasket()
  const pathname = usePathname()

  // Only show on studios discover page
  if (loading || !pathname?.includes('/discover/studios')) {
    return null
  }
  
  // Only show for users who can request quotes (not studio owners)
  // Show for musicians, podcasters, voice actors, a&r, engineers, managers
  const isStudioOwner = professionalRoles?.some(pr => pr.role.slug === 'studio-owner')
  const hasCreatorRole = professionalRoles?.some(pr => 
    ['musician', 'podcaster', 'voice-actor', 'a-and-r', 'engineer', 'manager'].includes(pr.role.slug)
  )
  
  if (!profile || !hasCreatorRole || isStudioOwner) {
    return null
  }

  return (
    <>
      <div className="fixed bottom-6 right-4 z-40">
        <div className="relative">
          <button
            onClick={toggleBasket}
            className="h-16 w-16 rounded-full shadow-lg cursor-pointer p-0 border-2 border-black bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 hover:bg-gray-100 transition-colors flex items-center justify-center"
            type="button"
          >
            <ShoppingCart className="h-7 w-7" />
          </button>
          {basketStudios.length > 0 && (
            <div className="absolute -top-2 -left-2 h-7 w-7 rounded-full bg-black text-white flex items-center justify-center text-sm font-bold z-10 border-2 border-white">
              {basketStudios.length}
            </div>
          )}
        </div>
      </div>
      <QuoteBasketDialog />
    </>
  )
} 