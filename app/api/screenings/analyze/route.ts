import { NextResponse } from 'next/server'

import { runScreeningAnalysis } from '@/lib/ai/screening'
import { scanFormSchema } from '@/lib/validators'
import { createSignedImageUrl, removeScreeningImage, uploadScreeningImage, StorageError } from '@/lib/supabase/storage'
import { createScreeningRecord, createScreeningResult, findOrCreateCondition } from '@/lib/supabase/screenings'
import { validateImageFile, FileValidationError } from '@/lib/utils/file'
import { createClient } from '@/lib/supabase/server'

function parseBoolean(value: FormDataEntryValue | null) {
  return value === 'true' || value === '1'
}

function getTreatmentUrgency(riskLevel: string) {
  return riskLevel === 'urgent' ? 'urgent' : 'routine'
}

export async function POST(request: Request) {
  const supabase = await createClient()

  const { data: authData, error: authError } = await supabase.auth.getUser()
  if (authError || !authData.user) {
    return NextResponse.json({ error: 'Authentication required to submit a scan.' }, { status: 401 })
  }

  const formData = await request.formData()
  const image = formData.get('image')
  const payload = {
    bodyArea: String(formData.get('bodyArea') ?? ''),
    ageGroup: String(formData.get('ageGroup') ?? '') || undefined,
    durationText: String(formData.get('durationText') ?? '') || undefined,
    symptomNotes: String(formData.get('symptomNotes') ?? '') || undefined,
    fever: parseBoolean(formData.get('fever')),
    itching: parseBoolean(formData.get('itching')),
    pain: parseBoolean(formData.get('pain')),
    redness: parseBoolean(formData.get('redness')),
    image,
  }

  const validation = scanFormSchema.safeParse(payload)
  if (!validation.success) {
    const message = validation.error.issues
      .map((issue: { message: string }) => issue.message)
      .join(', ')
    return NextResponse.json({ error: message || 'Please check your scan submission.' }, { status: 400 })
  }

  const file = validation.data.image

  // Validate image file thoroughly
  try {
    validateImageFile(file)
  } catch (error) {
    if (error instanceof FileValidationError) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }
    throw error
  }

  const screeningId = crypto.randomUUID()
  const userId = authData.user.id
  let imagePath = ''

  try {
    const uploadResult = await uploadScreeningImage(supabase, userId, screeningId, file)
    imagePath = uploadResult.path
    const signedUrl = await createSignedImageUrl(supabase, imagePath)

    const analysis = await runScreeningAnalysis({
      imageUrl: signedUrl,
      bodyArea: validation.data.bodyArea,
      symptomNotes: validation.data.symptomNotes,
      durationText: validation.data.durationText,
      ageGroup: validation.data.ageGroup,
      fever: validation.data.fever,
      itching: validation.data.itching,
      pain: validation.data.pain,
      redness: validation.data.redness,
    })

    const conditionId = await findOrCreateCondition(
      supabase,
      analysis.condition_name,
      analysis.condition_category,
      analysis.summary,
      analysis.possible_signs,
      analysis.red_flags,
      analysis.risk_level,
      validation.data.bodyArea,
      getTreatmentUrgency(analysis.risk_level),
      {
        recommended_action: analysis.recommended_action,
        self_care: analysis.self_care,
        follow_up_questions: analysis.follow_up_questions,
        educational_disclaimer: analysis.educational_disclaimer,
      }
    )

    let screeningCreated = false

    try {
      await createScreeningRecord(supabase, {
        id: screeningId,
        user_id: authData.user.id,
        image_path: imagePath,
        body_area: validation.data.bodyArea,
        age_group: validation.data.ageGroup ?? null,
        duration_text: validation.data.durationText ?? null,
        symptoms: validation.data.symptomNotes ? [validation.data.symptomNotes] : null,
        notes: validation.data.symptomNotes ?? null,
        fever: validation.data.fever ?? false,
        itching: validation.data.itching ?? false,
        pain: validation.data.pain ?? false,
        redness: validation.data.redness ?? false,
        ai_analysis_status: 'completed',
        ai_analysis_result: analysis,
        raw_ai_response: analysis,
        risk_level: analysis.risk_level,
        recommendations: analysis.self_care,
        follow_up_required: analysis.seek_urgent_care,
      })
      screeningCreated = true

      await createScreeningResult(supabase, {
        screening_id: screeningId,
        condition_id: conditionId,
        confidence_score: analysis.confidence,
        detected_areas: {
          bodyArea: validation.data.bodyArea,
          durationText: validation.data.durationText,
          ageGroup: validation.data.ageGroup,
          fever: validation.data.fever,
          itching: validation.data.itching,
          pain: validation.data.pain,
          redness: validation.data.redness,
          symptomNotes: validation.data.symptomNotes,
        },
        severity_level: analysis.risk_level,
        ai_model_version: process.env.GEMINI_MODEL_SCREENING ?? 'gemini-2.5-flash',
        raw_ai_response: analysis,
      })

      return NextResponse.json({ id: screeningId }, { status: 201 })
    } catch (innerError) {
      console.error('Create screening data failed:', innerError)

      if (screeningCreated) {
        await supabase.from('screenings').delete().eq('id', screeningId)
      }

      throw innerError
    }
  } catch (error) {
    console.error('Scan submission failed:', error)

    // Only try to clean up storage if we have a path
    if (imagePath) {
      try {
        await removeScreeningImage(supabase, imagePath)
      } catch (cleanupError) {
        console.error('Failed to clean up uploaded image:', cleanupError)
      }
    }

    // Provide user-friendly error message
    let userMessage = 'Unable to complete the scan. Please try again.'
    if (error instanceof StorageError) {
      console.error(`Storage error (${error.code}):`, error.originalError)
      userMessage = 'Failed to upload image. Please check your connection and try again.'
    } else if (error instanceof Error) {
      userMessage = error.message
    }

    return NextResponse.json({ error: userMessage }, { status: 500 })
  }
}
