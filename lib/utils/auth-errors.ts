/**
 * Maps Supabase auth errors to user-friendly messages
 */
export function mapAuthError(error: string): string {
  const lowerError = error.toLowerCase()

  if (lowerError.includes('email rate limit exceeded') ||
      lowerError.includes('too many requests') ||
      lowerError.includes('429')) {
    return 'Too many signup attempts were made recently. Please wait a few minutes before trying again. If this keeps happening during development, consider using a custom SMTP provider in Supabase.'
  }

  if (lowerError.includes('invalid email')) {
    return 'Please enter a valid email address.'
  }

  if (lowerError.includes('password')) {
    return 'Password must be at least 6 characters long.'
  }

  if (lowerError.includes('user already registered')) {
    return 'An account with this email already exists. Please sign in instead.'
  }

  // Default to the original error if not mapped
  return error
}