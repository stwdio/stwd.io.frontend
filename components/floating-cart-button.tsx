'use client'

import { useState, useEffect } from 'react'
import { useQuoteBasket } from '@/lib/store/quote-basket'
import { supabase } from '@/lib/supabase'
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
  }, [])

  // Only show for creators
  if (loading || !profile || profile.role !== 'creator') {
    return null
  }

  return (
    <>
      <div className="fixed bottom-6 right-6 z-50">
        <div className="relative">
          <Button
            onClick={toggleBasket}
            size="lg"
            className="h-14 w-14 rounded-full shadow-lg cursor-pointer p-0"
            variant="outline"
          >
            <div className="relative p-2">
              <ShoppingCart className="h-6 w-6" />
            </div>
          </Button>
          {basketStudios.length > 0 && (
            <Badge 
              variant="default" 
              className="absolute -top-2 -left-2 h-6 w-6 p-0 flex items-center justify-center text-xs font-bold min-w-[1.5rem] z-10"
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