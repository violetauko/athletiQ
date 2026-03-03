// components/opportunities/latest-opportunities.tsx (Server Component with ISR)
import { OpportunityCard } from './opportunity-card'
import Link from 'next/link'

import { getLatestOpportunities } from '@/lib/opportunites'

export default async function LatestOpportunities() {
  const data = await getLatestOpportunities()
  const opportunities = data.opportunities || []

  if (!opportunities.length) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">No opportunities available at the moment.</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {opportunities.map((opportunity: any, index: number) => (
        <Link href={`/opportunities/${opportunity.id}`} key={opportunity.id}>
          <div
            className="animate-slide-up cursor-pointer h-full"
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <OpportunityCard {...opportunity} />
          </div>
        </Link>
      ))}
    </div>
  )
}