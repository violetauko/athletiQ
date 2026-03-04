// app/api/cron/cleanup-tokens/route.ts
import { NextResponse } from 'next/server';
import { PasswordResetTokenService } from '@/lib/password-reset-token';

export async function GET(request: Request) {
  try {
    // Verify cron secret for security
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const deletedCount = await PasswordResetTokenService.cleanupExpiredTokens();
    
    return NextResponse.json({ 
      success: true, 
      message: `Cleaned up ${deletedCount} expired tokens` 
    });
  } catch (error) {
    console.error('Cron job error:', error);
    return NextResponse.json(
      { error: 'Failed to clean up tokens' },
      { status: 500 }
    );
  }
}