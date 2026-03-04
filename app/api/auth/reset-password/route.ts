// app/api/auth/reset-password/route.ts (updated)
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { PasswordResetTokenService } from '@/lib/password-reset-token';
import { sendEmail } from '@/lib/email/email-service';

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    // Find user
    const user = await prisma.user.findUnique({
      where: { email },
    });

    // Always return success for security (don't reveal if user exists)
    if (!user) {
      return NextResponse.json({ 
        message: 'If an account exists with this email, you will receive a password reset link.' 
      });
    }

    // Create reset token
    const { token, code } = await PasswordResetTokenService.createToken({
      identifier: email,
      userId: user.id,
      expiresInHours: 1,
    });

    // Generate reset links
    const resetLinks = PasswordResetTokenService.generateResetLinks(token, code);

    // Get request metadata
    const ipAddress = request.headers.get('x-forwarded-for') || 
                     request.headers.get('x-real-ip') || 
                     'Unknown';
    const userAgent = request.headers.get('user-agent') || 'Unknown';
    const browser = parseBrowser(userAgent);
    const location = await getLocationFromIP(ipAddress); // Implement this

    // Send reset email
    await sendEmail({
      to: email,
      subject: 'Reset Your Password',
      template: 'forgot-password',
      data: {
        name: user.name || email.split('@')[0],
        resetLink: resetLinks.tokenLink,
        code,
        expiresIn: 1,
        ipAddress,
        location,
        browser,
      },
    });

    // Log the reset request (for audit)
    await logPasswordResetRequest({
      email,
      userId: user.id,
      ipAddress,
      userAgent,
    });

    return NextResponse.json({ 
      message: 'If an account exists with this email, you will receive a password reset link.' 
    });
  } catch (error) {
    console.error('Password reset error:', error);
    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500 }
    );
  }
}

// Helper functions
function parseBrowser(userAgent: string): string {
  if (userAgent.includes('Chrome')) return 'Chrome';
  if (userAgent.includes('Firefox')) return 'Firefox';
  if (userAgent.includes('Safari')) return 'Safari';
  if (userAgent.includes('Edge')) return 'Edge';
  return 'Unknown';
}

async function getLocationFromIP(ip: string): Promise<string> {
  // Implement IP geolocation here
  // You can use services like ipapi.co, ipgeolocation.io, etc.
  return 'Unknown';
}

async function logPasswordResetRequest(data: any) {
  // Implement logging to database or logging service
  console.log('Password reset request:', data);
}