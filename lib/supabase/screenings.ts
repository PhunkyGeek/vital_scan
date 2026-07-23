import type { SupabaseClient } from '@supabase/supabase-js'

export async function findOrCreateCondition(
  supabase: SupabaseClient,
  conditionName: string,
  conditionCategory: string,
  summary: string,
  possibleSigns: string[],
  redFlags: string[],
  riskLevel: string,
  bodyArea: string,
  treatmentUrgency: 'immediate' | 'urgent' | 'routine' | 'monitoring',
  educationalContent: Record<string, unknown>
) {
  const existing = await supabase
    .from('conditions')
    .select('id')
    .eq('name', conditionName)
    .limit(1)

  if (existing.error) {
    throw existing.error
  }

  if (existing.data?.[0]?.id) {
    return existing.data[0].id
  }

  const { data, error } = await supabase
    .from('conditions')
    .insert({
      name: conditionName,
      description: summary,
      category: conditionCategory,
      symptoms: possibleSigns,
      risk_level: riskLevel,
      common_body_areas: [bodyArea],
      emergency_indicators: redFlags,
      treatment_urgency: treatmentUrgency,
      educational_content: educationalContent,
      is_active: true,
    })
    .select('id')
    .single()

  if (error || !data?.id) {
    throw error ?? new Error('Unable to create condition record')
  }

  return data.id
}

export async function createScreeningRecord(
  supabase: SupabaseClient,
  screening: {
    id: string
    user_id: string
    image_path: string
    image_url?: string
    body_area: string
    age_group?: string | null
    duration_text?: string | null
    symptoms?: string[] | null
    notes?: string | null
    fever: boolean
    itching: boolean
    pain: boolean
    redness: boolean
    ai_model?: string
    ai_analysis_status: 'pending' | 'processing' | 'completed' | 'failed'
    ai_analysis_result: Record<string, unknown>
    raw_ai_response: Record<string, unknown>
    risk_level: string
    recommendations?: string[] | null
    follow_up_required: boolean
  }
) {
  const { data, error } = await supabase
    .from('screenings')
    .insert(screening)
    .select('id')
    .single()

  if (error || !data?.id) {
    throw error ?? new Error('Unable to create screening record')
  }

  return data.id
}

export async function createScreeningResult(
  supabase: SupabaseClient,
  result: {
    screening_id: string
    condition_id: string
    confidence_score: number
    detected_areas: Record<string, unknown>
    severity_level: string
    ai_model_version: string
    raw_ai_response: Record<string, unknown>
  }
) {
  const { data, error } = await supabase
    .from('screening_results')
    .insert(result)
    .select('id')
    .single()

  if (error || !data?.id) {
    throw error ?? new Error('Unable to create screening result')
  }

  return data.id
}
