"use client"

import { useState, useEffect, type FormEvent } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { createClient } from "@/lib/supabase/client"
import { mapAuthError } from "@/lib/utils/auth-errors"
import { SignupSuccess } from "@/components/auth/SignupSuccess"

export default function SignupPage() {
  const router = useRouter()
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [lastAttempt, setLastAttempt] = useState<number | null>(null)
  const cooldownPeriod = 30000 // 30 seconds

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError(null)
    setMessage(null)

    // Check cooldown
    if (lastAttempt && Date.now() - lastAttempt < cooldownPeriod) {
      setError("Please wait a moment before trying again.")
      return
    }

    // Validation
    if (!name.trim()) {
      setError("Please enter your full name.")
      return
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.")
      return
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters.")
      return
    }

    setIsLoading(true)
    setLastAttempt(Date.now())
    const supabase = createClient()

    const appUrl = process.env.NEXT_PUBLIC_APP_URL
    const emailRedirectTo = appUrl ? `${appUrl.replace(/\/$/, '')}/auth/callback` : undefined

    if (!emailRedirectTo) {
      setError('Missing app URL configuration for email confirmation.')
      setIsLoading(false)
      return
    }

    // Sign up with full_name in metadata - trigger will handle profile creation
    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo,
        data: {
          full_name: name.trim(),
        },
      },
    })

    if (signUpError) {
      setError(mapAuthError(signUpError.message))
      setIsLoading(false)
      return
    }

    setIsLoading(false)

    // If email confirmation is not required (session exists), redirect to dashboard
    if (data.session) {
      router.push("/dashboard")
      return
    }

    // Email confirmation required - show success state
    setShowSuccess(true)
  }

  const [cooldownRemaining, setCooldownRemaining] = useState(0)

  useEffect(() => {
    if (!lastAttempt) {
      return
    }

    const updateRemaining = () => {
      const remaining = cooldownPeriod - (Date.now() - lastAttempt)
      setCooldownRemaining(Math.max(0, remaining))
    }

    updateRemaining()
    const intervalId = window.setInterval(updateRemaining, 500)

    return () => window.clearInterval(intervalId)
  }, [lastAttempt, cooldownPeriod])

  const isSubmitDisabled = isLoading || cooldownRemaining > 0

  if (showSuccess) {
    return (
      <SignupSuccess
        email={email}
        onBackToLogin={() => router.push("/login")}
      />
    )
  }

  return (
    <Card>
      <CardHeader className="text-center">
        <CardTitle className="text-2xl">Join Vital Scan</CardTitle>
        <CardDescription>
          Create your account for AI-assisted health screening
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {error ? (
          <div className="rounded-lg border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm text-destructive">
            {error}
          </div>
        ) : null}
        {message ? (
          <div className="rounded-lg border border-primary/20 bg-primary/10 px-4 py-3 text-sm text-primary">
            {message}
          </div>
        ) : null}

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <label htmlFor="name" className="text-sm font-medium">
              Full Name
            </label>
            <Input
              id="name"
              type="text"
              placeholder="Enter your full name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              required
              disabled={isLoading}
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="email" className="text-sm font-medium">
              Email
            </label>
            <Input
              id="email"
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
              disabled={isLoading}
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="password" className="text-sm font-medium">
              Password
            </label>
            <Input
              id="password"
              type="password"
              placeholder="Create a password (min 6 characters)"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
              disabled={isLoading}
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="confirmPassword" className="text-sm font-medium">
              Confirm Password
            </label>
            <Input
              id="confirmPassword"
              type="password"
              placeholder="Confirm your password"
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              required
              disabled={isLoading}
            />
          </div>
          <Button className="w-full" type="submit" disabled={isSubmitDisabled}>
            {isLoading ? "Creating account…" : isSubmitDisabled ? "Please wait…" : "Create Account"}
          </Button>
        </form>

        <div className="text-center text-sm">
          Already have an account?{" "}
          <Link href="/login" className="text-primary hover:underline">
            Sign in
          </Link>
        </div>
      </CardContent>
    </Card>
  )
}
