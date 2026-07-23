// lib/validators/index.ts - Zod validation schemas for Vital Scan

import { z } from 'zod';

// =============================================================================
// ENUM VALIDATORS
// =============================================================================

export const riskLevelSchema = z.enum(['low', 'medium', 'high', 'urgent']);
export const chatRoleSchema = z.enum(['user', 'assistant', 'system']);
export const bodyAreaSchema = z.enum(['skin', 'eye', 'throat', 'nail', 'wound', 'other']);
export const ageGroupSchema = z.enum(['child', 'teen', 'adult', 'senior']);
export const treatmentUrgencySchema = z.enum(['immediate', 'urgent', 'routine', 'monitoring']);

// =============================================================================
// BASE VALIDATION SCHEMAS
// =============================================================================

// UUID validation
export const uuidSchema = z.string().uuid();

// Email validation
export const emailSchema = z.string().email('Invalid email address');

// Password validation (strong password requirements)
export const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
  .regex(/[0-9]/, 'Password must contain at least one number')
  .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character');

// Phone number validation
export const phoneSchema = z
  .string()
  .regex(/^[\+]?[1-9][\d]{0,15}$/, 'Invalid phone number format');

// Date validation
export const dateSchema = z.string().refine(
  (date) => !isNaN(Date.parse(date)),
  'Invalid date format'
);

// URL validation
export const urlSchema = z.string().url('Invalid URL format');

// =============================================================================
// PROFILE VALIDATION SCHEMAS
// =============================================================================

export const profileFormSchema = z.object({
  fullName: z
    .string()
    .min(2, 'Full name must be at least 2 characters')
    .max(100, 'Full name must be less than 100 characters')
    .regex(/^[a-zA-Z\s'-]+$/, 'Full name contains invalid characters'),

  dateOfBirth: dateSchema.refine(
    (date) => {
      const birthDate = new Date(date);
      const today = new Date();
      const age = today.getFullYear() - birthDate.getFullYear();
      return age >= 13 && age <= 120;
    },
    'Age must be between 13 and 120 years'
  ),

  gender: z.enum(['male', 'female', 'other', 'prefer-not-to-say']),

  medicalHistory: z
    .array(z.string().min(1).max(200))
    .max(50, 'Too many medical history entries')
    .optional(),

  allergies: z
    .array(z.string().min(1).max(100))
    .max(20, 'Too many allergy entries')
    .optional(),

  emergencyContact: z
    .string()
    .min(2, 'Emergency contact name must be at least 2 characters')
    .max(100, 'Emergency contact name must be less than 100 characters')
    .regex(/^[a-zA-Z\s'-]+$/, 'Emergency contact name contains invalid characters'),

  emergencyPhone: phoneSchema,

  preferences: z
    .record(z.string(), z.any())
    .optional()
});

export const profileUpdateSchema = profileFormSchema.partial();

// =============================================================================
// SCREENING VALIDATION SCHEMAS
// =============================================================================

export const scanFormSchema = z.object({
  bodyArea: bodyAreaSchema,
  ageGroup: ageGroupSchema.optional(),
  durationText: z
    .string()
    .max(100, 'Duration must be less than 100 characters')
    .optional(),
  symptomNotes: z
    .string()
    .max(500, 'Symptom notes must be less than 500 characters')
    .optional(),
  fever: z.boolean().optional(),
  itching: z.boolean().optional(),
  pain: z.boolean().optional(),
  redness: z.boolean().optional(),
  image: z
    .instanceof(File)
    .refine(
      (file) => file.size <= 10 * 1024 * 1024,
      'Image must be less than 10MB'
    )
    .refine(
      (file) => ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'].includes(file.type),
      'Only JPEG, PNG, and WebP images are allowed'
    )
});

export const screeningAnalysisRequestSchema = z.object({
  screeningId: uuidSchema,
  imageUrl: urlSchema,
  bodyArea: bodyAreaSchema,
  symptoms: z.array(z.string()).optional()
});

export const screeningAnalysisResponseSchema = z.object({
  screeningId: uuidSchema,
  results: z.array(z.object({
    conditionId: uuidSchema,
    confidenceScore: z.number().min(0).max(1),
    detectedAreas: z.record(z.string(), z.any()),
    severityLevel: riskLevelSchema,
    aiModelVersion: z.string(),
    rawAiResponse: z.record(z.string(), z.any())
  })),
  riskLevel: riskLevelSchema,
  recommendations: z.array(z.string()),
  followUpRequired: z.boolean(),
  followUpDate: dateSchema.optional()
});

// =============================================================================
// CHAT VALIDATION SCHEMAS
// =============================================================================

export const chatRequestSchema = z.object({
  sessionId: uuidSchema.optional(),
  message: z
    .string()
    .min(1, 'Message cannot be empty')
    .max(2000, 'Message must be less than 2000 characters'),
  screeningId: uuidSchema.optional(),
  context: z.record(z.string(), z.any()).optional()
});

export const chatMessageSchema = z.object({
  sessionId: uuidSchema,
  role: chatRoleSchema,
  content: z.string().min(1),
  metadata: z.record(z.string(), z.any()).optional(),
  tokenCount: z.number().int().positive().optional()
});

export const chatSessionSchema = z.object({
  userId: uuidSchema,
  title: z
    .string()
    .min(1, 'Session title cannot be empty')
    .max(200, 'Session title must be less than 200 characters'),
  screeningId: uuidSchema.optional(),
  isActive: z.boolean().default(true),
  messageCount: z.number().int().min(0).default(0),
  lastMessageAt: dateSchema
});

// =============================================================================
// AUTH VALIDATION SCHEMAS
// =============================================================================

export const signInSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Password is required')
});

export const signUpSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  confirmPassword: z.string(),
  fullName: z
    .string()
    .min(2, 'Full name must be at least 2 characters')
    .max(100, 'Full name must be less than 100 characters'),
  dateOfBirth: dateSchema.optional(),
  acceptTerms: z.boolean().refine(val => val === true, 'You must accept the terms and conditions')
}).refine(
  (data) => data.password === data.confirmPassword,
  {
    message: "Passwords don't match",
    path: ["confirmPassword"]
  }
);

export const resetPasswordSchema = z.object({
  email: emailSchema
});

export const updatePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: passwordSchema,
  confirmNewPassword: z.string()
}).refine(
  (data) => data.newPassword === data.confirmNewPassword,
  {
    message: "New passwords don't match",
    path: ["confirmNewPassword"]
  }
);

// =============================================================================
// AI INTEGRATION VALIDATION SCHEMAS
// =============================================================================

export const geminiAnalysisRequestSchema = z.object({
  image: z.string().refine(
    (str) => {
      // Check if it's a valid base64 data URL
      return str.startsWith('data:image/') && str.includes('base64,');
    },
    'Invalid image format'
  ),
  bodyArea: bodyAreaSchema,
  symptoms: z.array(z.string()).optional(),
  context: z.string().optional()
});

export const geminiAnalysisResponseSchema = z.object({
  conditions: z.array(z.object({
    name: z.string().min(1),
    confidence: z.number().min(0).max(1),
    description: z.string().min(1),
    severity: riskLevelSchema,
    recommendations: z.array(z.string()),
    emergency: z.boolean()
  })),
  overallRisk: riskLevelSchema,
  followUp: z.boolean(),
  explanation: z.string().min(1)
});

export const geminiScreeningResponseSchema = z.object({
  condition_name: z.string().min(1),
  condition_category: z.string().min(1),
  confidence: z.number().min(0).max(1),
  risk_level: riskLevelSchema,
  summary: z.string().min(1),
  possible_signs: z.array(z.string().min(1)),
  red_flags: z.array(z.string().min(1)),
  recommended_action: z.string().min(1),
  self_care: z.array(z.string().min(1)),
  seek_urgent_care: z.boolean(),
  follow_up_questions: z.array(z.string().min(1)),
  educational_disclaimer: z.string().min(1)
});

// =============================================================================
// HEALTH LIBRARY VALIDATION SCHEMAS
// =============================================================================

export const healthLibraryItemSchema = z.object({
  title: z
    .string()
    .min(1, 'Title is required')
    .max(200, 'Title must be less than 200 characters'),

  category: z
    .string()
    .min(1, 'Category is required')
    .max(50, 'Category must be less than 50 characters'),

  content: z
    .string()
    .min(10, 'Content must be at least 10 characters')
    .max(10000, 'Content must be less than 10,000 characters'),

  tags: z
    .array(z.string().min(1).max(30))
    .max(10, 'Too many tags')
    .optional(),

  author: z
    .string()
    .min(1, 'Author is required')
    .max(100, 'Author name must be less than 100 characters')
});

// =============================================================================
// SPEECH RECOGNITION VALIDATION SCHEMAS
// =============================================================================

export const speechRecognitionResultSchema = z.object({
  transcript: z.string().min(1),
  confidence: z.number().min(0).max(1),
  isFinal: z.boolean()
});

export const speechSynthesisOptionsSchema = z.object({
  text: z.string().min(1),
  voice: z.any().optional(), // SpeechSynthesisVoice type
  rate: z.number().min(0.1).max(10).optional(),
  pitch: z.number().min(0).max(2).optional(),
  volume: z.number().min(0).max(1).optional()
});

// =============================================================================
// API RESPONSE VALIDATION SCHEMAS
// =============================================================================

export const apiResponseSchema = <T extends z.ZodType>(dataSchema: T) => z.object({
  data: dataSchema.optional(),
  error: z.string().optional(),
  message: z.string().optional(),
  status: z.enum(['success', 'error'])
});

export const paginatedResponseSchema = <T extends z.ZodType>(dataSchema: T) => z.object({
  data: z.array(dataSchema),
  pagination: z.object({
    page: z.number().int().positive(),
    limit: z.number().int().positive(),
    total: z.number().int().min(0),
    totalPages: z.number().int().min(0),
    hasNext: z.boolean(),
    hasPrev: z.boolean()
  })
});

// =============================================================================
// UTILITY VALIDATION SCHEMAS
// =============================================================================

// File upload validation
export const fileUploadSchema = z.object({
  file: z
    .instanceof(File)
    .refine(
      (file) => file.size <= 10 * 1024 * 1024, // 10MB
      'File must be less than 10MB'
    )
    .refine(
      (file) => {
        const allowedTypes = [
          'image/jpeg', 'image/jpg', 'image/png', 'image/webp',
          'application/pdf', 'text/plain'
        ];
        return allowedTypes.includes(file.type);
      },
      'File type not allowed'
    )
});

// Search and filter validation
export const searchParamsSchema = z.object({
  query: z.string().optional(),
  category: z.string().optional(),
  tags: z.array(z.string()).optional(),
  limit: z.number().int().min(1).max(100).default(20),
  offset: z.number().int().min(0).default(0),
  sortBy: z.enum(['created_at', 'updated_at', 'title', 'relevance']).default('created_at'),
  sortOrder: z.enum(['asc', 'desc']).default('desc')
});

// Pagination validation
export const paginationParamsSchema = z.object({
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(100).default(20),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).default('desc')
});

// =============================================================================
// TYPE EXPORTS
// =============================================================================

// Export inferred types for use in components
export type ProfileFormData = z.infer<typeof profileFormSchema>;
export type ScreeningFormData = z.infer<typeof scanFormSchema>;
export type ChatRequest = z.infer<typeof chatRequestSchema>;
export type SignInData = z.infer<typeof signInSchema>;
export type SignUpData = z.infer<typeof signUpSchema>;
export type GeminiAnalysisRequest = z.infer<typeof geminiAnalysisRequestSchema>;
export type GeminiAnalysisResponse = z.infer<typeof geminiAnalysisResponseSchema>;
export type HealthLibraryItem = z.infer<typeof healthLibraryItemSchema>;
export type SpeechRecognitionResult = z.infer<typeof speechRecognitionResultSchema>;
export type SpeechSynthesisOptions = z.infer<typeof speechSynthesisOptionsSchema>;
export type SearchParams = z.infer<typeof searchParamsSchema>;
export type PaginationParams = z.infer<typeof paginationParamsSchema>;

// Validation helper functions
export const validateData = <T>(schema: z.ZodSchema<T>, data: unknown): { success: true; data: T } | { success: false; errors: z.ZodError } => {
  const result = schema.safeParse(data);
  if (result.success) {
    return { success: true, data: result.data };
  }
  return { success: false, errors: result.error };
};

export const validateFormData = <T>(schema: z.ZodSchema<T>, formData: FormData): { success: true; data: T } | { success: false; errors: z.ZodError } => {
  const data = Object.fromEntries(formData.entries());
  return validateData(schema, data);
};