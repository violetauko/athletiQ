// app/api/auth/send-verification/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sendEmail } from '@/lib/email/email-service';
import crypto from 'crypto';

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      // Return success even if user doesn't exist (security)
      return NextResponse.json({ 
        message: 'If an account exists, a verification email will be sent.' 
      });
    }

    // Check if already verified
    if (user.emailVerified) {
      return NextResponse.json(
        { error: 'Email already verified' },
        { status: 400 }
      );
    }

    // Generate verification token and code
    const token = crypto.randomBytes(32).toString('hex');
    const code = Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit code
    const expires = new Date();
    expires.setHours(expires.getHours() + 24); // 24 hours expiry

    // Delete any existing verification tokens
    await prisma.verificationToken.deleteMany({
      where: { identifier: email },
    });

    // Save new verification token
    await prisma.verificationToken.create({
      data: {
        identifier: email,
        token,
        expires,
        // Store code in token field or create a separate field
        // For now, we'll append it to the token
      },
    });

    // Send verification email with both link and code
    const verificationLink = `${process.env.NEXT_PUBLIC_APP_URL}/verify-email?token=${token}`;
    
    await sendEmail({
      to: email,
      subject: 'Verify Your Email Address',
      template: 'email-verification',
      data: {
        name: user.name || email.split('@')[0],
        verificationLink,
        code,
        expiresIn: 24,
      },
    });

    // Store code separately (you might want to add a field for this)
    // For now, we'll store it in a separate table or cache
    // This is a simplified version - consider using Redis for better performance
    await prisma.$executeRaw`
      INSERT INTO verification_codes (email, code, expires)
      VALUES (${email}, ${code}, ${expires})
      ON CONFLICT (email) DO UPDATE
      SET code = ${code}, expires = ${expires}
    `;

    return NextResponse.json({ 
      message: 'Verification email sent successfully' 
    });
  } catch (error) {
    console.error('Send verification error:', error);
    return NextResponse.json(
      { error: 'Failed to send verification email' },
      { status: 500 }
    );
  }
}