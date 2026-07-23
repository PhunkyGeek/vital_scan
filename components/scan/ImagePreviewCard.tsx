import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Trash2 } from 'lucide-react'

interface ImagePreviewCardProps {
  previewUrl: string | null
  file: File | null
  onRemove: () => void
}

export function ImagePreviewCard({ previewUrl, file, onRemove }: ImagePreviewCardProps) {
  if (!file || !previewUrl) {
    return null
  }

  return (
    <Card className="rounded-3xl border border-muted-foreground/15 bg-card/95 p-0 shadow-sm">
      <CardHeader className="flex items-center justify-between gap-4 px-6 py-5">
        <CardTitle className="text-base">Preview</CardTitle>
        <Button variant="ghost" size="sm" onClick={onRemove}>
          <Trash2 className="h-4 w-4" />
          Remove
        </Button>
      </CardHeader>
      <CardContent className="p-0">
        <div className="relative overflow-hidden rounded-b-3xl border-t border-muted-foreground/10">
          <Image
            src={previewUrl}
            alt="Selected scan preview"
            width={1200}
            height={720}
            className="h-72 w-full object-cover"
          />
        </div>
        <div className="space-y-1 px-6 py-4 text-sm text-muted-foreground">
          <p className="font-medium text-foreground">Image details</p>
          <p>{file.name}</p>
          <p>{`${(file.size / 1024 / 1024).toFixed(2)} MB`}</p>
        </div>
      </CardContent>
    </Card>
  )
}
