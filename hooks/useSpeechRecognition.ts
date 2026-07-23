import { useCallback, useEffect, useRef, useState } from 'react'

type SpeechRecognitionCtor = new () => SpeechRecognition

interface UseSpeechRecognitionReturn {
  isSupported: boolean
  isListening: boolean
  transcript: string
  error: string | null
  startListening: () => void
  stopListening: () => void
  resetTranscript: () => void
}

/**
 * Hook for browser-based speech recognition (speech-to-text)
 * Uses Web Speech API (SpeechRecognition) where available
 *
 * Usage:
 *   const { isSupported, isListening, transcript, startListening, stopListening } = useSpeechRecognition()
 */
export function useSpeechRecognition(language = 'en-US'): UseSpeechRecognitionReturn {
  const isBrowserSpeechRecognitionSupported =
    typeof window !== 'undefined' &&
    (('SpeechRecognition' in window) || ('webkitSpeechRecognition' in window))

  const isSupported = isBrowserSpeechRecognitionSupported
  const [isListening, setIsListening] = useState(false)
  const [transcript, setTranscript] = useState('')
  const [error, setError] = useState<string | null>(null)

  const recognitionRef = useRef<SpeechRecognition | null>(null)

  // Initialize speech recognition on mount
  useEffect(() => {
    if (typeof window === 'undefined') {
      return
    }

      // Check browser support
    const win = window as unknown as {
      SpeechRecognition?: SpeechRecognitionCtor
      webkitSpeechRecognition?: SpeechRecognitionCtor
    }

    const SpeechRecognitionConstructor =
      win.SpeechRecognition || win.webkitSpeechRecognition

    if (!SpeechRecognitionConstructor) {
      return
    }

    const recognition = new SpeechRecognitionConstructor()
    recognitionRef.current = recognition

    // Configure recognition
    recognition.continuous = true
    recognition.interimResults = true
    recognition.lang = language

    // Handle results
    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let interimTranscriptLocal = ''
      let finalTranscript = ''

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcriptChunk = event.results[i][0].transcript

        if (event.results[i].isFinal) {
          finalTranscript += transcriptChunk + ' '
        } else {
          interimTranscriptLocal += transcriptChunk
        }
      }

      setTranscript((prev) => `${prev}${finalTranscript}${interimTranscriptLocal}`)
    }

    // Handle errors
    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      const errorMessage = getErrorMessage(event.error)
      setError(errorMessage)
      setIsListening(false)
    }

    // Handle start
    recognition.onstart = () => {
      setError(null)
      setIsListening(true)
    }

    // Handle end
    recognition.onend = () => {
      setIsListening(false)
    }

    return () => {
      recognition.stop()
    }
  }, [language])

  const startListening = useCallback(() => {
    if (!recognitionRef.current || !isSupported) {
      return
    }

    setError(null)

    try {
      recognitionRef.current.start()
    } catch {
      // Already started, ignore
    }
  }, [isSupported])

  const stopListening = useCallback(() => {
    if (!recognitionRef.current) {
      return
    }

    try {
      recognitionRef.current.stop()
    } catch {
      // Not started, ignore
    }
  }, [])

  const resetTranscript = useCallback(() => {
    setTranscript('')
    setError(null)
  }, [])

  return {
    isSupported,
    isListening,
    transcript,
    error,
    startListening,
    stopListening,
    resetTranscript,
  }
}

/**
 * Map Web Speech API error codes to user-friendly messages
 */
function getErrorMessage(error: string): string {
  const errorMap: Record<string, string> = {
    'no-speech':
      'No speech was detected. Please try speaking into the microphone again.',
    'audio-capture': 'No microphone was found. Ensure it is connected and enabled.',
    'not-allowed': 'Microphone access was denied. Please allow access in your browser settings.',
    'network': 'Network error. Please check your connection and try again.',
    'service-not-allowed': 'Speech recognition is not allowed. Your browser may block this feature.',
  }

  return (
    errorMap[error] || `An error occurred: ${error}. Please try again.`
  )
}
