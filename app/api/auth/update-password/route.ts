// // app/api/auth/update-password/route.ts
// import { NextRequest, NextResponse } from 'next/server';
// import { prisma } from '@/lib/prisma';
// import { sendEmail } from '@/lib/email/email-service';
// import bcrypt from 'bcryptjs';

// export async function POST(request: NextRequest) {
//   try {
//     const { token, email, password } = await request.json();

//     // Verify token
//     const resetToken = await prisma.passwordResetToken
//     .findUnique({
//       where: { token },
//     });

//     if (!resetToken || resetToken.identifier !== email) {
//       return NextResponse.json(
//         { error: 'Invalid or expired reset token' },
//         { status: 400 }
//       );
//     }

//     if (resetToken.expires < new Date()) {
//       await prisma.passwordResetToken.delete({
//         where: { token },
//       });
//       return NextResponse.json(
//         { error: 'Reset token has expired' },
//         { status: 400 }
//       );
//     }

//     // Hash new password
//     const hashedPassword = await bcrypt.hash(password, 10);

//     // Update user password
//     await prisma.user.update({
//       where: { email },
//       data: { password: hashedPassword },
//     });

//     // Delete used token
//     await prisma.passwordResetToken.delete({
//       where: { token },
//     });

//     // Get request info for confirmation email
//     const ipAddress = request.headers.get('x-forwarded-for') || 'Unknown';
//     const userAgent = request.headers.get('user-agent') || 'Unknown';
//     const browser = userAgent.split(' ')[0] || 'Unknown';
//     const location = 'Unknown';

//     // Send confirmation email
//     const user = await prisma.user.findUnique({
//       where: { email },
//     });

//     await sendEmail({
//       to: email,
//       subject: 'Your password has been reset',
//       template: 'password-reset-confirmation',
//       data: {
//         name: user?.name || email.split('@')[0],
//         loginLink: `${process.env.NEXT_PUBLIC_APP_URL}/login`,
//         ipAddress,
//         location,
//         browser,
//         time: new Date(),
//       },
//     });

//     return NextResponse.json({ 
//       message: 'Password updated successfully' 
//     });
//   } catch (error) {
//     console.error('Password update error:', error);
//     return NextResponse.json(
//       { error: 'Failed to update password' },
//       { status: 500 }
//     );
//   }
// }
// app/api/auth/update-password/route.ts (updated)
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { PasswordResetTokenService } from '@/lib/password-reset-token';
import { sendEmail } from '@/lib/email/email-service';
import bcrypt from 'bcryptjs';

export async function POST(request: NextRequest) {
  try {
    const { token, code, email, password } = await request.json();

    // Validate either token or code is provided
    if (!token && !code) {
      return NextResponse.json(
        { error: 'Reset token or code is required' },
        { status: 400 }
      );
    }

    if (!password) {
      return NextResponse.json(
        { error: 'New password is required' },
        { status: 400 }
      );
    }

    // Validate password strength
    const passwordValidation = validatePassword(password);
    if (!passwordValidation.valid) {
      return NextResponse.json(
        { error: passwordValidation.error },
        { status: 400 }
      );
    }

    let validationResult;

    // Validate token or code
    if (token) {
      validationResult = await PasswordResetTokenService.validateToken(token);
    } else if (code && email) {
      validationResult = await PasswordResetTokenService.validateCode(email, code);
    }

    if (!validationResult?.valid) {
      return NextResponse.json(
        { error: validationResult?.error || 'Invalid reset token' },
        { status: 400 }
      );
    }

    const resetToken = validationResult.token;

    // Hash new password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Update user password
    await prisma.user.update({
      where: { email: resetToken.identifier },
      data: { password: hashedPassword },
    });

    // Mark token as used
    await PasswordResetTokenService.markTokenAsUsed(resetToken.token);

    // Get request metadata for confirmation email
    const ipAddress = request.headers.get('x-forwarded-for') || 'Unknown';
    const userAgent = request.headers.get('user-agent') || 'Unknown';
    const browser = parseBrowser(userAgent);
    const location = await getLocationFromIP(ipAddress);

    // Get user details for email
    const user = await prisma.user.findUnique({
      where: { email: resetToken.identifier },
    });

    // Send confirmation email
    await sendEmail({
      to: resetToken.identifier,
      subject: 'Your password has been reset',
      template: 'password-reset-confirmation',
      data: {
        name: user?.name || resetToken.identifier.split('@')[0],
        loginLink: `${process.env.NEXT_PUBLIC_APP_URL}/login`,
        ipAddress,
        location,
        browser,
        time: new Date(),
      },
    });

    // Log the password change
    await logPasswordChange({
      email: resetToken.identifier,
      userId: user?.id,
      ipAddress,
      userAgent,
    });

    return NextResponse.json({ 
      message: 'Password updated successfully' 
    });
  } catch (error) {
    console.error('Password update error:', error);
    return NextResponse.json(
      { error: 'Failed to update password' },
      { status: 500 }
    );
  }
}

// Password validation function
function validatePassword(password: string): { valid: boolean; error?: string } {
  if (password.length < 8) {
    return { valid: false, error: 'Password must be at least 8 characters' };
  }
  if (!/[A-Z]/.test(password)) {
    return { valid: false, error: 'Password must contain at least one uppercase letter' };
  }
  if (!/[a-z]/.test(password)) {
    return { valid: false, error: 'Password must contain at least one lowercase letter' };
  }
  if (!/[0-9]/.test(password)) {
    return { valid: false, error: 'Password must contain at least one number' };
  }
  if (!/[^A-Za-z0-9]/.test(password)) {
    return { valid: false, error: 'Password must contain at least one special character' };
  }
  return { valid: true };
}

function parseBrowser(userAgent: string): string {
  if (userAgent.includes('Chrome')) return 'Chrome';
  if (userAgent.includes('Firefox')) return 'Firefox';
  if (userAgent.includes('Safari')) return 'Safari';
  if (userAgent.includes('Edge')) return 'Edge';
  return 'Unknown';
}

async function getLocationFromIP(ip: string): Promise<string> {
  return 'Unknown';
}

async function logPasswordChange(data: any) {
  console.log('Password changed:', data);
}