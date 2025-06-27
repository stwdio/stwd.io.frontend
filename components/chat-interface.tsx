interface ChatInterfaceProps {
  conversation: any
  currentProfileId: number
}

export function ChatInterface({ conversation, currentProfileId }: ChatInterfaceProps) {
  return (
    <div className="flex flex-col h-full">
      <div className="border-b p-4">
        <h3 className="font-medium">Chat with {conversation?.customer_profile?.first_name || 'User'}</h3>
      </div>
      <div className="flex-1 p-4">
        <p className="text-sm text-muted-foreground">Chat functionality coming soon</p>
      </div>
    </div>
  )
} 