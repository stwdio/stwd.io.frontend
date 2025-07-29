'use client'

import { Card, CardContent } from '@/components/ui/card'

export function WorkspaceUsers() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold">User Management</h2>
        <p className="text-muted-foreground">
          Manage platform users and permissions
        </p>
      </div>
      
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <p className="text-muted-foreground">
            User management interface coming soon
          </p>
        </CardContent>
      </Card>
    </div>
  )
}