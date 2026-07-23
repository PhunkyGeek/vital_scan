"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Mail } from "lucide-react"

interface SignupSuccessProps {
  email: string
  onBackToLogin?: () => void
}

export function SignupSuccess({ email, onBackToLogin }: SignupSuccessProps) {
  return (
    <Card>
      <CardHeader className="text-center">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
          <Mail className="h-6 w-6 text-primary" />
        </div>
        <CardTitle className="text-2xl">Check Your Email</CardTitle>
        <CardDescription>
          We have sent a confirmation link to <strong>{email}</strong>
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4 text-center">
        <p className="text-sm text-muted-foreground">
          Click the link in the email to activate your account and start using Vital Scan.
        </p>
        <p className="text-sm text-muted-foreground">
          Didn&apos;t receive the email? Check your spam folder or try signing up again.
        </p>
        <Button onClick={onBackToLogin} variant="outline" className="w-full">
          Back to Sign In
        </Button>
      </CardContent>
    </Card>
  )
}