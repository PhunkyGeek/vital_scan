import type { SupabaseClient } from '@supabase/supabase-js'

export interface HistoryItem {
  id: string
  user_id: string
  body_area: string
  created_at: string
  condition_name: string
  risk_level: string
  age_group?: string | null
  summary?: string | null
  condition_category?: string | null
  confidence_score?: number
  image_path?: string | null
}

/**
 * Get user's screening history with results, ordered by most recent
 */
export async function getUserScreeningHistory(
  supabase: SupabaseClient,
  userId: string,
  options?: {
    limit?: number
    offset?: number
    riskLevel?: string
  }
): Promise<HistoryItem[]> {
  let query = supabase
    .from('screenings')
    .select(`
      id,
      user_id,
      body_area,
      created_at,
      age_group,
      image_path,
      ai_analysis_result,
      screening_results (
        id,
        condition_name,
        condition_category,
        risk_level,
        confidence,
        confidence_score,
        summary
      )
    `)
    .eq('user_id', userId)

  // Apply offset/pagination
  if (options?.offset) {
    query = query.range(
      options.offset,
      options.offset + (options.limit || 10) - 1
    )
  } else if (options?.limit) {
    query = query.limit(options.limit)
  }

  query = query.order('created_at', { ascending: false })

  const { data, error } = await query

  if (error) {
    console.error('Failed to fetch screening history:', {
      code: error.code,
      message: error.message,
      details: error.details,
      hint: error.hint,
    })
    return []
  }

  type ScreeningRow = {
    id: string
    user_id: string
    body_area: string
    created_at: string
    age_group?: string | null
    image_path?: string | null
    ai_analysis_result?: {
      condition_name?: string | null
      condition_category?: string | null
      risk_level?: string
      confidence?: number
      confidence_score?: number
      summary?: string
    } | null
    screening_results?: Array<{
      id: string
      condition_name?: string | null
      condition_category?: string | null
      risk_level?: string
      confidence?: number
      confidence_score?: number
      summary?: string
    }>
  }

  return (
    (data as unknown as ScreeningRow[] | null)?.flatMap((row) => {
      const items: HistoryItem[] = []

      if (row.screening_results && row.screening_results.length > 0) {
        row.screening_results.forEach((result) => {
          const riskLevel = result.risk_level || 'unknown'
          if (options?.riskLevel && options.riskLevel !== 'all' && riskLevel !== options.riskLevel) {
            return
          }

          items.push({
            id: row.id,
            user_id: row.user_id,
            body_area: row.body_area,
            created_at: row.created_at,
            age_group: row.age_group,
            image_path: row.image_path,
            condition_name: result.condition_name || 'Unknown Condition',
            condition_category: result.condition_category,
            risk_level: riskLevel,
            confidence_score: result.confidence_score ?? result.confidence,
            summary: result.summary,
          })
        })
      } else if (row.ai_analysis_result) {
        const result = row.ai_analysis_result
        const riskLevel = result?.risk_level || 'unknown'
        if (options?.riskLevel && options.riskLevel !== 'all' && riskLevel !== options.riskLevel) {
          return items
        }

        items.push({
          id: row.id,
          user_id: row.user_id,
          body_area: row.body_area,
          created_at: row.created_at,
          age_group: row.age_group,
          image_path: row.image_path,
          condition_name: result?.condition_name || 'Unknown Condition',
          condition_category: result?.condition_category,
          risk_level: riskLevel,
          confidence_score: result?.confidence_score ?? result?.confidence,
          summary: result?.summary,
        })
      }

      return items
    }) || []
  )
}

/**
 * Get total screening count for a user
 */
export async function getUserScreeningCount(
  supabase: SupabaseClient,
  userId: string
): Promise<number> {
  const { count, error } = await supabase
    .from('screenings')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)

  if (error) {
    console.error('Failed to fetch screening count:', {
      code: error.code,
      message: error.message,
      details: error.details,
    })
    return 0
  }

  return count || 0
}

/**
 * Get unique body areas from user's screenings
 */
export async function getUserBodyAreas(
  supabase: SupabaseClient,
  userId: string
): Promise<string[]> {
  const { data, error } = await supabase
    .from('screenings')
    .select('body_area')
    .eq('user_id', userId)

  if (error) {
    console.error('Failed to fetch body areas:', {
      code: error.code,
      message: error.message,
      details: error.details,
    })
    return []
  }

  // Extract unique body areas using Set
  const bodyAreas = [...new Set(data?.map(item => item.body_area) || [])]
  return bodyAreas.filter(Boolean).sort()
}
