'use client'

import { useState, useCallback, Suspense } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { OpportunityCard } from '@/components/opportunities/opportunity-card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Search, Filter, Plus } from 'lucide-react'
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

export function OpportunitiesComponent() {
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
    <div className="flex flex-col pl-3">
      {/* Search and Filter Section */}
      <div className="flex justify-between mt-3">
        <h1 className="text-3xl font-bold mb-6">My Opportunites</h1>
        <Button variant="outline" className="gap-2"
          onClick={()=>router.push("/dashboard/recruiter/opportunities/new")}
        >
          <Plus className="w-4 h-4" />
          Add New Opportunity
        </Button>
      </div>
      <section className="bg-white border sticky top-16 z-40 rounded-2xl px-3">
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
      <section className="pb-12 p-3 flex-1">
        <div className="container">
          <div className="flex items-center justify-between mb-8">
            <div className="text-muted-foreground">
              {isLoading ? (
                <Skeleton className="h-5 w-40 inline-block" />
              ) : (
                <>
                  Showing{' '}
                  <span className="font-semibold text-foreground">{data?.pagination.total ?? 0}</span>{' '}
                  opportunities
                </>
              )}
            </div>
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
      <OpportunitiesComponent />
    </Suspense>
  );
}