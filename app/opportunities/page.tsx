// 'use client'
// import { OpportunityCard } from '@/components/opportunities/opportunity-card'
// import { Input } from '@/components/ui/input'
// import { Button } from '@/components/ui/button'
// import { Search, Filter } from 'lucide-react'
// import TitleCard from '@/components/shared/title-card'
// import { useRouter } from 'next/navigation'

// export default function OpportunitiesPage() {
//   const router = useRouter();
//   // Mock data - in production, this would come from API/database with pagination
//   const opportunities = [
//     {
//       id: '1',
//       title: 'Professional Basketball Player',
//       sport: 'Basketball',
//       category: 'Professional Sports',
//       location: 'Melbourne, Victoria',
//       city: 'Melbourne',
//       type: 'Full Time',
//       salaryMin: 60000,
//       salaryMax: 75000,
//       description: 'We are seeking talented basketball players to join our professional team. This is an excellent opportunity for athletes looking to take their career to the next level with competitive compensation and world-class facilities.',
//       postedDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
//       isNew: true,
//     },
//     {
//       id: '2',
//       title: 'Soccer Scout',
//       sport: 'Soccer',
//       category: 'Sports Management',
//       location: 'New York, New York',
//       city: 'New York',
//       type: 'Contract',
//       salaryMin: 40000,
//       salaryMax: 55000,
//       description: 'Join our scouting team to identify and recruit promising soccer talent. Requires extensive knowledge of the sport and player development. Travel required.',
//       postedDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
//       isNew: true,
//     },
//     {
//       id: '3',
//       title: 'Track & Field Coach',
//       sport: 'Track & Field',
//       category: 'Coaching',
//       location: 'Horsham, Surrey',
//       city: 'Horsham',
//       type: 'Full Time',
//       salaryMin: 55000,
//       salaryMax: 70000,
//       description: 'Lead our track and field program with expertise in sprint and distance training. Develop athletes to reach their maximum potential through data-driven coaching methods.',
//       postedDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
//       isNew: true,
//     },
//     {
//       id: '4',
//       title: 'Swimming Performance Analyst',
//       sport: 'Swimming',
//       category: 'Sports Science',
//       location: 'Munich, Bavaria',
//       city: 'Munich',
//       type: 'Contract',
//       salaryMin: 48000,
//       salaryMax: 62000,
//       description: 'Analyze swimmer performance metrics and provide data-driven insights to improve technique and competitive results. Work with Olympic-level athletes.',
//       postedDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
//       isNew: true,
//     },
//     {
//       id: '5',
//       title: 'Tennis Academy Director',
//       sport: 'Tennis',
//       category: 'Management',
//       location: 'Miami, Florida',
//       city: 'Miami',
//       type: 'Full Time',
//       salaryMin: 75000,
//       salaryMax: 95000,
//       description: 'Oversee all operations of our prestigious tennis academy. Manage coaching staff, develop curriculum, and maintain relationships with sponsors and partners.',
//       postedDate: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000),
//     },
//     {
//       id: '6',
//       title: 'Youth Baseball Coach',
//       sport: 'Baseball',
//       category: 'Coaching',
//       location: 'Boston, Massachusetts',
//       city: 'Boston',
//       type: 'Part Time',
//       salaryMin: 25000,
//       salaryMax: 35000,
//       description: 'Develop young baseball players aged 10-14 with focus on fundamentals, teamwork, and sportsmanship. Weekend and evening availability required.',
//       postedDate: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
//     },
//     {
//       id: '7',
//       title: 'Strength & Conditioning Coach',
//       sport: 'Multi-Sport',
//       category: 'Training',
//       location: 'Los Angeles, California',
//       city: 'Los Angeles',
//       type: 'Full Time',
//       salaryMin: 65000,
//       salaryMax: 80000,
//       description: 'Design and implement strength and conditioning programs for professional athletes across multiple sports. CSCS certification required.',
//       postedDate: new Date(Date.now() - 18 * 24 * 60 * 60 * 1000),
//     },
//     {
//       id: '8',
//       title: 'Volleyball Player - Division I',
//       sport: 'Volleyball',
//       category: 'College Athletics',
//       location: 'Austin, Texas',
//       city: 'Austin',
//       type: 'Scholarship',
//       description: 'Full athletic scholarship available for talented volleyball players. Join our competitive Division I program with state-of-the-art training facilities.',
//       postedDate: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000),
//     },
//   ]


//   return (
//     <div className="flex flex-col">
//       {/* Page Header */}
//       <div className="my-12">
//         <TitleCard 
//           image="https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=800&q=80" 
//           title="Find Your Perfect Opportunity" 
//           description="Browse through thousands of verified sports opportunities across the globe"
//           action="Let's talk"
//           onClick={()=>router.push("/contact")}
//         />
//       </div>

//       {/* Search and Filter Section */}
//       <section className="bg-white border-b sticky top-16 z-40 rounded-2xl px-3">
//         <div className="container py-6">
//           <div className="flex flex-col md:flex-row gap-4">
//             <div className="flex-1 flex gap-2">
//               <Input 
//                 placeholder="Search by sport, position, or keyword..." 
//                 className="flex-1"
//               />
//               <Button className="bg-black hover:bg-black/90">
//                 <Search className="w-4 h-4 mr-2" />
//                 Search
//               </Button>
//             </div>
//             <Button variant="outline" className="gap-2">
//               <Filter className="w-4 h-4" />
//               Filters
//             </Button>
//           </div>

//           {/* Quick Filters */}
//           <div className="flex flex-wrap gap-2 mt-4">
//             {['All Sports', 'Basketball', 'Soccer', 'Track & Field', 'Swimming', 'Tennis'].map((filter) => (
//               <Button
//                 key={filter}
//                 variant={filter === 'All Sports' ? 'default' : 'outline'}
//                 size="sm"
//                 className="rounded-full"
//               >
//                 {filter}
//               </Button>
//             ))}
//           </div>
//         </div>
//       </section>

//       {/* Opportunities Grid */}
//       <section className="py-12 flex-1">
//         <div className="container">
//           <div className="flex items-center justify-between mb-8">
//             <p className="text-muted-foreground">
//               Showing <span className="font-semibold text-foreground">{opportunities.length}</span> opportunities
//             </p>
//             <div className="flex gap-2 items-center">
//               <span className="text-sm text-muted-foreground">Sort by:</span>
//               <Button variant="outline" size="sm">
//                 Most Recent
//               </Button>
//             </div>
//           </div>

//           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
//             {opportunities.map((opportunity, index) => (
//               <div key={opportunity.id} className="animate-slide-up" style={{ animationDelay: `${index * 50}ms` }}>
//                 <OpportunityCard {...opportunity} />
//               </div>
//             ))}
//           </div>

//           {/* Pagination */}
//           <div className="flex justify-center gap-2 mt-12">
//             <Button variant="outline" disabled>
//               Previous
//             </Button>
//             <Button variant="default" className="bg-black">1</Button>
//             <Button variant="outline">2</Button>
//             <Button variant="outline">3</Button>
//             <Button variant="outline">
//               Next
//             </Button>
//           </div>
//         </div>
//       </section>
//     </div>
//   )
// }
'use client'

import { useState, useCallback, Suspense } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { OpportunityCard } from '@/components/opportunities/opportunity-card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Search, Filter } from 'lucide-react'
import TitleCard from '@/components/shared/title-card'

const SPORT_FILTERS = ['All Sports', 'Rugby', 'Basketball', 'Soccer', 'Track & Field', 'Swimming', 'Tennis']
const PAGE_SIZE = 12

interface Opportunity {
  id: string
  title: string
  sport: string
  category: string
  location: string
  city: string
  type: string
  salaryMin?: number | null
  salaryMax?: number | null
  description: string
  postedDate: string
  isNew?: boolean
}

interface OpportunitiesResponse {
  opportunities: Opportunity[]
  pagination:{
    total: number
    page: number
    pageSize: number
  }
}

async function fetchOpportunities(params: URLSearchParams): Promise<OpportunitiesResponse> {
  const res = await fetch(`/api/opportunities?${params.toString()}`)
  if (!res.ok) throw new Error('Failed to fetch opportunities')
  return await res.json()
}

function OpportunitiesPage() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const [searchInput, setSearchInput] = useState(searchParams.get('q') ?? '')
  const selectedSport = searchParams.get('sport') ?? 'All Sports'
  const currentPage = Number(searchParams.get('page') ?? '1')

  // Build query params for the API call
  const apiParams = new URLSearchParams()
  if (searchParams.get('q')) apiParams.set('q', searchParams.get('q')!)
  if (selectedSport && selectedSport !== 'All Sports') apiParams.set('sport', selectedSport)
  apiParams.set('page', String(currentPage))
  apiParams.set('pageSize', String(PAGE_SIZE))

  const { data, isLoading, isError } = useQuery({
    queryKey: ['opportunities', apiParams.toString()],
    queryFn: async () => fetchOpportunities(apiParams),
    placeholderData: (prev) => prev,
    staleTime: 1000 * 60 * 5
  })

  const updateParams = useCallback(
    (updates: Record<string, string | null>) => {
      const next = new URLSearchParams(searchParams.toString())
      for (const [key, value] of Object.entries(updates)) {
        if (value === null) next.delete(key)
        else next.set(key, value)
      }
      // Reset to page 1 on filter change
      if (!('page' in updates)) next.set('page', '1')
      router.push(`${pathname}?${next.toString()}`)
    },
    [pathname, router, searchParams]
  )

  const handleSearch = () => {
    updateParams({ q: searchInput || null })
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSearch()
  }

  const totalPages = data ? Math.ceil(data.pagination.total / PAGE_SIZE) : 1

  return (
    <div className="flex flex-col">
      {/* Page Header */}
      <div className="my-12">
        <TitleCard
          image="https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=800&q=80"
          title="Find Your Perfect Opportunity"
          description="Browse through thousands of verified sports opportunities across the globe"
          action="Let's talk"
          onClick={() => router.push('/contact')}
        />
      </div>

      {/* Search and Filter Section */}
      <section className="bg-white border-b sticky top-16 z-40 rounded-2xl px-3">
        <div className="container py-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 flex gap-2">
              <Input
                placeholder="Search by sport, position, or keyword..."
                className="flex-1"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                onKeyDown={handleKeyDown}
              />
              <Button className="bg-black hover:bg-black/90" onClick={handleSearch}>
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
            {SPORT_FILTERS.map((filter) => (
              <Button
                key={filter}
                variant={filter === selectedSport ? 'default' : 'outline'}
                size="sm"
                className="rounded-full"
                onClick={() =>
                  updateParams({ sport: filter === 'All Sports' ? null : filter })
                }
              >
                {filter}
              </Button>
            ))}
          </div>
        </div>
      </section>

      {/* Opportunities Grid */}
      <section className="py-12 flex-1">
        <div className="container">
          <div className="flex items-center justify-between mb-8">
            <p className="text-muted-foreground">
              {isLoading ? (
                <Skeleton className="h-5 w-40 inline-block" />
              ) : (
                <>
                  Showing{' '}
                  <span className="font-semibold text-foreground">{data?.pagination.total ?? 0}</span>{' '}
                  opportunities
                </>
              )}
            </p>
            <div className="flex gap-2 items-center">
              <span className="text-sm text-muted-foreground">Sort by:</span>
              <Button variant="outline" size="sm">
                Most Recent
              </Button>
            </div>
          </div>

          {isError && (
            <div className="text-center py-16 text-muted-foreground">
              Failed to load opportunities. Please try again.
            </div>
          )}

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {Array.from({ length: PAGE_SIZE }).map((_, i) => (
                <Skeleton key={i} className="h-64 rounded-2xl" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {(data?.opportunities ?? []).map((opportunity, index) => (
                <div
                  key={opportunity.id}
                  className="animate-slide-up"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <OpportunityCard
                    {...opportunity}
                    postedDate={new Date(opportunity.postedDate)}
                  />
                </div>
              ))}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center gap-2 mt-12">
              <Button
                variant="outline"
                disabled={currentPage <= 1}
                onClick={() => updateParams({ page: String(currentPage - 1) })}
              >
                Previous
              </Button>

              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <Button
                  key={page}
                  variant={page === currentPage ? 'default' : 'outline'}
                  className={page === currentPage ? 'bg-black' : ''}
                  onClick={() => updateParams({ page: String(page) })}
                >
                  {page}
                </Button>
              ))}

              <Button
                variant="outline"
                disabled={currentPage >= totalPages}
                onClick={() => updateParams({ page: String(currentPage + 1) })}
              >
                Next
              </Button>
            </div>
          )}
        </div>
      </section>
    </div>
  )
}

export default function OpportunitiesPageWrapper() {
  return (
    <Suspense fallback={<div className="text-center py-20">Loading…</div>}>
      <OpportunitiesPage />
    </Suspense>
  );
}