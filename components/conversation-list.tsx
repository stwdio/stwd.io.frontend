interface ConversationListProps {
  onSelectConversation: (conversation: any) => void
  selectedConversationId?: number
}

export function ConversationList({ onSelectConversation, selectedConversationId }: ConversationListProps) {
  return (
    <div className="p-4">
      <p className="text-sm text-muted-foreground">No conversations yet</p>
    </div>
  )
} 