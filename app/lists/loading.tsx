export default function Loading() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <div className="h-8 bg-muted animate-pulse rounded-md w-48 mb-2"></div>
          <div className="h-4 bg-muted animate-pulse rounded-md w-64"></div>
        </div>
        <div className="h-10 bg-muted animate-pulse rounded-md w-32"></div>
      </div>
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="h-48 bg-muted animate-pulse rounded-lg border"></div>
        ))}
      </div>
    </div>
  )
} 