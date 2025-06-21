"use client"

import type React from "react"

import { useEffect, useState } from "react"

interface ClientLayoutProps {
  children: React.ReactNode
}

export function ClientLayout({ children }: ClientLayoutProps) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <div className="min-h-screen bg-black text-white">
        <div className="animate-pulse">
          <div className="h-16 bg-gray-900 border-b border-gray-800" />
          <div className="container mx-auto px-4 py-8">
            <div className="h-8 bg-gray-800 rounded w-1/3 mb-4" />
            <div className="h-4 bg-gray-800 rounded w-2/3 mb-2" />
            <div className="h-4 bg-gray-800 rounded w-1/2" />
          </div>
        </div>
      </div>
    )
  }

  return <>{children}</>
}
