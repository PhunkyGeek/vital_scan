"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import type { SupabaseClient } from "@supabase/supabase-js"
import { DisclaimerBanner } from "@/components/shared/DisclaimerBanner"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Mic, Send, Bot, User, Loader2, MessageSquare, Plus, Volume2, VolumeX, Copy, Trash2, Share2 } from "lucide-react"
import {
  listChatSessions,
  createChatSession,
  getChatMessages,
  permanentlyDeleteChatSession,
  getChatMessagesForExport,
  type ChatSession,
} from "@/lib/data/chat"
import { useSpeechToText, useTextToSpeech } from "@/lib/hooks/speech"
import {
  getUserProfile,
  type UserProfile,
} from "@/lib/data/profile"

interface ChatMessage {
  id: string
  role: "assistant" | "user" | "system"
  content: string
}

function formatDateTime(value: string) {
  return new Date(value).toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  })
}

export default function ClientPage() {
  const router = useRouter()
  const supabase = createClient() as SupabaseClient
  const [userId, setUserId] = useState<string | null>(null)
  const [sessions, setSessions] = useState<ChatSession[]>([])
  const [activeSession, setActiveSession] = useState<ChatSession | null>(null)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState("")
  const [isLoadingSessions, setIsLoadingSessions] = useState(true)
  const [isSending, setIsSending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [sessionToDelete, setSessionToDelete] = useState<ChatSession | null>(null)
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)

  // Get voice preferences
  const chatPrefs = profile?.preferences?.chat as Record<string, unknown> | undefined
  const languagePrefs = profile?.preferences?.language as Record<string, unknown> | undefined
  const voiceEnabled = (chatPrefs?.voiceEnabled as boolean) ?? false
  const preferredLanguage = (languagePrefs?.preferredLanguage as string) ?? 'en-US'
  const effectiveLanguage =
    preferredLanguage === 'auto'
      ? (typeof navigator !== 'undefined' ? navigator.language : 'en-US')
      : preferredLanguage || 'en-US'

  // Speech recognition hook
  const speechToText = useSpeechToText({
    language: effectiveLanguage,
    onResult: (transcript, isFinal) => {
      if (isFinal) {
        setInput(transcript)
      }
    },
    onError: (error) => {
      console.error("Speech recognition error:", error)
      setError("Speech recognition failed. Please try again.")
    },
  })

  // Text-to-speech hook
  const textToSpeech = useTextToSpeech({
    language: effectiveLanguage,
  })

  useEffect(() => {
    async function loadUser() {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        router.push('/login')
        return
      }

      setUserId(user.id)

      // Load user profile for preferences
      try {
        const userProfile = await getUserProfile(supabase, user.id)
        setProfile(userProfile)
      } catch (err) {
        console.error('Failed to load profile:', err)
      }
    }

    void loadUser()
  }, [supabase, router])

  const loadSessions = useCallback(async () => {
    if (!userId) return

    setIsLoadingSessions(true)
    try {
      const sessions = await listChatSessions(supabase, userId)
      setSessions(sessions)
      setActiveSession((current) => current ?? sessions[0] ?? null)
    } catch (err) {
      console.error("Failed to load chat sessions:", err)
    } finally {
      setIsLoadingSessions(false)
    }
  }, [supabase, userId])

  useEffect(() => {
    void loadSessions()
  }, [loadSessions])

  useEffect(() => {
    if (!activeSession || !userId) {
      setMessages([
        {
          id: "welcome",
          role: "assistant",
          content:
            "Hello! I'm your AI health assistant. I can help answer questions about health conditions, provide general information, and offer self-care advice. Remember, I'm not a substitute for professional medical advice. How can I help you today?",
        },
      ])
      return
    }

    async function loadMessagesForSession() {
      if (!activeSession || !userId) {
        return
      }

      try {
        const sessionId = activeSession.id
        const user = userId
        const storedMessages = await getChatMessages(
          supabase,
          sessionId,
          user,
          100
        )

        setMessages(
          storedMessages.map((message) => ({
            id: message.id,
            role: message.role,
            content: message.content,
          }))
        )
      } catch (err) {
        console.error("Failed to load session messages:", err)
        setMessages([
          {
            id: "error",
            role: "assistant",
            content:
              "Unable to load conversation history. Please try selecting another chat or starting a new one.",
          },
        ])
      }
    }

    void loadMessagesForSession()
  }, [activeSession, supabase, userId])

  const handleNewSession = useCallback(async () => {
    if (!userId) return

    setIsLoadingSessions(true)
    try {
      const session = await createChatSession(supabase, userId)
      if (!session) {
        throw new Error('Chat session creation failed')
      }
      setSessions((current) => [session, ...current])
      setActiveSession(session)
    } catch (err) {
      console.error("Failed to create chat session:", err)
    } finally {
      setIsLoadingSessions(false)
    }
  }, [supabase, userId])

  const handleSend = useCallback(async () => {
    if (!input.trim() || isSending) return

    if (!userId) {
      router.push("/login")
      return
    }

    let session = activeSession
    if (!session) {
      setIsLoadingSessions(true)
      try {
        session = await createChatSession(supabase, userId)
        if (!session) {
          throw new Error('Chat session creation failed')
        }
        const createdSession = session
        setSessions((current) => [createdSession, ...current])
        setActiveSession(createdSession)
      } catch (err) {
        console.error("Failed to create chat session:", err)
        setError("Unable to start a new conversation right now.")
        setIsLoadingSessions(false)
        return
      } finally {
        setIsLoadingSessions(false)
      }
    }

    const userMessage: ChatMessage = {
      id: `${Date.now()}-user`,
      role: "user",
      content: input.trim(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setIsSending(true)
    setError(null)

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: userMessage.content,
          sessionId: session.id,
        }),
      })

      if (!response.ok) {
        // Safely parse error response
        let errorMsg = `HTTP ${response.status}`
        try {
          const errorText = await response.text()
          if (errorText) {
            const errorPayload = JSON.parse(errorText)
            errorMsg = errorPayload.error || errorMsg
          }
        } catch (parseErr) {
          // If we can't parse error response, use status code
          console.error("Failed to parse error response:", parseErr)
        }
        throw new Error(errorMsg)
      }

      // Safely parse successful response
      const responseText = await response.text()
      if (!responseText) {
        throw new Error("Empty response from chat API")
      }
      let data
      try {
        data = JSON.parse(responseText)
      } catch (parseErr) {
        console.error("Failed to parse chat response:", { parseErr, responseText })
        throw new Error("Invalid response format from chat API")
      }

      const assistantMessage: ChatMessage = {
        id: `${Date.now()}-assistant`,
        role: "assistant",
        content:
          data.assistantMessage?.content ??
          "I could not generate a response. Please try again.",
      }

      setMessages((prev) => [...prev, assistantMessage])
      void loadSessions()
    } catch (err) {
      console.error("Chat send failed:", err)
      setError(err instanceof Error ? err.message : "Unable to send message")
      setMessages((prev) => [
        ...prev,
        {
          id: `${Date.now()}-assistant-error`,
          role: "assistant",
          content:
            "I'm sorry, I had trouble connecting right now. Please try again in a moment.",
        },
      ])
    } finally {
      setIsSending(false)
    }
  }, [activeSession, input, isSending, router, supabase, userId, loadSessions])

  const handleMicClick = useCallback(() => {
    if (!speechToText.isSupported) {
      setError("Speech recognition is not supported in your browser.")
      return
    }

    if (speechToText.isListening) {
      speechToText.stopListening()
    } else {
      speechToText.resetTranscript()
      speechToText.startListening()
    }
  }, [speechToText])

  const handleSpeakMessage = useCallback((content: string) => {
    if (!textToSpeech.isSupported) {
      setError("Text-to-speech is not supported in your browser.")
      return
    }

    if (textToSpeech.isSpeaking) {
      textToSpeech.stop()
    } else {
      textToSpeech.speak(content)
    }
  }, [textToSpeech])

  const showToast = useCallback((message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 3000)
  }, [])

  const handleCopyMessage = useCallback(async (content: string) => {
    try {
      await navigator.clipboard.writeText(content)
      showToast('Copied to clipboard')
    } catch (error) {
      console.error('Failed to copy to clipboard:', error)
      showToast('Failed to copy to clipboard', 'error')
    }
  }, [showToast])

  const handleDeleteSession = useCallback((session: ChatSession) => {
    setSessionToDelete(session)
    setDeleteDialogOpen(true)
  }, [])

  const confirmDeleteSession = useCallback(async () => {
    if (!sessionToDelete || !userId) return

    try {
      await permanentlyDeleteChatSession(supabase, sessionToDelete.id, userId)

      // Remove from local state
      setSessions(prev => prev.filter(s => s.id !== sessionToDelete.id))

      // If this was the active session, clear it and reset to default
      if (activeSession?.id === sessionToDelete.id) {
        setActiveSession(null)
        setMessages([
          {
            id: 'default-greeting',
            role: 'assistant',
            content: 'Hello! I\'m your AI health assistant. I can help answer your health questions, explain medical terms, and provide general health information. What would you like to know?',
          },
        ])
      }

      showToast('Chat deleted successfully')
    } catch (error) {
      console.error('Failed to delete session:', error)
      showToast('Failed to delete chat', 'error')
    } finally {
      setDeleteDialogOpen(false)
      setSessionToDelete(null)
    }
  }, [sessionToDelete, userId, supabase, activeSession, showToast])

  const handleShareSession = useCallback(async (session: ChatSession) => {
    if (!userId) return

    try {
      const { title, messages } = await getChatMessagesForExport(supabase, session.id, userId)

      // Format the conversation for sharing
      const date = new Date(session.created_at).toLocaleDateString()
      let shareText = `Vital Scan Chat: ${title}\nDate: ${date}\n\n`

      messages.forEach(message => {
        const role = message.role === 'user' ? 'You' : 'AI'
        shareText += `${role}: ${message.content}\n\n`
      })

      // Try Web Share API first
      if (navigator.share) {
        await navigator.share({
          title: `Vital Scan: ${title}`,
          text: shareText,
        })
        showToast('Chat shared')
      } else {
        // Fallback to clipboard
        await navigator.clipboard.writeText(shareText)
        showToast('Chat copied to clipboard')
      }
    } catch (error) {
      console.error('Failed to share session:', error)
      if (error instanceof Error && error.name !== 'AbortError') {
        showToast('Failed to share chat', 'error')
      }
    }
  }, [userId, supabase, showToast])

  return (
    <div className="min-h-screen bg-background">

      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">AI Health Chatbot</h1>
          <p className="text-muted-foreground">
            Ask questions, review past conversations, and keep your chat history saved securely.
          </p>
        </div>

        <DisclaimerBanner />

        <div className="grid gap-6 lg:grid-cols-[320px_1fr] mt-8">
          <Card className="space-y-4 p-4">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                <MessageSquare className="h-4 w-4" />
                Conversations
              </div>
              <Button size="sm" onClick={handleNewSession} disabled={isLoadingSessions}>
                <Plus className="h-4 w-4" /> New
              </Button>
            </div>

            {isLoadingSessions ? (
              <div className="space-y-3">
                {[...Array(4)].map((_, index) => (
                  <div key={index} className="h-16 rounded-xl bg-muted animate-pulse" />
                ))}
              </div>
            ) : sessions.length > 0 ? (
              <div className="space-y-3">
                {sessions.map((session) => (
                  <div
                    key={session.id}
                    className={`relative w-full rounded-2xl border p-4 pb-12 transition cursor-pointer ${
                      activeSession?.id === session.id
                        ? 'border-primary bg-primary/5'
                        : 'border-border bg-background hover:border-primary/60'
                    }`}
                    onClick={() => setActiveSession(session)}
                  >
                    <div className="pr-20">
                      <span className="font-semibold text-foreground block truncate">{session.title}</span>
                      <p className="text-sm text-muted-foreground mt-1">
                        {session.message_count} message{session.message_count === 1 ? '' : 's'}
                      </p>
                      <span className="text-xs text-muted-foreground block mt-2">
                        {formatDateTime(session.last_message_at)}
                      </span>
                    </div>
                    <div className="absolute bottom-4 right-4 flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleShareSession(session)
                        }}
                        className="h-8 w-8 p-0"
                        aria-label="Share chat"
                      >
                        <Share2 className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleDeleteSession(session)
                        }}
                        className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                        aria-label="Delete chat"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-2xl border border-border bg-muted p-6 text-sm text-muted-foreground">
                No conversation history yet. Start a new chat to save questions and answers.
              </div>
            )}
          </Card>

          <Card className="h-[720px] flex flex-col">
            <CardContent className="flex-1 p-4 overflow-y-auto">
              <div className="space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex items-start space-x-3 ${
                      message.role === 'user' ? 'justify-end' : ''
                    }`}
                  >
                    {message.role === 'assistant' && (
                      <div className="flex-shrink-0">
                        <Bot className="h-8 w-8 text-primary" />
                      </div>
                    )}
                    <div className="flex-1">
                      <div
                        className={`rounded-2xl px-4 py-3 max-w-[80%] ${
                          message.role === 'user'
                            ? 'bg-primary text-primary-foreground ml-auto'
                            : 'bg-muted'
                        }`}
                      >
                        <p className="text-sm whitespace-pre-wrap break-words">{message.content}</p>
                      </div>
                      {message.role === 'assistant' && (
                        <div className="flex gap-2 mt-2">
                          {voiceEnabled && textToSpeech.isSupported && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleSpeakMessage(message.content)}
                              className="h-8 px-2"
                              aria-label={textToSpeech.isSpeaking ? "Stop speaking" : "Read message aloud"}
                            >
                              {textToSpeech.isSpeaking ? (
                                <VolumeX className="h-4 w-4" />
                              ) : (
                                <Volume2 className="h-4 w-4" />
                              )}
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleCopyMessage(message.content)}
                            className="h-8 px-2"
                            aria-label="Copy response"
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                        </div>
                      )}
                    </div>
                    {message.role === 'user' && (
                      <div className="flex-shrink-0">
                        <User className="h-8 w-8 text-muted-foreground" />
                      </div>
                    )}
                  </div>
                ))}
                {isSending && (
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0">
                      <Bot className="h-8 w-8 text-primary" />
                    </div>
                    <div className="rounded-2xl px-4 py-3 max-w-[80%] bg-muted">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Thinking...
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>

            <div className="border-t p-4">
              {error && (
                <div className="mb-3 rounded-xl bg-destructive/10 px-4 py-3 text-sm text-destructive">
                  {error}
                </div>
              )}
              <div className="flex flex-col gap-3 sm:flex-row">
                <div className="flex flex-1 gap-2">
                  <Input
                    value={speechToText.isListening ? speechToText.transcript : input}
                    onChange={(event) => setInput(event.target.value)}
                    placeholder={speechToText.isListening ? "Listening..." : "Ask a health question..."}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter') {
                        void handleSend()
                      }
                    }}
                    className="flex-1"
                    disabled={isSending}
                  />
                  {voiceEnabled && speechToText.isSupported && (
                    <Button
                      type="button"
                      variant={speechToText.isListening ? "destructive" : "outline"}
                      size="icon"
                      onClick={handleMicClick}
                      aria-label={speechToText.isListening ? "Stop listening" : "Start voice input"}
                      className={speechToText.isListening ? "animate-pulse" : ""}
                    >
                      <Mic className="h-4 w-4" />
                    </Button>
                  )}
                </div>
                <Button
                  onClick={() => void handleSend()}
                  disabled={isSending || !input.trim()}
                >
                  {isSending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </main>

      {/* Delete Confirmation Dialog */}
      {deleteDialogOpen && sessionToDelete && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-background rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold mb-2">Delete this chat?</h3>
            <p className="text-sm text-muted-foreground mb-6">
              This will permanently remove the conversation &quot;{sessionToDelete.title}&quot; from your history.
            </p>
            <div className="flex gap-3 justify-end">
              <Button
                variant="outline"
                onClick={() => {
                  setDeleteDialogOpen(false)
                  setSessionToDelete(null)
                }}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={confirmDeleteSession}
              >
                Delete
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {toast && (
        <div className={`fixed bottom-4 right-4 px-4 py-2 rounded-lg text-sm font-medium z-50 ${
          toast.type === 'success'
            ? 'bg-green-100 text-green-800 border border-green-200'
            : 'bg-red-100 text-red-800 border border-red-200'
        }`}>
          {toast.message}
        </div>
      )}
    </div>
  )
}
