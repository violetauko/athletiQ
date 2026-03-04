import { NextResponse } from 'next/server';
import { put } from '@vercel/blob';
import { auth } from '@/auth';
import { UPLOAD_CONFIG, UploadType, validateUploadFile } from '@/lib/upload';

/**
 * POST /api/athlete/upload
 * Accepts multipart/form-data with fields:
 *   file — the file to upload
 *   type — 'image' | 'resume'
 *
 * Returns { url, pathname } on success.
 */
export async function POST(req: Request) {
  try {
    // Auth check
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    if (session.user.role !== 'ATHLETE') {
      return NextResponse.json({ error: 'Only athletes can upload files' }, { status: 403 });
    }

    const formData = await req.formData();
    const file = formData.get('file');
    const type = formData.get('type') as UploadType | null;

    if (!file || !(file instanceof File)) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    if (!type || !UPLOAD_CONFIG[type]) {
      return NextResponse.json(
        { error: 'Invalid upload type. Must be "image" or "resume"' },
        { status: 400 },
      );
    }

    // Validate file
    const validation = validateUploadFile(file, type);
    if (!validation.valid) {
      return NextResponse.json({ error: validation.error }, { status: 422 });
    }

    // Build a unique, organized path:
    // {folder}/{userId}/{timestamp}-{sanitized-filename}
    const config = UPLOAD_CONFIG[type];
    const ext = file.name.split('.').pop() ?? config.allowedExtensions[0];
    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
    const pathname = `${config.folder}/${session.user.id}/${Date.now()}-${safeName}`;

    // Upload to Vercel Blob (access: 'public' so we get a stable URL)
    const blob = await put(pathname, file, {
      access: 'public',
      contentType: file.type,
    });

    return NextResponse.json(
      { url: blob.url, pathname: blob.pathname },
      { status: 201 },
    );
  } catch (error) {
    console.error('[ATHLETE_UPLOAD]', error);
    const message = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
