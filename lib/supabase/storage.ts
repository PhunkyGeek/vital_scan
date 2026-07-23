import type { SupabaseClient } from '@supabase/supabase-js'
import { getStorageConfig } from '@/lib/env/client'
import { getImageExtension } from '@/lib/utils/file'

/**
 * Storage error class for better error handling in storage operations
 */
export class StorageError extends Error {
  constructor(
    message: string,
    public code: string,
    public originalError?: Error
  ) {
    super(message)
    this.name = 'StorageError'
  }
}

/**
 * Metadata about an uploaded screening image
 */
export interface ScreeningImageUploadResult {
  path: string
  mimetype: string
  size: number
  uploadedAt: string
  userId: string
}

/**
 * Get the screening images bucket name from environment configuration
 */
export function getScreeningBucketName(): string {
  const bucketName = getStorageConfig().bucketScreenings
  if (!bucketName) {
    throw new Error(
      'Screening images bucket name is not configured. Set SUPABASE_STORAGE_BUCKET_SCREENINGS environment variable.'
    )
  }
  return bucketName
}

/**
 * Build a storage path for a screening image
 * Pattern: {userId}/screenings/{screeningId}-{timestamp}.{extension}
 *
 * Example: user-123/screenings/screening-456-1712345678.jpg
 *
 * IMPORTANT: If your Supabase RLS storage policy uses
 * (storage.foldername(name))[1] = auth.uid()::text,
 * then the first path segment must be the user ID.
 *
 * Correct path:
 *   {userId}/screenings/{fileName}
 *
 * Wrong path:
 *   screenings/{userId}/{fileName}
 *
 * This is necessary because foldername(name) is split on '/'.
 */
export function buildScreeningImagePath(
  userId: string,
  screeningId: string,
  mimeType: string
): string {
  if (!userId || !screeningId) {
    throw new Error('userId and screeningId are required')
  }

  const extension = getImageExtension(mimeType)
  const timestamp = Math.floor(Date.now() / 1000)

  return `${userId}/screenings/${screeningId}-${timestamp}.${extension}`
}

/**
 * Upload a screening image to the private bucket
 * Returns path and metadata for storage in database
 *
 * Requirements:
 * - File must be validated before calling this function
 * - User must be authenticated
 * - Bucket must be configured in Supabase
 */
export async function uploadScreeningImage(
  supabase: SupabaseClient,
  userId: string,
  screeningId: string,
  file: File
): Promise<ScreeningImageUploadResult> {
  if (!userId || !screeningId || !file) {
    throw new StorageError(
      'Missing required parameters for upload',
      'INVALID_PARAMS'
    )
  }

  const bucketName = getScreeningBucketName()
  const path = buildScreeningImagePath(userId, screeningId, file.type)

  try {
    const { data, error } = await supabase.storage
      .from(bucketName)
      .upload(path, file, {
        contentType: file.type,
        // Don't cache private bucket uploads heavily
        cacheControl: 'private, max-age=0',
        upsert: false, // Don't overwrite if path exists
      })

    if (error) {
      throw new StorageError(
        `Failed to upload image: ${error.message}`,
        'UPLOAD_FAILED',
        error as Error
      )
    }

    if (!data?.path) {
      throw new StorageError(
        'Upload returned no path information',
        'NO_PATH_RETURNED'
      )
    }

    return {
      path: data.path,
      mimetype: file.type,
      size: file.size,
      uploadedAt: new Date().toISOString(),
      userId,
    }
  } catch (error) {
    if (error instanceof StorageError) {
      throw error
    }

    throw new StorageError(
      'Unexpected error during upload',
      'UPLOAD_ERROR',
      error instanceof Error ? error : undefined
    )
  }
}

/**
 * Create a signed URL for accessing a private screening image
 *
 * Signed URLs allow temporary, authenticated access to private bucket files.
 *
 * Recommendations:
 * - Use short expiry times (default 1 hour)
 * - Generate URLs at read time, not storage time
 * - Never store signed URLs in database (only store path)
 * - Always validate user ownership before serving URL
 */
export async function createSignedImageUrl(
  supabase: SupabaseClient,
  path: string,
  expiresInSeconds?: number
): Promise<string> {
  const bucketName = getScreeningBucketName()
  const expiry = expiresInSeconds ?? getStorageConfig().signedUrlExpirySeconds

  if (!path) {
    throw new StorageError(
      'Image path is required to generate signed URL',
      'MISSING_PATH'
    )
  }

  if (expiry < 1 || expiry > 604800) {
    // Max 7 days
    throw new StorageError(
      'Expiry time must be between 1 second and 7 days',
      'INVALID_EXPIRY'
    )
  }

  try {
    const { data, error } = await supabase.storage
      .from(bucketName)
      .createSignedUrl(path, expiry)

    if (error) {
      throw new StorageError(
        `Failed to create signed URL: ${error.message}`,
        'SIGNED_URL_FAILED',
        error as Error
      )
    }

    if (!data?.signedUrl) {
      throw new StorageError(
        'No signed URL was returned',
        'NO_SIGNED_URL'
      )
    }

    return data.signedUrl
  } catch (error) {
    if (error instanceof StorageError) {
      throw error
    }

    throw new StorageError(
      'Unexpected error creating signed URL',
      'SIGNED_URL_ERROR',
      error instanceof Error ? error : undefined
    )
  }
}

/**
 * Delete a screening image from storage
 *
 * Should only be called after confirming user ownership and database cleanup.
 */
export async function removeScreeningImage(
  supabase: SupabaseClient,
  path: string
): Promise<void> {
  const bucketName = getScreeningBucketName()

  if (!path) {
    throw new StorageError(
      'Image path is required to delete file',
      'MISSING_PATH'
    )
  }

  try {
    const { error } = await supabase.storage
      .from(bucketName)
      .remove([path])

    if (error) {
      throw new StorageError(
        `Failed to delete image: ${error.message}`,
        'DELETE_FAILED',
        error as Error
      )
    }
  } catch (error) {
    if (error instanceof StorageError) {
      throw error
    }

    throw new StorageError(
      'Unexpected error deleting file',
      'DELETE_ERROR',
      error instanceof Error ? error : undefined
    )
  }
}
