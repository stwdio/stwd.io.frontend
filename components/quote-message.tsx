'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { IconCurrencyDollar, IconMessage } from '@tabler/icons-react'

interface QuoteMessageProps {
  content: string
  quoteAmount: number | null
  senderName: string
  timestamp: string
  isOwn?: boolean
}

export function QuoteMessage({ 
  content, 
  quoteAmount, 
  senderName, 
  timestamp,
  isOwn = false 
}: QuoteMessageProps) {
  // Ensure we have a valid quote amount
  const hasValidQuote = quoteAmount !== null && quoteAmount !== undefined && quoteAmount > 0

  return (
    <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'} mb-4`}>
      <div className={`max-w-md ${isOwn ? 'ml-auto' : 'mr-auto'}`}>
        <Card className="border-2 border-blue-200 bg-blue-50 shadow-sm">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium flex items-center">
                <IconCurrencyDollar className="h-4 w-4 mr-1 text-blue-600" />
                {hasValidQuote ? 'Quote Response' : 'Response'}
              </CardTitle>
              <Badge variant="secondary" className="bg-blue-100 text-blue-800 text-xs">
                {senderName}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            {hasValidQuote && (
              <div className="mb-4 p-4 bg-blue-100 rounded-lg border border-blue-200">
                <div className="text-xs text-blue-600 font-medium mb-1">Quoted Amount</div>
                <div className="text-2xl font-bold text-blue-800">
                  ${quoteAmount!.toFixed(2)}
                </div>
              </div>
            )}
            
            {content && (
              <div className={hasValidQuote ? 'space-y-2' : ''}>
                {hasValidQuote && (
                  <div className="text-xs text-blue-600 font-medium mb-2">Message</div>
                )}
                <p className="text-sm text-gray-700 leading-relaxed">
                  {content}
                </p>
              </div>
            )}
            
            <div className="mt-3 pt-2 border-t border-blue-200">
              <div className="text-xs text-blue-500">
                {new Date(timestamp).toLocaleDateString()} at {new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 