'use client'

import { useState, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { useQuoteBasket } from '@/lib/store/quote-basket'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ShoppingCart } from 'lucide-react'
import { QuoteBasketDialog } from '@/components/quote-basket-dialog'

interface Profile {
  id: number
  user_id: string
  role: 'creator' | 'owner' | 'admin' | null
}

export function FloatingCartButton() {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const { studios: basketStudios, toggleBasket } = useQuoteBasket()
  const pathname = usePathname()
  const supabase = createClient()

  useEffect(() => {
    const getProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        setLoading(false)
        return
      }

      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single()

      if (profileData) {
        setProfile(profileData)
      }
      setLoading(false)
    }

    getProfile()
  }, [supabase])

  // Hide on profile pages or if not a creator
  if (loading || !profile || profile.role !== 'creator' || pathname.startsWith('/profile')) {
    return null
  }

  return (
    <>
      <div className="fixed bottom-6 right-4 z-50">
        <div className="relative">
          <Button
            onClick={toggleBasket}
            size="lg"
            className="h-16 w-16 rounded-full shadow-lg cursor-pointer p-0 border-2 border-black aspect-square min-w-0 min-h-0 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60"
            variant="outline"
          >
            <div className="relative flex items-center justify-center w-full h-full">
              <ShoppingCart className="h-7 w-7" />
            </div>
          </Button>
          {basketStudios.length > 0 && (
            <Badge 
              variant="default" 
              className="absolute -top-2 -left-2 h-7 w-7 p-0 flex items-center justify-center text-sm font-bold min-w-[1.75rem] z-10 border-2 border-black bg-primary/95 backdrop-blur supports-[backdrop-filter]:bg-primary/90"
            >
              {basketStudios.length}
            </Badge>
          )}
        </div>
      </div>
      <QuoteBasketDialog />
    </>
  )
} 