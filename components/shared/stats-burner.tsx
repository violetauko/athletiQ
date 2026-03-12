import { getAthleteStats } from "@/lib/stats"

export const StatsBurner = async () => {
    // Fetch stats directly on the server
    let statsData = null
    try {
        statsData = await getAthleteStats()
    } catch (error) {
        console.error('Error fetching stats in StatsBurner:', error)
    }

    return (
        <section className="py-8 bg-linear-to-br from-amber-50 to-stone-100">
            <div className="container mx-auto">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    {[
                        { label: 'Total Athletes', value: statsData?.totalAthletes || '10,000+' },
                        { label: 'Sports', value: statsData?.totalSports || '25+' },
                        { label: 'Countries', value: statsData?.totalCountries || '50+' },
                        { label: 'Success Rate', value: statsData?.successRate || '92%' },
                    ].map((stat, index) => (
                        <div key={index} className="text-center">
                            <div className="text-4xl font-bold text-amber-700 mb-2">
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