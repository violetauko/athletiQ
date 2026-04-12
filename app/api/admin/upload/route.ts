import { NextResponse } from 'next/server';
import { put } from '@vercel/blob';
import { auth } from '@/auth';
import { UPLOAD_CONFIG, UploadType, validateUploadFile } from '@/lib/upload';

/**
 * POST /api/admin/upload
 * Accepts multipart/form-data with fields:
 *   file — the file to upload
 *   type — 'product' | 'image'
 *
 * Returns { url, pathname } on success.
 */
export async function POST(req: Request) {
  try {
    // Auth check
    const session = await auth();
    if (!session?.user || !['ADMIN', 'SUPER_ADMIN'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get('file');
    const type = formData.get('type') as UploadType | null;

    if (!file || !(file instanceof File)) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    if (!type || !UPLOAD_CONFIG[type]) {
      return NextResponse.json(
        { error: 'Invalid upload type.' },
        { status: 400 },
      );
    }

    // Validate file
    const validation = validateUploadFile(file, type);
    if (!validation.valid) {
      return NextResponse.json({ error: validation.error }, { status: 422 });
    }

    // Build a unique, organized path:
    // admin/{folder}/{userId}/{timestamp}-{sanitized-filename}
    const config = UPLOAD_CONFIG[type];
    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
    const pathname = `admin/${config.folder}/${session.user.id}/${Date.now()}-${safeName}`;

    // Upload to Vercel Blob
    const blob = await put(pathname, file, {
      access: 'public',
      contentType: file.type,
    });

    return NextResponse.json(
      { url: blob.url, pathname: blob.pathname },
      { status: 201 },
    );
  } catch (error) {
    console.error('[ADMIN_UPLOAD]', error);
    const message = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
