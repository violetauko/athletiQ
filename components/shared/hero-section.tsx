'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Search } from 'lucide-react'
import Image from 'next/image'
import RoundedImage from './rounded-image'
import Link from 'next/link'
import CustomersWeServe from '../customer-serve'

export function HeroSection() {

  return (
    <section className="relative w-full min-h-150 flex flex-col items-center justify-center overflow-hidden">
      <div className='container w-full flex items-center justify-between my-7'>
        <div className="space-y-4 w-2/3">
          <h1 className="text-5xl md:text-6xl font-bold leading-tight">
            Take the Next Step in Your Career with Us
          </h1>
        </div>
        <div className='flex items-start justify-evenly space-x-3'>
          <RoundedImage 
              image='https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=1920&q=80'
              alt='Profile'
              size={16}
            />
          <RoundedImage 
              image='https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=1920&q=80'
              alt='Profile'
              size={16}
            />
          <RoundedImage 
              image='https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=1920&q=80'
              alt='Profile'
              size={16}
            />
          <RoundedImage 
              image='https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=1920&q=80'
              alt='Profile'
              size={16}
            />
        </div>
      </div>

      {/* Content */}
      <div className="container relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center pb-20 mt-10">
        <div className="space-y-8 text-white h-full">

          {/* Search Box */}
          <div className="relative overflow-hidden rounded-2xl p-6 shadow-2xl h-full">

            {/* Background Image */}
            <Image
              src="https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=1920&q=80"
              alt="Athletes in action"
              fill
              className="object-cover"
              priority
            />

            {/* Optional Dark Overlay */}
            <div className="absolute inset-0 bg-black/40" />

            {/* Content (must be relative + higher z-index) */}
            <div className="relative z-10 flex flex-col justify-between h-full">
              <div className='mt-3'>
                <h3 className="text-white font-semibold text-lg">
                  LOOKING FOR AN OPPORTUNITY
                </h3>

                <p className="text-white/80 text-sm">
                  Find your perfect match in sports recruitment
                </p>
              </div>

              <div>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                  <Input placeholder="Sport or Keyword" className="bg-white/90" />
                  <Input placeholder="All Sports" className="bg-white/90" />
                  <Input placeholder="All Locations" className="bg-white/90" />

                  <Button className="w-full md:w-auto bg-black hover:bg-black/90 rounded-full px-8">
                    <Search className="w-4 h-4 mr-2" />
                    Search
                  </Button>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* Right Side - Stats */}
        <div className="grid grid-cols-1 gap-6">
          {/* Managing Stats */}
          <div className="bg-black/80 backdrop-blur-sm rounded-2xl p-8 border border-white/10">
            <h3 className="text-white font-bold text-xl mb-4">RECRUITING EXCELLENCE</h3>
            <p className="text-white/80 text-sm mb-6">
              Connect with top talent across all sports disciplines
            </p>
            <Link href="/apply">
              <Button className="bg-white text-black hover:bg-white/90 rounded-full">
                Apply Now
              </Button>
            </Link>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-linear-to-br from-amber-900/80 to-amber-800/80 backdrop-blur-sm rounded-xl p-6 border border-white/10">
              <div className="text-4xl font-bold text-white mb-2">500+</div>
              <div className="text-white/90 text-sm">Organizations</div>
              <p className="text-white/70 text-xs mt-2">
                Leading sports organizations trust us
              </p>
            </div>
            
            <div className="bg-linear-to-br from-yellow-700/80 to-yellow-600/80 backdrop-blur-sm rounded-xl p-6 border border-white/10">
              <div className="text-4xl font-bold text-white mb-2">2,700+</div>
              <div className="text-white/90 text-sm">Active Opportunities</div>
              <p className="text-white/70 text-xs mt-2">
                Find your perfect position today
              </p>
            </div>
          </div>
        </div>
      </div>
      <CustomersWeServe />
    </section>
  )
}
