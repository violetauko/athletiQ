import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function PrivacyPage() {
    return (
        <div className="min-h-screen py-12">
            <div className="container mx-auto max-w-4xl px-4">
                <Link
                    href="/login"
                    className="inline-flex items-center text-sm text-muted-foreground hover:text-black mb-6"
                >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to login
                </Link>

                <Card>
                    <CardHeader>
                        <CardTitle className="text-3xl font-bold">Privacy Policy</CardTitle>
                        <p className="text-sm text-muted-foreground">Last updated: February 27, 2026</p>
                    </CardHeader>
                    <CardContent className="prose prose-stone max-w-none space-y-2">
                        <h2>1. Introduction</h2>
                        <p>
                            AthletiQ ("we," "our," or "us") is committed to protecting your privacy. This Privacy Policy 
                            explains how we collect, use, and safeguard your information when you use our platform.
                        </p>

                        <h2>2. Information We Collect</h2>
                        <h3>2.1 Personal Information</h3>
                        <p>We may collect:</p>
                        <ul>
                            <li>Name and contact information (email, phone number)</li>
                            <li>Profile information (athletic background, achievements, photos)</li>
                            <li>Account credentials</li>
                            <li>Payment information (processed securely through third-party providers)</li>
                        </ul>

                        <h3>2.2 Automatically Collected Information</h3>
                        <p>When you use our Platform, we may collect:</p>
                        <ul>
                            <li>Device information (IP address, browser type, operating system)</li>
                            <li>Usage data (pages visited, time spent, interactions)</li>
                            <li>Cookies and similar tracking technologies</li>
                        </ul>

                        <h2>3. How We Use Your Information</h2>
                        <p>We use your information to:</p>
                        <ul>
                            <li>Provide and maintain our services</li>
                            <li>Match athletes with opportunities</li>
                            <li>Communicate with you about your account and opportunities</li>
                            <li>Improve and personalize your experience</li>
                            <li>Ensure platform security and prevent fraud</li>
                            <li>Comply with legal obligations</li>
                        </ul>

                        <h2>4. Sharing Your Information</h2>
                        <p>We may share your information with:</p>
                        <ul>
                            <li><strong>Organizations:</strong> When you apply for opportunities</li>
                            <li><strong>Service Providers:</strong> Who assist in operating our platform</li>
                            <li><strong>Legal Authorities:</strong> When required by law</li>
                        </ul>
                        <p>We do not sell your personal information to third parties.</p>

                        <h2>5. Data Security</h2>
                        <p>
                            We implement appropriate technical and organizational measures to protect your information. 
                            However, no method of transmission over the internet is 100% secure.
                        </p>

                        <h2>6. Your Rights</h2>
                        <p>Depending on your location, you may have the right to:</p>
                        <ul>
                            <li>Access your personal information</li>
                            <li>Correct inaccurate data</li>
                            <li>Request deletion of your data</li>
                            <li>Opt-out of certain data processing</li>
                            <li>Data portability</li>
                        </ul>
                        <p>To exercise these rights, contact us at privacy@athletec.org</p>

                        <h2>7. Cookies</h2>
                        <p>
                            We use cookies to enhance your experience. You can control cookies through your browser settings. 
                            Disabling cookies may affect platform functionality.
                        </p>

                        <h2>8. Children's Privacy</h2>
                        <p>
                            Our Platform is not intended for users under 13. We do not knowingly collect information from 
                            children under 13. If you believe a child has provided us with information, please contact us.
                        </p>

                        <h2>9. International Data Transfers</h2>
                        <p>
                            Your information may be transferred and processed in countries other than your own. We ensure 
                            appropriate safeguards are in place for such transfers.
                        </p>

                        <h2>10. Changes to This Policy</h2>
                        <p>
                            We may update this Privacy Policy periodically. We will notify you of material changes by 
                            posting the updated policy on this page.
                        </p>

                        <h2>11. Contact Us</h2>
                        <p>
                            For privacy-related questions, contact us at:
                            <br />
                            Email: privacy@athletec.org
                            <br />
                            Address: [Your Company Address]
                        </p>

                        <div className="mt-8 pt-6 border-t">
                            <p className="text-sm text-muted-foreground">
                                By using AthletiQ, you consent to this Privacy Policy.
                            </p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}