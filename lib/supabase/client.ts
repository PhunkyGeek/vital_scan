import { createBrowserClient } from '@supabase/ssr'
import { getSupabaseClientConfig } from '@/lib/env/client'

export function createClient() {
  const config = getSupabaseClientConfig()
  return createBrowserClient(
    config.url,
    config.anonKey
  )
}