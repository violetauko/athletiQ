// components/home/stats-section.tsx (Server Component)
import { prisma } from '@/lib/prisma'


async function getStats() {
  try {
    const [totalAthletes, totalSports, totalOpportunities] = await Promise.all([
      prisma.athleteProfile.count(),
      prisma.sport.count(),
      prisma.opportunity.count(), // Assuming you have an Opportunity model
    ])

    // Get unique locations for countries
    const locations = await prisma.athleteProfile.findMany({
      distinct: ['location'],
      where: { location: { not: null } },
      select: { location: true }
    })

    return {
      totalAthletes: totalAthletes.toLocaleString() + '+',
      totalSports: totalSports.toLocaleString() + '+',
      totalCountries: locations.length.toLocaleString() + '+',
      totalOpportunities: totalOpportunities.toLocaleString() + '+',
    }
  } catch (error) {
    console.error('Error fetching stats:', error)
    return {
      totalAthletes: '10,000+',
      totalSports: '25+',
      totalCountries: '50+',
      totalOpportunities: '500+',
    }
  }
}

export default async function StatsSection() {
  const stats = await getStats()

  return (
    <section className="py-12 bg-stone-50">
      <div className="container">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {[
            { label: 'Total Athletes', value: stats.totalAthletes },
            { label: 'Sports', value: stats.totalSports },
            { label: 'Countries', value: stats.totalCountries },
            { label: 'Opportunities', value: stats.totalOpportunities },
          ].map((stat, index) => (
            <div key={index} className="text-center group">
              <div className="text-4xl font-bold text-amber-700 mb-2 group-hover:scale-110 transition-transform">
                {stat.value}
              </div>
              <div className="text-sm text-muted-foreground font-medium">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}