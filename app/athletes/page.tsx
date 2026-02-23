import { AthleteCard } from '@/components/athletes/athlete-card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Search, Filter, Trophy } from 'lucide-react'
import TitleCard from '@/components/shared/title-card'
import Link from 'next/link'

export default function AthletesPage() {
  // Mock data - in production, this would come from API/database
  const athletes = [
    {
      name: 'Sarah Johnson',
      sport: 'Basketball',
      position: 'Point Guard',
      imageUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&q=80',
      achievements: ['State Champion 2023', 'MVP Award'],
      gpa: 3.9,
      experience: 'Advanced',
    },
    {
      name: 'Michael Chen',
      sport: 'Soccer',
      position: 'Midfielder',
      imageUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=80',
      achievements: ['Regional Champion', 'Top Scorer 2023'],
      gpa: 3.7,
      experience: 'Professional',
    },
    {
      name: 'Emma Rodriguez',
      sport: 'Track & Field',
      position: '100m Sprinter',
      imageUrl: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&q=80',
      achievements: ['National Record Holder', 'Olympic Qualifier'],
      gpa: 3.8,
      experience: 'Professional',
    },
    {
      name: 'James Wilson',
      sport: 'Swimming',
      position: 'Freestyle',
      imageUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&q=80',
      achievements: ['State Champion', 'Junior Olympics'],
      gpa: 3.6,
      experience: 'Advanced',
    },
    {
      name: 'Sofia Martinez',
      sport: 'Tennis',
      position: 'Singles',
      imageUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&q=80',
      achievements: ['Regional Champion', 'National Ranking #12'],
      gpa: 4.0,
      experience: 'Advanced',
    },
    {
      name: 'David Kim',
      sport: 'Baseball',
      position: 'Pitcher',
      imageUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&q=80',
      achievements: ['All-Star Team', 'Perfect Game Award'],
      gpa: 3.5,
      experience: 'Advanced',
    },
    {
      name: 'Isabella Brown',
      sport: 'Volleyball',
      position: 'Outside Hitter',
      imageUrl: 'https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=400&q=80',
      achievements: ['Conference Champion', 'Player of the Year'],
      gpa: 3.9,
      experience: 'Advanced',
    },
    {
      name: 'Marcus Thompson',
      sport: 'American Football',
      position: 'Quarterback',
      imageUrl: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=400&q=80',
      achievements: ['Division Champion', 'All-Conference'],
      gpa: 3.4,
      experience: 'Advanced',
    },
  ]

  const sports = [
    'All Sports',
    'Basketball',
    'Soccer',
    'Track & Field',
    'Swimming',
    'Tennis',
    'Baseball',
    'Volleyball',
  ]

  return (
    <div className="flex flex-col ">
      {/* Page Header */}
      <div className="my-12">
        <TitleCard
          image="https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=800&q=80"
          title="Discover Talented Athletes"
          icon={<Trophy className="w-12 h-12 text-amber-400" />}
          description="Connect with exceptional athletes across all sports disciplines."
        />
      </div>

      {/* Search and Filter Section */}
      <section className="bg-white border-b sticky top-16 z-40 rounded-2xl">
        <div className="container py-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 flex gap-2">
              <Input
                placeholder="Search by name, sport, or position..."
                className="flex-1"
              />
              <Button className="bg-black hover:bg-black/90">
                <Search className="w-4 h-4 mr-2" />
                Search
              </Button>
            </div>
            <Button variant="outline" className="gap-2">
              <Filter className="w-4 h-4" />
              Filters
            </Button>
          </div>

          {/* Quick Filters */}
          <div className="flex flex-wrap gap-2 mt-4">
            {sports.map((sport) => (
              <Button
                key={sport}
                variant={sport === 'All Sports' ? 'default' : 'outline'}
                size="sm"
                className="rounded-full"
              >
                {sport}
              </Button>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-8 bg-linear-to-br from-amber-50 to-stone-100">
        <div className="container">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { label: 'Total Athletes', value: '10,000+' },
              { label: 'Sports', value: '25+' },
              { label: 'Countries', value: '50+' },
              { label: 'Success Rate', value: '92%' },
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

      {/* Athletes Grid */}
      <section className="py-12 flex-1">
        <div className="">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl font-bold mb-2">Featured Athletes</h2>
              <p className="text-muted-foreground">
                Showing <span className="font-semibold text-foreground">{athletes.length}</span> athletes
              </p>
            </div>
            <div className="flex gap-2 items-center">
              <span className="text-sm text-muted-foreground">Sort by:</span>
              <Button variant="outline" size="sm">
                Most Recent
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {athletes.map((athlete, index) => (
              <div
                key={index}
                className="animate-slide-up"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className="group">
                  <AthleteCard {...athlete} />
                  <div className="mt-3 space-y-2">
                    <div className="flex flex-wrap gap-1">
                      {athlete.achievements.slice(0, 2).map((achievement, i) => (
                        <Badge
                          key={i}
                          variant="outline"
                          className="text-xs"
                        >
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
              </div>
            ))}
          </div>

          {/* Pagination */}
          <div className="flex justify-center gap-2 mt-12">
            <Button variant="outline" disabled>
              Previous
            </Button>
            <Button variant="default" className="bg-black">
              1
            </Button>
            <Button variant="outline">2</Button>
            <Button variant="outline">3</Button>
            <Button variant="outline">Next</Button>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-linear-to-br from-stone-900 to-black text-white mb-12 rounded-2xl">
        <div className="container text-center">
          <h2 className="text-4xl font-bold mb-4">Are You an Athlete?</h2>
          <p className="text-xl text-white/80 mb-8 max-w-2xl mx-auto">
            Create your profile and get discovered by top sports organizations worldwide
          </p>
          <div className="flex gap-4 justify-center">
            <Link href={'/register'}>
              <Button
                size="lg"
                className="bg-white text-black hover:bg-white/90 rounded-full px-8"
              >
                Create Profile
              </Button>
            </Link>
            <Link href={'/about'}>
              <Button
                size="lg"
                variant="outline"
                className="rounded-full px-8 text-black border-white hover:bg-white/10"
              >
                Learn More
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}