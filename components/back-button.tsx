'use client'

import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { cn } from '@/lib/utils'

interface BackButtonProps {
  href: string
  label: string
  className?: string
}

export function BackButton({ href, label, className }: BackButtonProps) {
  return (
    <Link 
      href={href} 
      className={cn(
        "inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-4",
        className
      )}
    >
      <ArrowLeft className="h-4 w-4" />
      <span>{label}</span>
    </Link>
  )
}