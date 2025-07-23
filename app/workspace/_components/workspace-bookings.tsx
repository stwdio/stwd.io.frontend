import { Card, CardContent } from '@/components/ui/card'

interface WorkspaceBookingsProps {
  userId: string
}

export async function WorkspaceBookings({ userId }: WorkspaceBookingsProps) {
  // TODO: Implement bookings fetching
  
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold">Bookings</h2>
        <p className="text-muted-foreground">
          Manage your confirmed bookings and schedule
        </p>
      </div>
      
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <p className="text-muted-foreground">
            Bookings will be integrated with the chat system
          </p>
        </CardContent>
      </Card>
    </div>
  )
}