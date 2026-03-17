// app/reset-password/[token]/page.tsx
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { NewPasswordForm } from '@/components/auth/new-password-form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle, Lock } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Set New Password | Athletic Performance Agency',
  description: 'Create a new password for your account',
};

interface NewPasswordPageProps {
  params: Promise<{
    token: string;
  }>;
}

async function validateToken(token: string) {
  try {
    const resetToken = await prisma.passwordResetToken.findUnique({
      where: { token },
    });

    if (!resetToken) {
      return { valid: false, error: 'Invalid or expired token' };
    }

    if (resetToken.expires < new Date()) {
      await prisma.passwordResetToken.delete({
        where: { token },
      });
      return { valid: false, error: 'Token has expired' };
    }

    return { valid: true, email: resetToken.identifier };
  } catch (error) {
    console.error('Token validation error:', error);
    return { valid: false, error: 'Validation failed' };
  }
}

export default async function NewPasswordPage({ params }: NewPasswordPageProps) {
  const { token } = await params;
  
  if (!token) {
    notFound();
  }

  const validation = await validateToken(token);

  if (!validation.valid) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-stone-50 to-amber-50">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4">
              <AlertCircle className="w-6 h-6 text-red-600" />
            </div>
            <CardTitle className="text-2xl">Invalid Reset Link</CardTitle>
            <CardDescription>
              {validation.error || 'This password reset link is no longer valid.'}
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-sm text-muted-foreground mb-4">
              Please request a new password reset link to continue.
            </p>
            <a
              href="/reset-password"
              className="text-amber-600 hover:text-amber-700 font-medium text-sm"
            >
              Request New Reset Link →
            </a>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-stone-50 to-amber-50">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center mb-4">
            <Lock className="w-6 h-6 text-amber-600" />
          </div>
          <CardTitle className="text-2xl">Create New Password</CardTitle>
          <CardDescription>
            Enter your new password below. Make sure it's strong and unique.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <NewPasswordForm token={token} email={validation.email || ''} />
        </CardContent>
      </Card>
    </div>
  );
}