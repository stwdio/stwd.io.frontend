'use client'

import { useAuth } from '@/lib/auth/auth-context'
import { QuotesContent } from '@/components/quotes/quotes-content'
import { Card, CardContent } from '@/components/ui/card'
import { FileText } from 'lucide-react'

export default function QuotesPage() {
  const { user, profile, loading } = useAuth()

  if (loading) {
    return (
      <div className="flex flex-col flex-1 px-4 py-3 sm:px-6 sm:py-4">
        <div className="animate-pulse">
          <div className="h-8 w-32 bg-muted rounded mb-4" />
          <div className="space-y-3">
            <div className="h-20 bg-muted rounded" />
            <div className="h-20 bg-muted rounded" />
          </div>
        </div>
      </div>
    )
  }

  if (!user || !profile) {
    return (
      <div className="flex flex-col flex-1 px-4 py-3 sm:px-6 sm:py-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Sign in to view quotes</h3>
              <p className="text-muted-foreground">
                Please sign in to view and manage your quote requests.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return <QuotesContent />
}