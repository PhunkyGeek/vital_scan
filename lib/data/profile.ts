import type { SupabaseClient } from '@supabase/supabase-js'

export interface UserProfile {
  id: string
  email: string
  full_name: string | null
  avatar_url: string | null
  date_of_birth: string | null
  gender: string | null
  medical_history?: string[] | null
  allergies?: string[] | null
  emergency_contact?: string | null
  emergency_phone?: string | null
  preferences: Record<string, unknown> | null
  created_at: string
  updated_at: string
}

/**
 * Get user profile by ID
 */
export async function getUserProfile(
  supabase: SupabaseClient,
  userId: string
): Promise<UserProfile | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single()

  if (error) {
    console.error('Failed to fetch user profile:', {
      code: error.code,
      message: error.message,
      details: error.details,
    })
    return null
  }

  return (data as UserProfile) || null
}

/**
 * Create profile row when missing for authenticated users
 */
export async function createUserProfile(
  supabase: SupabaseClient,
  userId: string,
  email: string
): Promise<UserProfile> {
  const { data, error } = await supabase
    .from('profiles')
    .insert({
      id: userId,
      email,
      preferences: {},
    })
    .select()
    .single()

  if (error || !data) {
    console.error('Failed to create user profile:', {
      code: error?.code,
      message: error?.message,
      details: error?.details,
    })
    throw new Error(error?.message || 'Failed to create user profile')
  }

  return data as UserProfile
}

/**
 * Update user profile
 */
export async function updateUserProfile(
  supabase: SupabaseClient,
  userId: string,
  updates: Partial<Omit<UserProfile, 'id' | 'created_at'>>
): Promise<UserProfile | null> {
  const { data, error } = await supabase
    .from('profiles')
    .update({
      ...updates,
      updated_at: new Date().toISOString(),
    })
    .eq('id', userId)
    .select()
    .single()

  if (error) {
    console.error('Failed to update user profile:', {
      code: error.code,
      message: error.message,
      details: error.details,
    })
    throw error
  }

  return (data as UserProfile) || null
}

/**
 * Update user preferences (theme, voice, etc.)
 */
export async function updateUserPreferences(
  supabase: SupabaseClient,
  userId: string,
  preferences: Record<string, unknown>
): Promise<void> {
  const { error } = await supabase
    .from('profiles')
    .update({
      preferences,
      updated_at: new Date().toISOString(),
    })
    .eq('id', userId)

  if (error) {
    console.error('Failed to update user preferences:', {
      code: error.code,
      message: error.message,
      details: error.details,
    })
    throw error
  }
}

/**
 * Get specific preference value
 */
export function getPreference(
  preferences: Record<string, unknown> | null | undefined,
  key: string,
  defaultValue?: unknown
): unknown {
  if (!preferences) return defaultValue
  return preferences[key] ?? defaultValue
}

/**
 * Set specific preference value
 */
export function setPreference(
  preferences: Record<string, unknown> | null | undefined,
  key: string,
  value: unknown
): Record<string, unknown> {
  return {
    ...(preferences || {}),
    [key]: value,
  }
}

/**
 * Get display name for user (first name from full_name or email prefix)
 */
export function getUserDisplayName(
  profile: UserProfile | null,
  email: string
): string {
  if (profile?.full_name) {
    // Use first word of full_name as first name
    return profile.full_name.split(' ')[0]
  }
  // Fallback to email prefix
  return email.split('@')[0]
}

/**
 * Get user avatar info
 */
export function getUserAvatar(
  profile: UserProfile | null
): { src: string | null; initial: string } {
  if (profile?.avatar_url) {
    return { src: profile.avatar_url, initial: '' }
  }

  // Get initial from full_name or use default
  const initial = profile?.full_name
    ? profile.full_name.charAt(0).toUpperCase()
    : 'U'

  return { src: null, initial }
}
