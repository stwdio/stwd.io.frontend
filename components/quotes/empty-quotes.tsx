'use client'

import { Button } from '@/components/ui/button'
import { FileText } from 'lucide-react'
import Link from 'next/link'

interface EmptyQuotesProps {
  userRole?: string
}

export function EmptyQuotes({ userRole }: EmptyQuotesProps) {
  return (
    <div className="flex flex-col items-center justify-center h-full p-8">
      <FileText className="h-16 w-16 text-muted-foreground mb-4" />
      <h2 className="text-xl font-semibold mb-2">No quotes selected</h2>
      <p className="text-muted-foreground text-center mb-6 max-w-md">
        {userRole === 'user' 
          ? 'Select a quote from the list to view details, or browse studios to request new quotes.'
          : 'Select a quote request from the list to view details and respond.'
        }
      </p>
      {userRole === 'user' && (
        <Button asChild>
          <Link href="/discover/studios">Browse Studios</Link>
        </Button>
      )}
    </div>
  )
}