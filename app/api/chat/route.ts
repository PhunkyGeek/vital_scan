import { NextRequest, NextResponse } from 'next/server'

import { chatWithGemini, validateHistoryMessages, trimHistoryMessages, type SimpleChatMessage } from '@/lib/ai/chat'
import { addChatMessage, getChatMessages, getChatSession } from '@/lib/data/chat'
import { getScreeningWithResult } from '@/lib/data/screenings'
import { chatRequestSchema } from '@/lib/validators'
import { createClient } from '@/lib/supabase/server'

function removeTrailingDuplicateUserMessage(
  history: SimpleChatMessage[],
  userMessage: string
): SimpleChatMessage[] {
  if (!history.length || !userMessage.trim()) {
    return history
  }

  const lastMessage = history[history.length - 1]
  if (lastMessage.role === 'user' && lastMessage.content.trim() === userMessage.trim()) {
    console.log('[chat-api] Dropped duplicate trailing user message from history')
    return history.slice(0, -1)
  }

  return history
}

export interface SimpleChatRequest {
  message: string
  history: SimpleChatMessage[]
  screeningId?: string
}

export interface SimpleChatResponse {
  message: string
}

export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const body = await request.json()

    // Check if this is a simple chat request (no sessionId, has history array)
    if (!body.sessionId && body.history && Array.isArray(body.history)) {
      return handleSimpleChat(body as SimpleChatRequest)
    }

    // Handle existing complex chat request with session management
    return handleComplexChat(body)
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : 'Unknown error'
    console.error('[chat-api] Request parsing failed:', {
      error: errorMsg,
      stack: error instanceof Error ? error.stack : undefined,
    })

    return NextResponse.json(
      {
        error: 'Internal server error',
        message: errorMsg,
      },
      { status: 500 }
    )
  }
}

async function handleSimpleChat(body: SimpleChatRequest): Promise<NextResponse> {
  if (!body.message || !body.history) {
    return NextResponse.json(
      { error: 'Missing required fields: message and history' },
      { status: 400 }
    )
  }

  try {
    // Validate and sanitize conversation history
    const validatedHistory = validateHistoryMessages(body.history)
    
    // Trim history to prevent token overflow
    // Keep last 6 messages (approximately 3 conversation turns)
    const trimmedHistory = trimHistoryMessages(validatedHistory, 6)
    const dedupedHistory = removeTrailingDuplicateUserMessage(trimmedHistory, body.message)

    let screeningContext = null

    // If screeningId is provided, fetch the screening context
    if (body.screeningId) {
      const supabase = await createClient()
      const { data: authData } = await supabase.auth.getUser()

      if (authData.user) {
        screeningContext = await getScreeningWithResult(
          supabase,
          body.screeningId,
          authData.user.id
        )
      }
    }

    // Call Gemini with the conversation
    let aiResponse: string
    try {
      aiResponse = await chatWithGemini({
        userMessage: body.message,
        conversationHistory: dedupedHistory,
        screeningContext,
      })
    } catch (geminiError) {
      const errorMsg = geminiError instanceof Error ? geminiError.message : 'Unknown Gemini error'
      console.error('[chat-api] Gemini call failed:', {
        error: errorMsg,
        messageLength: body.message.length,
        historyLength: trimmedHistory.length,
      })
      
      aiResponse = "I'm having trouble processing that request. Please check your internet connection and try again in a moment."
    }

    return NextResponse.json({
      message: aiResponse,
    } as SimpleChatResponse)
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : 'Unknown error'
    console.error('[chat-api] handleSimpleChat failed:', {
      error: errorMsg,
      stack: error instanceof Error ? error.stack : undefined,
    })

    return NextResponse.json(
      { error: 'Failed to process chat request', details: errorMsg },
      { status: 500 }
    )
  }
}

async function handleComplexChat(body: unknown): Promise<NextResponse> {
  try {
    // Validate input
    const validation = chatRequestSchema.safeParse(body as Record<string, unknown>)
    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid request',
          details: validation.error.issues.map((issue) => issue.message),
        },
        { status: 400 }
      )
    }

    const { message: userMessage, sessionId } = validation.data

    // Get authenticated user
    const supabase = await createClient()

    const { data: authData } = await supabase.auth.getUser()
    if (!authData.user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const userId = authData.user.id

    // Get or verify session
    if (!sessionId) {
      // This shouldn't happen in normal flow, but handle gracefully
      return NextResponse.json(
        { success: false, error: 'Session ID is required' },
        { status: 400 }
      )
    }

    const session = await getChatSession(supabase, sessionId, userId)
    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Session not found or unauthorized' },
        { status: 404 }
      )
    }

    // Validate screening ID if provided
    let screeningContext = null
    if (session.screening_id) {
      screeningContext = await getScreeningWithResult(
        supabase,
        session.screening_id,
        userId
      )
    }

    // Save user message
    const userMessageData = await addChatMessage(
      supabase,
      sessionId,
      userId,
      'user',
      userMessage
    )

    // Get recent conversation history (limit to prevent token overflow)
    const recentMessages = await getChatMessages(supabase, sessionId, userId, 20)

    // Convert database messages to SimpleChatMessage format and validate
    const conversationHistory: SimpleChatMessage[] = recentMessages
      .filter(msg => msg.role === 'user' || msg.role === 'assistant') // Filter out system messages
      .map(msg => ({
        role: msg.role as 'user' | 'assistant',
        content: msg.content
      }))

    const validatedHistory = validateHistoryMessages(conversationHistory)
    const trimmedHistory = trimHistoryMessages(validatedHistory, 6)
    const dedupedHistory = removeTrailingDuplicateUserMessage(trimmedHistory, userMessage)

    // Call Gemini
    let assistantResponse: string
    try {
      assistantResponse = await chatWithGemini({
        userMessage,
        conversationHistory: dedupedHistory,
        screeningContext,
      })
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error'
      console.error('[chat-api] Gemini error in complex chat:', {
        error: errorMsg,
        sessionId,
        userId,
      })

      // Return a graceful error message to user
      assistantResponse =
        "I'm having trouble processing that request. Please try again in a moment."
    }

    // Save assistant response
    const assistantMessageData = await addChatMessage(
      supabase,
      sessionId,
      userId,
      'assistant',
      assistantResponse
    )

    // Return both messages
    return NextResponse.json(
      {
        success: true,
        userMessage: userMessageData,
        assistantMessage: assistantMessageData,
      },
      { status: 200 }
    )
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : 'Unknown error'
    console.error('[chat-api] handleComplexChat failed:', {
      error: errorMsg,
      stack: error instanceof Error ? error.stack : undefined,
    })

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to send chat message.',
      },
      { status: 500 }
    )
  }
}
