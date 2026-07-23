/**
 * Client-safe environment variables
 * These use explicit static references to NEXT_PUBLIC_* variables
 * so Next.js can properly inline them at build time
 * Never use dynamic process.env[key] lookups - they don't work in the browser
 */

/**
 * Get Supabase URL - statically referenced so it gets inlined at build time
 */
function getSupabaseUrl(): string {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  if (!url) {
    throw new Error('Missing required environment variable: NEXT_PUBLIC_SUPABASE_URL')
  }
  return url
}

/**
 * Get Supabase anonymous key - prefers PUBLISHABLE_KEY, falls back to ANON_KEY
 * Both are statically referenced so they get inlined at build time
 */
function getSupabaseAnonKey(): string {
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

/**
 * Supabase client configuration
 * Uses static environment variable references for proper Next.js build-time inlining
 */
export function getSupabaseClientConfig() {
  return {
    url: getSupabaseUrl(),
    anonKey: getSupabaseAnonKey(),
  }
}

/**
 * Storage configuration with sensible defaults
 * Parses integer configs with validation
 */
export function getStorageConfig() {
  // Bucket name - use static reference or fallback
  const bucketName = process.env.NEXT_PUBLIC_SUPABASE_STORAGE_BUCKET_SCREENINGS ?? 'screening-images'

  // Max image size in bytes - parse with validation
  const parseMaxImageBytes = (): number => {
    const envValue = process.env.NEXT_PUBLIC_SCREENING_IMAGE_MAX_BYTES
    if (!envValue) {
      return 10 * 1024 * 1024 // 10MB default
    }
    const parsed = parseInt(envValue, 10)
    return Number.isNaN(parsed) || parsed < 1 ? 10 * 1024 * 1024 : parsed
  }

  // Signed URL expiry in seconds - parse with validation
  const parseSignedUrlExpiry = (): number => {
    const envValue = process.env.NEXT_PUBLIC_SCREENING_IMAGE_SIGNED_URL_EXPIRY_SECONDS
    if (!envValue) {
      return 3600 // 1 hour default
    }
    const parsed = parseInt(envValue, 10)
    // Ensure expiry is between 1 second and 7 days
    return Number.isNaN(parsed) || parsed < 1 ? 3600 : Math.min(parsed, 604800)
  }

  return {
    bucketScreenings: bucketName,
    maxImageBytes: parseMaxImageBytes(),
    signedUrlExpirySeconds: parseSignedUrlExpiry(),
  }
}