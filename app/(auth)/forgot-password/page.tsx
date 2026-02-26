"use client";

import { useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Mail } from "lucide-react";

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState("");
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        // Simulate API call
        try {
            // Here you would call your API to send reset password email
            await new Promise(resolve => setTimeout(resolve, 1500));
            
            toast.success("Reset link sent!", {
                description: "Check your email for password reset instructions.",
            });
            setIsSubmitted(true);
        } catch (error) {
            toast.error("Something went wrong", {
                description: "Please try again later.",
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen mx-auto flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
            <Card className="w-full max-w-md">
                <CardHeader className="space-y-1">
                    <CardTitle className="text-2xl font-bold text-center">
                        Forgot password?
                    </CardTitle>
                    <CardDescription className="text-center">
                        {!isSubmitted 
                            ? "Enter your email and we'll send you a reset link"
                            : "Check your email for the reset link"
                        }
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {!isSubmitted ? (
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="email">Email address</Label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        id="email"
                                        type="email"
                                        placeholder="john.doe@example.com"
                                        className="pl-9"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                        disabled={loading}
                                    />
                                </div>
                            </div>
                            <Button 
                                type="submit" 
                                className="w-full bg-black hover:bg-black/90"
                                disabled={loading}
                            >
                                {loading ? "Sending..." : "Send reset link"}
                            </Button>
                        </form>
                    ) : (
                        <div className="text-center space-y-4">
                            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                                <p className="text-sm text-green-800">
                                    We've sent a password reset link to <strong>{email}</strong>
                                </p>
                            </div>
                            <p className="text-sm text-muted-foreground">
                                Didn't receive the email? Check your spam folder or{" "}
                                <button
                                    onClick={() => setIsSubmitted(false)}
                                    className="text-black font-semibold hover:underline bg-transparent border-0 cursor-pointer"
                                >
                                    try again
                                </button>
                            </p>
                        </div>
                    )}
                </CardContent>
                <CardFooter>
                    <Link
                        href="/login"
                        className="flex items-center justify-center w-full text-sm text-muted-foreground hover:text-black"
                    >
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back to login
                    </Link>
                </CardFooter>
            </Card>
        </div>
    );
}