import type { SupabaseClient } from '@supabase/supabase-js'
import { createSignedImageUrl } from '@/lib/supabase/storage'

export interface GeminiAnalysisResult {
  condition_name: string
  condition_category: string
  confidence: number
  risk_level: string
  summary: string
  possible_signs: string[]
  red_flags: string[]
  recommended_action: string
  self_care: string[]
  seek_urgent_care: boolean
  follow_up_questions: string[]
  educational_disclaimer: string
  [key: string]: unknown
}

export interface ScreeningWithResult {
  id: string
  user_id: string
  image_url: string
  image_path: string
  body_area: string
  age_group: string | null
  duration_text: string | null
  symptoms: string[] | null
  notes: string | null
  fever: boolean
  itching: boolean
  pain: boolean
  redness: boolean
  ai_analysis_status: string
  ai_analysis_result: GeminiAnalysisResult
  raw_ai_response: GeminiAnalysisResult
  risk_level: string
  recommendations: string[] | null
  follow_up_required: boolean
  created_at: string
  updated_at: string
  result?: {
    id: string
    screening_id: string
    condition_id: string
    confidence_score: number
    detected_areas: Record<string, unknown>
    severity_level: string
    ai_model_version: string
    raw_ai_response: GeminiAnalysisResult
    created_at: string
  }
  condition?: {
    id: string
    name: string
    description: string
    category: string
    symptoms: string[]
    risk_level: string
    common_body_areas: string[]
    emergency_indicators: string[]
    treatment_urgency: string
    educational_content: Record<string, unknown>
    is_active: boolean
  }
}

export async function getScreeningWithResult(
  supabase: SupabaseClient,
  screeningId: string,
  userId: string
): Promise<ScreeningWithResult | null> {
  // First, fetch the screening
  const { data: screeningData, error: screeningError } = await supabase
    .from('screenings')
    .select('*')
    .eq('id', screeningId)
    .eq('user_id', userId)
    .single()

  if (screeningError || !screeningData) {
    return null
  }

  // Then fetch the screening_results separately
  const { data: screeningResultsData } = await supabase
    .from('screening_results')
    .select(`
      id,
      screening_id,
      condition_id,
      confidence_score,
      detected_areas,
      severity_level,
      ai_model_version,
      raw_ai_response,
      condition_name,
      condition_category,
      confidence,
      risk_level,
      summary,
      possible_signs,
      red_flags,
      recommended_action,
      self_care,
      seek_urgent_care,
      follow_up_questions,
      educational_disclaimer,
      created_at
    `)
    .eq('screening_id', screeningId)
    .maybeSingle()

  // Fetch condition if condition_id exists
  let conditionData = null
  if (screeningResultsData?.condition_id) {
    const { data: condition } = await supabase
      .from('conditions')
      .select(`
        id,
        name,
        description,
        category,
        symptoms,
        risk_level,
        common_body_areas,
        emergency_indicators,
        treatment_urgency,
        educational_content,
        is_active
      `)
      .eq('id', screeningResultsData.condition_id)
      .single()
    conditionData = condition
  }

  // Generate signed URL for secure image access
  let signedUrl: string
  try {
    signedUrl = await createSignedImageUrl(supabase, screeningData.image_path)
  } catch (error) {
    console.error('Failed to generate signed URL:', error)
    signedUrl = '' // fallback
  }

  // Use screening_results data as primary source for AI analysis, fallback to screenings.ai_analysis_result
  const screeningResult = screeningResultsData
  const aiAnalysisResult = screeningResult?.raw_ai_response?.parsed || screeningData.ai_analysis_result

  return {
    ...screeningData,
    image_url: signedUrl,
    ai_analysis_result: aiAnalysisResult,
    result: screeningResult || undefined,
    condition: conditionData || undefined,
  }
}