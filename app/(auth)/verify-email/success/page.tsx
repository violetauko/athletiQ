// app/verify-email/success/page.tsx
import { Metadata } from 'next';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle2, ArrowRight } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Email Verified | Athletic Performance Agency',
  description: 'Your email has been successfully verified',
};

export default function VerifyEmailSuccessPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 ">
      <Card className="w-full max-w-md text-center">
        <CardHeader>
          <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
            <CheckCircle2 className="w-8 h-8 text-green-600" />
          </div>
          <CardTitle className="text-2xl">Email Verified! 🎉</CardTitle>
          <CardDescription className="text-base">
            Your email has been successfully verified. You can now access all features of your account.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-sm text-amber-800">
            <p className="font-medium mb-1">What's next?</p>
            <ul className="space-y-1 text-left">
              <li>✓ Complete your profile</li>
              <li>✓ Browse opportunities</li>
              <li>✓ Connect with organizations</li>
            </ul>
          </div>
          
          <div className="space-y-3">
            <Link href="/dashboard">
              <Button className="w-full bg-amber-600 hover:bg-amber-700">
                Go to Dashboard
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
            {/* <Link href="/profile/">
              <Button variant="outline" className="w-full">
                Complete Profile
              </Button>
            </Link> */}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}