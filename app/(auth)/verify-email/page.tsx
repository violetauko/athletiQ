// app/verify-email/page.tsx (updated)
import { Metadata } from 'next';
import { Suspense } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { VerifyEmailForm } from '@/components/auth/verify-email-form';
import { Mail, Shield } from 'lucide-react';
import TitleCard from '@/components/shared/title-card';

export const metadata: Metadata = {
    title: 'Verify Email | Athletic Performance Agency',
    description: 'Verify your email address to complete registration',
};

interface VerifyEmailPageProps {
    searchParams: {
        token?: string;
        email?: string;
    };
}

export default function VerifyEmailPage({ searchParams }: VerifyEmailPageProps) {
    const { token, email } = searchParams;

    return (
        <div className="flex flex-col">
            <div className="my-4 md:my-12">
                <TitleCard
                    image="https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=800&q=80"
                    title="Verify Email"
                />
            </div>
            <Card className="w-full mx-auto max-w-md">
                <CardHeader className="text-center">
                    <div className="mx-auto w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center mb-4">
                        <Mail className="w-6 h-6 text-amber-600" />
                    </div>
                    <CardTitle className="text-2xl">Verify Your Email</CardTitle>
                    <CardDescription>
                        {token
                            ? 'Click verify to confirm your email address'
                            : 'Enter your email to receive a verification code'
                        }
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Suspense fallback={
                        <div className="flex justify-center py-8">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-600" />
                        </div>
                    }>
                        <VerifyEmailForm initialEmail={email || ''} token={token} />
                    </Suspense>

                    {/* Security Note */}
                    <div className="mt-6 pt-6 border-t border-stone-200">
                        <div className="flex items-start gap-2 text-xs text-muted-foreground">
                            <Shield className="w-4 h-4 flex-shrink-0 mt-0.5" />
                            <p>
                                We'll never ask for your password. The verification link is valid for 24 hours.
                                If you didn't request this, please ignore this email.
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}