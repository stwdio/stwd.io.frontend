'use client'

import { create } from 'zustand'

interface AuthModalStore {
  isOpen: boolean
  title: string
  description: string
  open: (title?: string, description?: string) => void
  close: () => void
}

export const useAuthModal = create<AuthModalStore>((set) => ({
  isOpen: false,
  title: "Sign in to continue",
  description: "You need to be signed in to perform this action.",
  open: (title, description) => set({ 
    isOpen: true, 
    title: title || "Sign in to continue",
    description: description || "You need to be signed in to perform this action."
  }),
  close: () => set({ isOpen: false }),
}))