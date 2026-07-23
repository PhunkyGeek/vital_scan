"use client"

import { useCallback, useRef } from 'react'
import { Upload, ImagePlus, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { formatFileSize, IMAGE_MIME_TYPES } from '@/lib/utils/file'

interface ScanUploadCardProps {
  selectedFile: File | null
  onFileSelect: (file: File) => void
  onRemove: () => void
  error?: string
}

export function ScanUploadCard({ selectedFile, onFileSelect, onRemove, error }: ScanUploadCardProps) {
  const inputRef = useRef<HTMLInputElement | null>(null)

  const handleFileChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0]
      if (file) {
        onFileSelect(file)
      }
    },
    [onFileSelect]
  )

  const handleDrop = useCallback(
    (event: React.DragEvent<HTMLDivElement>) => {
      event.preventDefault()
      const file = event.dataTransfer.files?.[0]
      if (file) {
        onFileSelect(file)
      }
    },
    [onFileSelect]
  )

  const acceptedTypes = IMAGE_MIME_TYPES.join(',')

  return (
    <div className="rounded-3xl border border-muted-foreground/15 bg-card/95 p-6 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-foreground">Upload a clear image</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Drop a photo or select one from your device. Supported formats: JPEG, PNG, WebP.
          </p>
        </div>
        <Button
          variant="secondary"
          size="sm"
          onClick={() => inputRef.current?.click()}
        >
          <Upload className="h-4 w-4" />
          Select file
        </Button>
      </div>

      {selectedFile ? (
        <div className="mt-6 rounded-3xl border border-muted-foreground/15 bg-background p-4">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="font-semibold text-foreground">Selected image</p>
              <p className="text-sm text-muted-foreground">{selectedFile.name}</p>
              <p className="text-sm text-muted-foreground">{formatFileSize(selectedFile.size)}</p>
            </div>
            <Badge variant="secondary">Ready</Badge>
          </div>
          <div className="mt-4 flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={onRemove}>
              <Trash2 className="h-4 w-4" />
              Remove
            </Button>
          </div>
        </div>
      ) : (
        <div
          role="button"
          tabIndex={0}
          onDrop={handleDrop}
          onDragOver={(event) => event.preventDefault()}
          className={cn(
            'mt-6 rounded-3xl border-2 border-dashed border-muted-foreground/30 bg-background/75 px-6 py-12 text-center transition hover:border-primary/70 hover:bg-primary/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50',
            error ? 'border-destructive text-destructive' : ''
          )}
          onClick={() => inputRef.current?.click()}
        >
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-muted/10 text-primary">
            <ImagePlus className="h-8 w-8" />
          </div>
          <p className="mt-5 text-sm font-semibold text-foreground">Drag & drop an image here</p>
          <p className="mt-2 text-sm text-muted-foreground">or click to browse your files</p>
          <p className="mt-4 text-xs text-muted-foreground">Up to 10MB. Keep the affected area centered.</p>
        </div>
      )}

      {error ? <p className="mt-3 text-sm text-destructive">{error}</p> : null}

      <input
        ref={inputRef}
        type="file"
        accept={acceptedTypes}
        className="hidden"
        onChange={handleFileChange}
      />
    </div>
  )
}
