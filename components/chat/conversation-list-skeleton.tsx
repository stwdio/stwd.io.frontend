'use client'

import { Skeleton } from '@/components/ui/skeleton'

export function ConversationListSkeleton() {
  return (
    <div className="flex flex-col h-full bg-background">
      {/* Header with title */}
      <div className="p-4 border-b space-y-4">
        <h2 className="text-xl font-semibold">Conversations</h2>
        
        {/* Search and Filter Bar */}
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Skeleton className="h-9 w-full rounded-md" />
          </div>
          <Skeleton className="h-9 w-9 rounded-md" />
        </div>
      </div>
      
      {/* Conversation items */}
      <div className="flex-1 overflow-y-auto">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="relative">
            <div className="p-4 border-b">
              <div className="flex items-start gap-3">
                <Skeleton className="h-10 w-10 rounded-full flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start mb-1">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-12" />
                  </div>
                  <Skeleton className="h-3 w-full mb-1" />
                  <Skeleton className="h-3 w-3/4" />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}