export default function Loading() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="animate-pulse space-y-8">
            <div className="h-8 bg-muted rounded-lg w-1/3"></div>
            <div className="h-64 bg-muted rounded-2xl"></div>
            <div className="grid gap-6 md:grid-cols-2">
              <div className="h-48 bg-muted rounded-2xl"></div>
              <div className="h-48 bg-muted rounded-2xl"></div>
            </div>
            <div className="h-32 bg-muted rounded-2xl"></div>
          </div>
        </div>
      </div>
    </div>
  )
}