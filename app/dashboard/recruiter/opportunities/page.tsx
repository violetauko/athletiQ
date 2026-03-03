import { Suspense } from 'react'
import { getSports } from '@/lib/sports'
import { OpportunitiesComponent } from '@/components/dashboard/client/opportunities-page';


export default async function OpportunitiesPageWrapper() {
  const sportsRes = await getSports()
  return (
    <Suspense fallback={<div className="text-center py-20">Loading…</div>}>
      <OpportunitiesComponent sports={sportsRes.sports} />
    </Suspense>
  );
}