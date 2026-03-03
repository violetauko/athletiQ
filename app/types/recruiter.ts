
export interface Opportunity {
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

export interface OpportunitiesResponse {
  opportunities: Opportunity[]
  pagination:{
    total: number
    page: number
    pageSize: number
  }
}