'use client'

import { Button } from '@/components/ui/button'
import { IconMessage, IconSearch, IconUsers } from '@tabler/icons-react'

interface EmptyChatProps {
  onNewChat: () => void
}

export function EmptyChat({ onNewChat }: EmptyChatProps) {
  return (
    <div className="h-full flex flex-col">
      {/* Empty header to align with conversation list */}
      <div className="h-[73px] border-b"></div>
      
      <div className="flex-1 flex items-center justify-center p-8">
      <div className="text-center max-w-md">
        <IconMessage className="h-16 w-16 mx-auto text-muted-foreground mb-6" />
        
        <h2 className="text-2xl font-semibold mb-2">Welcome to Chat</h2>
        <p className="text-muted-foreground mb-8">
          Connect with studios, collaborators, and other creators
        </p>
        
        <div className="space-y-4">
          <Button onClick={onNewChat} size="lg" className="w-full">
            <IconMessage className="mr-2 h-4 w-4" />
            Start New Conversation
          </Button>
          
          <div className="flex gap-4 justify-center">
            <Button variant="outline" size="sm" asChild>
              <a href="/discover">
                <IconSearch className="mr-2 h-4 w-4" />
                Browse Studios
              </a>
            </Button>
            
            <Button variant="outline" size="sm" asChild>
              <a href="/discover/people">
                <IconUsers className="mr-2 h-4 w-4" />
                Find Collaborators
              </a>
            </Button>
          </div>
        </div>
        
        <div className="mt-12 text-sm text-muted-foreground">
          <p>Your conversations are private and secure.</p>
          <p>Studio owners will receive notifications for new messages.</p>
        </div>
      </div>
      </div>
    </div>
  )
}