import Link from 'next/link'
import { Package } from 'lucide-react'

export function HistoryEmptyState() {
  return (
    <div className="col-span-full rounded-xl border border-dashed border-border p-8 text-center">
      <div className="mb-4 flex justify-center">
        <Package className="w-12 h-12 text-muted-foreground/50" />
      </div>
      <h3 className="mb-1 text-lg font-semibold text-foreground">
        No screening history yet
      </h3>
      <p className="mb-6 text-muted-foreground">
        Start by submitting a scan to build your screening history.
      </p>
      <Link
        href="/scan"
        className="inline-flex items-center px-4 py-2 rounded-lg bg-primary text-primary-foreground font-medium transition-all hover:bg-primary/90 active:scale-95"
      >
        Start Scanning
      </Link>
    </div>
  )
}
