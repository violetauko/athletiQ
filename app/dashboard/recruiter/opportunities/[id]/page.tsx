import { use } from 'react'
import { OpportunityDetails } from '@/components/opportunities/opportunity-details'

type Props = {
  params: Promise<{ id: string }>
}

export default function OpportunityDetailPage({ params }: Props) {
  const { id } = use(params)

  return (
    <OpportunityDetails
      id={id}
      backHref="/dashboard/recruiter/opportunities"
      applyHref={`dashboard/recruiter/opportunities/${id}/apply`}
    />
  )
}