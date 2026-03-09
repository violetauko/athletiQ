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

export async function getAthleteCount() {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/athlete?limit=1`, {
      next: { revalidate: 300 } // Revalidate every 5 minutes
    })
    
    if (!res.ok) throw new Error('Failed to fetch athlete count')
    const data = await res.json()
    return data.total || 10000 // Default to 10000 if total is missing
  } catch (error) {
    console.error('Error getting athlete count:', error)
    return 10000 // Fallback
  }
}