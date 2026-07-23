import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ImageIcon } from 'lucide-react'
import Image from 'next/image'
import type { ScreeningWithResult } from '@/lib/data/screenings'

interface ScanImagePreviewProps {
  screening: ScreeningWithResult
}

export function ScanImagePreview({ screening }: ScanImagePreviewProps) {
  return (
    <Card className="rounded-3xl border border-muted-foreground/15 bg-card/95 p-0 shadow-sm">
      <CardHeader className="px-6 py-5">
        <CardTitle className="text-base">Scanned image</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="relative overflow-hidden rounded-b-3xl border-t border-muted-foreground/10">
          {screening.image_url ? (
            <Image
              src={screening.image_url}
              alt="Scanned health condition"
              width={400}
              height={320}
              className="h-64 w-full object-cover"
            />
          ) : (
            <div className="flex h-64 items-center justify-center bg-muted/20">
              <ImageIcon className="h-12 w-12 text-muted-foreground" />
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}