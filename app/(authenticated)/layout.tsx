import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { BottomNav } from '@/components/shared/BottomNav'

export default async function AuthenticatedLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: authData } = await supabase.auth.getUser()

  if (!authData.user) {
    redirect('/login')
  }

  return (
    <div className="min-h-screen pb-20">
      {children}
      <BottomNav />
    </div>
  )
}