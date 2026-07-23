import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { ConfirmedSuccess } from '@/components/auth/ConfirmedSuccess'

export default async function ConfirmedPage() {
  const supabase = await createClient()
  const { data } = await supabase.auth.getSession()

  if (!data?.session) {
    return redirect('/login')
  }

  return <ConfirmedSuccess />
}
