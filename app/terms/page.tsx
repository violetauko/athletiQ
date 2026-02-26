import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function TermsPage() {
    return (
        <div className="min-h-screen  py-12">
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
                        <CardTitle className="text-3xl font-bold">Terms of Service</CardTitle>
                        <p className="text-sm text-muted-foreground">Last updated: February 27, 2026</p>
                    </CardHeader>
                    <CardContent className="prose prose-stone max-w-none">
                        <h2>1. Acceptance of Terms</h2>
                        <p>
                            By accessing and using AthletiQ ("the Platform"), you agree to be bound by these Terms of Service. 
                            If you do not agree to these terms, please do not use the Platform.
                        </p>

                        <h2>2. Description of Service</h2>
                        <p>
                            AthletiQ provides a platform connecting athletes with opportunities in sports, including but not limited to 
                            scholarships, training programs, and professional contracts. We facilitate connections but are not a party 
                            to any agreements between athletes and organizations.
                        </p>

                        <h2>3. User Accounts</h2>
                        <p>
                            To access certain features, you must create an account. You are responsible for maintaining the 
                            confidentiality of your account credentials and for all activities under your account.
                        </p>

                        <h2>4. User Conduct</h2>
                        <p>You agree not to:</p>
                        <ul>
                            <li>Provide false or misleading information</li>
                            <li>Impersonate another person or entity</li>
                            <li>Use the Platform for any illegal purpose</li>
                            <li>Harass, abuse, or harm other users</li>
                            <li>Attempt to gain unauthorized access to the Platform</li>
                        </ul>

                        <h2>5. Content</h2>
                        <p>
                            You retain ownership of content you submit. By submitting content, you grant AthletiQ a license to 
                            display and distribute it on the Platform. You are solely responsible for your content.
                        </p>

                        <h2>6. Privacy</h2>
                        <p>
                            Your privacy is important to us. Please review our Privacy Policy to understand how we collect and 
                            use your information.
                        </p>

                        <h2>7. Third-Party Links</h2>
                        <p>
                            The Platform may contain links to third-party websites. AthletiQ is not responsible for the content 
                            or practices of these websites.
                        </p>

                        <h2>8. Termination</h2>
                        <p>
                            We reserve the right to suspend or terminate your account at our discretion, particularly for 
                            violations of these terms.
                        </p>

                        <h2>9. Disclaimer of Warranties</h2>
                        <p>
                            The Platform is provided "as is" without warranties of any kind. We do not guarantee that the 
                            Platform will be error-free or uninterrupted.
                        </p>

                        <h2>10. Limitation of Liability</h2>
                        <p>
                            AthletiQ shall not be liable for any indirect, incidental, or consequential damages arising from 
                            your use of the Platform.
                        </p>

                        <h2>11. Changes to Terms</h2>
                        <p>
                            We may modify these terms at any time. Continued use of the Platform constitutes acceptance of 
                            modified terms.
                        </p>

                        <h2>12. Contact Information</h2>
                        <p>
                            For questions about these Terms, please contact us at:
                            <br />
                            Email: legal@athletec.org
                            <br />
                            Address: [Your Company Address]
                        </p>

                        <div className="mt-8 pt-6 border-t">
                            <p className="text-sm text-muted-foreground">
                                By using AthletiQ, you acknowledge that you have read and understood these Terms of Service.
                            </p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}