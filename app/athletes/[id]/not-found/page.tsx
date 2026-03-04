// app/athletes/[id]/not-found.tsx
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Frown } from 'lucide-react'

export default function AthleteNotFound() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4">
      <Frown className="w-24 h-24 text-stone-400 mb-6" />
      <h1 className="text-4xl font-bold mb-4">Athlete Not Found</h1>
      <p className="text-lg text-muted-foreground mb-8 max-w-md">
        Sorry, we couldn't find the athlete you're looking for. They may have been removed or the link might be broken.
      </p>
      <div className="flex gap-4">
        <Link href="/athletes">
          <Button className="bg-black hover:bg-black/90 rounded-full">
            Browse Athletes
          </Button>
        </Link>
        <Link href="/">
          <Button variant="outline" className="rounded-full">
            Go Home
          </Button>
        </Link>
      </div>
    </div>
  )
}