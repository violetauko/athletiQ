// export async function getLatestOpportunities() {
//   const res = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/opportunities?latest=true&limit=4`, {
//     next: { revalidate: 3600 },
//   })

//   if (!res.ok) {
//     throw new Error('Failed to fetch latest opportunities')
//   }

//   return res.json()
// }
export async function getLatestOpportunities() {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/opportunities?limit=4&sort=recent`, {
      next: { revalidate: 60 } // Revalidate every minute
    })
    
    if (!res.ok) throw new Error('Failed to fetch opportunities')
    return res.json()
  } catch (error) {
    console.error('Error fetching opportunities:', error)
    return { opportunities: [] }
  }
}
