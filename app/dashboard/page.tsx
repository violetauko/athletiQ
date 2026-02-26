import { redirect } from 'next/navigation'
import { auth } from '@/auth'

export default async function DashboardPage() {
  const session = await auth()

  if (!session?.user) {
    redirect('/login')
  }

  // Render different dashboards based on the user's role
  switch (session.user.role) {
    case 'ADMIN':
      redirect('/dashboard/admin')
    case 'CLIENT':
      redirect('/dashboard/recruiter')
    case 'ATHLETE':
    default:
      redirect('/dashboard/athlete')
  }
}