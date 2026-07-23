import { useCallback, useEffect, useRef, useState } from 'react'

interface UseTextToSpeechReturn {
  isSupported: boolean
  isSpeaking: boolean
  isPaused: boolean
  speak: (text: string) => void
  pause: () => void
  resume: () => void
  stop: () => void
  setRate: (rate: number) => void
  setVolume: (volume: number) => void
}

/**
 * Hook for browser-based text-to-speech using Web Speech API
 *
 * Usage:
 *   const { isSupported, isSpeaking, speak, stop } = useTextToSpeech()
 *   <button onClick={() => speak("Hello world")}>Speak</button>
 */
export function useTextToSpeech(lang = 'en-US'): UseTextToSpeechReturn {
  const [isSupported] = useState<boolean>(() =>
    typeof window !== 'undefined' && 'speechSynthesis' in window
  )
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [isPaused, setIsPaused] = useState(false)

  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null)

  useEffect(() => {
    if (typeof window === 'undefined') {
      return
    }

    const synth = window.speechSynthesis

    return () => {
      if (synth) {
        synth.cancel()
      }
    }
  }, [])

  const speak = useCallback(
    (text: string) => {
      if (!isSupported || !text.trim()) {
        return
      }

      const synth = window.speechSynthesis

      // Stop any existing speech
      synth.cancel()
      setIsPaused(false)

      // Create utterance
      const utterance = new SpeechSynthesisUtterance(text)
      utterance.lang = lang
      utterance.rate = 1
      utterance.pitch = 1
      utterance.volume = 1

      // Set up event handlers
      utterance.onstart = () => {
        setIsSpeaking(true)
      }

      utterance.onend = () => {
        setIsSpeaking(false)
        setIsPaused(false)
      }

      utterance.onerror = () => {
        setIsSpeaking(false)
        setIsPaused(false)
      }

      utteranceRef.current = utterance

      // Speak
      synth.speak(utterance)
    },
    [isSupported, lang]
  )

  const pause = useCallback(() => {
    if (!isSupported) {
      return
    }

    const synth = window.speechSynthesis

    if (synth.speaking) {
      synth.pause()
      setIsPaused(true)
    }
  }, [isSupported])

  const resume = useCallback(() => {
    if (!isSupported) {
      return
    }

    const synth = window.speechSynthesis

    if (synth.paused) {
      synth.resume()
      setIsPaused(false)
    }
  }, [isSupported])

  const stop = useCallback(() => {
    if (!isSupported) {
      return
    }

    const synth = window.speechSynthesis
    synth.cancel()
    setIsSpeaking(false)
    setIsPaused(false)
  }, [isSupported])

  const setRate = useCallback(
    (rate: number) => {
      if (utteranceRef.current) {
        utteranceRef.current.rate = Math.max(0.1, Math.min(2, rate))
      }
    },
    []
  )

  const setVolume = useCallback(
    (volume: number) => {
      if (utteranceRef.current) {
        utteranceRef.current.volume = Math.max(0, Math.min(1, volume))
      }
    },
    []
  )

  return {
    isSupported,
    isSpeaking,
    isPaused,
    speak,
    pause,
    resume,
    stop,
    setRate,
    setVolume,
  }
}
