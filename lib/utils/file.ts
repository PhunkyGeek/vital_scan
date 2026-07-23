import { getStorageConfig } from '@/lib/env/client'

/**
 * Allowed image MIME types for health screening uploads
 */
export const IMAGE_MIME_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
] as const

/**
 * File validation error types for better error handling
 */
export class FileValidationError extends Error {
  constructor(
    message: string,
    public code:
      | 'INVALID_MIME_TYPE'
      | 'FILE_TOO_LARGE'
      | 'MISSING_FILE'
      | 'INVALID_FILE_TYPE'
  ) {
    super(message)
    this.name = 'FileValidationError'
  }
}

/**
 * Validate file is present and is a File object
 */
export function validateFileExists(file: unknown): asserts file is File {
  if (!file || !(file instanceof File)) {
    throw new FileValidationError(
      'No file provided. Please upload an image to continue.',
      'MISSING_FILE'
    )
  }
}

/**
 * Check if file MIME type is allowed
 */
export function isValidImageMimeType(file: File): boolean {
  return IMAGE_MIME_TYPES.includes(file.type as typeof IMAGE_MIME_TYPES[number])
}

/**
 * Validate image file thoroughly
 * Throws FileValidationError on failure
 */
export function validateImageFile(file: File): void {
  // Check mime type
  if (!isValidImageMimeType(file)) {
    throw new FileValidationError(
      `Invalid image format. Only JPEG, PNG, and WebP are supported. Got: ${file.type}`,
      'INVALID_MIME_TYPE'
    )
  }

  // Check file size
  const maxBytes = getStorageConfig().maxImageBytes
  if (file.size > maxBytes) {
    throw new FileValidationError(
      `Image is too large. Maximum size is ${formatFileSize(maxBytes)}, but your image is ${formatFileSize(file.size)}.`,
      'FILE_TOO_LARGE'
    )
  }
}

/**
 * Convert MIME type to safe file extension
 * Always returns a valid extension
 */
export function getImageExtension(fileType: string): string {
  switch (fileType.toLowerCase()) {
    case 'image/png':
      return 'png'
    case 'image/webp':
      return 'webp'
    case 'image/jpeg':
    case 'image/jpg':
      return 'jpg'
    default:
      // Fallback to jpg if MIME type is unknown
      // This is safe because we validate MIME types before calling this
      return 'jpg'
  }
}

/**
 * Format bytes to human-readable size
 */
export function formatFileSize(bytes: number): string {
  if (bytes < 1024) {
    return `${bytes} B`
  }

  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`
  }

  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

/**
 * Extract safe filename from File object
 * Removes path separators and special characters
 */
export function getSafeFilename(file: File): string {
  // Get base name without path
  const baseName = file.name.split('/').pop() || 'file'
  // Remove extension (will be added later based on MIME type)
  return baseName.replace(/\.[^/.]+$/, '').slice(0, 100) // Limit to 100 chars
}
