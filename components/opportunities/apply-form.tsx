// 'use client'

// import { useState } from 'react'
// import { useMutation, useQuery } from '@tanstack/react-query'
// import { useRouter } from 'next/navigation'
// import { Button } from '@/components/ui/button'
// import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
// import { Textarea } from '@/components/ui/textarea'
// import { Label } from '@/components/ui/label'
// import { Skeleton } from '@/components/ui/skeleton'
// import { Badge } from '@/components/ui/badge'
// import { ArrowLeft, ArrowRight, CheckCircle2, Send } from 'lucide-react'
// import Link from 'next/link'

// interface ApplyFormProps {
//   opportunityId: string
//   /** Where the "back" link goes (e.g. /opportunities/:id) */
//   backHref: string
//   /** Where to redirect after a successful application */
//   successRedirect: string
// }

// interface OpportunitySummary {
//   id: string
//   title: string
//   organization: string
//   sport: string
//   type: string
//   city: string
// }

// const STEPS = ['Introduction', 'Cover Letter', 'Review & Submit'] as const
// type Step = 0 | 1 | 2

// export function ApplyForm({ opportunityId, backHref, successRedirect }: ApplyFormProps) {
//   const router = useRouter()
//   const [step, setStep] = useState<Step>(0)
//   const [coverLetter, setCoverLetter] = useState('')

//   // Fetch just the summary info for the header
//   const { data: opportunity, isLoading } = useQuery<OpportunitySummary>({
//     queryKey: ['opportunity-summary', opportunityId],
//     queryFn: async () => {
//       const res = await fetch(`/api/opportunities/${opportunityId}`)
//       if (!res.ok) throw new Error('Failed to load opportunity')
//       return res.json()
//     },
//   })

//   const { mutate: submitApplication, isPending, isError, error } = useMutation({
//     mutationFn: async () => {
//       const res = await fetch(`/api/athlete/opportunities/${opportunityId}/apply`, {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({ coverLetter }),
//       })
//       if (!res.ok) {
//         const data = await res.json().catch(() => ({}))
//         throw new Error(data.error ?? 'Failed to submit application')
//       }
//       return res.json()
//     },
//     onSuccess: () => {
//       router.push(successRedirect)
//     },
//   })

//   return (
//     <div className="flex flex-col min-h-screen">
//       {/* Header */}
//       <div className="border-b bg-white sticky top-16 z-30">
//         <div className="container py-4 flex items-center justify-between">
//           <Button asChild variant="ghost" className="gap-2 text-muted-foreground">
//             <Link href={backHref}>
//               <ArrowLeft className="w-4 h-4" />
//               Back to opportunity
//             </Link>
//           </Button>

//           {/* Step Indicators */}
//           <div className="hidden md:flex items-center gap-2">
//             {STEPS.map((label, i) => (
//               <div key={label} className="flex items-center gap-2">
//                 <div
//                   className={`flex items-center gap-1.5 text-sm font-medium ${
//                     i === step
//                       ? 'text-black'
//                       : i < step
//                       ? 'text-green-600'
//                       : 'text-muted-foreground'
//                   }`}
//                 >
//                   {i < step ? (
//                     <CheckCircle2 className="w-4 h-4" />
//                   ) : (
//                     <span className="w-5 h-5 rounded-full border-2 border-current flex items-center justify-center text-xs">
//                       {i + 1}
//                     </span>
//                   )}
//                   {label}
//                 </div>
//                 {i < STEPS.length - 1 && (
//                   <div className="w-8 h-px bg-border mx-1" />
//                 )}
//               </div>
//             ))}
//           </div>

//           <div className="text-sm text-muted-foreground md:hidden">
//             Step {step + 1} of {STEPS.length}
//           </div>
//         </div>
//       </div>

//       <div className="container py-12 max-w-2xl mx-auto w-full">
//         {/* Opportunity Summary Banner */}
//         {isLoading ? (
//           <Skeleton className="h-20 w-full mb-8" />
//         ) : opportunity ? (
//           <div className="flex items-center gap-4 p-4 bg-amber-50 border border-amber-200 rounded-xl mb-8">
//             <div className="flex-1 min-w-0">
//               <p className="font-semibold truncate">{opportunity.title}</p>
//               <p className="text-sm text-muted-foreground">{opportunity.organization}</p>
//             </div>
//             <div className="flex gap-2 flex-shrink-0">
//               <Badge className="bg-amber-600 hover:bg-amber-700 text-xs">{opportunity.sport}</Badge>
//               <Badge variant="outline" className="text-xs">{opportunity.type}</Badge>
//             </div>
//           </div>
//         ) : null}

//         {/* Step 0: Introduction */}
//         {step === 0 && (
//           <Card>
//             <CardHeader>
//               <CardTitle className="text-2xl">Before You Apply</CardTitle>
//             </CardHeader>
//             <CardContent className="space-y-6">
//               <p className="text-muted-foreground leading-relaxed">
//                 You're about to apply for this opportunity. The process takes approximately
//                 10–15 minutes. Please make sure you have the following ready:
//               </p>
//               <ul className="space-y-3">
//                 {[
//                   'An up-to-date athlete profile',
//                   "A compelling cover letter (you'll write it in the next step)",
//                   "Any relevant achievements or stats you'd like to highlight",
//                 ].map((item) => (
//                   <li key={item} className="flex gap-3">
//                     <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
//                     <span className="text-muted-foreground">{item}</span>
//                   </li>
//                 ))}
//               </ul>
//               <div className="pt-4">
//                 <Button
//                   className="w-full bg-black hover:bg-black/90 rounded-full gap-2"
//                   size="lg"
//                   onClick={() => setStep(1)}
//                 >
//                   Get Started
//                   <ArrowRight className="w-4 h-4" />
//                 </Button>
//               </div>
//             </CardContent>
//           </Card>
//         )}

//         {/* Step 1: Cover Letter */}
//         {step === 1 && (
//           <Card>
//             <CardHeader>
//               <CardTitle className="text-2xl">Cover Letter</CardTitle>
//             </CardHeader>
//             <CardContent className="space-y-4">
//               <p className="text-muted-foreground text-sm">
//                 Tell the organization why you're the right fit. Highlight your relevant experience,
//                 achievements, and what excites you about this opportunity.
//               </p>
//               <div className="space-y-2">
//                 <Label htmlFor="cover-letter">Your cover letter</Label>
//                 <Textarea
//                   id="cover-letter"
//                   placeholder="I'm excited to apply for this opportunity because..."
//                   className="min-h-65 resize-none"
//                   value={coverLetter}
//                   onChange={(e) => setCoverLetter(e.target.value)}
//                 />
//                 <p className="text-xs text-muted-foreground text-right">
//                   {coverLetter.length} characters
//                 </p>
//               </div>
//               <div className="flex gap-3 pt-2">
//                 <Button
//                   variant="outline"
//                   className="flex-1 rounded-full"
//                   onClick={() => setStep(0)}
//                 >
//                   <ArrowLeft className="w-4 h-4 mr-2" />
//                   Back
//                 </Button>
//                 <Button
//                   className="flex-1 bg-black hover:bg-black/90 rounded-full"
//                   onClick={() => setStep(2)}
//                   disabled={coverLetter.trim().length < 50}
//                 >
//                   Continue
//                   <ArrowRight className="w-4 h-4 ml-2" />
//                 </Button>
//               </div>
//               {coverLetter.trim().length < 50 && coverLetter.length > 0 && (
//                 <p className="text-xs text-amber-600 text-center">
//                   Please write at least 50 characters.
//                 </p>
//               )}
//             </CardContent>
//           </Card>
//         )}

//         {/* Step 2: Review & Submit */}
//         {step === 2 && (
//           <Card>
//             <CardHeader>
//               <CardTitle className="text-2xl">Review & Submit</CardTitle>
//             </CardHeader>
//             <CardContent className="space-y-6">
//               <div className="p-4 bg-stone-50 rounded-xl border space-y-2">
//                 <p className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
//                   Cover Letter Preview
//                 </p>
//                 <p className="text-sm leading-relaxed whitespace-pre-wrap">{coverLetter}</p>
//               </div>

//               {isError && (
//                 <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
//                   {(error as Error).message ?? 'Something went wrong. Please try again.'}
//                 </div>
//               )}

//               <div className="flex gap-3">
//                 <Button
//                   variant="outline"
//                   className="flex-1 rounded-full"
//                   onClick={() => setStep(1)}
//                   disabled={isPending}
//                 >
//                   <ArrowLeft className="w-4 h-4 mr-2" />
//                   Edit Letter
//                 </Button>
//                 <Button
//                   className="flex-1 bg-black hover:bg-black/90 rounded-full gap-2"
//                   size="lg"
//                   onClick={() => submitApplication()}
//                   disabled={isPending}
//                 >
//                   {isPending ? 'Submitting…' : 'Submit Application'}
//                   {!isPending && <Send className="w-4 h-4" />}
//                 </Button>
//               </div>

//               <p className="text-xs text-center text-muted-foreground">
//                 By submitting you agree to our Terms of Service and Privacy Policy.
//               </p>
//             </CardContent>
//           </Card>
//         )}
//       </div>
//     </div>
//   )
// }
// 'use client'

// import { Button } from '@/components/ui/button'
// import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
// import { Input } from '@/components/ui/input'
// import { Label } from '@/components/ui/label'
// // import { Badge } from '@/components/ui/badge'
// import { CheckCircle2, Upload, ArrowLeft } from 'lucide-react'
// import Link from 'next/link'
// import { use, useState } from 'react'
// import TitleCard from '@/components/shared/title-card'
// import { useMutation, useQuery } from '@tanstack/react-query'
// import { useRouter } from 'next/navigation'

// interface OpportunitySummary {
//   id: string
//   title: string
//   organization: string
//   sport: string
//   type: string
//   city: string
// }

// export function ApplyForm({ params }: { params: Promise<{ id: string,backHref: string, successRedirect: string }>}) {
//   const [step, setStep] = useState(1)
//   const router = useRouter()
//   const { id, backHref, successRedirect } = use(params);

//   // Fetch just the summary info for the header
//   const { data: opportunity, isLoading } = useQuery<OpportunitySummary>({
//     queryKey: ['opportunity-summary', id],
//     queryFn: async () => {
//       const res = await fetch(`/api/opportunities/${id}`)
//       if (!res.ok) throw new Error('Failed to load opportunity')
//       return res.json()
//     },
//   })

//   const { mutate: submitApplication, isPending, isError, error } = useMutation({
//     mutationFn: async () => {
//       const res = await fetch(`/api/athlete/opportunities/${id}/apply`, {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({  }),
//       })
//       if (!res.ok) {
//         const data = await res.json().catch(() => ({}))
//         throw new Error(data.error ?? 'Failed to submit application')
//       }
//       return res.json()
//     },
//     onSuccess: () => {
//       router.push(successRedirect)
//     },
//   })

//   return (
//     <div className="">
//       <div className="mb-12">
//         {/* Header */}
//         <div className="mb-8">
//           <Link href={`/opportunities/${id}`} className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-4">
//             <ArrowLeft className="w-4 h-4" />
//             Back to Opportunity
//           </Link>
//            <div className="my-12">
//           <TitleCard
//             image="https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=800&q=80"
//             title="Apply for Position"
//             description="Professional Basketball Player at Elite Sports Management."
//           />
//         </div>
//         </div>

//         {/* Progress Indicator */}
//         <div className="mb-8">
//           <div className="flex items-center justify-between">
//             {[
//               { num: 1, label: 'Personal Info' },
//               { num: 2, label: 'Athletic Background' },
//               { num: 3, label: 'Documents' },
//               { num: 4, label: 'Review' },
//             ].map((s, index) => (
//               <div key={s.num} className="flex items-center flex-1">
//                 <div className="flex flex-col items-center flex-1">
//                   <div
//                     className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
//                       step >= s.num
//                         ? 'bg-black text-white'
//                         : 'bg-stone-200 text-muted-foreground'
//                     }`}
//                   >
//                     {step > s.num ? <CheckCircle2 className="w-5 h-5" /> : s.num}
//                   </div>
//                   <span className="text-xs mt-2 font-medium">{s.label}</span>
//                 </div>
//                 {index < 3 && (
//                   <div
//                     className={`h-1 flex-1 ${
//                       step > s.num ? 'bg-black' : 'bg-stone-200'
//                     }`}
//                   />
//                 )}
//               </div>
//             ))}
//           </div>
//         </div>

//         {/* Application Form */}
//         <Card>
//           <CardHeader>
//             <CardTitle>
//               {step === 1 && 'Personal Information'}
//               {step === 2 && 'Athletic Background'}
//               {step === 3 && 'Upload Documents'}
//               {step === 4 && 'Review & Submit'}
//             </CardTitle>
//             <CardDescription>
//               {step === 1 && 'Tell us about yourself'}
//               {step === 2 && 'Share your athletic experience'}
//               {step === 3 && 'Upload required documents'}
//               {step === 4 && 'Review your application before submitting'}
//             </CardDescription>
//           </CardHeader>
//           <CardContent className="space-y-6">
//             {/* Step 1: Personal Info */}
//             {step === 1 && (
//               <div className="space-y-4">
//                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                   <div className="space-y-2">
//                     <Label htmlFor="firstName">First Name *</Label>
//                     <Input id="firstName" placeholder="John" required />
//                   </div>
//                   <div className="space-y-2">
//                     <Label htmlFor="lastName">Last Name *</Label>
//                     <Input id="lastName" placeholder="Doe" required />
//                   </div>
//                 </div>

//                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                   <div className="space-y-2">
//                     <Label htmlFor="email">Email *</Label>
//                     <Input id="email" type="email" placeholder="john.doe@email.com" required />
//                   </div>
//                   <div className="space-y-2">
//                     <Label htmlFor="phone">Phone Number *</Label>
//                     <Input id="phone" type="tel" placeholder="+1 (555) 000-0000" required />
//                   </div>
//                 </div>

//                 <div className="space-y-2">
//                   <Label htmlFor="dob">Date of Birth *</Label>
//                   <Input id="dob" type="date" required />
//                 </div>

//                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                   <div className="space-y-2">
//                     <Label htmlFor="city">City *</Label>
//                     <Input id="city" placeholder="Los Angeles" required />
//                   </div>
//                   <div className="space-y-2">
//                     <Label htmlFor="state">State/Province *</Label>
//                     <Input id="state" placeholder="California" required />
//                   </div>
//                 </div>

//                 <div className="space-y-2">
//                   <Label htmlFor="address">Street Address</Label>
//                   <Input id="address" placeholder="123 Main Street" />
//                 </div>
//               </div>
//             )}

//             {/* Step 2: Athletic Background */}
//             {step === 2 && (
//               <div className="space-y-4">
//                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                   <div className="space-y-2">
//                     <Label htmlFor="height">Height (cm) *</Label>
//                     <Input id="height" type="number" placeholder="180" required />
//                   </div>
//                   <div className="space-y-2">
//                     <Label htmlFor="weight">Weight (kg) *</Label>
//                     <Input id="weight" type="number" placeholder="75" required />
//                   </div>
//                 </div>

//                 <div className="space-y-2">
//                   <Label htmlFor="position">Primary Position *</Label>
//                   <Input id="position" placeholder="Point Guard" required />
//                 </div>

//                 <div className="space-y-2">
//                   <Label htmlFor="experience">Years of Experience *</Label>
//                   <Input id="experience" type="number" placeholder="5" required />
//                 </div>

//                 <div className="space-y-2">
//                   <Label htmlFor="currentTeam">Current/Most Recent Team</Label>
//                   <Input id="currentTeam" placeholder="UCLA Bruins" />
//                 </div>

//                 <div className="space-y-2">
//                   <Label htmlFor="achievements">Key Achievements</Label>
//                   <textarea
//                     id="achievements"
//                     rows={4}
//                     className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
//                     placeholder="List your major achievements, awards, and recognitions..."
//                   />
//                 </div>

//                 <div className="space-y-2">
//                   <Label htmlFor="stats">Career Statistics (Optional)</Label>
//                   <textarea
//                     id="stats"
//                     rows={3}
//                     className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
//                     placeholder="Points per game, assists, rebounds, etc."
//                   />
//                 </div>
//               </div>
//             )}

//             {/* Step 3: Documents */}
//             {step === 3 && (
//               <div className="space-y-6">
//                 <div className="space-y-4">
//                   <div className="border-2 border-dashed border-stone-300 rounded-lg p-8 text-center hover:border-amber-400 transition-colors cursor-pointer">
//                     <Upload className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
//                     <p className="font-medium mb-2">Upload Resume/CV *</p>
//                     <p className="text-sm text-muted-foreground mb-4">
//                       PDF or Word document, max 5MB
//                     </p>
//                     <Button variant="outline" size="sm">
//                       Choose File
//                     </Button>
//                   </div>

//                   <div className="border-2 border-dashed border-stone-300 rounded-lg p-8 text-center hover:border-amber-400 transition-colors cursor-pointer">
//                     <Upload className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
//                     <p className="font-medium mb-2">Athletic Portfolio</p>
//                     <p className="text-sm text-muted-foreground mb-4">
//                       Photos, videos, or links to highlight reels
//                     </p>
//                     <Button variant="outline" size="sm">
//                       Choose Files
//                     </Button>
//                   </div>

//                   <div className="border-2 border-dashed border-stone-300 rounded-lg p-8 text-center hover:border-amber-400 transition-colors cursor-pointer">
//                     <Upload className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
//                     <p className="font-medium mb-2">Additional Documents</p>
//                     <p className="text-sm text-muted-foreground mb-4">
//                       References, certifications, transcripts (optional)
//                     </p>
//                     <Button variant="outline" size="sm">
//                       Choose Files
//                     </Button>
//                   </div>
//                 </div>

//                 <div className="space-y-2">
//                   <Label htmlFor="coverLetter">Cover Letter *</Label>
//                   <textarea
//                     id="coverLetter"
//                     rows={8}
//                     className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
//                     placeholder="Tell us why you're interested in this position and what makes you a great fit..."
//                     required
//                   />
//                 </div>
//               </div>
//             )}

//             {/* Step 4: Review */}
//             {step === 4 && (
//               <div className="space-y-6">
//                 <Card className="bg-gradient-to-br from-amber-50 to-stone-50">
//                   <CardContent className="p-6 space-y-4">
//                     <div className="flex items-center gap-2 mb-4">
//                       <CheckCircle2 className="w-5 h-5 text-green-600" />
//                       <h3 className="font-semibold">Application Summary</h3>
//                     </div>

//                     <div className="space-y-3 text-sm">
//                       <div className="flex justify-between">
//                         <span className="text-muted-foreground">Name:</span>
//                         <span className="font-medium">John Doe</span>
//                       </div>
//                       <div className="flex justify-between">
//                         <span className="text-muted-foreground">Email:</span>
//                         <span className="font-medium">john.doe@email.com</span>
//                       </div>
//                       <div className="flex justify-between">
//                         <span className="text-muted-foreground">Position:</span>
//                         <span className="font-medium">Point Guard</span>
//                       </div>
//                       <div className="flex justify-between">
//                         <span className="text-muted-foreground">Experience:</span>
//                         <span className="font-medium">5 years</span>
//                       </div>
//                       <div className="flex justify-between">
//                         <span className="text-muted-foreground">Documents:</span>
//                         <span className="font-medium">Resume uploaded</span>
//                       </div>
//                     </div>
//                   </CardContent>
//                 </Card>

//                 <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
//                   <div className="flex gap-3">
//                     <div className="flex-shrink-0">
//                       <CheckCircle2 className="w-5 h-5 text-blue-600" />
//                     </div>
//                     <div className="text-sm">
//                       <p className="font-medium text-blue-900 mb-1">Before you submit</p>
//                       <ul className="text-blue-800 space-y-1">
//                         <li>• All required fields are completed</li>
//                         <li>• Documents are uploaded correctly</li>
//                         <li>• Information is accurate and up-to-date</li>
//                         <li>• You've reviewed your cover letter</li>
//                       </ul>
//                     </div>
//                   </div>
//                 </div>

//                 <div className="flex items-start gap-3 p-4 bg-stone-100 rounded-lg">
//                   <input
//                     type="checkbox"
//                     id="terms"
//                     className="mt-1"
//                   />
//                   <Label htmlFor="terms" className="text-sm cursor-pointer">
//                     I confirm that all information provided is accurate and I agree to the{' '}
//                     <Link href="/terms" className="text-amber-700 hover:underline">
//                       Terms and Conditions
//                     </Link>
//                     {' '}and{' '}
//                     <Link href="/privacy" className="text-amber-700 hover:underline">
//                       Privacy Policy
//                     </Link>
//                   </Label>
//                 </div>
//               </div>
//             )}

//             {/* Navigation Buttons */}
//             <div className="flex gap-4 pt-6 border-t">
//               {step > 1 && (
//                 <Button
//                   variant="outline"
//                   onClick={() => setStep(step - 1)}
//                   className="flex-1"
//                 >
//                   Previous
//                 </Button>
//               )}
//               {step < 4 ? (
//                 <Button
//                   onClick={() => setStep(step + 1)}
//                   className="flex-1 bg-black hover:bg-black/90"
//                 >
//                   Next Step
//                 </Button>
//               ) : (
//                 <Button
//                   className="flex-1 bg-green-600 hover:bg-green-700"
//                 >
//                   Submit Application
//                 </Button>
//               )}
//             </div>
//           </CardContent>
//         </Card>

//         {/* Help Card */}
//         <Card className="mt-6 bg-linear-to-br from-amber-50 to-white border-amber-200">
//           <CardContent className="p-6">
//             <h3 className="font-semibold mb-2">Need Help?</h3>
//             <p className="text-sm text-muted-foreground mb-4">
//               If you have questions about the application process, contact our support team.
//             </p>
//             <Link href={"/contact"}>
//               <Button variant="outline" size="sm" className="rounded-full">
//                 Contact Support
//               </Button>
//             </Link>
//           </CardContent>
//         </Card>
//       </div>
//     </div>
//   )
// }
'use client'

import { use, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useMutation } from '@tanstack/react-query'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import TitleCard from '@/components/shared/title-card'

export function ApplyForm({
  params,
}: {
  params: { id: string }
}) {
  const { id } = params;
  const router = useRouter()

  const [coverLetter, setCoverLetter] = useState('')
  const [notes, setNotes] = useState('')
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const successRedirect = `/opportunities/${id}?applied=true`

  const { mutate: submitApplication, isPending } = useMutation({
    mutationFn: async () => {
      // Build payload dynamically
      const payload: Record<string, string> = {}

      if (coverLetter.trim()) {
        payload.coverLetter = coverLetter.trim()
      }

      if (notes.trim()) {
        payload.notes = notes.trim()
      }

      const res = await fetch(
        `/api/athlete/opportunities/${id}/apply`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        }
      )

      if (!res.ok) {
        const text = await res.text()
        throw new Error(text || 'Failed to submit application')
      }

      return res.json()
    },
    onSuccess: () => {
      router.push(successRedirect)
    },
    onError: (error: any) => {
      setErrorMessage(error.message)
    },
  })

  const handleSubmit = () => {
    // Require at least cover letter
    if (!coverLetter.trim()) {
      setErrorMessage('Cover letter is required.')
      return
    }

    setErrorMessage(null)
    submitApplication()
  }

  return (
    <div className="max-w-3xl mx-auto py-10">
      {/* Back Link */}
      <Link
        href={`/opportunities/${id}`}
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Opportunity
      </Link>

      <TitleCard
        image="https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=800&q=80"
        title="Submit Your Application"
        description="Complete the form below to apply."
      />

      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Application Details</CardTitle>
          <CardDescription>
            Tell the recruiter why you're a great fit.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Cover Letter */}
          <div className="space-y-2">
            <Label htmlFor="coverLetter">Cover Letter *</Label>
            <textarea
              id="coverLetter"
              rows={6}
              value={coverLetter}
              onChange={(e) => setCoverLetter(e.target.value)}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              placeholder="Explain why you're a strong candidate..."
            />
          </div>

          {/* Optional Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Additional Notes (Optional)</Label>
            <textarea
              id="notes"
              rows={4}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              placeholder="Any additional information you'd like to share..."
            />
          </div>

          {errorMessage && (
            <div className="text-sm text-red-600 bg-red-50 p-3 rounded-md">
              {errorMessage}
            </div>
          )}

          <Button
            onClick={handleSubmit}
            disabled={isPending}
            className="w-full bg-green-600 hover:bg-green-700"
          >
            {isPending ? 'Submitting...' : 'Submit Application'}
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}