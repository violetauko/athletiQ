'use client'
import { AthleteCard } from '@/components/athletes/athlete-card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Search, Filter, Trophy } from 'lucide-react'
import TitleCard from '@/components/shared/title-card'
import Link from 'next/link'
import { useQuery } from '@tanstack/react-query'
import { useState, useEffect } from 'react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import React from 'react'
import { Sport } from '@/app/types/athlete'


interface Athlete {
  id: string
  name: string
  sport: string
  sportId: string
  position: string
  imageUrl: string
  achievements: string[]
  gpa: number
  experience: 'Beginner' | 'Intermediate' | 'Advanced' | 'Professional'
  country?: string
  age?: number
  height?: string
  weight?: string
}

interface AthletesResponse {
  athletes: Athlete[]
  total: number
  page: number
  totalPages: number
  limit: number
}

export function AthletesClient({sports}: { sports: Sport[] }){
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(8)
  
  // Filter state
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedSport, setSelectedSport] = useState<string>('all')
  const [selectedExperience, setSelectedExperience] = useState<string>('all')
  const [sortBy, setSortBy] = useState<string>('recent')
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('')

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm)
      setCurrentPage(1) // Reset to first page on new search
    }, 500)

    return () => clearTimeout(timer)
  }, [searchTerm])

  // Fetch athletes with pagination and filters
  const {
    data: athletesData,
    isLoading: isLoadingAthletes,
    isError: isAthletesError,
    error: athletesError
  } = useQuery<AthletesResponse>({
    queryKey: ['athletes', currentPage, itemsPerPage, debouncedSearchTerm, selectedSport, selectedExperience, sortBy],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: itemsPerPage.toString(),
        ...(debouncedSearchTerm && { search: debouncedSearchTerm }),
        ...(selectedSport !== 'all' && { sportId: selectedSport }),
        ...(selectedExperience !== 'all' && { experience: selectedExperience }),
        ...(sortBy !== 'recent' && { sort: sortBy })
      })

      const response = await fetch(`/api/athlete?${params}`)
      if (!response.ok) {
        throw new Error('Failed to fetch athletes')
      }
      return response.json()
    },
    staleTime: 5 * 60 * 1000,
    // keepPreviousData: true
  })

  // Fetch stats
  const {
    data: statsData
  } = useQuery({
    queryKey: ['athlete-stats'],
    queryFn: async () => {
      const response = await fetch('/api/athlete/stats')
      if (!response.ok) {
        throw new Error('Failed to fetch stats')
      }
      return response.json()
    },
    staleTime: 10 * 60 * 1000
  })

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setDebouncedSearchTerm(searchTerm)
    setCurrentPage(1)
  }

  const handleSportFilter = (sportId: string) => {
    setSelectedSport(sportId)
    setCurrentPage(1)
  }

  const handleExperienceFilter = (experience: string) => {
    setSelectedExperience(experience)
    setCurrentPage(1)
  }

  const handleSortChange = (value: string) => {
    setSortBy(value)
    setCurrentPage(1)
  }

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  // Generate page numbers for pagination
  const getPageNumbers = () => {
    if (!athletesData) return []
    
    const totalPages = athletesData.totalPages
    const current = athletesData.page
    const delta = 2
    const range = []
    const rangeWithDots: (string | number)[] = []
    let l: number

    for (let i = 1; i <= totalPages; i++) {
      if (i === 1 || i === totalPages || (i >= current - delta && i <= current + delta)) {
        range.push(i)
      }
    }

    range.forEach((i) => {
      if (l) {
        if (i - l === 2) {
          rangeWithDots.push(l + 1)
        } else if (i - l !== 1) {
          rangeWithDots.push('...')
        }
      }
      rangeWithDots.push(i)
      l = i
    })

    return rangeWithDots
  }

  if (isAthletesError) {
    return (
      <div className="flex flex-col items-center justify-center min-h-100">
        <p className="text-red-500 mb-4">Error loading athletes: {athletesError instanceof Error ? athletesError.message : 'Unknown error'}</p>
        <Button onClick={() => window.location.reload()}>Try Again</Button>
      </div>
    )
  }

  return (
    <div className="flex flex-col">
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
          <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 flex gap-2">
              <Input
                placeholder="Search by name, sport, or position..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="flex-1"
              />
              <Button type="submit" className="bg-black hover:bg-black/90">
                <Search className="w-4 h-4 mr-2" />
                Search
              </Button>
            </div>
            <div className="flex gap-2">
              <Select value={selectedExperience} onValueChange={handleExperienceFilter}>
                <SelectTrigger className="w-37.5">
                  <SelectValue placeholder="Experience" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Levels</SelectItem>
                  <SelectItem value="Beginner">Beginner</SelectItem>
                  <SelectItem value="Intermediate">Intermediate</SelectItem>
                  <SelectItem value="Advanced">Advanced</SelectItem>
                  <SelectItem value="Professional">Professional</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" type="button" className="gap-2">
                <Filter className="w-4 h-4" />
                More Filters
              </Button>
            </div>
          </form>

          {/* Quick Filters */}
          <div className="flex flex-wrap gap-2 mt-4">
            <Button
              key="all"
              variant={selectedSport === 'all' ? 'default' : 'outline'}
              size="sm"
              className="rounded-full"
              onClick={() => handleSportFilter('all')}
            >
              All Sports
            </Button>
            {sports?.map((sport) => (
              <Button
                key={sport.id}
                variant={selectedSport === sport.id ? 'default' : 'outline'}
                size="sm"
                className="rounded-full"
                onClick={() => handleSportFilter(sport.id)}
              >
                {sport.name}
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

      {/* Athletes Grid */}
      <section className="py-12 flex-1">
        <div className="">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl font-bold mb-2">Featured Athletes</h2>
              <p className="text-muted-foreground">
                {isLoadingAthletes ? (
                  'Loading athletes...'
                ) : (
                  <>
                    Showing <span className="font-semibold text-foreground">
                      {athletesData?.athletes.length || 0}
                    </span> of{' '}
                    <span className="font-semibold text-foreground">
                      {athletesData?.total || 0}
                    </span> athletes
                  </>
                )}
              </p>
            </div>
            <div className="flex gap-2 items-center">
              <span className="text-sm text-muted-foreground">Sort by:</span>
              <Select value={sortBy} onValueChange={handleSortChange}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="recent">Most Recent</SelectItem>
                  <SelectItem value="name">Name A-Z</SelectItem>
                  <SelectItem value="gpa_desc">Highest GPA</SelectItem>
                  <SelectItem value="experience_desc">Most Experienced</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {isLoadingAthletes ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {[...Array(8)].map((_, index) => (
                <div key={index} className="animate-pulse">
                  <div className="bg-gray-200 h-64 rounded-lg mb-3"></div>
                  <div className="space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {athletesData?.athletes.map((athlete, index) => (
                  <Link href={`/athletes/${athlete.id}`} key={athlete.id}>
                    <div
                      className="animate-slide-up cursor-pointer group"
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
                  </Link>
                ))}
              </div>

              {athletesData?.athletes.length === 0 && (
                <div className="text-center py-12">
                  <p className="text-muted-foreground">No athletes found matching your criteria.</p>
                  <Button 
                    variant="outline" 
                    className="mt-4"
                    onClick={() => {
                      setSearchTerm('')
                      setDebouncedSearchTerm('')
                      setSelectedSport('all')
                      setSelectedExperience('all')
                      setSortBy('recent')
                    }}
                  >
                    Clear Filters
                  </Button>
                </div>
              )}
            </>
          )}

          {/* Pagination */}
          {athletesData && athletesData.totalPages > 1 && (
            <div className="flex justify-center items-center gap-2 mt-12">
              <Button
                variant="outline"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1 || isLoadingAthletes}
              >
                Previous
              </Button>
              
              {getPageNumbers().map((page, index) => (
                page === '...' ? (
                  <span key={`dots-${index}`} className="px-2">...</span>
                ) : (
                  <Button
                    key={page}
                    variant={currentPage === page ? 'default' : 'outline'}
                    className={currentPage === page ? 'bg-black' : ''}
                    onClick={() => handlePageChange(page as number)}
                    disabled={isLoadingAthletes}
                  >
                    {page}
                  </Button>
                )
              ))}

              <Button
                variant="outline"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === athletesData.totalPages || isLoadingAthletes}
              >
                Next
              </Button>
            </div>
          )}
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
