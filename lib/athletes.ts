export async function getFeaturedAthletes() {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/athlete/featured?limit=4`, {
      next: { revalidate: 300 } // Revalidate every 5 minutes
    })
    
    if (!res.ok) throw new Error('Failed to fetch featured athletes')
    return res.json()
  } catch (error) {
    console.error('Error getting featured athletes:', error)
    return []
  }
}