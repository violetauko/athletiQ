/**
 * upload.ts — Reusable Vercel Blob upload service
 *
 * SERVER-SIDE: use `uploadToBlob` in API routes.
 * CLIENT-SIDE: use `uploadFile` to call the /api/athlete/upload route.
 */

// ─── Types ────────────────────────────────────────────────────────────────────

export type UploadType = 'image' | 'resume' | 'product';

export interface UploadResult {
  url: string;
  pathname: string;
}

export interface UploadError {
  error: string;
}

// ─── Config ───────────────────────────────────────────────────────────────────

export const UPLOAD_CONFIG = {
  image: {
    maxSizeBytes: 5 * 1024 * 1024, // 5 MB
    allowedTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
    allowedExtensions: ['jpg', 'jpeg', 'png', 'webp', 'gif'],
    folder: 'profile-images',
  },
  resume: {
    maxSizeBytes: 10 * 1024 * 1024, // 10 MB
    allowedTypes: [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ],
    allowedExtensions: ['pdf', 'doc', 'docx'],
    folder: 'resumes',
  },
  product: {
    maxSizeBytes: 5 * 1024 * 1024, // 5 MB
    allowedTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
    allowedExtensions: ['jpg', 'jpeg', 'png', 'webp', 'gif'],
    folder: 'products',
  },
} as const;

// ─── Validation ───────────────────────────────────────────────────────────────

export function validateUploadFile(
  file: File,
  type: UploadType,
): { valid: true } | { valid: false; error: string } {
  const config = UPLOAD_CONFIG[type];

  if (!config.allowedTypes.includes(file.type as never)) {
    return {
      valid: false,
      error: `Invalid file type. Allowed: ${config.allowedExtensions.join(', ')}`,
    };
  }

  if (file.size > config.maxSizeBytes) {
    const maxMB = config.maxSizeBytes / (1024 * 1024);
    return {
      valid: false,
      error: `File too large. Maximum size is ${maxMB}MB`,
    };
  }

  return { valid: true };
}

// ─── Client-side helper ───────────────────────────────────────────────────────

/**
 * Upload a file from the browser via the /api/athlete/upload route.
 * Returns the public Vercel Blob URL.
 */
export async function uploadFile(
  file: File,
  type: UploadType,
  onProgress?: (state: 'uploading' | 'done' | 'error') => void,
): Promise<string> {
  const validation = validateUploadFile(file, type);
  if (!validation.valid) {
    throw new Error(validation.error);
  }

  onProgress?.('uploading');

  const formData = new FormData();
  formData.append('file', file);
  formData.append('type', type);

  const response = await fetch('/api/athlete/upload', {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    onProgress?.('error');
    let errorMsg = `Upload failed (${response.status})`;
    try {
      const data = await response.json();
      errorMsg = data.error ?? errorMsg;
    } catch {
      // ignore json parse error
    }
    throw new Error(errorMsg);
  }

  const result: UploadResult = await response.json();
  onProgress?.('done');
  return result.url;
}
