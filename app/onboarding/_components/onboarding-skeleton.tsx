import { Skeleton } from '@/components/ui/skeleton'
import { Card, CardContent, CardHeader } from '@/components/ui/card'

export function OnboardingPageSkeleton() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 sm:px-6 lg:px-8 py-12">
      <div className="max-w-3xl w-full space-y-8">
        <div className="text-center">
          <Skeleton className="h-10 w-64 mx-auto mb-4" />
          <Skeleton className="h-6 w-96 mx-auto mb-2" />
          <Skeleton className="h-4 w-72 mx-auto" />
        </div>
        
        <Card className="border-border">
          <CardHeader>
            <Skeleton className="h-6 w-48 mb-2" />
            <Skeleton className="h-4 w-80" />
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Role option skeletons */}
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-start space-x-3 p-4 rounded-lg border border-border">
                  <Skeleton className="h-4 w-4 rounded-full mt-1" />
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <Skeleton className="h-5 w-5" />
                      <div>
                        <Skeleton className="h-5 w-32 mb-1" />
                        <Skeleton className="h-4 w-64" />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-8 flex justify-end">
              <Skeleton className="h-10 w-48" />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}