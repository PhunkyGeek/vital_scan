import type { SupabaseClient } from '@supabase/supabase-js'

export interface ChatSession {
  id: string
  created_at: string
  updated_at: string
  user_id: string
  title: string
  screening_id: string | null
  is_active: boolean
  message_count: number
  last_message_at: string
}

export interface ChatMessage {
  id: string
  created_at: string
  updated_at: string
  session_id: string
  role: 'user' | 'assistant' | 'system'
  content: string
  metadata: Record<string, unknown> | null
  token_count: number | null
}

export interface ChatSessionWithMessages extends ChatSession {
  messages?: ChatMessage[]
}

/**
 * Create a new chat session for the current user
 * Optionally links to a screening for context-aware chat
 */
export async function createChatSession(
  supabase: SupabaseClient,
  userId: string,
  screeningId?: string
): Promise<ChatSession> {
  // Generate a default title based on whether this is screening-linked
  const title = screeningId ? 'Screening Discussion' : 'Health Chat'

  const { data, error } = await supabase
    .from('chat_sessions')
    .insert({
      user_id: userId,
      title,
      screening_id: screeningId || null,
      is_active: true,
      message_count: 0,
    })
    .select()
    .single()

  if (error || !data) {
    throw new Error(`Failed to create chat session: ${error?.message}`)
  }

  return data as ChatSession
}

/**
 * Get a chat session by ID with ownership check
 */
export async function getChatSession(
  supabase: SupabaseClient,
  sessionId: string,
  userId: string
): Promise<ChatSession | null> {
  const { data, error } = await supabase
    .from('chat_sessions')
    .select('*')
    .eq('id', sessionId)
    .eq('user_id', userId)
    .single()

  if (error) {
    // No matching session
    if (error.code === 'PGRST116') {
      return null
    }
    throw error
  }

  return data as ChatSession
}

/**
 * Get all chat sessions for a user
 */
export async function listChatSessions(
  supabase: SupabaseClient,
  userId: string
): Promise<ChatSession[]> {
  const { data, error } = await supabase
    .from('chat_sessions')
    .select('*')
    .eq('user_id', userId)
    .order('last_message_at', { ascending: false })

  if (error) {
    throw error
  }

  return (data || []) as ChatSession[]
}

/**
 * Add a message to a chat session
 */
export async function addChatMessage(
  supabase: SupabaseClient,
  sessionId: string,
  userId: string,
  role: 'user' | 'assistant',
  content: string,
  metadata?: Record<string, unknown>
): Promise<ChatMessage> {
  // Validate content length before insert
  const trimmedContent = content.trim()
  if (!trimmedContent || trimmedContent.length < 1) {
    throw new Error('Message content cannot be empty')
  }
  if (trimmedContent.length > 10000) {
    throw new Error('Message content exceeds maximum length of 10000 characters')
  }

  // Verify session ownership
  const session = await getChatSession(supabase, sessionId, userId)
  if (!session) {
    throw new Error('Session not found or unauthorized')
  }

  // Insert message
  const { data: messageData, error: messageError } = await supabase
    .from('chat_messages')
    .insert({
      session_id: sessionId,
      role,
      content: trimmedContent,
      metadata: metadata || null,
    })
    .select()
    .single()

  if (messageError || !messageData) {
    const errorDetails = messageError ? {
      message: messageError.message,
      code: messageError.code,
      details: messageError.details,
      hint: messageError.hint,
    } : 'No message data returned'
    console.error(`[chat] Failed to add ${role} message:`, {
      error: errorDetails,
      sessionId,
      userId,
      contentLength: trimmedContent.length,
    })
    throw new Error(`Failed to add message: ${messageError?.message || 'Unknown error'}`)
  }

  // Update session last_message_at and message_count
  const newMessageCount = session.message_count + 1
  const { error: updateError } = await supabase
    .from('chat_sessions')
    .update({
      last_message_at: new Date().toISOString(),
      message_count: newMessageCount,
    })
    .eq('id', sessionId)
    .eq('user_id', userId)

  if (updateError) {
    console.error('Failed to update session:', updateError)
    // Continue anyway, the message was saved
  }

  return messageData as ChatMessage
}

/**
 * Get chat messages for a session
 */
export async function getChatMessages(
  supabase: SupabaseClient,
  sessionId: string,
  userId: string,
  limit = 50
): Promise<ChatMessage[]> {
  // Verify session ownership
  const session = await getChatSession(supabase, sessionId, userId)
  if (!session) {
    throw new Error('Session not found or unauthorized')
  }

  const { data, error } = await supabase
    .from('chat_messages')
    .select('*')
    .eq('session_id', sessionId)
    .order('created_at', { ascending: true })
    .limit(limit)

  if (error) {
    throw error
  }

  return (data || []) as ChatMessage[]
}

/**
 * Get a full chat session with recent messages
 */
export async function getChatSessionWithMessages(
  supabase: SupabaseClient,
  sessionId: string,
  userId: string,
  messageLimit = 50
): Promise<ChatSessionWithMessages | null> {
  const session = await getChatSession(supabase, sessionId, userId)
  if (!session) {
    return null
  }

  const messages = await getChatMessages(supabase, sessionId, userId, messageLimit)

  return {
    ...session,
    messages,
  }
}

/**
 * Delete a chat session (soft delete via is_active flag)
 */
export async function deleteChatSession(
  supabase: SupabaseClient,
  sessionId: string,
  userId: string
): Promise<void> {
  const session = await getChatSession(supabase, sessionId, userId)
  if (!session) {
    throw new Error('Session not found or unauthorized')
  }

  const { error } = await supabase
    .from('chat_sessions')
    .update({ is_active: false })
    .eq('id', sessionId)
    .eq('user_id', userId)

  if (error) {
    throw new Error(`Failed to delete session: ${error.message}`)
  }
}

/**
 * Permanently delete a chat session and all its messages
 */
export async function permanentlyDeleteChatSession(
  supabase: SupabaseClient,
  sessionId: string,
  userId: string
): Promise<void> {
  // Verify session ownership
  const session = await getChatSession(supabase, sessionId, userId)
  if (!session) {
    throw new Error('Session not found or unauthorized')
  }

  // Delete all messages first
  const { error: messagesError } = await supabase
    .from('chat_messages')
    .delete()
    .eq('session_id', sessionId)

  if (messagesError) {
    console.error('Failed to delete chat messages:', messagesError)
    throw new Error(`Failed to delete chat messages: ${messagesError.message}`)
  }

  // Delete the session
  const { error: sessionError } = await supabase
    .from('chat_sessions')
    .delete()
    .eq('id', sessionId)
    .eq('user_id', userId)

  if (sessionError) {
    console.error('Failed to delete chat session:', sessionError)
    throw new Error(`Failed to delete chat session: ${sessionError.message}`)
  }
}

/**
 * Get chat messages for export (formatted for sharing)
 */
export async function getChatMessagesForExport(
  supabase: SupabaseClient,
  sessionId: string,
  userId: string
): Promise<{ title: string; messages: ChatMessage[] }> {
  const session = await getChatSession(supabase, sessionId, userId)
  if (!session) {
    throw new Error('Session not found or unauthorized')
  }

  const messages = await getChatMessages(supabase, sessionId, userId, 1000) // Get all messages

  return {
    title: session.title,
    messages,
  }
}
