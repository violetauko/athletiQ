// app/reset-password/page.tsx
import { Metadata } from 'next';
import { ResetPasswordForm } from '@/components/auth/reset-password-form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { KeyRound } from 'lucide-react';
import TitleCard from '@/components/shared/title-card';

export const metadata: Metadata = {
    title: 'Reset Password | Athletic Performance Agency',
    description: 'Reset your password to regain access to your account',
};

export default function ResetPasswordPage() {
    return (
        <div className="flex flex-col">
            <div className="my-4 md:my-12">
                <TitleCard
                    image="https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=800&q=80"
                    title="Reset Password"
                />
            </div>
            <Card className="w-full mx-auto max-w-md">
                <CardHeader className="text-center">
                    <div className="mx-auto w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center mb-4">
                        <KeyRound className="w-6 h-6 text-amber-600" />
                    </div>
                    <CardTitle className="text-2xl">Reset Password</CardTitle>
                    <CardDescription>
                        Enter your email address and we'll send you a link to reset your password.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <ResetPasswordForm />
                </CardContent>
            </Card>
        </div>
    );
}