import { GoogleGenerativeAI } from '@google/generative-ai'

import type { ScreeningWithResult } from '@/lib/data/screenings'
import { geminiConfig } from '@/lib/env/server'

export interface SimpleChatMessage {
  role: 'user' | 'assistant'
  content: string
}

export interface GeminiChatInput {
  userMessage: string
  conversationHistory: SimpleChatMessage[]
  screeningContext?: ScreeningWithResult | null
}

/**
 * Validate and sanitize conversation history messages
 * Ensures all messages have valid role and non-empty content
 */
export function validateHistoryMessages(messages: unknown[]): SimpleChatMessage[] {
  if (!Array.isArray(messages)) {
    console.warn('[chatbot] History is not an array, returning empty history')
    return []
  }

  return messages
    .filter((msg): msg is SimpleChatMessage => {
      // Check basic shape
      if (typeof msg !== 'object' || msg === null) return false
      if (!('role' in msg) || !('content' in msg)) return false

      const candidate = msg as { role?: unknown; content?: unknown }
      const role = candidate.role
      const content = candidate.content

      // Validate role
      if (role !== 'user' && role !== 'assistant') {
        console.warn(`[chatbot] Skipping message with invalid role: ${role}`)
        return false
      }

      // Validate content
      if (typeof content !== 'string' || !content.trim()) {
        console.warn(`[chatbot] Skipping message with empty content`)
        return false
      }

      return true
    })
}

/**
 * Trim conversation history to a reasonable size
 * Keeps the most recent messages to avoid token overflow
 * Recommended: keep last 6 messages (3 turns)
 */
export function trimHistoryMessages(messages: SimpleChatMessage[], maxMessages: number = 6): SimpleChatMessage[] {
  if (messages.length <= maxMessages) {
    return messages
  }
  const trimmed = messages.slice(-maxMessages)
  console.log(`[chatbot] Trimmed history from ${messages.length} to ${trimmed.length} messages`)
  return trimmed
}

/**
 * Build a system prompt for the Gemini chat model
 * Focuses on helpful, educational responses with appropriate safety guardrails
 */
function buildChatSystemPrompt(screeningContext?: ScreeningWithResult | null): string {
  const basePrompt = `You are a helpful, empathetic AI health education assistant for Vital Scan, a screening and educational platform.

Your role:
- Answer health questions directly and educationally
- Provide supportive self-care suggestions when appropriate
- Explain common causes and triggers for symptoms
- Help users understand their screening results
- Give practical, supportive guidance

Response style:
- Answer the question first with clear, educational information
- Use plain text structure and simple headings, not markdown formatting
- Format responses with sections such as:
  - What it means
  - Common causes or triggers
  - Supportive remedies or self-care options
  - When to seek medical care
- Use hyphenated bullet lines rather than markdown bullets or bold/italic styling
- Keep remedies framed carefully: "may help", "can help if...", "supportive steps include..."
- Only include red-flag warnings when truly needed - don't over-alarm
- Keep responses readable and complete; avoid cutting off mid-sentence
- Use calm, natural language

Important formatting rules:
- Do not use markdown formatting like **bold**, *italic*, \`code\`, or headings with #
- Do not use HTML tags
- Use plain text line breaks and simple list markers

Important safety rules:
- Do not provide definitive diagnoses or claim certainty
- Do not prescribe medications, dosages, or specific medical treatments
- Do not present remedies as guaranteed cures
- Do not encourage delaying urgent care for serious symptoms
- For emergencies (severe pain, breathing difficulty, chest pain, confusion, sudden vision changes, uncontrolled bleeding), immediately recommend urgent medical care
- Always encourage professional consultation for diagnosis or treatment decisions

Examples of appropriate supportive advice:
- Hydration for dehydration-related symptoms
- Rest for fatigue or stress-related issues
- Avoiding known triggers
- Salt-water gargles for sore throat (not as universal cure)
- Dark, quiet room for migraine-like headaches
- Warm compresses for muscle tension

Examples of when to escalate:
- Sudden, severe symptoms
- Symptoms with fever, weakness, confusion
- Chest pain, difficulty breathing
- Vision changes, severe headache
- Uncontrolled bleeding, severe allergic reactions

Example response style:
Migraines are a type of headache linked to changes in brain activity, nerve signaling, and certain chemical pathways. They often run in families and can be triggered by different factors.

Common causes or triggers:
- Stress
- Lack of sleep
- Dehydration
- Hormonal changes
- Bright lights or strong smells
- Certain foods or drinks
- Weather changes

Supportive remedies or self-care options:
- Resting in a dark, quiet room may help
- Drinking fluids can help if dehydration is part of the trigger
- Avoiding known triggers may reduce future episodes
- Keeping a migraine diary can help identify patterns

When to seek medical care:
- If the headache is sudden and severe
- If it comes with weakness, confusion, fever, or vision changes
- If migraines are becoming more frequent or harder to manage

Use this as a guide for clarity and structure, but adapt naturally depending on the user's question.`

  if (screeningContext) {
    return `${basePrompt}

SCREENING CONTEXT:
This user is asking about a screening result. Here is their screening information:
- Condition: ${screeningContext.condition?.name || screeningContext.ai_analysis_result.condition_name}
- Risk Level: ${screeningContext.risk_level}
- Summary: ${screeningContext.ai_analysis_result.summary}
- Red Flags: ${screeningContext.ai_analysis_result.red_flags?.join(', ') || 'None identified'}
- Self-Care Suggestions: ${screeningContext.ai_analysis_result.self_care?.join(', ') || 'None provided'}
- Recommended Action: ${screeningContext.ai_analysis_result.recommended_action}

Use this context to provide personalized, relevant responses about their specific screening result.`
  }

  return basePrompt
}

/**
 * Format conversation history for Gemini
 * Converts simple chat message format to Gemini's expected format
 * Assumes history has already been validated
 * NOTE: Gemini API expects 'model' role for AI responses, not 'assistant'
 */
function formatConversationHistory(
  messages: SimpleChatMessage[]
): Array<{ role: 'user' | 'model'; parts: Array<{ text: string }> }> {
  return messages
    .filter((msg) => msg.role === 'user' || msg.role === 'assistant')
    .map((msg) => ({
      role: msg.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: msg.content }],
    }))
}

/**
 * Remove a duplicated trailing user message from history when the current message is also sent separately.
 */
function removeTrailingDuplicateUserMessage(
  history: SimpleChatMessage[],
  userMessage: string
): SimpleChatMessage[] {
  if (!history.length || !userMessage.trim()) {
    return history
  }

  const lastMessage = history[history.length - 1]
  if (lastMessage.role === 'user' && lastMessage.content.trim() === userMessage.trim()) {
    console.log('[chatbot] Removed duplicate trailing user message from history')
    return history.slice(0, -1)
  }

  return history
}

/**
 * Chat with Gemini with optional screening context
 */
export async function chatWithGemini(input: GeminiChatInput): Promise<string> {
  try {
    const client = new GoogleGenerativeAI(geminiConfig.apiKey)
    const modelName = geminiConfig.modelChat
    const model = client.getGenerativeModel({ model: modelName })

    const systemPrompt = buildChatSystemPrompt(input.screeningContext)
    const historyWithoutDuplicate = removeTrailingDuplicateUserMessage(
      input.conversationHistory,
      input.userMessage
    )
    const formattedHistory = formatConversationHistory(historyWithoutDuplicate)

    // Validate request structure
    if (!input.userMessage || !input.userMessage.trim()) {
      throw new Error('User message cannot be empty')
    }

    // Call Gemini with conversation history
    const response = await model.generateContent({
      systemInstruction: systemPrompt,
      contents: [
        ...formattedHistory,
        {
          role: 'user',
          parts: [{ text: input.userMessage }],
        },
      ],
      generationConfig: {
        temperature: 0.45,
        maxOutputTokens: 1200,
      },
    })

    const text = response.response.text()

    // Handle empty response with safe fallback
    if (!text || !text.trim()) {
      console.warn('[chatbot] Gemini returned empty response, using fallback')
      return "I appreciate your question, but I wasn't able to provide a complete response. Please try asking again or rephrase your question."
    }

    return text.trim()
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    console.error('[chatbot] Gemini request failed:', {
      error: errorMessage,
      userMessagePreview: input.userMessage.slice(0, 120),
      historyLength: input.conversationHistory.length,
      recentHistory: input.conversationHistory.slice(-3),
      timestamp: new Date().toISOString(),
      errorObject: error,
    })
    throw error
  }
}
