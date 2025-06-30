import React, { useEffect, useState } from 'react'
import { useChatStore } from '@/hooks/useChatStore'
import { ChatSidebar } from './ChatSidebar'
import { ChatArea } from './ChatArea'
import { useIsMobile } from '@/hooks/use-mobile'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'
import { cn } from '@/lib/utils'

export function ChatLayout() {
  const isMobile = useIsMobile()
  const [showSidebar, setShowSidebar] = useState(!isMobile)
  
  const {
    selectedConversation,
    setSelectedConversation,
    conversations,
    loading,
    fetchCurrentProfile,
    fetchConversations,
    setupRealtimeSubscription,
    cleanupAllSubscriptions
  } = useChatStore()

  // Initialize chat store and set up subscriptions
  useEffect(() => {
    let isInitialized = false

    const initialize = async () => {
      if (isInitialized) return
      isInitialized = true

      try {
        // Clean up any existing subscriptions first
        cleanupAllSubscriptions()
        
        // Fetch current user profile first
        await fetchCurrentProfile()
        
        // Then fetch conversations
        await fetchConversations()
        
        // Set up real-time subscription for conversations
        const cleanup = setupRealtimeSubscription()
        
        // Return cleanup function
        return cleanup
      } catch (error) {
        console.error('Error initializing chat:', error)
      }
    }

    const cleanupPromise = initialize()

    // Cleanup subscriptions on unmount
    return () => {
      cleanupPromise.then(cleanup => cleanup?.())
      cleanupAllSubscriptions()
    }
  }, []) // Empty dependency array to run only once

  // Handle conversation selection
  const handleSelectConversation = (conversation: any) => {
    setSelectedConversation(conversation)
    if (isMobile) {
      setShowSidebar(false)
    }
  }

  // Handle back to sidebar on mobile
  const handleBackToSidebar = () => {
    setSelectedConversation(null)
    setShowSidebar(true)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full bg-background">
        <div className="text-center space-y-4">
          <div className="h-8 w-8 mx-auto border-2 border-primary border-t-transparent rounded-full animate-spin" />
          <div>
            <h3 className="text-lg font-medium">Loading messages...</h3>
            <p className="text-sm text-muted-foreground">
              Setting up your conversations
            </p>
          </div>
        </div>
      </div>
    )
  }

  // Mobile layout: show either sidebar or chat area
  if (isMobile) {
    return (
      <div className="flex h-full">
        {showSidebar ? (
          <ChatSidebar 
            onSelectConversation={handleSelectConversation}
            className="w-full"
          />
        ) : (
          <div className="flex flex-col w-full">
            {/* Mobile back button */}
            <div className="flex items-center gap-2 p-3 border-b bg-background">
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={handleBackToSidebar}
                className="shrink-0"
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <span className="font-medium text-sm text-muted-foreground">
                Back to conversations
              </span>
            </div>
            
            <div className="flex-1">
              <ChatArea />
            </div>
          </div>
        )}
      </div>
    )
  }

  // Desktop layout: sidebar + chat area
  return (
    <div className="flex h-full">
      {/* Sidebar */}
      <div className={cn(
        "transition-all duration-300 border-r bg-background",
        showSidebar ? "w-80" : "w-0 overflow-hidden"
      )}>
        <ChatSidebar 
          onSelectConversation={handleSelectConversation}
          className="h-full"
        />
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {!showSidebar && (
          <div className="flex items-center gap-2 p-3 border-b bg-background">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => setShowSidebar(true)}
            >
              Show conversations
            </Button>
          </div>
        )}
        
        <div className="flex-1">
          <ChatArea />
        </div>
      </div>
    </div>
  )
} 