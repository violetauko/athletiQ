'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Search, Users, Briefcase, Trophy, MapPin, Target, ChevronDown } from 'lucide-react'
import Image from 'next/image'
import RoundedImage from './rounded-image'
import Link from 'next/link'
import CustomersWeServe from '../customer-serve'
import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
// import { getSports } from '@/lib/sports' // Removed to avoid Prisma in browser
// import { getAthleteCount } from '@/lib/athletes' // Removed to avoid Prisma in browser

interface Sport {
  id: string
  name: string
}

export function HeroSection() {
  const router = useRouter()
  const [searchKeyword, setSearchKeyword] = useState('')
  const [searchSport, setSearchSport] = useState('')
  const [searchLocation, setSearchLocation] = useState('')
  const [isSearching, setIsSearching] = useState(false)
  const [isSportDropdownOpen, setIsSportDropdownOpen] = useState(false)
  const [sports, setSports] = useState<Sport[]>([])
  const [isLoadingSports, setIsLoadingSports] = useState(true)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const [dropdownPosition, setDropdownPosition] = useState<'bottom' | 'top'>('top')
  const [athletesCount, setAthletesCount] = useState(0)

  // Fetch sports from server using the getSports function
  useEffect(() => {
    const fetchSports = async () => {
      try {
        setIsLoadingSports(true)
        const sportsResponse = await fetch('/api/sports')
        const sportsData = await sportsResponse.json()
        setSports(sportsData.sports || [])
        const response = await fetch('/api/athlete/count')
        const countData = await response.json()
        setAthletesCount(countData.count || 0)
      } catch (error) {
        console.error('Error fetching sports:', error)
        // Fallback sports data in case of error
        setSports([
          { id: '1', name: 'Basketball' },
          { id: '2', name: 'Soccer' },
          { id: '3', name: 'Track & Field' },
          { id: '4', name: 'Swimming' },
          { id: '5', name: 'Tennis' },
          { id: '6', name: 'Baseball' },
          { id: '7', name: 'Volleyball' },
          { id: '8', name: 'American Football' },
          { id: '9', name: 'Golf' },
          { id: '10', name: 'Gymnastics' },
        ])
      } finally {
        setIsLoadingSports(false)
      }
    }

    fetchSports()
  }, [])

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsSportDropdownOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  useEffect(() => {
    if (isSportDropdownOpen && dropdownRef.current) {
      const rect = dropdownRef.current.getBoundingClientRect()
      const spaceBelow = window.innerHeight - rect.bottom
      const spaceAbove = rect.top

      const dropdownHeight = 240 // approx max-h-60 (15rem ≈ 240px)

      if (spaceBelow < dropdownHeight && spaceAbove > spaceBelow) {
        setDropdownPosition('bottom')
      } else {
        setDropdownPosition('top')
      }
    }
  }, [isSportDropdownOpen])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setIsSearching(true)

    // Build search params
    const params = new URLSearchParams()
    if (searchKeyword) params.append('q', searchKeyword)
    if (searchSport) params.append('sport', searchSport)
    if (searchLocation) params.append('location', searchLocation)

    // Navigate to opportunities page with search params
    router.push(`/opportunities?${params.toString()}`)

    setTimeout(() => setIsSearching(false), 500)
  }

  const handleQuickSearch = (type: string) => {
    switch (type) {
      case 'athletes':
        router.push('/athletes')
        break
      case 'opportunities':
        router.push('/opportunities')
        break
      case 'organizations':
        router.push('/organizations')
        break
    }
  }

  const selectSport = (sportName: string) => {
    setSearchSport(sportName)
    setIsSportDropdownOpen(false)
  }

  return (
    <section className="relative w-full min-h-150 flex flex-col items-center justify-center overflow-hidden">
      {/* <div className="w-full flex lg:flex-row 
                items-start lg:items-center 
                justify-between gap-6 my-7"> */}

      {/* Left Section */}
      {/* <div className="space-y-4 w-full sm:w-2/3">
            <h1 className="text-3xl sm:text-3xl md:text-5xl lg:text-6xl 
                          font-bold leading-tight">
              Take the Next Step in Your Career with Us
            </h1>
          </div> */}


      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 left-0 w-96 h-96 bg-amber-500 rounded-full filter blur-3xl"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-amber-600 rounded-full filter blur-3xl"></div>
      </div>

      <div className="container relative z-10 px-2 py-4 md:px-4 md:py-8">
        {/* Top Bar */}
        <div className="w-full flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 my-7">
          {/* Left Section */}
          <div className="space-y-4 w-full lg:w-2/3">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full">
              <Target className="w-4 h-4 text-amber-400" />
              <span className="text-sm text-black">Sports Recruitment Platform</span>
            </div>
            <h1 className="text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-black leading-tight">
              Take the Next Step in Your{' '}
              <span className="text-amber-400">Career</span>
              <br />with Us
            </h1>
          </div>

          {/* Right Section - Community Avatars */}
          <div className="flex items-center justify-start lg:justify-end flex-wrap md:flex-nowrap gap-3">
            <div className="flex -space-x-4">
              <RoundedImage
                image="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&q=80"
                alt="Athlete"
                size={12}

              />
              <RoundedImage
                image="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&q=80"
                alt="Athlete"
                size={12}

              />
              <RoundedImage
                image="https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&q=80"
                alt="Athlete"
                size={12}

              />
              <RoundedImage
                image="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&q=80"
                alt="Athlete"
                size={12}

              />
            </div>
            <div className="ml-4">
              <div className="text-black font-semibold">{athletesCount}+</div>
              <div className="text-black/60 text-sm">Athletes Joined</div>
            </div>
          </div>
        </div>


        {/* Content */}
        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-12 items-center pb-10 md:pb-20 mt-5 md:mt-10">
          <div className="space-y-4 md:space-y-8 text-black h-full">

            {/* Search Box */}
            <div className="relative overflow-hidden rounded-2xl p-3 md:p-6 shadow-2xl h-full">

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
              <div className="relative z-10 flex flex-col justify-between h-full ">
                <div className='mt-3'>
                  <h3 className="text-white font-semibold text-lg">

                    <Briefcase className="w-5 h-5 text-amber-400" />
                    LOOKING FOR AN OPPORTUNITY
                  </h3>

                  <p className="text-white/80 text-sm">
                    Find your perfect match in sports recruitment
                  </p>
                </div>

                <div className='space-y-2'>
                  <form onSubmit={handleSearch}>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                      <Input
                        placeholder="Sport or Keyword"
                        className="bg-white/90 border-0 focus:ring-2 focus:ring-amber-400"
                        value={searchKeyword}
                        onChange={(e) => setSearchKeyword(e.target.value)}
                      />

                      {/* Sports Dropdown */}
                      <div className="relative" ref={dropdownRef}>
                        {/* Dropdown Menu */}
                        {isSportDropdownOpen && (
                          <div className={`
                            absolute z-999 w-full
                            ${dropdownPosition === 'bottom' ? 'top-full mt-1' : 'bottom-full mb-1'}
                            bg-white text-black rounded-lg shadow-xl
                            border border-stone-200 max-h-60 overflow-y-auto
                          `}>
                            <div className="p-1">
                              <button
                                type="button"
                                className="w-full text-left px-3 py-2 text-sm hover:bg-stone-100 rounded-md transition-colors"
                                onClick={() => selectSport('')}
                              >
                                All Sports
                              </button>
                              {isLoadingSports ? (
                                <div className="px-3 py-4 text-center">
                                  <div className="animate-spin w-5 h-5 border-2 border-stone-400 border-t-amber-600 rounded-full mx-auto"></div>
                                  <p className="text-xs text-stone-500 mt-2">Loading sports...</p>
                                </div>
                              ) : (
                                sports.map((sport) => (
                                  <button
                                    key={sport.id}
                                    type="button"
                                    className="w-full text-left px-3 py-2 text-sm hover:bg-stone-100 rounded-md transition-colors"
                                    onClick={() => selectSport(sport.name)}
                                  >
                                    {sport.name}
                                  </button>
                                ))
                              )}
                            </div>
                          </div>
                        )}
                        <div
                          className="relative cursor-pointer"
                          onClick={() => setIsSportDropdownOpen(!isSportDropdownOpen)}
                        >
                          <Input
                            placeholder="All Sports"
                            className="bg-white/90 border-0 focus:ring-2 focus:ring-amber-400 cursor-pointer"
                            value={searchSport}
                            readOnly
                          />
                          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                        </div>


                      </div>

                      <Input
                        placeholder="All Locations"
                        className="bg-white/90 border-0 focus:ring-2 focus:ring-amber-400"
                        value={searchLocation}
                        onChange={(e) => setSearchLocation(e.target.value)}
                      />

                      <Button
                        type="submit"
                        className="w-full md:w-auto bg-black hover:bg-black/90 rounded-full px-8"
                        disabled={isSearching}
                      >
                        {isSearching ? (
                          <div className="flex items-center gap-2">
                            <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
                            Searching...
                          </div>
                        ) : (
                          <>
                            <Search className="w-4 h-4 mr-2" />
                            Search
                          </>
                        )}
                      </Button>
                    </div>
                  </form>

                  {/* Quick Filters */}
                  <div className="mt-4 flex flex-wrap gap-2">
                    <span className="text-sm text-white/60 w-full overflow-x-hidden">Popular:</span>
                    {sports.slice(0, 4).map((sport) => (
                      <button
                        key={sport.id}
                        type="button"
                        onClick={() => setSearchSport(sport.name)}
                        className="text-sm text-white/80 hover:text-amber-400 transition-colors"
                      >
                        {sport.name}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

            </div>
          </div>

          {/* Right Side - Stats */}
          <div className="grid grid-cols-1 gap-3 md:gap-6">
            {/* Managing Stats */}
            <div className="bg-black/80 backdrop-blur-sm rounded-2xl p-4 md:p-8 border border-white/10 hover:border-amber-500/50 transition-all group">
              <div className="flex items-center gap-2 mb-2 md:gap-3 md:mb-4">
                <div className="p-3 bg-amber-500/20 rounded-xl">
                  <Users className="w-4 h-4 md:w-6 md:h-6 text-amber-400" />
                </div>
                <h3 className="text-white font-bold text-base md:text-xl">RECRUITING EXCELLENCE</h3>
              </div>
              <p className="text-white/70 text-sm mb-6">
                Connect with top talent across all sports disciplines. Join thousands of successful placements.
              </p>

              <div className="flex gap-2 md:gap-3 justify-center">
                <Link href="/athletes">
                  <Button className="bg-white text-black hover:bg-white/90 rounded-full group-hover:scale-105 transition-transform">
                    Find Athletes
                  </Button>
                </Link>
                <Link href="/opportunities">
                  <Button variant="outline" className="text-black border-white/30 hover:bg-white/10 rounded-full">
                    View Opportunities
                  </Button>
                </Link>
              </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2  gap-2 md:gap-4">
              <div
                className="bg-linear-to-br from-amber-900/80 to-amber-800/80 backdrop-blur-sm rounded-xl p-3 md:p-6 border border-white/10 hover:scale-105 transition-transform cursor-pointer"
                onClick={() => handleQuickSearch('organizations')}
              >
                <Briefcase className="w-8 h-8 text-white mb-3" />
                <div className="text-3xl md:text-4xl font-bold text-white mb-1 md:mb-2">500+</div>
                <div className="text-white/90 text-sm">Organizations</div>
                <p className="text-white/70 text-xs mt-1 md:mt-2">
                  Leading sports organizations trust us
                </p>
              </div>

              <div
                className="bg-linear-to-br from-yellow-700/80 to-yellow-600/80 backdrop-blur-sm rounded-xl p-3 md:p-6 border border-white/10 hover:scale-105 transition-transform cursor-pointer"
                onClick={() => handleQuickSearch('opportunities')}
              >
                <Trophy className="w-8 h-8 text-white mb-3" />
                <div className="text-3xl md:text-4xl font-bold text-white mb-1 md:mb-2">2,700+</div>
                <div className="text-white/90 text-sm">Active Opportunities</div>
                <p className="text-white/70 text-xs mt-1 md:mt-2">
                  Find your perfect position today
                </p>
              </div>
            </div>

            {/* Trust Badges */}
            <div className="flex items-center gap-2 md:gap-4 pt-2">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-black text-sm">Live Opportunities</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-amber-400 rounded-full"></div>
                <span className="text-black text-sm">24/7 Support</span>
              </div>
            </div>
          </div>
        </div>
        <CustomersWeServe />
      </div>
    </section>
  )
}
