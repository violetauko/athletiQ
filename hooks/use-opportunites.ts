'use client'

import { useQuery } from '@tanstack/react-query'

interface OpportunitiesParams {
  sport?: string
  category?: string
  location?: string
  page?: number
  limit?: number
}

interface Opportunity {
  id: string
  title: string
  sport: string
  category: string
  location: string
  city?: string
  type: string
  salaryMin?: number
  salaryMax?: number
  description: string
  postedDate: Date
  deadline?: Date
}

interface OpportunitiesResponse {
  opportunities: Opportunity[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

async function fetchOpportunities(params: OpportunitiesParams): Promise<OpportunitiesResponse> {
  const searchParams = new URLSearchParams()
  
  if (params.sport) searchParams.set('sport', params.sport)
  if (params.category) searchParams.set('category', params.category)
  if (params.location) searchParams.set('location', params.location)
  if (params.page) searchParams.set('page', params.page.toString())
  if (params.limit) searchParams.set('limit', params.limit.toString())

  const response = await fetch(`/api/opportunities?${searchParams.toString()}`)
  
  if (!response.ok) {
    throw new Error('Failed to fetch opportunities')
  }
  
  return response.json()
}

export function useOpportunities(params: OpportunitiesParams = {}) {
  return useQuery({
    queryKey: ['opportunities', params],
    queryFn: () => fetchOpportunities(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

export function useOpportunity(id: string) {
  return useQuery({
    queryKey: ['opportunity', id],
    queryFn: async () => {
      const response = await fetch(`/api/opportunities/${id}`)
      if (!response.ok) {
        throw new Error('Failed to fetch opportunity')
      }
      return response.json()
    },
    enabled: !!id,
  })
}