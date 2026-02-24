'use client'

import { ApplyForm } from '@/components/opportunities/apply-form'

export default function ApplyPage({ params }: { params: Promise<{ id: string,backHref?: string }> }) {
  // Pass the params Promise directly and let the child component handle it with use()
  return (
    <ApplyForm 
      params={params.then(p => ({
        id: p.id,
        backHref: p.backHref || 'opportunities',
        successRedirect: "/dashboard/athlete/applications"
      }))}
    />
  )
}