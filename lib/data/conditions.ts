import type { SupabaseClient } from '@supabase/supabase-js'

export interface Condition {
  id: string
  slug: string
  name: string
  category: string
  description: string
  overview: string
  common_signs: string[]
  likely_triggers: string[]
  self_care: string[]
  red_flags: string[]
  when_to_seek_help: string
  prevention: string
  risk_level: string
  emergency_indicators: string[]
  treatment_urgency: string
  educational_content: Record<string, unknown>
  is_active: boolean
  scan_count?: number
  latest_created_at?: string
  created_at: string
}

/**
 * Get all active conditions, optionally filtered by search and category
 */
export async function getConditions(
  supabase: SupabaseClient,
  options?: {
    search?: string
    category?: string
    limit?: number
  }
): Promise<Condition[]> {
  let query = supabase
    .from('conditions')
    .select('*')
    .eq('is_active', true)

  // Apply search filter - case insensitive match on name and overview
  if (options?.search && options.search.trim()) {
    const searchTerm = options.search.trim()
    query = query.or(
      `name.ilike.%${searchTerm}%,overview.ilike.%${searchTerm}%`
    )
  }

  // Apply category filter
  if (options?.category && options.category !== 'all') {
    query = query.eq('category', options.category)
  }

  // Apply limit
  if (options?.limit) {
    query = query.limit(options.limit)
  }

  query = query.order('name', { ascending: true })

  const { data, error } = await query

  if (error) {
    console.error('Failed to fetch conditions:', {
      code: error.code,
      message: error.message,
      details: error.details,
    })
    return []
  }

  return (data as Condition[]) || []
}

/**
 * Get a single condition by ID
 */
export async function getConditionById(
  supabase: SupabaseClient,
  id: string
): Promise<Condition | null> {
  const { data, error } = await supabase
    .from('conditions')
    .select('*')
    .eq('id', id)
    .eq('is_active', true)
    .single()

  if (error || !data) {
    if (error) {
      console.error('Failed to fetch condition:', {
        code: error.code,
        message: error.message,
        details: error.details,
      })
    }
    return null
  }

  return (data as Condition) || null
}

/**
 * Get a single condition by slug
 */
export async function getConditionBySlug(
  supabase: SupabaseClient,
  slug: string
): Promise<Condition | null> {
  const { data, error } = await supabase
    .from('conditions')
    .select('*')
    .eq('slug', slug)
    .eq('is_active', true)
    .single()

  if (error || !data) {
    if (error) {
      console.error('Failed to fetch condition by slug:', {
        code: error.code,
        message: error.message,
        details: error.details,
      })
    }
    return null
  }

  return (data as Condition) || null
}

/**
 * Get all unique categories from active conditions
 * Falls back to categories from screening_results if conditions table is empty
 */
export async function getConditionCategories(
  supabase: SupabaseClient
): Promise<string[]> {
  // First try to get categories from conditions table
  const { data, error } = await supabase
    .from('conditions')
    .select('category')
    .eq('is_active', true)

  if (error) {
    console.error('Failed to fetch categories from conditions:', {
      code: error.code,
      message: error.message,
      details: error.details,
    })
  }

  // If we have categories from conditions table, use them
  if (data && data.length > 0) {
    const categories = [
      ...new Set((data as Array<{ category: string }>)?.map((item) => item.category) || [])
    ]
    return categories.filter(Boolean).sort()
  }

  // Fallback: Get unique categories from screening_results
  const { data: resultsData, error: resultsError } = await supabase
    .from('screening_results')
    .select('condition_category')
    .not('condition_category', 'is', null)

  if (resultsError) {
    console.error('Failed to fetch categories from screening_results:', {
      code: resultsError.code,
      message: resultsError.message,
      details: resultsError.details,
    })
    return []
  }

  const categories = [...new Set((resultsData as Array<{ condition_category?: string | null }> || []).map((item) => item.condition_category || ''))]
  return categories.filter(Boolean).sort()
}

/**
 * Get global condition library - from conditions table or derived from screening_results
 */
export async function getGlobalConditionLibrary(
  supabase: SupabaseClient,
  options?: {
    search?: string
    category?: string
    limit?: number
  }
): Promise<Condition[]> {
  // First try to get from conditions table
  let query = supabase
    .from('conditions')
    .select('*')
    .eq('is_active', true)

  if (options?.search && options.search.trim()) {
    const searchTerm = options.search.trim()
    query = query.or(`name.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`)
  }

  if (options?.category && options.category !== 'all') {
    query = query.eq('category', options.category)
  }

  if (options?.limit) {
    query = query.limit(options.limit)
  }

  query = query.order('name', { ascending: true })

  const { data } = await query

  // If conditions table has data, return it
  if (data && data.length > 0) {
    return (data as Condition[]) || []
  }

  // Fallback: Derive unique conditions from screening_results
  const { data: resultsData, error: resultsError } = await supabase
    .from('screening_results')
    .select(`
      condition_name,
      condition_category,
      risk_level,
      summary,
      possible_signs,
      red_flags,
      self_care,
      created_at
    `)
    .not('condition_name', 'is', null)
    .order('created_at', { ascending: false })

  if (resultsError) {
    console.error('Failed to fetch conditions from screening_results:', {
      code: resultsError.code,
      message: resultsError.message,
      details: resultsError.details,
    })
    return []
  }

  // Group by condition name and category, keeping latest result and counts
  type ScreeningResultRow = {
    condition_name?: string | null
    condition_category?: string | null
    risk_level?: string | null
    summary?: string | null
    possible_signs?: string[] | null
    red_flags?: string[] | null
    self_care?: string[] | null
    created_at?: string | null
  }

  const conditionMap = new Map<string, {
    result: ScreeningResultRow
    scan_count: number
    latest_created_at: string
  }>()

  if (resultsData) {
    (resultsData as ScreeningResultRow[]).forEach((result) => {
      const key = `${result.condition_name || 'unknown'}|${result.condition_category || 'General'}`
      const existing = conditionMap.get(key)
      const createdAt = result.created_at || new Date().toISOString()

      if (existing) {
        existing.scan_count += 1
        if (createdAt > existing.latest_created_at) {
          existing.latest_created_at = createdAt
          existing.result = result
        }
      } else {
        conditionMap.set(key, {
          result,
          scan_count: 1,
          latest_created_at: createdAt,
        })
      }
    })
  }

  // Apply search filter on derived conditions
  const conditions = Array.from(conditionMap.values())
    .map(({ result, scan_count, latest_created_at }) => ({
      ...result,
      scan_count,
      latest_created_at,
    }))
    .filter((cond) => {
      if (options?.search && options.search.trim()) {
        const searchTerm = options.search.trim().toLowerCase()
        return (
          cond.condition_name?.toLowerCase().includes(searchTerm) ||
          (cond.summary && cond.summary.toLowerCase().includes(searchTerm))
        )
      }
      return true
    })
    .filter((cond) => {
      if (options?.category && options.category !== 'all') {
        return cond.condition_category === options.category
      }
      return true
    })
    .map((cond) => ({
      id: `derived-${cond.condition_name}`,
      slug: (cond.condition_name?.toLowerCase().replace(/\s+/g, '-') ?? 'unknown') as string,
      name: (cond.condition_name ?? 'Condition') as string,
      category: cond.condition_category || 'General',
      description: cond.summary || 'Condition detected in health screenings',
      overview: cond.summary || '',
      common_signs: cond.possible_signs || [],
      likely_triggers: [],
      self_care: cond.self_care || [],
      red_flags: cond.red_flags || [],
      when_to_seek_help: 'Consult a healthcare professional',
      prevention: '',
      risk_level: cond.risk_level || 'moderate',
      emergency_indicators: cond.red_flags || [],
      treatment_urgency: cond.risk_level === 'high' || cond.risk_level === 'critical' ? 'urgent' : 'standard',
      educational_content: {},
      is_active: true,
      scan_count: cond.scan_count,
      latest_created_at: cond.latest_created_at,
      created_at: (cond.created_at ?? new Date().toISOString()) as string,
    }))
    .slice(0, options?.limit || 100)

  return conditions
}
