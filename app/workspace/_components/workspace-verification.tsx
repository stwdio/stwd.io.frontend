'use client'

import { Card, CardContent } from '@/components/ui/card'

export function WorkspaceVerification() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold">Verification Queue</h2>
        <p className="text-muted-foreground">
          Review and verify studio listings
        </p>
      </div>
      
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <p className="text-muted-foreground">
            No studios pending verification
          </p>
        </CardContent>
      </Card>
    </div>
  )
}