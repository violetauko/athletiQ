'use client'

import { ApplyForm } from '@/components/opportunities/apply-form'
import { use } from 'react'

export default function ApplyPage({ params }: { params: Promise<{ id: string }> }) {
  const param = use(params);
  return (
    <ApplyForm 
      params={param}
      // backHref={`/opportunities/${id}`}
      // successRedirect="/dashboard/athlete/applications"
    />
  )
}