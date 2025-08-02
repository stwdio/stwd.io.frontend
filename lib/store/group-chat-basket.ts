import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { toast } from 'sonner'

interface GroupChatBasketStore {
  userIds: string[]
  isOpen: boolean
  
  // Actions
  addUser: (userId: string) => void
  removeUser: (userId: string) => void
  clearBasket: () => void
  toggleBasket: () => void
  isUserInBasket: (userId: string) => boolean
}

const MAX_USERS = 5

export const useGroupChatBasket = create<GroupChatBasketStore>()(
  persist(
    (set, get) => ({
      userIds: [],
      isOpen: false,
      
      addUser: (userId: string) => {
        const { userIds } = get()
        
        if (userIds.includes(userId)) {
          toast.info('User Already Added To Group Chat')
          return
        }
        
        if (userIds.length >= MAX_USERS) {
          toast.error(`Maximum ${MAX_USERS} Users Allowed In Group Chat`)
          return
        }
        
        set({ userIds: [...userIds, userId] })
        toast.success('Added To Group Chat')
      },
      
      removeUser: (userId: string) => {
        set(state => ({
          userIds: state.userIds.filter(id => id !== userId)
        }))
      },
      
      clearBasket: () => {
        set({ userIds: [] })
        toast.success('Group Chat Basket Cleared')
      },
      
      toggleBasket: () => {
        set(state => ({ isOpen: !state.isOpen }))
      },
      
      isUserInBasket: (userId: string) => {
        return get().userIds.includes(userId)
      }
    }),
    {
      name: 'group-chat-basket',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ userIds: state.userIds })
    }
  )
)