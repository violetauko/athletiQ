import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Trophy, Users, Target, Heart } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'

export default function AboutPage() {
  const values = [
    {
      icon: <Trophy className="w-8 h-8" />,
      title: 'Excellence',
      description: 'We strive for excellence in everything we do, from athlete recruitment to organizational partnerships.',
    },
    {
      icon: <Users className="w-8 h-8" />,
      title: 'Community',
      description: 'Building a strong community of athletes, coaches, and sports organizations worldwide.',
    },
    {
      icon: <Target className="w-8 h-8" />,
      title: 'Opportunity',
      description: 'Creating opportunities for athletes to reach their full potential and achieve their dreams.',
    },
    {
      icon: <Heart className="w-8 h-8" />,
      title: 'Passion',
      description: 'Driven by passion for sports and dedication to helping athletes succeed.',
    },
  ]

  const stats = [
    { number: '10,000+', label: 'Athletes' },
    { number: '500+', label: 'Organizations' },
    { number: '50+', label: 'Countries' },
    { number: '2,700+', label: 'Opportunities' },
  ]

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-stone-900 to-black text-white py-24">
        <div className="container">
          <div className="max-w-3xl">
            <h1 className="text-5xl md:text-6xl font-bold mb-6">
              About AthletiQ
            </h1>
            <p className="text-xl text-white/80 leading-relaxed">
              We're on a mission to connect talented athletes with world-class sports organizations, 
              creating opportunities that transform careers and lives.
            </p>
          </div>
        </div>
      </section>

      {/* Story Section */}
      <section className="py-20 bg-white">
        <div className="container">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="relative h-96 lg:h-[500px] rounded-2xl overflow-hidden">
              <Image
                src="https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=800&q=80"
                alt="Athletes training"
                fill
                className="object-cover"
              />
            </div>

            <div className="space-y-6">
              <h2 className="text-4xl font-bold">Our Story</h2>
              <div className="space-y-4 text-muted-foreground">
                <p>
                  Founded in 2020, AthletiQ was born from a simple observation: talented athletes 
                  worldwide were struggling to find the right opportunities, while sports organizations 
                  were having difficulty discovering and recruiting top talent.
                </p>
                <p>
                  We set out to bridge this gap by creating a platform that makes athlete recruitment 
                  transparent, efficient, and accessible to everyone. Today, we're proud to serve 
                  thousands of athletes and hundreds of organizations across the globe.
                </p>
                <p>
                  Our platform has facilitated thousands of successful placements, helping athletes 
                  at every level - from promising youth talents to seasoned professionals - find their 
                  perfect match.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-gradient-to-br from-amber-50 to-stone-100">
        <div className="container">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-5xl font-bold text-amber-700 mb-2">
                  {stat.number}
                </div>
                <div className="text-muted-foreground font-medium">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-20 bg-white">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">Our Values</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              The principles that guide everything we do
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((value, index) => (
              <Card key={index} className="p-8 text-center space-y-4 hover:shadow-lg transition-shadow">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-amber-200 to-amber-100 rounded-2xl">
                  {value.icon}
                </div>
                <h3 className="text-xl font-bold">{value.title}</h3>
                <p className="text-muted-foreground text-sm">
                  {value.description}
                </p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-20 bg-gradient-to-br from-stone-50 to-white">
        <div className="container">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold mb-4">Our Mission</h2>
            </div>

            <Card className="p-12 bg-gradient-to-br from-amber-50 to-white border-amber-200">
              <p className="text-xl text-center leading-relaxed text-muted-foreground">
                To democratize access to sports opportunities by creating a transparent, efficient, 
                and inclusive platform that empowers athletes to achieve their dreams and helps 
                organizations discover exceptional talent from around the world.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-20 bg-white">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">Meet Our Team</h2>
            <p className="text-xl text-muted-foreground">
              Passionate professionals dedicated to your success
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                name: 'Michael Johnson',
                role: 'CEO & Founder',
                image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=80',
              },
              {
                name: 'Sarah Williams',
                role: 'Head of Recruitment',
                image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&q=80',
              },
              {
                name: 'David Chen',
                role: 'Chief Technology Officer',
                image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&q=80',
              },
            ].map((member, index) => (
              <div key={index} className="text-center">
                <div className="relative w-48 h-48 mx-auto mb-4 rounded-full overflow-hidden border-4 border-amber-200">
                  <Image
                    src={member.image}
                    alt={member.name}
                    fill
                    className="object-cover"
                  />
                </div>
                <h3 className="text-xl font-bold mb-1">{member.name}</h3>
                <p className="text-muted-foreground">{member.role}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-stone-900 to-black text-white">
        <div className="container text-center">
          <h2 className="text-4xl font-bold mb-6">
            Ready to Join AthletiQ?
          </h2>
          <p className="text-xl text-white/80 mb-8 max-w-2xl mx-auto">
            Whether you're an athlete looking for opportunities or an organization seeking talent, 
            we're here to help you succeed.
          </p>
          <div className="flex gap-4 justify-center">
            <Button size="lg" className="bg-white text-black hover:bg-white/90 rounded-full px-8" asChild>
              <Link href="/register">Get Started</Link>
            </Button>
            <Button size="lg" variant="outline" className="rounded-full px-8 text-white border-white hover:bg-white/10" asChild>
              <Link href="/contact">Contact Us</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}