'use client';
import { HeroSection } from '@/components/shared/hero-section'
import { OpportunityCard } from '@/components/opportunities/opportunity-card'
import { CategoryCard } from '@/components/shared/category-card'
import { AthleteCard } from '@/components/athletes/athlete-card'
import { Button } from '@/components/ui/button'
import { Dumbbell, Users, GraduationCap, TrendingUp, Briefcase, Trophy } from 'lucide-react'
import Link from 'next/link'
import TitleCard from '@/components/shared/title-card'
import { useRouter } from 'next/navigation';

export default function HomePage() {
  const router = useRouter()
  // Mock data - in production, this would come from API/database
  const latestOpportunities = [
    {
      id: '1',
      title: 'Division 2 Rugby In Poland',
      sport: 'Rugby',
      category: 'Professional Sports',
      location: 'Melbourne, Victoria',
      city: 'Melbourne',
      type: 'Full Time',
      salaryMin: 60000,
      salaryMax: 75000,
      description: 'We are seeking talented basketball players to join our professional team. This is an excellent opportunity for athletes looking to take their career to the next level.',
      postedDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      isNew: true,
    },
    {
      id: '2',
      title: 'Soccer Scout',
      sport: 'Soccer',
      category: 'Sports Management',
      location: 'New York, New York',
      city: 'New York',
      type: 'Contract',
      salaryMin: 40000,
      salaryMax: 55000,
      description: 'Join our scouting team to identify and recruit promising soccer talent. Requires extensive knowledge of the sport and player development.',
      postedDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      isNew: true,
    },
    {
      id: '3',
      title: 'Track & Field Coach',
      sport: 'Track & Field',
      category: 'Coaching',
      location: 'Horsham, Surrey',
      city: 'Horsham',
      type: 'Full Time',
      salaryMin: 55000,
      salaryMax: 70000,
      description: 'Lead our track and field program with expertise in sprint and distance training. Develop athletes to reach their maximum potential.',
      postedDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      isNew: true,
    },
    {
      id: '4',
      title: 'Swimming Performance Analyst',
      sport: 'Swimming',
      category: 'Sports Science',
      location: 'Munich, Bavaria',
      city: 'Munich',
      type: 'Contract',
      salaryMin: 48000,
      salaryMax: 62000,
      description: 'Analyze swimmer performance metrics and provide data-driven insights to improve technique and competitive results.',
      postedDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
      isNew: true,
    },
  ]

  const categories = [
    {
      name: 'Professional Sports',
      icon: <Trophy className="w-6 h-6" />,
      imageUrl: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=600&q=80',
      href: '/opportunities?category=professional',
      color: 'from-stone-300 to-stone-200',
    },
    {
      name: 'College Athletics',
      icon: <GraduationCap className="w-6 h-6" />,
      imageUrl: 'https://images.unsplash.com/photo-1577471488278-16eec37ffcc2?w=600&q=80',
      href: '/opportunities?category=college',
      color: 'from-amber-200 to-yellow-100',
    },
    {
      name: 'Coaching & Training',
      icon: <Users className="w-6 h-6" />,
      imageUrl: 'https://images.unsplash.com/photo-1571902943202-507ec2618e8f?w=600&q=80',
      href: '/opportunities?category=coaching',
      color: 'from-stone-200 to-amber-100',
    },
    {
      name: 'Sports Science',
      icon: <TrendingUp className="w-6 h-6" />,
      imageUrl: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=600&q=80',
      href: '/opportunities?category=science',
      color: 'from-sky-200 to-blue-100',
    },
    {
      name: 'Sports Management',
      icon: <Briefcase className="w-6 h-6" />,
      imageUrl: 'https://images.unsplash.com/photo-1560272564-c83b66b1ad12?w=600&q=80',
      href: '/opportunities?category=management',
      color: 'from-amber-200 to-amber-100',
    },
    {
      name: 'Youth Development',
      icon: <Dumbbell className="w-6 h-6" />,
      imageUrl: 'https://images.unsplash.com/photo-1609710228159-0fa9bd7c0827?w=600&q=80',
      href: '/opportunities?category=youth',
      color: 'from-green-200 to-emerald-100',
    },
  ]

  const featuredAthletes = [
    {
      name: 'Sarah Johnson',
      sport: 'Basketball',
      position: 'Point Guard',
      imageUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&q=80',
    },
    {
      name: 'Michael Chen',
      sport: 'Soccer',
      position: 'Midfielder',
      imageUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=80',
    },
    {
      name: 'Emma Rodriguez',
      sport: 'Track & Field',
      position: 'Sprinter',
      imageUrl: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&q=80',
    },
    {
      name: 'James Wilson',
      sport: 'Swimming',
      position: 'Freestyle',
      imageUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&q=80',
    },
  ]

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <HeroSection />

      {/* Benefits Section */}
      <section className="py-12 md:py-16">
        <div className="container">
          <div className="border-t border-gray-500 mb-20"></div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-12 items-start">
            <div className="space-y-3 md:space-y-6">
              <h2 className="text-2xl md:text-4xl font-bold">
                Recruitment Benefits With Us
              </h2>
              <p className="text-muted-foreground text-base md:text-lg">
                Join the leading platform connecting athletes with opportunities worldwide. 
                We've been the trusted partner for sports recruitment since our founding.
              </p>
              <Button className="rounded-full bg-black hover:bg-black/90">
                Our Services
              </Button>
            </div>

            <div className="space-y-4">
              {[
                {
                  title: 'Global Network',
                  description: 'Connect with sports organizations across 50+ countries',
                },
                {
                  title: 'Expert Guidance',
                  description: 'Get personalized career counseling from industry professionals',
                },
                {
                  title: 'Verified Opportunities',
                  description: 'All positions are verified and vetted for authenticity',
                },
              ].map((benefit, index) => (
                <div key={index} className="flex gap-4 p-6 bg-white rounded-xl shadow-sm border border-stone-200">
                  <div className="shrink-0 w-12 h-12 bg-linear-to-br from-amber-200 to-amber-100 rounded-xl flex items-center justify-center">
                    <div className="w-6 h-6 bg-amber-500 rounded-md" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-amber-700">{benefit.title}</h3>
                    <p className="text-sm text-muted-foreground">{benefit.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

        <div className="border-t border-gray-500 mt-20"></div>
        </div>
      </section>

      {/* Team Section */}
      <section >
        <div className="container space-y-8">
          <div className="text-start space-y-1 md:space-y-2">
            <p className="text-sm font-semibold text-muted-foreground tracking-wider uppercase mb2 md:mb-4">
              The Team
            </p>
            <h2 className="text-2xl md:text-4xl font-bold">Our Dedicated Team</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6">
            {featuredAthletes.map((athlete, index) => (
              <div key={index} className="animate-slide-up" style={{ animationDelay: `${index * 100}ms` }}>
                <AthleteCard {...athlete} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories/Sectors Section */}
      <section className="py-16">
        <div className="container space-y-4 md:space-y-8">
          <div className="space-y-2 flex flex-col md:flex-row justify-evenly">
            <h2 className="text-2xl md:text-4xl text-start font-bold w-full">Our Sectors</h2>
            <p className="text-muted-foreground text-base md:text-lg max-w-3xl w-full text-start">
              Explore opportunities across various sports sectors and find the perfect match for your skills and ambitions.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6 md:mt-12">
            {categories.map((category, index) => (
              <div key={index} className="animate-slide-up" style={{ animationDelay: `${index * 100}ms` }}>
                <CategoryCard {...category} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Latest Opportunities */}
      <section className="py-7">
        <div className="container space-y-8">
          <div className="flex items-center justify-between mb-6 md:mb-12">
            <h2 className="text-2xl md:text-4xl font-bold">Our Latest Opportunities</h2>
            <Button variant="outline" className="rounded-full" asChild>
              <Link href="/opportunities">View All</Link>
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {latestOpportunities.map((opportunity, index) => (
              <div key={opportunity.id} className="animate-slide-up" style={{ animationDelay: `${index * 100}ms` }}>
                <OpportunityCard {...opportunity} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-10 md:py-16">
        <div className="container">
          <div className="border-t border-gray-500 mb-20"></div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-12 items-center">
            <div className="space-y-3 md:space-y-6">
              <h2 className="text-2xl md:text-4xl font-bold">Testimonials</h2>
              <p className="text-muted-foreground text-base md:text-lg">
                Hear what athletes and organizations say about their experience with AthletiQ
              </p>
              <Button className="bg-black hover:bg-black/90 rounded-full">
                Show More
              </Button>
            </div>

            <div className="bg-linear-to-br from-stone-100 to-amber-50 rounded-2xl p-8 shadow-lg border border-stone-200 py-10">
              <div className="flex items-start gap-4 mb-6">
                <div className="w-16 h-16 rounded-full overflow-hidden shrink-0 border-2 border-white shadow-md">
                  <img
                    src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&q=80"
                    alt="Testimonial"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <h3 className="font-bold text-lg">Alex Thompson</h3>
                  <p className="text-sm text-muted-foreground">Professional Athlete</p>
                  <p className="text-sm text-muted-foreground font-semibold">Track & Field</p>
                </div>
              </div>
              <p className="text-muted-foreground leading-relaxed">
                "I am writing to express my sincere appreciation for the support you provided during my recruitment journey. 
                Your expertise and guidance were invaluable in helping me navigate the process and ultimately secure a position 
                that is a great fit for my skills and career goals."
              </p>
            </div>
          </div>
          <div className="border-t border-gray-500 mt-20"></div>
        </div>
      </section>

      {/* Contact CTA Section */}
      <section className="min-h-80 pt-12 pb-20">
        <TitleCard
          image="https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=1920&q=80"
          title='Contact Us'
          description='Ready to take the next step? Get in touch with our team today.'
          action="Let's Talk"
          onClick={()=>router.push("/contact")}
          />
      </section>

    </div>
  )
}
