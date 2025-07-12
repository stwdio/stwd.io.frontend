import { Skeleton } from '@/components/ui/skeleton'
import { Card } from '@/components/ui/card'

export function ChatLayoutSkeleton() {
  return (
    <div className="h-full flex">
      {/* Sidebar */}
      <div className="w-1/3 border-r border-border">
        <div className="p-4 border-b">
          <Skeleton className="h-6 w-24" />
        </div>
        <div className="p-4 space-y-3">
          {Array.from({ length: 5 }, (_, i) => (
            <ConversationItemSkeleton key={i} />
          ))}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col">
        <div className="p-4 border-b">
          <Skeleton className="h-6 w-32" />
        </div>
        <div className="flex-1 p-4 space-y-4">
          {Array.from({ length: 6 }, (_, i) => (
            <MessageBubbleSkeleton key={i} isOwn={i % 3 === 0} />
          ))}
        </div>
        <div className="p-4 border-t">
          <div className="flex space-x-2">
            <Skeleton className="flex-1 h-10" />
            <Skeleton className="h-10 w-20" />
          </div>
        </div>
      </div>
    </div>
  )
}

export function ConversationListSkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 8 }, (_, i) => (
        <ConversationItemSkeleton key={i} />
      ))}
    </div>
  )
}

function ConversationItemSkeleton() {
  return (
    <div className="flex items-center space-x-3 p-3 rounded-lg">
      <Skeleton className="h-10 w-10 rounded-full" />
      <div className="flex-1 space-y-2">
        <div className="flex justify-between">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-3 w-12" />
        </div>
        <Skeleton className="h-3 w-48" />
      </div>
    </div>
  )
}

function MessageBubbleSkeleton({ isOwn }: { isOwn: boolean }) {
  return (
    <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
      <div className={`max-w-xs space-y-2 ${isOwn ? 'order-2' : 'order-1'}`}>
        {!isOwn && <Skeleton className="h-6 w-20" />}
        <Card className={`p-3 ${isOwn ? 'bg-primary/10' : ''}`}>
          <Skeleton className="h-4 w-full mb-2" />
          {Math.random() > 0.5 && <Skeleton className="h-4 w-3/4" />}
        </Card>
        <Skeleton className="h-3 w-12" />
      </div>
      {!isOwn && (
        <Skeleton className="h-8 w-8 rounded-full ml-3 order-1" />
      )}
    </div>
  )
}