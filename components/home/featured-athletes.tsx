import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import { AthleteCard } from '../athletes/athlete-card'
import { getFeaturedAthletes } from '@/lib/athletes'

export async function FeaturedAthletes() {
  const athletes = await getFeaturedAthletes()

  if (!athletes.length) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">No featured athletes available.</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {athletes.map((athlete: any, index: number) => (
        <Link href={`/athletes/${athlete.id}`} key={athlete.id}>
          <div
            className="animate-slide-up cursor-pointer group"
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <AthleteCard {...athlete} />
            <div className="mt-3 space-y-2">
              <div className="flex flex-wrap gap-1">
                {athlete.achievements?.slice(0, 2).map((achievement: string, i: number) => (
                  <Badge key={i} variant="outline" className="text-xs">
                    {achievement}
                  </Badge>
                ))}
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">GPA: {athlete.gpa}</span>
                <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
                  {athlete.experience}
                </Badge>
              </div>
            </div>
          </div>
        </Link>
      ))}
    </div>
  )
}