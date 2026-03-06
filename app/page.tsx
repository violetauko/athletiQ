import { HeroSection } from '@/components/shared/hero-section'
import { Button } from '@/components/ui/button'
import { Dumbbell, Users, GraduationCap, TrendingUp, Briefcase, Trophy, Star, Shield, Globe } from 'lucide-react'
import Link from 'next/link'
import TitleCard from '@/components/shared/title-card'
import { CategoryCard } from '@/components/shared/category-card'
import { MemberCard } from '@/components/team/member-card'
import { LatestOpportunities } from '@/components/opportunities/latest-opportunities'
import { FeaturedAthletes } from '@/components/home/featured-athletes'
import { TestimonialsSection } from '@/components/home/testimonials-section'
import { StatsSection } from '@/components/home/stats-section'
import { Suspense } from 'react'

// Categories data - static, doesn't change often
const categories = [
  {
    name: 'Professional Sports',
    icon: <Trophy className="w-6 h-6" />,
    imageUrl: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=600&q=80',
    href: '/opportunities?category=professional',
    color: 'from-stone-300 to-stone-200',
    description: 'Professional contracts and opportunities'
  },
  {
    name: 'College Athletics',
    icon: <GraduationCap className="w-6 h-6" />,
    imageUrl: 'https://images.unsplash.com/photo-1577471488278-16eec37ffcc2?w=600&q=80',
    href: '/opportunities?category=college',
    color: 'from-amber-200 to-yellow-100',
    description: 'NCAA and college sports programs'
  },
  {
    name: 'Coaching & Training',
    icon: <Users className="w-6 h-6" />,
    imageUrl: 'https://images.unsplash.com/photo-1571902943202-507ec2618e8f?w=600&q=80',
    href: '/opportunities?category=coaching',
    color: 'from-stone-200 to-amber-100',
    description: 'Coaching positions and training roles'
  },
  {
    name: 'Sports Science',
    icon: <TrendingUp className="w-6 h-6" />,
    imageUrl: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=600&q=80',
    href: '/opportunities?category=science',
    color: 'from-sky-200 to-blue-100',
    description: 'Sports science and analytics'
  },
  {
    name: 'Sports Management',
    icon: <Briefcase className="w-6 h-6" />,
    imageUrl: 'https://images.unsplash.com/photo-1560272564-c83b66b1ad12?w=600&q=80',
    href: '/opportunities?category=management',
    color: 'from-amber-200 to-amber-100',
    description: 'Administration and management roles'
  },
  {
    name: 'Youth Development',
    icon: <Dumbbell className="w-6 h-6" />,
    imageUrl: 'https://images.unsplash.com/photo-1609710228159-0fa9bd7c0827?w=600&q=80',
    href: '/opportunities?category=youth',
    color: 'from-green-200 to-emerald-100',
    description: 'Youth sports and development programs'
  },
]

// Team data - static
const ourTeam = [
  {
    name: 'Cornellias Mokoro',
    position: 'Co-Founder & CEO',
    imageUrl: '/team/mokoro.jpeg',
    role: 'Leadership',
    linkedIn: 'https://linkedin.com/in/cornellias'
  },
  {
    name: 'Hezbon Obutu',
    position: 'Coordinator',
    imageUrl: '/team/hezbon.jpeg',
    role: 'Operations',
    linkedIn: 'https://linkedin.com/in/hezbon'
  },
]

// Benefits data - static
const benefits = [
  {
    title: 'Global Network',
    description: 'Connect with sports organizations across 50+ countries',
    icon: Globe,
    color: 'from-blue-200 to-blue-100'
  },
  {
    title: 'Expert Guidance',
    description: 'Get personalized career counseling from industry professionals',
    icon: Star,
    color: 'from-amber-200 to-amber-100'
  },
  {
    title: 'Verified Opportunities',
    description: 'All positions are verified and vetted for authenticity',
    icon: Shield,
    color: 'from-green-200 to-emerald-100'
  },
]

// Loading skeletons
function CategoriesSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {[...Array(6)].map((_, i) => (
        <div key={i} className="h-64 bg-stone-100 rounded-lg animate-pulse" />
      ))}
    </div>
  )
}

function TeamSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {[...Array(2)].map((_, i) => (
        <div key={i} className="h-80 bg-stone-100 rounded-lg animate-pulse" />
      ))}
    </div>
  )
}

export default function HomePage() {
  return (
    <div className="flex flex-col">
      {/* Hero Section - Static */}
      <HeroSection />

      {/* Benefits Section - Static */}
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
                We&apos;ve been the trusted partner for sports recruitment since our founding.
              </p>
              <Link href="/services">
                <Button className="rounded-full bg-black hover:bg-black/90">
                  Our Services
                </Button>
              </Link>
            </div>

            <div className="space-y-4">
              {benefits.map((benefit, index) => {
                const Icon = benefit.icon
                return (
                  <div 
                    key={index} 
                    className="flex gap-4 p-6 bg-white rounded-xl shadow-sm border border-stone-200 hover:shadow-md transition-shadow"
                  >
                    <div className={`shrink-0 w-12 h-12 bg-linear-to-br ${benefit.color} rounded-xl flex items-center justify-center`}>
                      <Icon className="w-6 h-6 text-stone-700" />
                    </div>
                    <div>
                      <h3 className="font-bold text-lg text-amber-700">{benefit.title}</h3>
                      <p className="text-sm text-muted-foreground">{benefit.description}</p>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          <div className="border-t border-gray-500 mt-20"></div>
        </div>
      </section>

      {/* Stats Section - Server Component with ISR */}
      <Suspense fallback={<StatsSectionSkeleton />}>
        <StatsSection />
      </Suspense>

      {/* Team Section - Static */}
      <section className="py-12">
        <div className="container space-y-8">
          <div className="text-start space-y-1 md:space-y-2">
            <p className="text-sm font-semibold text-muted-foreground tracking-wider uppercase mb-2 md:mb-4">
              The Team
            </p>
            <h2 className="text-2xl md:text-4xl font-bold">Our Dedicated Team</h2>
            <p className="text-muted-foreground max-w-2xl">
              Meet the passionate individuals behind AthletiQ, working tirelessly to connect athletes with opportunities.
            </p>
          </div>

          <Suspense fallback={<TeamSkeleton />}>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6">
              {ourTeam.map((team, index) => (
                <div 
                  key={index} 
                  className="animate-slide-up" 
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <MemberCard {...team} />
                </div>
              ))}
            </div>
          </Suspense>
        </div>
      </section>

      {/* Categories/Sectors Section - Static */}
      <section className="py-16 bg-stone-50">
        <div className="container space-y-4 md:space-y-8">
          <div className="space-y-2 flex flex-col md:flex-row justify-between items-start md:items-end">
            <div>
              <p className="text-sm font-semibold text-amber-600 tracking-wider uppercase mb-2">
                Our Sectors
              </p>
              <h2 className="text-2xl md:text-4xl font-bold">Explore by Category</h2>
            </div>
            <p className="text-muted-foreground text-base md:text-lg max-w-2xl">
              Discover opportunities across various sports sectors and find the perfect match for your skills and ambitions.
            </p>
          </div>

          <Suspense fallback={<CategoriesSkeleton />}>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6 md:mt-12">
              {categories.map((category, index) => (
                <div 
                  key={index} 
                  className="animate-slide-up h-full" 
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <CategoryCard {...category} />
                </div>
              ))}
            </div>
          </Suspense>
        </div>
      </section>

      {/* Featured Athletes - Dynamic */}
      <section className="py-16">
        <div className="container space-y-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
            <div>
              <p className="text-sm font-semibold text-amber-600 tracking-wider uppercase mb-2">
                Top Talent
              </p>
              <h2 className="text-2xl md:text-4xl font-bold">Featured Athletes</h2>
            </div>
            <Link href="/athletes">
              <Button variant="outline" className="rounded-full">
                View All Athletes
              </Button>
            </Link>
          </div>

          <Suspense fallback={<AthletesSkeleton />}>
            <FeaturedAthletes />
          </Suspense>
        </div>
      </section>

      {/* Latest Opportunities - Dynamic */}
      <section className="py-16 bg-stone-50">
        <div className="container space-y-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
            <div>
              <p className="text-sm font-semibold text-amber-600 tracking-wider uppercase mb-2">
                Fresh Opportunities
              </p>
              <h2 className="text-2xl md:text-4xl font-bold">Latest Opportunities</h2>
            </div>
            <Link href="/opportunities">
              <Button variant="outline" className="rounded-full">
                View All Opportunities
              </Button>
            </Link>
          </div>

          <Suspense fallback={<OpportunitiesSkeleton />}>
            <LatestOpportunities />
          </Suspense>
        </div>
      </section>

      {/* Testimonials Section - Static */}
      <TestimonialsSection />

      {/* Contact CTA Section - Static */}
      <section className="min-h-80 pt-12 pb-20">
        <TitleCard
          image="https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=1920&q=80"
          title="Contact Us"
          description="Ready to take the next step? Get in touch with our team today."
          action="Let's Talk"
          href="/contact"
        />
      </section>
    </div>
  )
}

// Skeleton Components
function StatsSectionSkeleton() {
  return (
    <section className="py-12 bg-stone-50">
      <div className="container">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="text-center">
              <div className="h-12 w-24 bg-stone-200 rounded-lg mx-auto mb-2 animate-pulse" />
              <div className="h-4 w-20 bg-stone-200 rounded mx-auto animate-pulse" />
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function AthletesSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="space-y-3">
          <div className="h-48 bg-stone-200 rounded-lg animate-pulse" />
          <div className="h-4 w-3/4 bg-stone-200 rounded animate-pulse" />
          <div className="h-4 w-1/2 bg-stone-200 rounded animate-pulse" />
        </div>
      ))}
    </div>
  )
}

function OpportunitiesSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="space-y-3">
          <div className="h-40 bg-stone-200 rounded-lg animate-pulse" />
          <div className="h-4 w-3/4 bg-stone-200 rounded animate-pulse" />
          <div className="h-4 w-1/2 bg-stone-200 rounded animate-pulse" />
          <div className="h-4 w-2/3 bg-stone-200 rounded animate-pulse" />
        </div>
      ))}
    </div>
  )
}