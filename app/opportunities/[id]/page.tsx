// import { Button } from '@/components/ui/button'
// import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
// import { Badge } from '@/components/ui/badge'
// import { MapPin, DollarSign, Briefcase, Calendar, CheckCircle2, Users, Trophy } from 'lucide-react'
// import Link from 'next/link'
// import Image from 'next/image'

// // In production, this would fetch from API
// async function getOpportunity(id: string) {
//   return {
//     id,
//     title: 'Professional Basketball Player',
//     sport: 'Basketball',
//     category: 'Professional Sports',
//     organization: 'Elite Sports Management',
//     location: 'Los Angeles, California',
//     city: 'Los Angeles',
//     state: 'California',
//     type: 'Full Time',
//     salaryMin: 60000,
//     salaryMax: 80000,
//     description: `We are seeking exceptional basketball talent to join our professional team. This is a unique opportunity to compete at the highest level while being part of a world-class organization.

// Our program offers state-of-the-art training facilities, expert coaching staff, and a comprehensive support system designed to help you reach your full potential both on and off the court.

// As a member of our team, you'll have access to sports science specialists, nutrition experts, and mental performance coaches. We're committed to developing well-rounded athletes who excel in competition and in life.`,
//     requirements: [
//       'Minimum 5 years of competitive basketball experience',
//       'College or professional playing experience required',
//       'Excellent physical conditioning and athletic ability',
//       'Strong team player with leadership qualities',
//       'Willingness to relocate to Los Angeles',
//       'Available for full-time commitment including training and travel',
//     ],
//     benefits: [
//       'Competitive salary with performance bonuses',
//       'Comprehensive health and dental insurance',
//       'Access to world-class training facilities',
//       'Professional development and career support',
//       'Housing assistance available',
//       'Travel and equipment provided',
//       'Nutrition and meal planning support',
//       'Mental performance coaching',
//     ],
//     responsibilities: [
//       'Participate in daily training sessions and team practices',
//       'Compete in scheduled games and tournaments',
//       'Maintain peak physical condition',
//       'Represent the organization professionally',
//       'Engage with fans and community events',
//       'Collaborate with coaching staff on performance improvement',
//     ],
//     status: 'ACTIVE',
//     postedDate: new Date('2026-02-10'),
//     deadline: new Date('2026-03-15'),
//     applicants: 47,
//     imageUrl: 'https://images.unsplash.com/photo-1546519638-68e109498ffc?w=1200&q=80',
//   }
// }

// export default async function OpportunityDetailPage({
//   params,
// }: {
//   params: { id: string }
// }) {
//   const opportunity = await getOpportunity(params.id)

//   return (
//     <div className="flex flex-col">
//       {/* Hero Section with Image */}
//       <section className="relative h-96 bg-linear-to-br from-stone-900 to-black rounded-2xl px-16 mt-12 overflow-hidden">
//         <div className="absolute inset-0">
//           <Image
//             src={opportunity.imageUrl}
//             alt={opportunity.title}
//             fill
//             className="object-cover opacity-40"
//           />
//         </div>
//         <div className="container relative h-full flex items-end pb-12">
//           <div className="text-white space-y-4">
//             <div className="flex gap-2">
//               <Badge className="bg-amber-600 hover:bg-amber-700">
//                 {opportunity.sport}
//               </Badge>
//               <Badge className="bg-white text-black">
//                 {opportunity.type}
//               </Badge>
//               <Badge variant="outline" className="border-white text-white">
//                 {opportunity.applicants} Applicants
//               </Badge>
//             </div>
//             <h1 className="text-5xl font-bold">{opportunity.title}</h1>
//             <p className="text-xl text-white/90">{opportunity.organization}</p>
//           </div>
//         </div>
//       </section>

//       {/* Main Content */}
//       <div className="py-12">
//         <div className="container">
//           <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
//             {/* Left Column - Details */}
//             <div className="lg:col-span-2 space-y-8">
//               {/* Quick Info */}
//               <Card>
//                 <CardContent className="p-6">
//                   <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
//                     <div className="space-y-2">
//                       <div className="flex items-center gap-2 text-muted-foreground">
//                         <MapPin className="w-4 h-4" />
//                         <span className="text-xs font-medium">Location</span>
//                       </div>
//                       <p className="font-semibold">{opportunity.city}</p>
//                       <p className="text-sm text-muted-foreground">{opportunity.state}</p>
//                     </div>

//                     <div className="space-y-2">
//                       <div className="flex items-center gap-2 text-muted-foreground">
//                         <DollarSign className="w-4 h-4" />
//                         <span className="text-xs font-medium">Salary</span>
//                       </div>
//                       <p className="font-semibold">
//                         ${opportunity.salaryMin.toLocaleString()}
//                       </p>
//                       <p className="text-sm text-muted-foreground">
//                         - ${opportunity.salaryMax.toLocaleString()}
//                       </p>
//                     </div>

//                     <div className="space-y-2">
//                       <div className="flex items-center gap-2 text-muted-foreground">
//                         <Briefcase className="w-4 h-4" />
//                         <span className="text-xs font-medium">Type</span>
//                       </div>
//                       <p className="font-semibold">{opportunity.type}</p>
//                     </div>

//                     <div className="space-y-2">
//                       <div className="flex items-center gap-2 text-muted-foreground">
//                         <Calendar className="w-4 h-4" />
//                         <span className="text-xs font-medium">Deadline</span>
//                       </div>
//                       <p className="font-semibold">
//                         {opportunity.deadline.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
//                       </p>
//                       <p className="text-sm text-muted-foreground">
//                         {opportunity.deadline.getFullYear()}
//                       </p>
//                     </div>
//                   </div>
//                 </CardContent>
//               </Card>

//               {/* Description */}
//               <Card>
//                 <CardHeader>
//                   <CardTitle className="text-2xl">About This Opportunity</CardTitle>
//                 </CardHeader>
//                 <CardContent className="space-y-4">
//                   {opportunity.description.split('\n\n').map((paragraph, index) => (
//                     <p key={index} className="text-muted-foreground leading-relaxed">
//                       {paragraph}
//                     </p>
//                   ))}
//                 </CardContent>
//               </Card>

//               {/* Responsibilities */}
//               <Card>
//                 <CardHeader>
//                   <CardTitle className="text-2xl flex items-center gap-2">
//                     <Trophy className="w-6 h-6 text-amber-600" />
//                     Responsibilities
//                   </CardTitle>
//                 </CardHeader>
//                 <CardContent>
//                   <ul className="space-y-3">
//                     {opportunity.responsibilities.map((item, index) => (
//                       <li key={index} className="flex gap-3">
//                         <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
//                         <span className="text-muted-foreground">{item}</span>
//                       </li>
//                     ))}
//                   </ul>
//                 </CardContent>
//               </Card>

//               {/* Requirements */}
//               <Card>
//                 <CardHeader>
//                   <CardTitle className="text-2xl flex items-center gap-2">
//                     <CheckCircle2 className="w-6 h-6 text-amber-600" />
//                     Requirements
//                   </CardTitle>
//                 </CardHeader>
//                 <CardContent>
//                   <ul className="space-y-3">
//                     {opportunity.requirements.map((item, index) => (
//                       <li key={index} className="flex gap-3">
//                         <div className="w-2 h-2 bg-amber-600 rounded-full flex-shrink-0 mt-2" />
//                         <span className="text-muted-foreground">{item}</span>
//                       </li>
//                     ))}
//                   </ul>
//                 </CardContent>
//               </Card>

//               {/* Benefits */}
//               <Card>
//                 <CardHeader>
//                   <CardTitle className="text-2xl flex items-center gap-2">
//                     <Users className="w-6 h-6 text-amber-600" />
//                     Benefits & Perks
//                   </CardTitle>
//                 </CardHeader>
//                 <CardContent>
//                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                     {opportunity.benefits.map((benefit, index) => (
//                       <div
//                         key={index}
//                         className="flex gap-3 p-4 bg-gradient-to-br from-amber-50 to-stone-50 rounded-lg border border-amber-200"
//                       >
//                         <CheckCircle2 className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
//                         <span className="text-sm font-medium">{benefit}</span>
//                       </div>
//                     ))}
//                   </div>
//                 </CardContent>
//               </Card>
//             </div>

//             {/* Right Column - Application Card */}
//             <div className="lg:col-span-1">
//               <div className="sticky top-24 space-y-6">
//                 {/* Apply Card */}
//                 <Card className="border-2 border-amber-200 bg-gradient-to-br from-white to-amber-50">
//                   <CardHeader>
//                     <CardTitle className="text-xl">Ready to Apply?</CardTitle>
//                   </CardHeader>
//                   <CardContent className="space-y-4">
//                     <div className="space-y-3">
//                       <div className="flex items-center justify-between text-sm">
//                         <span className="text-muted-foreground">Posted</span>
//                         <span className="font-medium">
//                           {opportunity.postedDate.toLocaleDateString('en-US', { 
//                             month: 'short', 
//                             day: 'numeric',
//                             year: 'numeric'
//                           })}
//                         </span>
//                       </div>
//                       <div className="flex items-center justify-between text-sm">
//                         <span className="text-muted-foreground">Applicants</span>
//                         <span className="font-medium">{opportunity.applicants}</span>
//                       </div>
//                       <div className="flex items-center justify-between text-sm">
//                         <span className="text-muted-foreground">Deadline</span>
//                         <span className="font-medium text-amber-700">
//                           {opportunity.deadline.toLocaleDateString('en-US', { 
//                             month: 'short', 
//                             day: 'numeric' 
//                           })}
//                         </span>
//                       </div>
//                     </div>

//                     <div className="pt-4 border-t space-y-3">
//                       <Button 
//                         className="w-full bg-black hover:bg-black/90 rounded-full" 
//                         size="lg"
//                         asChild
//                       >
//                         <Link href={`/opportunities/${opportunity.id}/apply`}>
//                           Apply Now
//                         </Link>
//                       </Button>
//                       <Button 
//                         variant="outline" 
//                         className="w-full rounded-full border-black"
//                         size="lg"
//                       >
//                         Save for Later
//                       </Button>
//                     </div>

//                     <p className="text-xs text-center text-muted-foreground">
//                       Application takes approximately 10-15 minutes
//                     </p>
//                   </CardContent>
//                 </Card>

//                 {/* Organization Info */}
//                 <Card>
//                   <CardHeader>
//                     <CardTitle className="text-lg">About the Organization</CardTitle>
//                   </CardHeader>
//                   <CardContent className="space-y-4">
//                     <div className="flex items-center gap-3">
//                       <div className="w-12 h-12 bg-gradient-to-br from-amber-200 to-amber-100 rounded-lg flex items-center justify-center">
//                         <Trophy className="w-6 h-6" />
//                       </div>
//                       <div>
//                         <p className="font-semibold">{opportunity.organization}</p>
//                         <p className="text-sm text-muted-foreground">{opportunity.category}</p>
//                       </div>
//                     </div>
//                     <p className="text-sm text-muted-foreground">
//                       Leading sports organization dedicated to developing world-class athletes 
//                       and providing exceptional opportunities for growth and success.
//                     </p>
//                     <Button variant="outline" className="w-full rounded-full" size="sm">
//                       View Profile
//                     </Button>
//                   </CardContent>
//                 </Card>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   )
// }
import { use } from 'react'
import { OpportunityDetails } from '@/components/opportunities/opportunity-details'

type Props = {
  params: Promise<{ id: string }>
}

export default function OpportunityDetailPage({ params }: Props) {
  const { id } = use(params)

  return (
    <OpportunityDetails
      id={id}
      backHref="/opportunities"
      applyHref={`/dashboard/athlete/opportunities/${id}/apply`}
    />
  )
}