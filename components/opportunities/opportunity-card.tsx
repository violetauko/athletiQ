import Link from 'next/link'
import { Card, CardContent, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { MapPin, DollarSign, Briefcase, Clock } from 'lucide-react'
import { timeAgo, formatSalary } from '@/lib/utils'

interface OpportunityCardProps {
  id: string
  title: string
  sport: string
  category: string
  location: string
  city?: string
  type: string
  salaryMin?: number
  salaryMax?: number
  description: string
  postedDate: Date
  isNew?: boolean
}

export function OpportunityCard({
  id,
  title,
  sport,
  category,
  location,
  city,
  type,
  salaryMin,
  salaryMax,
  description,
  postedDate,
  isNew = false,
}: OpportunityCardProps) {
  return (
    <Card className="group hover:shadow-lg transition-all duration-300 bg-linear-to-br from-stone-100 to-amber-50 border-stone-200 h-full flex flex-col justify-between">
      <CardContent className="p-6 space-y-4">
        {/* Header with Badge */}
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            {isNew && (
              <Badge className="bg-black text-white text-xs">NEW</Badge>
            )}
            <Badge variant="outline" className="text-xs">
              {timeAgo(postedDate)}
            </Badge>
          </div>
        </div>

        {/* Title */}
        <div>
          <h3 className="text-xl sm:text-2xl font-bold mb-2 group-hover:text-primary transition-colors">
            {title}
          </h3>
          <p className="text-sm text-muted-foreground">{category}</p>
        </div>

        {/* Location and Details */}
        <div className="space-y-1 sm:space-y-2 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4" />
            <span>{city || location}</span>
          </div>
          <div className="flex items-center gap-2">
            <Briefcase className="w-4 h-4" />
            <span>{type}</span>
          </div>
          {salaryMin && salaryMax && (
            <div className="flex items-center gap-2">
              <DollarSign className="w-4 h-4" />
              <span>{formatSalary(salaryMin, salaryMax)}</span>
            </div>
          )}
        </div>

        {/* Description */}
        <p className="text-sm text-muted-foreground line-clamp-3">
          {description}
        </p>
      </CardContent>

      <CardFooter className="p-6 pt-0 flex gap-2">
        <Button 
          variant="default" 
          className="flex-1 bg-black hover:bg-black/90 rounded-full"
          asChild
        >
          <Link href={`/opportunities/${id}`}>Learn More</Link>
        </Button>
        <Button 
          variant="outline" 
          className="flex-1 rounded-full border-black hover:bg-black hover:text-white"
          asChild
        >
          <Link href={`/opportunities/${id}/apply`}>Apply Now</Link>
        </Button>
      </CardFooter>
    </Card>
  )
}
