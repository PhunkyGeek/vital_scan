"use client"

import { useEffect, useRef, useState } from 'react'
import { Button } from '@/components/ui/button'
import { AlertTriangle, Camera, Circle, RefreshCw } from 'lucide-react'
import { formatFileSize } from '@/lib/utils/file'

function hasCameraSupport() {
  return (
    typeof navigator !== 'undefined' &&
    !!navigator.mediaDevices &&
    typeof navigator.mediaDevices.getUserMedia === 'function'
  )
}

interface CameraCaptureProps {
  selectedFile: File | null
  onCapture: (file: File) => void
  onRemove: () => void
}

export function CameraCapture({ selectedFile, onCapture, onRemove }: CameraCaptureProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const [status, setStatus] = useState<'loading' | 'ready' | 'denied' | 'unsupported' | 'error'>(() =>
    hasCameraSupport() ? 'loading' : 'unsupported'
  )
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const streamRef = useRef<MediaStream | null>(null)

  useEffect(() => {
    if (!navigator.mediaDevices?.getUserMedia) {
      return
    }

    let mounted = true

    navigator.mediaDevices
      .getUserMedia({ video: { facingMode: 'environment' } })
      .then((mediaStream) => {
        if (!mounted) {
          mediaStream.getTracks().forEach((track) => track.stop())
          return
        }

        if (mounted) {
          streamRef.current = mediaStream
          if (videoRef.current) {
            videoRef.current.srcObject = mediaStream
          }
          setStatus('ready')
        }
      })
      .catch((error) => {
        if (mounted) {
          console.error(error)
          setStatus('denied')
          setErrorMessage('Camera access was denied. Use the upload option instead.')
        }
      })

    return () => {
      mounted = false
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop())
      }
    }
  }, [])

  const capturePhoto = async () => {
    const video = videoRef.current
    if (!video) return

    const canvas = document.createElement('canvas')
    canvas.width = video.videoWidth || 1280
    canvas.height = video.videoHeight || 960
    const context = canvas.getContext('2d')
    if (!context) return

    context.drawImage(video, 0, 0, canvas.width, canvas.height)

    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob((blobResult) => resolve(blobResult), 'image/jpeg', 0.92)
    )

    if (!blob) {
      setErrorMessage('Unable to capture a photo. Please try again.')
      return
    }

    const file = new File([blob], `scan-${Date.now()}.jpg`, { type: 'image/jpeg' })
    onCapture(file)
  }

  return (
    <div className="rounded-3xl border border-muted-foreground/15 bg-card/95 p-6 shadow-sm">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-foreground">Camera capture</p>
          <p className="mt-1 text-sm text-muted-foreground">Allow camera access and take a clear photo of the affected area.</p>
        </div>
        <Button variant="outline" size="sm" onClick={() => window.location.reload()}>
          <RefreshCw className="h-4 w-4" />
          Restart
        </Button>
      </div>

      {selectedFile ? (
        <div className="mt-6 rounded-3xl border border-muted-foreground/15 bg-background p-4">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="font-semibold text-foreground">Captured image ready</p>
              <p className="text-sm text-muted-foreground">{selectedFile.name}</p>
              <p className="text-sm text-muted-foreground">{formatFileSize(selectedFile.size)}</p>
            </div>
            <Button variant="ghost" size="sm" onClick={onRemove}>
              Remove
            </Button>
          </div>
        </div>
      ) : status === 'ready' ? (
        <div className="mt-6 space-y-4">
          <div className="overflow-hidden rounded-3xl border border-muted-foreground/20 bg-black/5">
            <video
              ref={videoRef}
              className="h-[320px] w-full object-cover"
              autoPlay
              playsInline
              muted
            />
          </div>
          <Button className="w-full" onClick={capturePhoto}>
            <Circle className="h-4 w-4 mr-2" />
            Capture photo
          </Button>
        </div>
      ) : (
        <div className="mt-6 rounded-3xl border border-muted-foreground/15 bg-background/80 p-6 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-3xl bg-muted/10 text-muted-foreground">
            <Camera className="h-6 w-6" />
          </div>
          <p className="mt-4 text-sm font-medium text-foreground">{status === 'unsupported' ? 'Camera unavailable' : 'Requesting camera access'}</p>
          <p className="mt-2 text-sm text-muted-foreground">
            {status === 'unsupported'
              ? 'Your browser does not support camera capture. Use the upload option instead.'
              : 'Please allow camera access in your browser.'}
          </p>
          {errorMessage ? (
            <div className="mt-4 flex items-center justify-center gap-2 text-sm text-destructive">
              <AlertTriangle className="h-4 w-4" />
              {errorMessage}
            </div>
          ) : null}
        </div>
      )}
    </div>
  )
}
