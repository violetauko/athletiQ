"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import TitleCard from "@/components/shared/title-card";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function LoginPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const callbackUrl = searchParams.get("callbackUrl") ?? "/dashboard";
    const errorParam = searchParams.get("error");

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState<string | null>(
        errorParam === "CredentialsSignin" ? "Invalid email or password." : errorParam
    );
    const [loading, setLoading] = useState(false);

    async function handleCredentials(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setLoading(true);
        setError(null);

        const result = await signIn("credentials", {
            email,
            password,
            redirect: false,
        });

        setLoading(false);

        if (result?.error) {
            setError("Invalid email or password.");
        } else {
            router.push(callbackUrl);
            router.refresh();
        }
    }

    async function handleGoogle() {
        setLoading(true);
        await signIn("google", { callbackUrl });
    }

    return (
        <div className="flex flex-col">
            {/* Hero Section */}
            <div className="my-4 md:my-12">
                <TitleCard
                    image="https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=800&q=80"
                    title="Login"
                />
            </div>

            {/* Form Section */}
            <section className="w-full py-4 md:py-20">
                <div className="container mx-auto">
                    <div className="flex justify-center">
                        <Card className="w-full max-w-md p-8 shadow-lg">
                            <h2 className="text-2xl sm:text-3xl font-bold mb-2">
                                Welcome back
                            </h2>
                            <p className="text-sm text-muted-foreground mb-6">
                                Sign in to your AthletiQ account
                            </p>

                            {error && (
                                <div className="mb-4 rounded-md bg-red-50 border border-red-200 p-3 text-sm text-red-700">
                                    {error}
                                </div>
                            )}

                            <form onSubmit={handleCredentials} className="space-y-5">
                                <div className="space-y-2">
                                    <Label htmlFor="email">Email</Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        placeholder="john.doe@example.com"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                        autoComplete="email"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="password">Password</Label>
                                    <Input
                                        id="password"
                                        type="password"
                                        placeholder="••••••••"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                        autoComplete="current-password"
                                    />
                                </div>

                                <Button
                                    type="submit"
                                    className="w-full bg-black hover:bg-black/90 rounded-full"
                                    size="lg"
                                    disabled={loading}
                                >
                                    {loading ? "Signing in…" : "Sign In"}
                                </Button>
                            </form>

                            <div className="relative my-5">
                                <div className="absolute inset-0 flex items-center">
                                    <span className="w-full border-t" />
                                </div>
                                <div className="relative flex justify-center text-xs uppercase">
                                    <span className="bg-background px-2 text-muted-foreground">
                                        or continue with
                                    </span>
                                </div>
                            </div>

                            <Button
                                type="button"
                                variant="outline"
                                className="w-full rounded-full"
                                size="lg"
                                onClick={handleGoogle}
                                disabled={loading}
                            >
                                <svg
                                    className="mr-2 h-4 w-4"
                                    viewBox="0 0 24 24"
                                    aria-hidden="true"
                                >
                                    <path
                                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                                        fill="#4285F4"
                                    />
                                    <path
                                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                        fill="#34A853"
                                    />
                                    <path
                                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                                        fill="#FBBC05"
                                    />
                                    <path
                                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                                        fill="#EA4335"
                                    />
                                </svg>
                                Continue with Google
                            </Button>

                            <p className="mt-6 text-center text-sm text-muted-foreground">
                                Don&apos;t have an account?{" "}
                                <Link
                                    href="/register"
                                    className="font-semibold text-black hover:underline"
                                >
                                    Create one
                                </Link>
                            </p>
                        </Card>
                    </div>
                </div>
            </section>
        </div>
    );
}