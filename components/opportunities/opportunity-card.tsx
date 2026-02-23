// import Link from 'next/link'
// import { Card, CardContent, CardFooter } from '@/components/ui/card'
// import { Button } from '@/components/ui/button'
// import { Badge } from '@/components/ui/badge'
// import { MapPin, DollarSign, Briefcase, Clock } from 'lucide-react'
// import { timeAgo, formatSalary } from '@/lib/utils'

// interface OpportunityCardProps {
//   id: string
//   title: string
//   sport: string
//   category: string
//   location: string
//   city?: string
//   type: string
//   salaryMin?: number
//   salaryMax?: number
//   description: string
//   postedDate: Date
//   isNew?: boolean
// }

// export function OpportunityCard({
//   id,
//   title,
//   sport,
//   category,
//   location,
//   city,
//   type,
//   salaryMin,
//   salaryMax,
//   description,
//   postedDate,
//   isNew = false,
// }: OpportunityCardProps) {
//   return (
//     <Card className="group hover:shadow-lg transition-all duration-300 bg-linear-to-br from-stone-100 to-amber-50 border-stone-200 h-full flex flex-col justify-between">
//       <CardContent className="p-6 space-y-4">
//         {/* Header with Badge */}
//         <div className="flex items-start justify-between">
//           <div className="space-y-1">
//             {isNew && (
//               <Badge className="bg-black text-white text-xs">NEW</Badge>
//             )}
//             <Badge variant="outline" className="text-xs">
//               {timeAgo(postedDate)}
//             </Badge>
//           </div>
//         </div>

//         {/* Title */}
//         <div>
//           <h3 className="text-xl sm:text-2xl font-bold mb-2 group-hover:text-primary transition-colors">
//             {title}
//           </h3>
//           <p className="text-sm text-muted-foreground">{category}</p>
//         </div>

//         {/* Location and Details */}
//         <div className="space-y-1 sm:space-y-2 text-sm text-muted-foreground">
//           <div className="flex items-center gap-2">
//             <MapPin className="w-4 h-4" />
//             <span>{city || location}</span>
//           </div>
//           <div className="flex items-center gap-2">
//             <Briefcase className="w-4 h-4" />
//             <span>{type}</span>
//           </div>
//           {salaryMin && salaryMax && (
//             <div className="flex items-center gap-2">
//               <DollarSign className="w-4 h-4" />
//               <span>{formatSalary(salaryMin, salaryMax)}</span>
//             </div>
//           )}
//         </div>

//         {/* Description */}
//         <p className="text-sm text-muted-foreground line-clamp-3">
//           {description}
//         </p>
//       </CardContent>

//       <CardFooter className="p-6 pt-0 flex gap-2">
//         <Button 
//           variant="default" 
//           className="flex-1 bg-black hover:bg-black/90 rounded-full"
//           asChild
//         >
//           <Link href={`/opportunities/${id}`}>Learn More</Link>
//         </Button>
//         <Button 
//           variant="outline" 
//           className="flex-1 rounded-full border-black hover:bg-black hover:text-white"
//           asChild
//         >
//           <Link href={`/opportunities/${id}/apply`}>Apply Now</Link>
//         </Button>
//       </CardFooter>
//     </Card>
//   )
// }
'use client'

import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { MapPin, DollarSign, Clock } from 'lucide-react'

interface OpportunityCardProps {
  id: string
  title: string
  sport: string
  category: string
  location: string
  city: string
  type: string
  salaryMin?: number | null
  salaryMax?: number | null
  description: string
  postedDate: Date
  isNew?: boolean
}

function formatSalary(min?: number | null, max?: number | null): string | null {
  if (!min && !max) return null
  const fmt = (n: number) =>
    n >= 1000 ? `$${(n / 1000).toFixed(0)}k` : `$${n}`
  if (min && max) return `${fmt(min)} – ${fmt(max)}`
  if (min) return `From ${fmt(min)}`
  if (max) return `Up to ${fmt(max)}`
  return null
}

function timeAgo(date: Date): string {
  const diffDays = Math.floor((Date.now() - date.getTime()) / (1000 * 60 * 60 * 24))
  if (diffDays === 0) return 'Today'
  if (diffDays === 1) return '1 day ago'
  if (diffDays < 7) return `${diffDays} days ago`
  if (diffDays < 14) return '1 week ago'
  return `${Math.floor(diffDays / 7)} weeks ago`
}

export function OpportunityCard({
  id,
  title,
  sport,
  category,
  city,
  type,
  salaryMin,
  salaryMax,
  description,
  postedDate,
  isNew,
}: OpportunityCardProps) {
  const salary = formatSalary(salaryMin, salaryMax)

  return (
    <Card className='group hover:shadow-lg transition-all duration-300 bg-linear-to-br from-stone-100 to-amber-50 border-stone-200 h-full flex flex-col justify-between'>
      <CardContent className="p-5 flex flex-col flex-1 gap-4">
        {/* Top row */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex flex-wrap gap-1.5">
            <Badge className="bg-amber-600 hover:bg-amber-700 text-xs">{sport}</Badge>
            <Badge variant="outline" className="text-xs">{type}</Badge>
            {isNew && (
              <Badge className="bg-green-600 hover:bg-green-700 text-xs">New</Badge>
            )}
          </div>
        </div>

        {/* Title & category */}
        <div>
          <h3 className="font-semibold text-base leading-snug line-clamp-2 group-hover:text-amber-700 transition-colors">
            {title}
          </h3>
          <p className="text-sm text-muted-foreground mt-0.5">{category}</p>
        </div>

        {/* Meta */}
        <div className="flex flex-col gap-1.5 text-sm text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 shrink-0" />
            <span>{city}</span>
          </div>
          {salary && (
            <div className="flex items-center gap-1.5">
              <DollarSign className="w-3.5 h-3.5 shrink-0" />
              <span>{salary}</span>
            </div>
          )}
          <div className="flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 shrink-0" />
            <span>{timeAgo(postedDate)}</span>
          </div>
        </div>

        {/* Description snippet */}
        <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed flex-1">
          {description}
        </p>

        {/* Actions */}
        <div className="flex gap-2 pt-1">
          <Button
            asChild
            variant="outline"
            size="sm"
            className="flex-1 rounded-full text-xs"
          >
            <Link href={`/opportunities/${id}`}>Learn More</Link>
          </Button>
          <Button
            asChild
            size="sm"
            className="flex-1 bg-black hover:bg-black/90 rounded-full text-xs"
          >
            <Link href={`/opportunities/${id}/apply`}>Apply Now</Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}