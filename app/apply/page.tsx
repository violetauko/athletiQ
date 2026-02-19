'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { CheckCircle2, Upload, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'

export default function ApplyPage({ params }: { params: { id: string } }) {
  const [step, setStep] = useState(1)

  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-50 to-white py-12">
      <div className="container max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <Link href={`/opportunities/${params.id}`} className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-4">
            <ArrowLeft className="w-4 h-4" />
            Back to Opportunity
          </Link>
          <h1 className="text-4xl font-bold mb-2">Apply for Position</h1>
          <p className="text-muted-foreground">
            Professional Basketball Player at Elite Sports Management
          </p>
        </div>

        {/* Progress Indicator */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {[
              { num: 1, label: 'Personal Info' },
              { num: 2, label: 'Athletic Background' },
              { num: 3, label: 'Documents' },
              { num: 4, label: 'Review' },
            ].map((s, index) => (
              <div key={s.num} className="flex items-center flex-1">
                <div className="flex flex-col items-center flex-1">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
                      step >= s.num
                        ? 'bg-black text-white'
                        : 'bg-stone-200 text-muted-foreground'
                    }`}
                  >
                    {step > s.num ? <CheckCircle2 className="w-5 h-5" /> : s.num}
                  </div>
                  <span className="text-xs mt-2 font-medium">{s.label}</span>
                </div>
                {index < 3 && (
                  <div
                    className={`h-1 flex-1 ${
                      step > s.num ? 'bg-black' : 'bg-stone-200'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Application Form */}
        <Card>
          <CardHeader>
            <CardTitle>
              {step === 1 && 'Personal Information'}
              {step === 2 && 'Athletic Background'}
              {step === 3 && 'Upload Documents'}
              {step === 4 && 'Review & Submit'}
            </CardTitle>
            <CardDescription>
              {step === 1 && 'Tell us about yourself'}
              {step === 2 && 'Share your athletic experience'}
              {step === 3 && 'Upload required documents'}
              {step === 4 && 'Review your application before submitting'}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Step 1: Personal Info */}
            {step === 1 && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name *</Label>
                    <Input id="firstName" placeholder="John" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name *</Label>
                    <Input id="lastName" placeholder="Doe" required />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email *</Label>
                    <Input id="email" type="email" placeholder="john.doe@email.com" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number *</Label>
                    <Input id="phone" type="tel" placeholder="+1 (555) 000-0000" required />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="dob">Date of Birth *</Label>
                  <Input id="dob" type="date" required />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="city">City *</Label>
                    <Input id="city" placeholder="Los Angeles" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="state">State/Province *</Label>
                    <Input id="state" placeholder="California" required />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address">Street Address</Label>
                  <Input id="address" placeholder="123 Main Street" />
                </div>
              </div>
            )}

            {/* Step 2: Athletic Background */}
            {step === 2 && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="height">Height (cm) *</Label>
                    <Input id="height" type="number" placeholder="180" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="weight">Weight (kg) *</Label>
                    <Input id="weight" type="number" placeholder="75" required />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="position">Primary Position *</Label>
                  <Input id="position" placeholder="Point Guard" required />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="experience">Years of Experience *</Label>
                  <Input id="experience" type="number" placeholder="5" required />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="currentTeam">Current/Most Recent Team</Label>
                  <Input id="currentTeam" placeholder="UCLA Bruins" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="achievements">Key Achievements</Label>
                  <textarea
                    id="achievements"
                    rows={4}
                    className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    placeholder="List your major achievements, awards, and recognitions..."
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="stats">Career Statistics (Optional)</Label>
                  <textarea
                    id="stats"
                    rows={3}
                    className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    placeholder="Points per game, assists, rebounds, etc."
                  />
                </div>
              </div>
            )}

            {/* Step 3: Documents */}
            {step === 3 && (
              <div className="space-y-6">
                <div className="space-y-4">
                  <div className="border-2 border-dashed border-stone-300 rounded-lg p-8 text-center hover:border-amber-400 transition-colors cursor-pointer">
                    <Upload className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                    <p className="font-medium mb-2">Upload Resume/CV *</p>
                    <p className="text-sm text-muted-foreground mb-4">
                      PDF or Word document, max 5MB
                    </p>
                    <Button variant="outline" size="sm">
                      Choose File
                    </Button>
                  </div>

                  <div className="border-2 border-dashed border-stone-300 rounded-lg p-8 text-center hover:border-amber-400 transition-colors cursor-pointer">
                    <Upload className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                    <p className="font-medium mb-2">Athletic Portfolio</p>
                    <p className="text-sm text-muted-foreground mb-4">
                      Photos, videos, or links to highlight reels
                    </p>
                    <Button variant="outline" size="sm">
                      Choose Files
                    </Button>
                  </div>

                  <div className="border-2 border-dashed border-stone-300 rounded-lg p-8 text-center hover:border-amber-400 transition-colors cursor-pointer">
                    <Upload className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                    <p className="font-medium mb-2">Additional Documents</p>
                    <p className="text-sm text-muted-foreground mb-4">
                      References, certifications, transcripts (optional)
                    </p>
                    <Button variant="outline" size="sm">
                      Choose Files
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="coverLetter">Cover Letter *</Label>
                  <textarea
                    id="coverLetter"
                    rows={8}
                    className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    placeholder="Tell us why you're interested in this position and what makes you a great fit..."
                    required
                  />
                </div>
              </div>
            )}

            {/* Step 4: Review */}
            {step === 4 && (
              <div className="space-y-6">
                <Card className="bg-gradient-to-br from-amber-50 to-stone-50">
                  <CardContent className="p-6 space-y-4">
                    <div className="flex items-center gap-2 mb-4">
                      <CheckCircle2 className="w-5 h-5 text-green-600" />
                      <h3 className="font-semibold">Application Summary</h3>
                    </div>

                    <div className="space-y-3 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Name:</span>
                        <span className="font-medium">John Doe</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Email:</span>
                        <span className="font-medium">john.doe@email.com</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Position:</span>
                        <span className="font-medium">Point Guard</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Experience:</span>
                        <span className="font-medium">5 years</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Documents:</span>
                        <span className="font-medium">Resume uploaded</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex gap-3">
                    <div className="flex-shrink-0">
                      <CheckCircle2 className="w-5 h-5 text-blue-600" />
                    </div>
                    <div className="text-sm">
                      <p className="font-medium text-blue-900 mb-1">Before you submit</p>
                      <ul className="text-blue-800 space-y-1">
                        <li>• All required fields are completed</li>
                        <li>• Documents are uploaded correctly</li>
                        <li>• Information is accurate and up-to-date</li>
                        <li>• You've reviewed your cover letter</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-4 bg-stone-100 rounded-lg">
                  <input
                    type="checkbox"
                    id="terms"
                    className="mt-1"
                  />
                  <Label htmlFor="terms" className="text-sm cursor-pointer">
                    I confirm that all information provided is accurate and I agree to the{' '}
                    <Link href="/terms" className="text-amber-700 hover:underline">
                      Terms and Conditions
                    </Link>
                    {' '}and{' '}
                    <Link href="/privacy" className="text-amber-700 hover:underline">
                      Privacy Policy
                    </Link>
                  </Label>
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex gap-4 pt-6 border-t">
              {step > 1 && (
                <Button
                  variant="outline"
                  onClick={() => setStep(step - 1)}
                  className="flex-1"
                >
                  Previous
                </Button>
              )}
              {step < 4 ? (
                <Button
                  onClick={() => setStep(step + 1)}
                  className="flex-1 bg-black hover:bg-black/90"
                >
                  Next Step
                </Button>
              ) : (
                <Button
                  className="flex-1 bg-green-600 hover:bg-green-700"
                >
                  Submit Application
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Help Card */}
        <Card className="mt-6 bg-gradient-to-br from-amber-50 to-white border-amber-200">
          <CardContent className="p-6">
            <h3 className="font-semibold mb-2">Need Help?</h3>
            <p className="text-sm text-muted-foreground mb-4">
              If you have questions about the application process, contact our support team.
            </p>
            <Button variant="outline" size="sm" className="rounded-full">
              Contact Support
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}