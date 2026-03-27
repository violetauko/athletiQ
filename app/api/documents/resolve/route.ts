import { NextResponse } from 'next/server';
import { list } from '@vercel/blob';
import { auth } from '@/auth';

/**
 * GET /api/documents/resolve?filename=example.pdf
 * 
 * Attempts to find a full Vercel Blob URL for a legacy filename
 * by searching through the 'resumes' and 'profile-images' folders.
 */
export async function GET(req: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const filename = searchParams.get('filename');

    if (!filename) {
      return NextResponse.json({ error: 'Filename is required' }, { status: 400 });
    }

    // Sanitize the filename the same way the upload logic does
    const safeName = filename.replace(/[^a-zA-Z0-9._-]/g, '_');

    // List blobs to find a match. 
    // We search the 'resumes' folder first as it's the most likely location.
    const { blobs } = await list({ prefix: 'resumes/' });
    
    // Find a blob whose pathname ends with the filename (after the timestamp- prefix)
    // or matches the filename exactly.
    let matchedBlob = blobs.find(b => 
      b.pathname === `/${safeName}` || 
      b.pathname.endsWith(safeName)
    );

    // If not found in resumes, check profile-images
    if (!matchedBlob) {
      const { blobs: imageBlobs } = await list({ prefix: 'profile-images/' });
      matchedBlob = imageBlobs.find(b => 
        b.pathname === `/${safeName}` || 
        b.pathname.endsWith(safeName)
      );
    }

    if (!matchedBlob) {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 });
    }

    return NextResponse.json({ url: matchedBlob.url });
  } catch (error) {
    console.error('[DOCUMENT_RESOLVE_GET]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
