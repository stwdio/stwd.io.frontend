import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { FileText, DollarSign } from 'lucide-react'

interface QuoteMessageProps {
  price?: number
  message: string
  projectType: string
  budgetRange?: string
  studioName: string
  isOwner?: boolean // true if viewing as studio owner
}

export function QuoteMessage({ 
  price, 
  message, 
  projectType,
  budgetRange,
  studioName,
  isOwner = false
}: QuoteMessageProps) {
  return (
    <Card className="bg-primary/5 border-primary/20 max-w-lg">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
            <FileText className="h-5 w-5 text-primary" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold">Quote Response</p>
            <p className="text-xs text-muted-foreground">
              {isOwner ? `You sent a quote` : `${studioName} sent you a quote`}
            </p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {price && (
          <div className="flex items-center gap-2">
            <DollarSign className="h-4 w-4 text-muted-foreground" />
            <span className="text-2xl font-bold">${price}</span>
            <span className="text-sm text-muted-foreground">/hour</span>
          </div>
        )}
        
        <div className="space-y-2">
          <div className="flex items-center gap-2 flex-wrap">
            <Badge variant="secondary" className="text-xs">
              {projectType}
            </Badge>
            {budgetRange && (
              <Badge variant="outline" className="text-xs">
                Budget: {budgetRange}
              </Badge>
            )}
          </div>
          
          <p className="text-sm">{message}</p>
        </div>
      </CardContent>
    </Card>
  )
}