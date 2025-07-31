'use client'

import { ConnectLayout } from '@/components/connect/connect-layout'
import { Skeleton } from '@/components/ui/skeleton'

export function ChatHubSkeleton() {
  // Sidebar skeleton - matches ConversationList exactly
  const sidebarSkeleton = (
    <div className="flex flex-col h-full">
      {/* Search and Filter - matches h-[73px] */}
      <div className="h-[73px] p-4 border-b flex items-center">
        <div className="flex items-center gap-2 w-full">
          {/* Search Input Skeleton */}
          <div className="relative flex-1">
            <Skeleton className="h-9 w-full rounded-md" />
          </div>
          
          {/* Filter Button Skeleton */}
          <Skeleton className="h-9 w-9 rounded-md" />
        </div>
      </div>
      
      {/* Conversation items */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-2 space-y-2">
          {/* 5 skeleton conversations as requested */}
          {[...Array(5)].map((_, i) => (
            <div key={i} className="w-full p-3 rounded-lg flex items-start gap-3">
              {/* Avatar */}
              <Skeleton className="h-10 w-10 rounded-full shrink-0" />
              
              <div className="flex-1 min-w-0">
                {/* Top row with name and time */}
                <div className="flex items-baseline justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <Skeleton className="h-4 w-24" />
                    {/* Badge for some conversations */}
                    {i % 2 === 0 && <Skeleton className="h-5 w-14 rounded-full" />}
                  </div>
                  <Skeleton className="h-3 w-8 shrink-0 ml-1" />
                </div>
                
                {/* Message preview */}
                <Skeleton className="h-3 w-full mt-1" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )

  // Content skeleton - matches MessageThread exactly
  const contentSkeleton = (
    <div className="h-full flex flex-col">
      {/* Header - matches h-[73px] */}
      <div className="h-[73px] p-4 border-b flex items-center">
        <div className="flex items-center gap-3">
          <Skeleton className="h-10 w-10 rounded-full" />
          <div>
            <Skeleton className="h-5 w-32 mb-1" />
            <Skeleton className="h-3 w-24" />
          </div>
        </div>
      </div>
      
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="space-y-4">
          {/* 7 skeleton messages as requested */}
          {/* Received message */}
          <div className="flex gap-3">
            <Skeleton className="h-8 w-8 rounded-full shrink-0" />
            <div className="flex flex-col gap-1 max-w-[70%]">
              <Skeleton className="h-16 w-64 rounded-lg" />
              <Skeleton className="h-3 w-12" />
            </div>
          </div>
          
          {/* Sent message */}
          <div className="flex gap-3 flex-row-reverse">
            <Skeleton className="h-8 w-8 rounded-full shrink-0" />
            <div className="flex flex-col gap-1 max-w-[70%] items-end">
              <Skeleton className="h-10 w-48 rounded-lg" />
              <Skeleton className="h-3 w-12" />
            </div>
          </div>
          
          {/* Received message */}
          <div className="flex gap-3">
            <Skeleton className="h-8 w-8 rounded-full shrink-0" />
            <div className="flex flex-col gap-1 max-w-[70%]">
              <Skeleton className="h-12 w-56 rounded-lg" />
              <Skeleton className="h-3 w-12" />
            </div>
          </div>
          
          {/* Sent message */}
          <div className="flex gap-3 flex-row-reverse">
            <Skeleton className="h-8 w-8 rounded-full shrink-0" />
            <div className="flex flex-col gap-1 max-w-[70%] items-end">
              <Skeleton className="h-20 w-72 rounded-lg" />
              <Skeleton className="h-3 w-12" />
            </div>
          </div>
          
          {/* Received message */}
          <div className="flex gap-3">
            <Skeleton className="h-8 w-8 rounded-full shrink-0" />
            <div className="flex flex-col gap-1 max-w-[70%]">
              <Skeleton className="h-10 w-48 rounded-lg" />
              <Skeleton className="h-3 w-12" />
            </div>
          </div>
          
          {/* Sent message */}
          <div className="flex gap-3 flex-row-reverse">
            <Skeleton className="h-8 w-8 rounded-full shrink-0" />
            <div className="flex flex-col gap-1 max-w-[70%] items-end">
              <Skeleton className="h-14 w-60 rounded-lg" />
              <Skeleton className="h-3 w-12" />
            </div>
          </div>
          
          {/* Received message */}
          <div className="flex gap-3">
            <Skeleton className="h-8 w-8 rounded-full shrink-0" />
            <div className="flex flex-col gap-1 max-w-[70%]">
              <Skeleton className="h-16 w-52 rounded-lg" />
              <Skeleton className="h-3 w-12" />
            </div>
          </div>
        </div>
      </div>
      
      {/* Input */}
      <div className="p-4 border-t">
        <div className="flex gap-2 items-center">
          <Skeleton className="h-10 flex-1 rounded-md" />
          <Skeleton className="h-10 w-10 rounded-md" />
        </div>
      </div>
    </div>
  )

  // Empty state skeleton
  const emptyStateSkeleton = (
    <div className="flex items-center justify-center h-full">
      <div className="text-center space-y-4">
        <Skeleton className="h-16 w-16 rounded-full mx-auto" />
        <Skeleton className="h-6 w-48 mx-auto" />
        <Skeleton className="h-4 w-64 mx-auto" />
      </div>
    </div>
  )

  return (
    <div className="h-full flex flex-col">
      {/* Mobile header */}
      <div className="lg:hidden flex-shrink-0 bg-background">
        <div className="w-full px-4 sm:px-6">
          <div className="flex items-center justify-between py-4">
            <div>
              <h2 className="text-3xl font-bold">CONNECT</h2>
              <h3 className="text-xl font-medium uppercase text-muted-foreground">
                Chat
              </h3>
            </div>
          </div>
        </div>
      </div>
      
      {/* Chat content */}
      <div className="flex-1 overflow-hidden">
        <ConnectLayout
          sidebar={sidebarSkeleton}
          content={contentSkeleton}
          emptyState={emptyStateSkeleton}
          selectedId={1} // Show content skeleton by default
          mobileTitle="Loading..."
          onBackToList={() => {}}
        />
      </div>
    </div>
  )
}