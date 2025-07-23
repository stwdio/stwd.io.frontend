import { Card, CardContent } from '@/components/ui/card'

interface WorkspaceLeadsProps {
  userId: string
}

export async function WorkspaceLeads({ userId }: WorkspaceLeadsProps) {
  // TODO: Implement leads fetching from inquiries table
  
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold">Incoming Leads</h2>
        <p className="text-muted-foreground">
          Review and respond to studio inquiries
        </p>
      </div>
      
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <p className="text-muted-foreground">
            Leads functionality will be integrated with the chat system
          </p>
        </CardContent>
      </Card>
    </div>
  )
}