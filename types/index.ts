export interface ScanResult {
  id: string
  userId: string
  imageUrl: string
  condition: string
  confidence: number
  riskLevel: 'low' | 'medium' | 'high' | 'urgent'
  description: string
  recommendations: string[]
  nextSteps: string
  redFlags: string[]
  createdAt: Date
  updatedAt: Date
}

export interface ChatMessage {
  id: string
  userId: string
  role: 'user' | 'assistant'
  content: string
  createdAt: Date
}

export interface ChatSession {
  id: string
  userId: string
  title: string
  messages: ChatMessage[]
  createdAt: Date
  updatedAt: Date
}

export interface UserProfile {
  id: string
  email: string
  fullName?: string
  avatarUrl?: string
  createdAt: Date
  updatedAt: Date
}

export interface HealthLibraryItem {
  id: string
  title: string
  description: string
  category: string
  content: string
  tags: string[]
  createdAt: Date
  updatedAt: Date
}