import { redirect } from 'next/navigation'
import { auth } from '@/auth'
import { ClientDashboard } from '@/components/dashboard/client-dashboard'
import { AdminDashboard } from '@/components/dashboard/admin-dashboard'

export default async function DashboardPage() {
  const session = await auth()

  if (!session?.user) {
    redirect('/login')
  }

  // Render different dashboards based on the user's role
  switch (session.user.role) {
    case 'ADMIN':
      return <AdminDashboard />
    case 'CLIENT':
      // Clients are also Recruiters in the domain context
      return <ClientDashboard />
    case 'ATHLETE':
    default:
      redirect('/dashboard/athlete')
  }
}