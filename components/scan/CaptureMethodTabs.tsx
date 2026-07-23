"use client"

import { Button } from '@/components/ui/button'
import { Camera, Upload } from 'lucide-react'

interface CaptureMethodTabsProps {
  value: 'upload' | 'camera'
  onChange: (value: 'upload' | 'camera') => void
}

export function CaptureMethodTabs({ value, onChange }: CaptureMethodTabsProps) {
  return (
    <div className="grid grid-cols-2 gap-2 rounded-3xl border border-muted-foreground/15 bg-card px-1 py-1 shadow-sm">
      <Button
        type="button"
        variant={value === 'upload' ? 'secondary' : 'ghost'}
        size="sm"
        className="h-11 w-full gap-2 rounded-3xl"
        onClick={() => onChange('upload')}
      >
        <Upload className="h-4 w-4" />
        Upload
      </Button>
      <Button
        type="button"
        variant={value === 'camera' ? 'secondary' : 'ghost'}
        size="sm"
        className="h-11 w-full gap-2 rounded-3xl"
        onClick={() => onChange('camera')}
      >
        <Camera className="h-4 w-4" />
        Camera
      </Button>
    </div>
  )
}
