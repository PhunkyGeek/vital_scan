/**
 * Server-only environment variables
 * These are NEVER accessible in the browser
 * Import this only in server components, API routes, or server actions
 */

export function getRequiredServerEnv(key: string): string {
  const value = process.env[key]
  if (!value) {
    throw new Error(`Missing required server environment variable: ${key}`)
  }
  return value
}

export function getOptionalServerEnv(key: string, defaultValue?: string): string | undefined {
  return process.env[key] ?? defaultValue
}

// Get Supabase anonymous key, preferring PUBLISHABLE_KEY but falling back to ANON_KEY
export function getSupabaseServerAnonKey(): string {
  const publishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
  if (publishableKey) {
    return publishableKey
  }

  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (anonKey) {
    return anonKey
  }

  throw new Error('Missing required Supabase client key. Set either NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY or NEXT_PUBLIC_SUPABASE_ANON_KEY')
}

// Supabase server configuration (includes service role key)
export const supabaseServerConfig = {
  url: getRequiredServerEnv('NEXT_PUBLIC_SUPABASE_URL'),
  anonKey: getSupabaseServerAnonKey(),
  serviceRoleKey: getRequiredServerEnv('SUPABASE_SERVICE_ROLE_KEY'),
}

// Gemini configuration (server-only)
export const geminiConfig = {
  apiKey: getRequiredServerEnv('GEMINI_API_KEY'),
  model: getOptionalServerEnv('GEMINI_MODEL') ?? 'gemini-1.5-pro',
  modelScreening: getOptionalServerEnv('GEMINI_MODEL_SCREENING') ?? 'gemini-1.5-pro',
  modelChat: getOptionalServerEnv('GEMINI_MODEL_CHAT') ?? 'gemini-1.5-pro',
}

// Validation for critical server vars on startup
export function validateRequiredServerEnv(): boolean {
  try {
    // Access all required config to trigger validation
    void supabaseServerConfig
    void geminiConfig
    return true
  } catch (error) {
    console.error('Server environment validation failed:', error)
    throw error
  }
}