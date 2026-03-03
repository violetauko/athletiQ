// lib/sports.ts
export async function getSports() {
  const res = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/sports`, {
    next: { revalidate: 3600 }, // 1 hour cache (ISR)
  })

  if (!res.ok) {
    throw new Error('Failed to fetch sports')
  }

  return res.json()
}