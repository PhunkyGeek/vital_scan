// types/index.ts - Comprehensive TypeScript types for Vital Scan

// =============================================================================
// DATABASE TYPES (Generated from Supabase schema)
// =============================================================================

// Custom enums from database
export type RiskLevel = 'low' | 'moderate' | 'high' | 'critical';
export type ChatRole = 'user' | 'assistant' | 'system';
export type BodyArea = 'head' | 'neck' | 'chest' | 'abdomen' | 'arms' | 'legs' | 'back' | 'skin';
export type TreatmentUrgency = 'immediate' | 'urgent' | 'routine' | 'monitoring';

// Base database types
export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          created_at: string;
          updated_at: string;
          email: string;
          full_name: string | null;
          avatar_url: string | null;
          date_of_birth: string | null;
          gender: string | null;
          medical_history: string[] | null;
          allergies: string[] | null;
          emergency_contact: string | null;
          emergency_phone: string | null;
          preferences: Record<string, unknown> | null;
        };
        Insert: {
          id: string;
          created_at?: string;
          updated_at?: string;
          email: string;
          full_name?: string | null;
          avatar_url?: string | null;
          date_of_birth?: string | null;
          gender?: string | null;
          medical_history?: string[] | null;
          allergies?: string[] | null;
          emergency_contact?: string | null;
          emergency_phone?: string | null;
          preferences?: Record<string, unknown> | null;
        };
        Update: {
          id?: string;
          created_at?: string;
          updated_at?: string;
          email?: string;
          full_name?: string | null;
          avatar_url?: string | null;
          date_of_birth?: string | null;
          gender?: string | null;
          medical_history?: string[] | null;
          allergies?: string[] | null;
          emergency_contact?: string | null;
          emergency_phone?: string | null;
          preferences?: Record<string, unknown> | null;
        };
      };
      screenings: {
        Row: {
          id: string;
          created_at: string;
          updated_at: string;
          user_id: string;
          image_url: string;
          image_path: string;
          body_area: BodyArea;
          symptoms: string[] | null;
          notes: string | null;
          ai_analysis_status: 'pending' | 'processing' | 'completed' | 'failed';
          ai_analysis_result: Record<string, unknown> | null;
          risk_level: RiskLevel | null;
          recommendations: string[] | null;
          follow_up_required: boolean;
          follow_up_date: string | null;
          reviewed_by_doctor: boolean;
          doctor_notes: string | null;
        };
        Insert: {
          id?: string;
          created_at?: string;
          updated_at?: string;
          user_id: string;
          image_url: string;
          image_path: string;
          body_area: BodyArea;
          symptoms?: string[] | null;
          notes?: string | null;
          ai_analysis_status?: 'pending' | 'processing' | 'completed' | 'failed';
          ai_analysis_result?: Record<string, unknown> | null;
          risk_level?: RiskLevel | null;
          recommendations?: string[] | null;
          follow_up_required?: boolean;
          follow_up_date?: string | null;
          reviewed_by_doctor?: boolean;
          doctor_notes?: string | null;
        };
        Update: {
          id?: string;
          created_at?: string;
          updated_at?: string;
          user_id?: string;
          image_url?: string;
          image_path?: string;
          body_area?: BodyArea;
          symptoms?: string[] | null;
          notes?: string | null;
          ai_analysis_status?: 'pending' | 'processing' | 'completed' | 'failed';
          ai_analysis_result?: Record<string, unknown> | null;
          risk_level?: RiskLevel | null;
          recommendations?: string[] | null;
          follow_up_required?: boolean;
          follow_up_date?: string | null;
          reviewed_by_doctor?: boolean;
          doctor_notes?: string | null;
        };
      };
      screening_results: {
        Row: {
          id: string;
          created_at: string;
          updated_at: string;
          screening_id: string;
          condition_id: string;
          confidence_score: number;
          detected_areas: Record<string, unknown>;
          severity_level: RiskLevel;
          ai_model_version: string;
          raw_ai_response: Record<string, unknown>;
        };
        Insert: {
          id?: string;
          created_at?: string;
          updated_at?: string;
          screening_id: string;
          condition_id: string;
          confidence_score: number;
          detected_areas?: Record<string, unknown>;
          severity_level: RiskLevel;
          ai_model_version: string;
          raw_ai_response: Record<string, unknown>;
        };
        Update: {
          id?: string;
          created_at?: string;
          updated_at?: string;
          screening_id?: string;
          condition_id?: string;
          confidence_score?: number;
          detected_areas?: Record<string, unknown>;
          severity_level?: RiskLevel;
          ai_model_version?: string;
          raw_ai_response?: Record<string, unknown>;
        };
      };
      conditions: {
        Row: {
          id: string;
          created_at: string;
          updated_at: string;
          name: string;
          description: string;
          category: string;
          symptoms: string[];
          risk_level: RiskLevel;
          common_body_areas: BodyArea[];
          emergency_indicators: string[];
          treatment_urgency: TreatmentUrgency;
          educational_content: Record<string, unknown>;
          is_active: boolean;
        };
        Insert: {
          id?: string;
          created_at?: string;
          updated_at?: string;
          name: string;
          description: string;
          category: string;
          symptoms?: string[];
          risk_level: RiskLevel;
          common_body_areas?: BodyArea[];
          emergency_indicators?: string[];
          treatment_urgency: TreatmentUrgency;
          educational_content?: Record<string, unknown>;
          is_active?: boolean;
        };
        Update: {
          id?: string;
          created_at?: string;
          updated_at?: string;
          name?: string;
          description?: string;
          category?: string;
          symptoms?: string[];
          risk_level?: RiskLevel;
          common_body_areas?: BodyArea[];
          emergency_indicators?: string[];
          treatment_urgency?: TreatmentUrgency;
          educational_content?: Record<string, unknown>;
          is_active?: boolean;
        };
      };
      chat_sessions: {
        Row: {
          id: string;
          created_at: string;
          updated_at: string;
          user_id: string;
          title: string;
          screening_id: string | null;
          is_active: boolean;
          message_count: number;
          last_message_at: string;
        };
        Insert: {
          id?: string;
          created_at?: string;
          updated_at?: string;
          user_id: string;
          title: string;
          screening_id?: string | null;
          is_active?: boolean;
          message_count?: number;
          last_message_at?: string;
        };
        Update: {
          id?: string;
          created_at?: string;
          updated_at?: string;
          user_id?: string;
          title?: string;
          screening_id?: string | null;
          is_active?: boolean;
          message_count?: number;
          last_message_at?: string;
        };
      };
      chat_messages: {
        Row: {
          id: string;
          created_at: string;
          updated_at: string;
          session_id: string;
          role: ChatRole;
          content: string;
          metadata: Record<string, unknown> | null;
          token_count: number | null;
        };
        Insert: {
          id?: string;
          created_at?: string;
          updated_at?: string;
          session_id: string;
          role: ChatRole;
          content: string;
          metadata?: Record<string, unknown> | null;
          token_count?: number | null;
        };
        Update: {
          id?: string;
          created_at?: string;
          updated_at?: string;
          session_id?: string;
          role?: ChatRole;
          content?: string;
          metadata?: Record<string, unknown> | null;
          token_count?: number | null;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      risk_level: RiskLevel;
      chat_role: ChatRole;
      body_area: BodyArea;
      treatment_urgency: TreatmentUrgency;
    };
  };
}

// =============================================================================
// DOMAIN TYPES (Application-specific interfaces)
// =============================================================================

// User Profile
export type UserProfile = Database['public']['Tables']['profiles']['Row'] & {
  // Additional computed properties can be added here
};

// Screening with related data
export type Screening = Database['public']['Tables']['screenings']['Row'] & {
  profile?: UserProfile;
  results?: ScreeningResult[];
};

// Screening Result with condition details
export type ScreeningResult = Database['public']['Tables']['screening_results']['Row'] & {
  screening?: Screening;
  condition?: Condition;
};

// Medical Condition
export type Condition = Database['public']['Tables']['conditions']['Row'] & {
  // Additional computed properties can be added here
};

// Chat Session with messages
export type ChatSession = Database['public']['Tables']['chat_sessions']['Row'] & {
  messages?: ChatMessage[];
  screening?: Screening;
};

// Chat Message
export type ChatMessage = Database['public']['Tables']['chat_messages']['Row'] & {
  session?: ChatSession;
};

// =============================================================================
// API TYPES (Request/Response interfaces)
// =============================================================================

// Auth API
export interface AuthUser {
  id: string;
  email: string;
  user_metadata?: Record<string, unknown>;
}

export interface AuthSession {
  user: AuthUser;
  access_token: string;
  refresh_token: string;
}

// Screening API
export interface CreateScreeningRequest {
  image: File;
  bodyArea: BodyArea;
  symptoms?: string[];
  notes?: string;
}

export interface ScreeningAnalysisRequest {
  screeningId: string;
  imageUrl: string;
  bodyArea: BodyArea;
  symptoms?: string[];
}

export interface ScreeningAnalysisResponse {
  screeningId: string;
  results: ScreeningResult[];
  riskLevel: RiskLevel;
  recommendations: string[];
  followUpRequired: boolean;
  followUpDate?: string;
}

// Chat API
export interface ChatRequest {
  sessionId?: string;
  message: string;
  screeningId?: string;
  context?: Record<string, unknown>;
}

export interface ChatResponse {
  sessionId: string;
  message: ChatMessage;
  suggestions?: string[];
}

// Health Library API
export interface HealthLibraryItem {
  id: string;
  title: string;
  category: string;
  content: string;
  tags: string[];
  lastUpdated: string;
  author: string;
}

// =============================================================================
// AI INTEGRATION TYPES
// =============================================================================

// Gemini API types
export interface GeminiAnalysisRequest {
  image: string; // base64 encoded
  bodyArea: BodyArea;
  symptoms?: string[];
  context?: string;
}

export interface GeminiAnalysisResponse {
  conditions: Array<{
    name: string;
    confidence: number;
    description: string;
    severity: RiskLevel;
    recommendations: string[];
    emergency: boolean;
  }>;
  overallRisk: RiskLevel;
  followUp: boolean;
  explanation: string;
}

// Speech Recognition types
export interface SpeechRecognitionResult {
  transcript: string;
  confidence: number;
  isFinal: boolean;
}

export interface SpeechSynthesisOptions {
  text: string;
  voice?: SpeechSynthesisVoice;
  rate?: number;
  pitch?: number;
  volume?: number;
}

// =============================================================================
// FORM TYPES (For React Hook Form + Zod)
// =============================================================================

export interface ProfileFormData {
  fullName: string;
  dateOfBirth: string;
  gender: string;
  medicalHistory: string[];
  allergies: string[];
  emergencyContact: string;
  emergencyPhone: string;
  preferences: Record<string, unknown>;
}

export interface ScreeningFormData {
  bodyArea: BodyArea;
  symptoms: string[];
  notes: string;
  image: File | null;
}

export interface ChatFormData {
  message: string;
  sessionId?: string;
}

// =============================================================================
// UI COMPONENT TYPES
// =============================================================================

export interface StatCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon?: React.ComponentType<unknown>;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
}

export interface AlertProps {
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

// =============================================================================
// STATE MANAGEMENT TYPES (Zustand stores)
// =============================================================================

export interface AuthStore {
  user: AuthUser | null;
  session: AuthSession | null;
  profile: UserProfile | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, metadata?: Record<string, unknown>) => Promise<void>;
  signOut: () => Promise<void>;
  updateProfile: (updates: Partial<UserProfile>) => Promise<void>;
  refreshSession: () => Promise<void>;
}

export interface ScreeningStore {
  screenings: Screening[];
  currentScreening: Screening | null;
  isAnalyzing: boolean;
  fetchScreenings: () => Promise<void>;
  createScreening: (data: CreateScreeningRequest) => Promise<Screening>;
  analyzeScreening: (screeningId: string) => Promise<void>;
  setCurrentScreening: (screening: Screening | null) => void;
}

export interface ChatStore {
  sessions: ChatSession[];
  currentSession: ChatSession | null;
  isTyping: boolean;
  fetchSessions: () => Promise<void>;
  createSession: (title: string, screeningId?: string) => Promise<ChatSession>;
  sendMessage: (message: string, sessionId: string) => Promise<ChatMessage>;
  setCurrentSession: (session: ChatSession | null) => void;
}

// =============================================================================
// UTILITY TYPES
// =============================================================================

export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

export type RequireAtLeastOne<T, Keys extends keyof T = keyof T> = Pick<T, Exclude<keyof T, Keys>> & {
  [K in Keys]-?: Required<Pick<T, K>> & Partial<Pick<T, Exclude<Keys, K>>>;
}[Keys];

// API Response wrapper
export interface ApiResponse<T = unknown> {
  data?: T;
  error?: string;
  message?: string;
  status: 'success' | 'error';
}

// Pagination types
export interface PaginationParams {
  page: number;
  limit: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

// =============================================================================
// CONSTANTS AND CONFIG TYPES
// =============================================================================

export interface AppConfig {
  supabase: {
    url: string;
    anonKey: string;
  };
  gemini: {
    apiKey: string;
    model: string;
  };
  features: {
    speechRecognition: boolean;
    speechSynthesis: boolean;
    offlineMode: boolean;
  };
}

export interface ValidationRules {
  password: {
    minLength: number;
    requireUppercase: boolean;
    requireLowercase: boolean;
    requireNumbers: boolean;
    requireSpecialChars: boolean;
  };
  fileUpload: {
    maxSize: number; // in bytes
    allowedTypes: string[];
  };
}

// Export commonly used types
// export type { Database }; // Already exported above
