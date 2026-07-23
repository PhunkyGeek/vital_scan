"use client"

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { CheckCircle } from 'lucide-react'

export function ConfirmedSuccess() {
  const router = useRouter()
  const [countdown, setCountdown] = useState(5)

  useEffect(() => {
    const timer = window.setInterval(() => {
      setCountdown((current) => current - 1)
    }, 1000)

    return () => window.clearInterval(timer)
  }, [])

  useEffect(() => {
    if (countdown <= 0) {
      router.push('/dashboard')
    }
  }, [countdown, router])

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="flex min-h-screen items-center justify-center px-4 py-12">
        <Card className="w-full max-w-md rounded-3xl border border-border bg-card">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary">
              <CheckCircle className="h-8 w-8" />
            </div>
            <CardTitle className="text-2xl">Email Confirmed</CardTitle>
            <CardDescription>
              Your account has been verified successfully.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-center">
            <p className="text-sm text-muted-foreground">
              Redirecting to your dashboard in {countdown} second{countdown === 1 ? '' : 's'}...
            </p>
            <Button className="w-full" onClick={() => router.push('/dashboard')}>
              Go to Dashboard Now
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
