import { notFound } from 'next/navigation'

import { getScreeningWithResult } from '@/lib/data/screenings'
import { ResultPage } from '@/components/result/ResultPage'
import { createClient } from '@/lib/supabase/server'

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function ScanResultPage({ params }: PageProps) {
  const { id } = await params
  const supabase = await createClient()

  const { data: authData } = await supabase.auth.getUser()
  if (!authData.user) {
    notFound()
  }

    const screening = await getScreeningWithResult(supabase, id, authData.user.id)
  
  
  if (!screening) {
    notFound()
  }

  return <ResultPage screening={screening} />
}