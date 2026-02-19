import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar, 
  Trophy, 
  Target,
  Activity,
  GraduationCap,
  Video
} from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'

// Mock data - replace with actual API call
async function getAthlete(id: string) {
  return {
    id,
    firstName: 'Sarah',
    lastName: 'Johnson',
    email: 'sarah.johnson@example.com',
    phone: '+1 (555) 123-4567',
    location: 'Los Angeles, California',
    dateOfBirth: new Date('2000-03-15'),
    gender: 'Female',
    profileImage: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&q=80',
    bio: 'Passionate basketball player with 8 years of competitive experience. Dedicated to excellence on and off the court. Looking to take my career to the professional level.',
    
    // Physical Stats
    height: 180, // cm
    weight: 70, // kg
    
    // Sports Info
    primarySport: 'Basketball',
    secondarySports: ['Track & Field', 'Volleyball'],
    position: 'Point Guard',
    experience: 'Advanced',
    
    // Achievements
    achievements: [
      'State Championship Winner 2022',
      'MVP Award 2023',
      'All-Star Team Selection 2022-2023',
      'Team Captain 2022-2023',
      'Top Scorer in Conference 2023',
    ],
    
    // Academic
    gpa: 3.8,
    graduationYear: 2024,
    currentSchool: 'UCLA',
    
    // Stats
    stats: {
      gamesPlayed: 120,
      avgPoints: 18.5,
      avgAssists: 6.2,
      avgRebounds: 4.8,
    },
    
    // Media
    videoHighlights: [
      'https://example.com/highlight1.mp4',
      'https://example.com/highlight2.mp4',
    ],
  }
}

export default async function AthleteProfilePage({ 
  params 
}: { 
  params: { id: string } 
}) {
  const athlete = await getAthlete(params.id)
  const age = new Date().getFullYear() - athlete.dateOfBirth.getFullYear()

  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-50 to-white">
      {/* Header Section */}
      <section className="bg-gradient-to-br from-stone-900 to-black text-white py-12">
        <div className="container">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 items-start">
            {/* Profile Image */}
            <div className="md:col-span-1">
              <div className="relative w-48 h-48 mx-auto md:mx-0 rounded-full overflow-hidden border-4 border-white shadow-2xl">
                <Image
                  src={athlete.profileImage}
                  alt={`${athlete.firstName} ${athlete.lastName}`}
                  fill
                  className="object-cover"
                />
              </div>
            </div>

            {/* Profile Info */}
            <div className="md:col-span-3 space-y-4">
              <div>
                <h1 className="text-4xl md:text-5xl font-bold mb-2">
                  {athlete.firstName} {athlete.lastName}
                </h1>
                <div className="flex flex-wrap gap-2 mb-4">
                  <Badge className="bg-amber-500 text-white">
                    {athlete.primarySport}
                  </Badge>
                  <Badge variant="outline" className="text-white border-white">
                    {athlete.position}
                  </Badge>
                  <Badge variant="outline" className="text-white border-white">
                    {athlete.experience}
                  </Badge>
                </div>
                <p className="text-white/80 text-lg max-w-3xl">
                  {athlete.bio}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
                <div className="flex items-center gap-2 text-white/80">
                  <MapPin className="w-5 h-5" />
                  <span>{athlete.location}</span>
                </div>
                <div className="flex items-center gap-2 text-white/80">
                  <Calendar className="w-5 h-5" />
                  <span>{age} years old</span>
                </div>
                <div className="flex items-center gap-2 text-white/80">
                  <Mail className="w-5 h-5" />
                  <span>{athlete.email}</span>
                </div>
                <div className="flex items-center gap-2 text-white/80">
                  <Phone className="w-5 h-5" />
                  <span>{athlete.phone}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-12">
        <div className="container">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Stats & Info */}
            <div className="lg:col-span-1 space-y-6">
              {/* Physical Stats */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="w-5 h-5" />
                    Physical Stats
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Height</span>
                    <span className="font-semibold">{athlete.height} cm</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Weight</span>
                    <span className="font-semibold">{athlete.weight} kg</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Position</span>
                    <span className="font-semibold">{athlete.position}</span>
                  </div>
                </CardContent>
              </Card>

              {/* Academic Info */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <GraduationCap className="w-5 h-5" />
                    Academic
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">School</span>
                    <span className="font-semibold">{athlete.currentSchool}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">GPA</span>
                    <span className="font-semibold">{athlete.gpa.toFixed(1)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Graduation</span>
                    <span className="font-semibold">{athlete.graduationYear}</span>
                  </div>
                </CardContent>
              </Card>

              {/* Sports */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="w-5 h-5" />
                    Sports
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <div className="text-sm text-muted-foreground mb-2">Primary Sport</div>
                    <Badge className="bg-amber-600">{athlete.primarySport}</Badge>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground mb-2">Secondary Sports</div>
                    <div className="flex flex-wrap gap-2">
                      {athlete.secondarySports.map((sport, index) => (
                        <Badge key={index} variant="outline">{sport}</Badge>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* CTA */}
              <Card className="bg-gradient-to-br from-amber-50 to-stone-50 border-amber-200">
                <CardContent className="p-6 space-y-4">
                  <div className="text-center">
                    <h3 className="font-bold text-lg mb-2">Interested in recruiting?</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Contact this athlete directly
                    </p>
                    <Button className="w-full bg-black hover:bg-black/90 rounded-full">
                      Send Message
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Right Column - Achievements & Media */}
            <div className="lg:col-span-2 space-y-8">
              {/* Performance Stats */}
              <Card>
                <CardHeader>
                  <CardTitle>Performance Statistics</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    <div className="text-center p-4 bg-gradient-to-br from-amber-50 to-stone-50 rounded-lg">
                      <div className="text-3xl font-bold text-amber-700 mb-1">
                        {athlete.stats.gamesPlayed}
                      </div>
                      <div className="text-sm text-muted-foreground">Games Played</div>
                    </div>
                    <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-sky-50 rounded-lg">
                      <div className="text-3xl font-bold text-blue-700 mb-1">
                        {athlete.stats.avgPoints}
                      </div>
                      <div className="text-sm text-muted-foreground">Avg Points</div>
                    </div>
                    <div className="text-center p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg">
                      <div className="text-3xl font-bold text-green-700 mb-1">
                        {athlete.stats.avgAssists}
                      </div>
                      <div className="text-sm text-muted-foreground">Avg Assists</div>
                    </div>
                    <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-violet-50 rounded-lg">
                      <div className="text-3xl font-bold text-purple-700 mb-1">
                        {athlete.stats.avgRebounds}
                      </div>
                      <div className="text-sm text-muted-foreground">Avg Rebounds</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Achievements */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Trophy className="w-5 h-5" />
                    Achievements & Awards
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    {athlete.achievements.map((achievement, index) => (
                      <li 
                        key={index} 
                        className="flex items-start gap-3 p-3 bg-gradient-to-r from-amber-50 to-transparent rounded-lg"
                      >
                        <Trophy className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                        <span>{achievement}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

              {/* Video Highlights */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Video className="w-5 h-5" />
                    Highlight Videos
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {athlete.videoHighlights.map((video, index) => (
                      <div 
                        key={index}
                        className="aspect-video bg-gradient-to-br from-stone-200 to-stone-300 rounded-lg flex items-center justify-center"
                      >
                        <div className="text-center text-muted-foreground">
                          <Video className="w-12 h-12 mx-auto mb-2" />
                          <p className="text-sm">Highlight Video {index + 1}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}