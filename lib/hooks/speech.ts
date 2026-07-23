import { useState, useEffect, useCallback, useRef } from 'react'

type SpeechRecognitionConstructor = new () => SpeechRecognition

export interface SpeechToTextState {
  isListening: boolean
  transcript: string
  isSupported: boolean
  error: string | null
}

export interface UseSpeechToTextOptions {
  language?: string
  continuous?: boolean
  interimResults?: boolean
  onResult?: (transcript: string, isFinal: boolean) => void
  onError?: (error: string) => void
}

export function useSpeechToText(options: UseSpeechToTextOptions = {}) {
  const {
    language = 'en-US',
    continuous = false,
    interimResults = true,
    onResult,
    onError,
  } = options

  const isSpeechRecognitionSupported =
    typeof window !== 'undefined' &&
    (('SpeechRecognition' in window) || ('webkitSpeechRecognition' in window))

  const [state, setState] = useState<SpeechToTextState>({
    isListening: false,
    transcript: '',
    isSupported: isSpeechRecognitionSupported,
    error: null,
  })

  const recognitionRef = useRef<SpeechRecognition | null>(null)
  const onResultRef = useRef(onResult)
  const onErrorRef = useRef(onError)

  // Update refs when callbacks change
  useEffect(() => {
    onResultRef.current = onResult
  }, [onResult])

  useEffect(() => {
    onErrorRef.current = onError
  }, [onError])

  useEffect(() => {
    // Check for browser support
    const win = window as unknown as {
      SpeechRecognition?: SpeechRecognitionConstructor
      webkitSpeechRecognition?: SpeechRecognitionConstructor
    }

    const SpeechRecognitionConstructor =
      win.SpeechRecognition || win.webkitSpeechRecognition

    if (!SpeechRecognitionConstructor) {
      recognitionRef.current = null
      return
    }

    // Only create recognition instance once
    if (!recognitionRef.current) {
      const recognition = new SpeechRecognition()
      recognitionRef.current = recognition

      recognition.onstart = () => {
        setState(prev => ({ ...prev, isListening: true, error: null }))
      }

      recognition.onresult = (event: SpeechRecognitionEvent) => {
        let finalTranscript = ''
        let interimTranscript = ''

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript
          if (event.results[i].isFinal) {
            finalTranscript += transcript
          } else {
            interimTranscript += transcript
          }
        }

        const fullTranscript = finalTranscript || interimTranscript
        setState(prev => ({ ...prev, transcript: fullTranscript }))

        if (finalTranscript && onResultRef.current) {
          onResultRef.current(finalTranscript, true)
        } else if (interimTranscript && onResultRef.current) {
          onResultRef.current(interimTranscript, false)
        }
      }

      recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
        const errorMessage = `Speech recognition error: ${event.error}`
        setState(prev => ({ ...prev, error: errorMessage, isListening: false }))
        if (onErrorRef.current) {
          onErrorRef.current(errorMessage)
        }
      }

      recognition.onend = () => {
        setState(prev => ({ ...prev, isListening: false }))
      }
    }

    // Update recognition properties
    const recognition = recognitionRef.current
    if (recognition) {
      recognition.lang = language
      recognition.continuous = continuous
      recognition.interimResults = interimResults
    }

    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop()
        } catch {
          // Ignore errors during cleanup
        }
      }
    }
  }, [language, continuous, interimResults])

  // Update recognition properties when options change
  useEffect(() => {
    if (recognitionRef.current) {
      recognitionRef.current.lang = language
      recognitionRef.current.continuous = continuous
      recognitionRef.current.interimResults = interimResults
    }
  }, [language, continuous, interimResults])

  const startListening = useCallback(() => {
    if (!recognitionRef.current || !state.isSupported) return

    try {
      setState(prev => ({ ...prev, error: null }))
      recognitionRef.current.start()
    } catch {
      const errorMessage = 'Failed to start speech recognition'
      setState(prev => ({ ...prev, error: errorMessage }))
      if (onErrorRef.current) {
        onErrorRef.current(errorMessage)
      }
    }
  }, [state.isSupported])

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop()
      } catch {
        // Ignore errors when stopping
      }
    }
  }, [])

  const resetTranscript = useCallback(() => {
    setState(prev => ({ ...prev, transcript: '' }))
  }, [])

  return {
    ...state,
    startListening,
    stopListening,
    resetTranscript,
  }
}

export interface SpeechSpeakOptions {
  lang?: string
  rate?: number
  pitch?: number
  volume?: number
  voice?: SpeechSynthesisVoice | null
}

export interface TextToSpeechState {
  isSpeaking: boolean
  isSupported: boolean
  currentText: string
  error: string | null
}

export interface UseTextToSpeechOptions {
  language?: string
  rate?: number
  pitch?: number
  volume?: number
  voice?: SpeechSynthesisVoice | null
  onStart?: () => void
  onEnd?: () => void
  onError?: (error: string) => void
}

export function useTextToSpeech(options: UseTextToSpeechOptions = {}) {
  const {
    language = 'en-US',
    rate = 1,
    pitch = 1,
    volume = 1,
    voice = null,
    onStart,
    onEnd,
    onError,
  } = options

  const [state, setState] = useState<TextToSpeechState>(() => ({
    isSpeaking: false,
    isSupported: typeof window !== 'undefined' && 'speechSynthesis' in window,
    currentText: '',
    error: null,
  }))

  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null)
  const onStartRef = useRef(onStart)
  const onEndRef = useRef(onEnd)
  const onErrorRef = useRef(onError)

  // Update refs when callbacks change
  useEffect(() => {
    onStartRef.current = onStart
  }, [onStart])

  useEffect(() => {
    onEndRef.current = onEnd
  }, [onEnd])

  useEffect(() => {
    onErrorRef.current = onError
  }, [onError])

  useEffect(() => {
    if (!('speechSynthesis' in window)) {
      return
    }

    return () => {
      window.speechSynthesis.cancel()
    }
  }, [])

  const speak = useCallback(
    (text: string, options?: SpeechSpeakOptions) => {
      if (!('speechSynthesis' in window) || !text.trim()) return

      const synth = window.speechSynthesis
      synth.cancel()

      const utterance = new SpeechSynthesisUtterance(text)
      utterance.lang = options?.lang ?? language
      utterance.rate = options?.rate ?? rate
      utterance.pitch = options?.pitch ?? pitch
      utterance.volume = options?.volume ?? volume

      if (options?.voice ?? voice) {
        utterance.voice = options?.voice ?? voice
      }

      utterance.onstart = () => {
        setState(prev => ({ ...prev, isSpeaking: true, currentText: text, error: null }))
        if (onStartRef.current) onStartRef.current()
      }

      utterance.onend = () => {
        setState(prev => ({ ...prev, isSpeaking: false, currentText: '' }))
        if (onEndRef.current) onEndRef.current()
      }

      utterance.onerror = (event) => {
        const errorMessage = `Speech synthesis error: ${event.error}`
        setState(prev => ({ ...prev, isSpeaking: false, currentText: '', error: errorMessage }))
        if (onErrorRef.current) onErrorRef.current(errorMessage)
      }

      utteranceRef.current = utterance
      synth.speak(utterance)
    },
    [language, rate, pitch, volume, voice]
  )

  const stop = useCallback(() => {
    if (!('speechSynthesis' in window)) return
    window.speechSynthesis.cancel()
    setState(prev => ({ ...prev, isSpeaking: false, currentText: '' }))
  }, [])

  const pause = useCallback(() => {
    if (!('speechSynthesis' in window)) return
    window.speechSynthesis.pause()
  }, [])

  const resume = useCallback(() => {
    if (!('speechSynthesis' in window)) return
    window.speechSynthesis.resume()
  }, [])

  return {
    ...state,
    speak,
    stop,
    pause,
    resume,
  }
}

export function getAvailableVoices(): SpeechSynthesisVoice[] {
  if (!('speechSynthesis' in window)) return []
  return window.speechSynthesis.getVoices()
}

export function getVoiceForLanguage(language: string): SpeechSynthesisVoice | null {
  const voices = getAvailableVoices()
  return voices.find(voice => voice.lang.startsWith(language)) || voices[0] || null
}