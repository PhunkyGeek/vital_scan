import { redirect } from 'next/navigation'
import type { EmailOtpType } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/server'

const allowedEmailOtpTypes: EmailOtpType[] = [
  'signup',
  'invite',
  'magiclink',
  'recovery',
  'email_change',
  'email',
]

export async function GET(request: Request) {
  const url = new URL(request.url)
  const searchParams = url.searchParams
  const code = searchParams.get('code')
  const tokenHash = searchParams.get('token_hash') ?? searchParams.get('token')
  const typeParam = searchParams.get('type') ?? undefined

  const hasCode = Boolean(code)
  const hasTokenHash = Boolean(tokenHash)
  console.log('Auth callback:', { hasCode, hasTokenHash, type: typeParam })

  if (!hasCode && !hasTokenHash) {
    console.error('Auth callback failed: missing code or token_hash/type')
    return redirect('/login?error=confirmation_failed')
  }

  try {
    const supabase = await createClient()

    if (hasCode) {
      const { data, error } = await supabase.auth.exchangeCodeForSession(code as string)

      if (error || !data?.session) {
        const errorMessage = error?.message ?? 'Unknown authentication error'
        console.error('Auth callback failed:', errorMessage)
        return redirect('/login?error=confirmation_failed')
      }

      return redirect('/auth/confirmed')
    }

    if (!tokenHash || !typeParam) {
      console.error('Auth callback failed: missing token_hash or type for verifyOtp')
      return redirect('/login?error=confirmation_failed')
    }

    if (!allowedEmailOtpTypes.includes(typeParam as EmailOtpType)) {
      console.error('Auth callback failed: unsupported email OTP type', typeParam)
      return redirect('/login?error=confirmation_failed')
    }

    const typeValue = typeParam as EmailOtpType
    const { data, error } = await supabase.auth.verifyOtp({
      token_hash: tokenHash,
      type: typeValue,
    })

    if (error || !data?.session) {
      const errorMessage = error?.message ?? 'Unknown authentication error'
      console.error('Auth callback failed:', errorMessage)
      return redirect('/login?error=confirmation_failed')
    }

    return redirect('/auth/confirmed')
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown exception'
    console.error('Auth callback exception:', message)
    return redirect('/login?error=confirmation_failed')
  }
}
