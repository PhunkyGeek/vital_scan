import { analyzeWithGemini, type GeminiScreeningInput } from './gemini'

export type ScreeningAnalysisInput = GeminiScreeningInput

export async function runScreeningAnalysis(input: ScreeningAnalysisInput) {
  return analyzeWithGemini(input)
}
