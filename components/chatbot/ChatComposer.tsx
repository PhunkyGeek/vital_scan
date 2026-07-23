'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useSpeechRecognition } from '@/hooks/useSpeechRecognition'
import { useTextToSpeech } from '@/hooks/useTextToSpeech'
import { Send } from 'lucide-react'
import { useCallback, useRef, useState } from 'react'
import { SpeechPlaybackToggle } from './SpeechPlaybackToggle'
import { VoiceInputButton } from './VoiceInputButton'

interface ChatComposerProps {
  onSendMessage: (message: string) => void
  isLoading?: boolean
  lastAssistantMessage?: string | null
}

export function ChatComposer({
  onSendMessage,
  isLoading,
  lastAssistantMessage,
}: ChatComposerProps) {
  const [input, setInput] = useState('')
  const lastTranscriptRef = useRef('')

  const {
    isSupported: isVoiceInputSupported,
    isListening,
    transcript,
    startListening,
    stopListening,
    resetTranscript,
  } = useSpeechRecognition()

  const {
    isSupported: isVoiceOutputSupported,
    isSpeaking,
    speak: speakText,
    stop: stopSpeaking,
  } = useTextToSpeech()

  // Handle voice input completion
  const handleVoiceComplete = useCallback(() => {
    if (transcript && transcript !== lastTranscriptRef.current) {
      setInput((prev) => prev + (prev ? ' ' : '') + transcript.trim())
      lastTranscriptRef.current = transcript
    }
    resetTranscript()
  }, [transcript, resetTranscript])

  // Handle listening stop
  const handleStopListening = useCallback(() => {
    stopListening()
    // Small delay to ensure transcript is finalized
    setTimeout(handleVoiceComplete, 100)
  }, [stopListening, handleVoiceComplete])

  const handleSendMessage = useCallback(() => {
    const message = input.trim()
    if (!message || isLoading) {
      return
    }

    onSendMessage(message)
    setInput('')
  }, [input, isLoading, onSendMessage])

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  return (
    <div className="border-t border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 p-4 sm:p-6 space-y-3">
      {/* Voice input indicator */}
      {isListening && (
        <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800">
          <span className="inline-block h-2 w-2 rounded-full bg-red-500 animate-pulse" />
          <p className="text-xs text-red-700 dark:text-red-200">
            Listening... {transcript && <span className="ml-1">&ldquo;{transcript}&rdquo;</span>}
          </p>
        </div>
      )}

      {/* Voice playback controls */}
      {lastAssistantMessage && (
        <div className="flex justify-end">
          <SpeechPlaybackToggle
            isSupported={isVoiceOutputSupported}
            isSpeaking={isSpeaking}
            onSpeak={speakText}
            onStop={stopSpeaking}
            text={lastAssistantMessage}
            disabled={isLoading}
          />
        </div>
      )}

      {/* Input area */}
      <div className="flex gap-3">
        <Input
          placeholder="Ask me anything..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={isLoading || isListening}
          className="rounded-full"
        />

        <VoiceInputButton
          isSupported={isVoiceInputSupported}
          isListening={isListening}
          onStart={startListening}
          onStop={handleStopListening}
          disabled={isLoading}
        />

        <Button
          onClick={handleSendMessage}
          disabled={isLoading || !input.trim()}
          size="sm"
          className="rounded-full"
        >
          <Send className="h-4 w-4" />
        </Button>
      </div>

      {/* Help text */}
      <p className="text-xs text-muted-foreground text-center">Press Enter to send or use voice input</p>
    </div>
  )
}
