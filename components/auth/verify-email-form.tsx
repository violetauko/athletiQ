// components/auth/verify-email-form.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Mail, RefreshCw, CheckCircle2, AlertCircle, Clock } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

const formSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  code: z.string().optional(),
});

interface VerifyEmailFormProps {
  initialEmail?: string;
  token?: string;
}

export function VerifyEmailForm({ initialEmail = '', token }: VerifyEmailFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [verificationStatus, setVerificationStatus] = useState<'idle' | 'sending' | 'sent' | 'error' | 'verified'>(
    token ? 'sending' : 'idle'
  );
  const [errorMessage, setErrorMessage] = useState('');

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: initialEmail,
      code: '',
    },
  });

  // Auto-verify if token is provided
  useEffect(() => {
    if (token) {
      verifyWithToken(token);
    }
  }, [token]);

  // Countdown timer for resend
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const verifyWithToken = async (verificationToken: string) => {
    setIsLoading(true);
    setVerificationStatus('sending');
    
    try {
      const response = await fetch('/api/auth/verify-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: verificationToken }),
      });

      const data = await response.json();

      if (response.ok) {
        setVerificationStatus('verified');
        setTimeout(() => {
          router.push('/verify-email/success');
        }, 2000);
      } else {
        setVerificationStatus('error');
        setErrorMessage(data.error || 'Verification failed');
      }
    } catch (error) {
      setVerificationStatus('error');
      setErrorMessage('Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const sendVerificationEmail = async (email: string) => {
    try {
      const response = await fetch('/api/auth/send-verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to send verification email');
      }

      return true;
    } catch (error) {
      throw error;
    }
  };

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsLoading(true);
    setVerificationStatus('sending');
    setErrorMessage('');

    try {
      if (values.code) {
        // Verify with code
        const response = await fetch('/api/auth/verify-email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            email: values.email,
            code: values.code 
          }),
        });

        const data = await response.json();

        if (response.ok) {
          setVerificationStatus('verified');
          setTimeout(() => {
            router.push('/verify-email/success');
          }, 2000);
        } else {
          setVerificationStatus('error');
          setErrorMessage(data.error || 'Invalid verification code');
        }
      } else {
        // Send verification email
        await sendVerificationEmail(values.email);
        setVerificationStatus('sent');
        setCountdown(60); // 60 seconds cooldown
        form.setValue('code', ''); // Clear any existing code
      }
    } catch (error) {
      setVerificationStatus('error');
      setErrorMessage(error instanceof Error ? error.message : 'Failed to send verification email');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    if (countdown > 0) return;

    const email = form.getValues('email');
    if (!email) return;

    setIsResending(true);
    try {
      await sendVerificationEmail(email);
      setCountdown(60);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Failed to resend verification email');
    } finally {
      setIsResending(false);
    }
  };

  // Success state
  if (verificationStatus === 'verified') {
    return (
      <div className="text-center space-y-6">
        <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center animate-bounce">
          <CheckCircle2 className="w-8 h-8 text-green-600" />
        </div>
        <div>
          <h3 className="text-xl font-semibold text-green-700 mb-2">
            Email Verified! 🎉
          </h3>
          <p className="text-muted-foreground">
            Your email has been successfully verified. Redirecting you to the success page...
          </p>
        </div>
        <div className="w-full bg-stone-200 rounded-full h-2">
          <div className="bg-green-600 h-2 rounded-full animate-progress"></div>
        </div>
      </div>
    );
  }

  // Auto-verification in progress
  if (token && verificationStatus === 'sending') {
    return (
      <div className="text-center space-y-6">
        <div className="mx-auto w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center animate-spin">
          <RefreshCw className="w-8 h-8 text-amber-600" />
        </div>
        <div>
          <h3 className="text-lg font-semibold mb-2">Verifying Your Email</h3>
          <p className="text-muted-foreground">
            Please wait while we verify your email address...
          </p>
        </div>
      </div>
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Email Field */}
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email Address</FormLabel>
              <FormControl>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                  <Input 
                    placeholder="you@example.com" 
                    type="email"
                    disabled={isLoading || verificationStatus === 'sent'}
                    className="pl-10"
                    {...field}
                  />
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Verification Code Field (shown after email is sent) */}
        {verificationStatus === 'sent' && (
          <FormField
            control={form.control}
            name="code"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Verification Code</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="Enter 6-digit code" 
                    maxLength={6}
                    className="text-center text-lg tracking-widest"
                    disabled={isLoading}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
                <p className="text-xs text-muted-foreground mt-1">
                  Enter the 6-digit code sent to your email
                </p>
              </FormItem>
            )}
          />
        )}

        {/* Error Message */}
        {errorMessage && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{errorMessage}</AlertDescription>
          </Alert>
        )}

        {/* Success Message */}
        {verificationStatus === 'sent' && !errorMessage && (
          <Alert className="bg-green-50 border-green-200">
            <Mail className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-700">
              Verification email sent! Check your inbox and spam folder.
            </AlertDescription>
          </Alert>
        )}

        {/* Action Buttons */}
        <div className="space-y-3">
          <Button 
            type="submit" 
            className="w-full bg-amber-600 hover:bg-amber-700"
            disabled={isLoading || (verificationStatus === 'sent' && !form.getValues('code'))}
          >
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                {verificationStatus === 'sent' ? 'Verifying...' : 'Sending...'}
              </>
            ) : (
              verificationStatus === 'sent' ? 'Verify Code' : 'Send Verification Email'
            )}
          </Button>

          {verificationStatus === 'sent' && (
            <Button
              type="button"
              variant="outline"
              className="w-full"
              onClick={handleResend}
              disabled={isResending || countdown > 0}
            >
              {countdown > 0 ? (
                <>
                  <Clock className="w-4 h-4 mr-2" />
                  Resend in {countdown}s
                </>
              ) : isResending ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-stone-600 mr-2" />
                  Resending...
                </>
              ) : (
                <>
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Resend Code
                </>
              )}
            </Button>
          )}
        </div>

        {/* Help Text */}
        <div className="text-center text-sm text-muted-foreground">
          {verificationStatus === 'sent' ? (
            <p>
              Didn't receive the code? Check your spam folder or{' '}
              <button
                type="button"
                onClick={handleResend}
                disabled={countdown > 0}
                className="text-amber-600 hover:text-amber-700 font-medium"
              >
                try again
              </button>
            </p>
          ) : (
            <p>
              We'll send a verification code to your email address.
            </p>
          )}
        </div>
      </form>
    </Form>
  );
}