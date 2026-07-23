import { GoogleGenerativeAI } from '@google/generative-ai'

import { geminiScreeningResponseSchema } from '@/lib/validators'
import { geminiConfig } from '@/lib/env/server'

export interface GeminiScreeningInput {
  imageUrl: string
  bodyArea: string
  symptomNotes?: string
  durationText?: string
  ageGroup?: string
  fever?: boolean
  itching?: boolean
  pain?: boolean
  redness?: boolean
}

function buildScreeningPrompt(input: GeminiScreeningInput) {
  const details = [
    `Body area: ${input.bodyArea}`,
    input.ageGroup ? `Age group: ${input.ageGroup}` : null,
    input.durationText ? `Duration: ${input.durationText}` : null,
    input.fever !== undefined ? `Fever: ${input.fever ? 'yes' : 'no'}` : null,
    input.itching !== undefined ? `Itching: ${input.itching ? 'yes' : 'no'}` : null,
    input.pain !== undefined ? `Pain: ${input.pain ? 'yes' : 'no'}` : null,
    input.redness !== undefined ? `Redness: ${input.redness ? 'yes' : 'no'}` : null,
    input.symptomNotes ? `Symptom notes: ${input.symptomNotes}` : null,
  ]
    .filter(Boolean)
    .join('\n')

  return `You are a clinical AI assistant. Use the image and patient details to provide AI-assisted screening guidance only. Do not claim a medical diagnosis. Do not offer prescriptions, dosages, or definitive diagnosis statements. Be conservative with uncertainty, call out unclear findings, and recommend medical attention when urgent signs are present.

Use the image from this secure URL: ${input.imageUrl}

${details}

Respond with JSON only. Do not wrap the JSON in markdown, and do not include any extra text outside the JSON object. The JSON must follow this exact schema:
{
  "condition_name": "string",
  "condition_category": "string",
  "confidence": 0.0,
  "risk_level": "low | medium | high | urgent",
  "summary": "string",
  "possible_signs": ["string"],
  "red_flags": ["string"],
  "recommended_action": "string",
  "self_care": ["string"],
  "seek_urgent_care": true,
  "follow_up_questions": ["string"],
  "educational_disclaimer": "string"
}

If the image quality or context is limited, state that clearly and keep the confidence conservative.`
}

function extractJsonObject(payload: string) {
  const firstBrace = payload.indexOf('{')
  const lastBrace = payload.lastIndexOf('}')

  if (firstBrace === -1 || lastBrace === -1 || lastBrace <= firstBrace) {
    throw new Error('Gemini response did not contain valid JSON')
  }

  const rawJson = payload.slice(firstBrace, lastBrace + 1)

  try {
    return JSON.parse(rawJson)
  } catch {
    throw new Error('Gemini returned malformed JSON output')
  }
}

export async function analyzeWithGemini(input: GeminiScreeningInput) {
  const client = new GoogleGenerativeAI(geminiConfig.apiKey)
  const modelName = geminiConfig.modelScreening
  const model = client.getGenerativeModel({ model: modelName })

  const prompt = buildScreeningPrompt(input)

  const response = await model.generateContent({
    contents: [{ role: 'user', parts: [{ text: prompt }] }],
    generationConfig: {
      temperature: 0.2,
      maxOutputTokens: 600,
    },
  })

  const rawText = response.response.text() || ''

  if (!rawText) {
    throw new Error('Gemini returned an empty response')
  }

  const parsed = extractJsonObject(rawText)

  return geminiScreeningResponseSchema.parse(parsed)
}
