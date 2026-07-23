import { create } from 'zustand'
import { persist } from 'zustand/middleware'

// Theme store
interface ThemeState {
  theme: 'light' | 'dark' | 'system'
  setTheme: (theme: 'light' | 'dark' | 'system') => void
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      theme: 'system',
      setTheme: (theme) => set({ theme })
    }),
    {
      name: 'vital-scan-theme'
    }
  )
)

// UI state store
interface UIState {
  isLoading: boolean
  setLoading: (loading: boolean) => void
  error: string | null
  setError: (error: string | null) => void
  success: string | null
  setSuccess: (success: string | null) => void
}

export const useUIStore = create<UIState>((set) => ({
  isLoading: false,
  setLoading: (loading) => set({ isLoading: loading }),
  error: null,
  setError: (error) => set({ error }),
  success: null,
  setSuccess: (success) => set({ success })
}))

// Chat store
interface ChatState {
  messages: Array<{
    id: string
    role: 'user' | 'assistant'
    content: string
    timestamp: Date
  }>
  isTyping: boolean
  addMessage: (message: { role: 'user' | 'assistant'; content: string }) => void
  setTyping: (typing: boolean) => void
  clearMessages: () => void
}

export const useChatStore = create<ChatState>((set) => ({
  messages: [],
  isTyping: false,
  addMessage: (message) => set((state) => ({
    messages: [...state.messages, {
      id: Date.now().toString(),
      ...message,
      timestamp: new Date()
    }]
  })),
  setTyping: (typing) => set({ isTyping: typing }),
  clearMessages: () => set({ messages: [] })
}))

// Scan store
interface ScanState {
  currentScan: {
    id: string | null
    imageUrl: string | null
    status: 'idle' | 'uploading' | 'analyzing' | 'complete' | 'error'
    result: Record<string, unknown> | null
  }
  setScanStatus: (status: ScanState['currentScan']['status']) => void
  setScanResult: (result: Record<string, unknown>) => void
  setScanImage: (imageUrl: string) => void
  resetScan: () => void
}

export const useScanStore = create<ScanState>((set) => ({
  currentScan: {
    id: null,
    imageUrl: null,
    status: 'idle',
    result: null
  },
  setScanStatus: (status) => set((state) => ({
    currentScan: { ...state.currentScan, status }
  })),
  setScanResult: (result) => set((state) => ({
    currentScan: { ...state.currentScan, result, status: 'complete' }
  })),
  setScanImage: (imageUrl) => set((state) => ({
    currentScan: { ...state.currentScan, imageUrl }
  })),
  resetScan: () => set({
    currentScan: {
      id: null,
      imageUrl: null,
      status: 'idle',
      result: null
    }
  })
}))