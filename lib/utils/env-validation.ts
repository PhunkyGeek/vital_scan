/**
 * Environment variable validation utility
 * Call this in development to catch missing env vars early
 * 
 * IMPORTANT: This is for development validation only.
 * At build time, Next.js validates that NEXT_PUBLIC_* vars are set.
 */

export function validateEnvironment(): { isValid: boolean; errors: string[] } {
  const errors: string[] = []

  // Check required NEXT_PUBLIC_ client variables
  const requiredPublicVars = [
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_APP_NAME',
    'NEXT_PUBLIC_APP_URL',
  ]

  for (const varName of requiredPublicVars) {
    if (!process.env[varName]) {
      errors.push(`Missing required environment variable: ${varName}`)
    }
  }

  // Check that at least one Supabase key is provided
  const hasPublishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
  const hasAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!hasPublishableKey && !hasAnonKey) {
    errors.push('Missing Supabase client key. Set either NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY or NEXT_PUBLIC_SUPABASE_ANON_KEY')
  }

  // Check server-side required variables
  const requiredServerVars = [
    'SUPABASE_SERVICE_ROLE_KEY',
    'GEMINI_API_KEY',
  ]

  for (const varName of requiredServerVars) {
    if (!process.env[varName]) {
      errors.push(`Missing required server environment variable: ${varName}`)
    }
  }

  // Validate storage bucket name format if set
  const bucketName = process.env.NEXT_PUBLIC_SUPABASE_STORAGE_BUCKET_SCREENINGS
  if (bucketName && !/^[a-z0-9-_]+$/.test(bucketName)) {
    errors.push(`Invalid bucket name format: ${bucketName} (must contain only lowercase letters, numbers, hyphens, and underscores)`)
  }

  // Validate numeric configs if set
  if (process.env.NEXT_PUBLIC_SCREENING_IMAGE_MAX_BYTES) {
    const maxBytes = parseInt(process.env.NEXT_PUBLIC_SCREENING_IMAGE_MAX_BYTES, 10)
    if (Number.isNaN(maxBytes) || maxBytes < 1) {
      errors.push(`Invalid NEXT_PUBLIC_SCREENING_IMAGE_MAX_BYTES: must be a positive number`)
    }
  }

  if (process.env.NEXT_PUBLIC_SCREENING_IMAGE_SIGNED_URL_EXPIRY_SECONDS) {
    const expiry = parseInt(process.env.NEXT_PUBLIC_SCREENING_IMAGE_SIGNED_URL_EXPIRY_SECONDS, 10)
    if (Number.isNaN(expiry) || expiry < 1) {
      errors.push(`Invalid NEXT_PUBLIC_SCREENING_IMAGE_SIGNED_URL_EXPIRY_SECONDS: must be a positive number`)
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  }
}

// Development helper to log env validation results
export function logEnvironmentValidation() {
  if (process.env.NODE_ENV === 'development') {
    const result = validateEnvironment()
    if (!result.isValid) {
      console.error('🚨 Environment validation failed:')
      result.errors.forEach(error => console.error(`  - ${error}`))
    } else {
      console.log('✅ Environment validation passed')
    }
  }
}