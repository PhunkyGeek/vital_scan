// Speech recognition utilities
export class SpeechRecognitionManager {
  private recognition: SpeechRecognition | null = null
  private isListening = false

  constructor() {
    if (typeof window !== 'undefined' && 'webkitSpeechRecognition' in window) {
      this.recognition = new webkitSpeechRecognition()
      this.recognition.continuous = false
      this.recognition.interimResults = false
      this.recognition.lang = 'en-US'
    }
  }

  startListening(onResult: (transcript: string) => void, onError?: (error: string) => void): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.recognition) {
        reject(new Error('Speech recognition not supported'))
        return
      }

      if (this.isListening) {
        reject(new Error('Already listening'))
        return
      }

      this.recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript
        onResult(transcript)
        resolve()
      }

      this.recognition.onerror = (event) => {
        const error = `Speech recognition error: ${event.error}`
        onError?.(error)
        reject(new Error(error))
      }

      this.recognition.onend = () => {
        this.isListening = false
      }

      this.isListening = true
      this.recognition.start()
    })
  }

  stopListening() {
    if (this.recognition && this.isListening) {
      this.recognition.stop()
      this.isListening = false
    }
  }

  isSupported(): boolean {
    return this.recognition !== null
  }
}

// Speech synthesis utilities
export class SpeechSynthesisManager {
  private synth: SpeechSynthesis | null = null

  constructor() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      this.synth = window.speechSynthesis
    }
  }

  speak(text: string, options?: {
    rate?: number
    pitch?: number
    volume?: number
    voice?: SpeechSynthesisVoice
  }): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.synth) {
        reject(new Error('Speech synthesis not supported'))
        return
      }

      // Cancel any ongoing speech
      this.synth.cancel()

      const utterance = new SpeechSynthesisUtterance(text)

      if (options) {
        utterance.rate = options.rate || 1
        utterance.pitch = options.pitch || 1
        utterance.volume = options.volume || 1
        if (options.voice) {
          utterance.voice = options.voice
        }
      }

      utterance.onend = () => resolve()
      utterance.onerror = (event) => reject(new Error(`Speech synthesis error: ${event.error}`))

      this.synth.speak(utterance)
    })
  }

  stop() {
    if (this.synth) {
      this.synth.cancel()
    }
  }

  getVoices(): SpeechSynthesisVoice[] {
    return this.synth?.getVoices() || []
  }

  isSupported(): boolean {
    return this.synth !== null
  }
}

// Hook for speech recognition
export function useSpeechRecognition() {
  const manager = new SpeechRecognitionManager()

  const startListening = (onResult: (transcript: string) => void, onError?: (error: string) => void) => {
    return manager.startListening(onResult, onError)
  }

  const stopListening = () => {
    manager.stopListening()
  }

  return {
    startListening,
    stopListening,
    isSupported: manager.isSupported()
  }
}

// Hook for speech synthesis
export function useSpeechSynthesis() {
  const manager = new SpeechSynthesisManager()

  const speak = (text: string, options?: Parameters<SpeechSynthesisManager['speak']>[1]) => {
    return manager.speak(text, options)
  }

  const stop = () => {
    manager.stop()
  }

  return {
    speak,
    stop,
    getVoices: manager.getVoices.bind(manager),
    isSupported: manager.isSupported()
  }
}