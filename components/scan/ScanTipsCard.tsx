import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ShieldCheck, Sparkles } from 'lucide-react'

export function ScanTipsCard() {
  return (
    <Card className="rounded-3xl border border-muted-foreground/10 bg-gradient-to-br from-card/95 to-card/80 p-6 shadow-sm">
      <CardHeader>
        <div className="flex items-center gap-3">
          <Sparkles className="h-5 w-5 text-primary" />
          <CardTitle className="text-base">Scan guidance</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-4 pt-2">
        <p className="text-sm text-muted-foreground">
          Use a clear, focused image of the most affected area. Keep the background simple and steady the camera for better AI screening.
        </p>
        <div className="grid gap-3">
          <div className="rounded-2xl border border-muted-foreground/15 bg-background/85 p-4">
            <p className="text-sm font-semibold text-foreground">Good lighting</p>
            <p className="text-sm text-muted-foreground">Natural light or soft indoor light improves analysis confidence.</p>
          </div>
          <div className="rounded-2xl border border-muted-foreground/15 bg-background/85 p-4">
            <p className="text-sm font-semibold text-foreground">Stable framing</p>
            <p className="text-sm text-muted-foreground">Center the affected area and avoid motion blur.</p>
          </div>
          <div className="rounded-2xl border border-muted-foreground/15 bg-background/85 p-4">
            <p className="text-sm font-semibold text-foreground">Privacy first</p>
            <p className="text-sm text-muted-foreground">Only share the visible condition area and avoid private information.</p>
          </div>
        </div>
        <div className="rounded-2xl border border-emerald-200/70 bg-emerald-50/80 p-4 text-sm text-emerald-900">
          <div className="flex items-center gap-2 font-medium">
            <ShieldCheck className="h-4 w-4" />
            <span>Important safety note</span>
          </div>
          <p className="mt-2">
            Vital Scan is AI-assisted screening only. It is not a medical diagnosis, and urgent cases should be evaluated by a healthcare professional.
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
