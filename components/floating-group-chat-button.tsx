'use client'

import { usePathname } from 'next/navigation'
import { useGroupChatBasket } from '@/lib/store/group-chat-basket'
import { useAuth } from '@/lib/auth/auth-context'
import { Users } from 'lucide-react'
import { GroupChatBasketDialog } from '@/components/group-chat-basket-dialog'

export function FloatingGroupChatButton() {
  const { profile, loading } = useAuth()
  const { userIds, toggleBasket } = useGroupChatBasket()
  const pathname = usePathname()

  // Only show on connections page
  if (loading || !pathname?.includes('/connect/connections')) {
    return null
  }
  
  // Only show for authenticated users
  if (!profile) {
    return null
  }

  // Always show the button on connections page

  return (
    <>
      <div className="fixed bottom-6 right-4 z-40">
        <div className="relative">
          <button
            onClick={toggleBasket}
            className="h-16 w-16 rounded-full shadow-lg cursor-pointer p-0 border-2 border-black bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 hover:bg-gray-100 transition-colors flex items-center justify-center"
            type="button"
          >
            <Users className="h-7 w-7" />
          </button>
          {userIds.length > 0 && (
            <div className="absolute -top-2 -left-2 h-7 w-7 rounded-full bg-black text-white flex items-center justify-center text-sm font-bold z-10 border-2 border-white">
              {userIds.length}
            </div>
          )}
        </div>
      </div>
      <GroupChatBasketDialog />
    </>
  )
}