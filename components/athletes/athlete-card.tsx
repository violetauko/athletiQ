import Image from 'next/image'
import { Card } from '@/components/ui/card'

interface AthleteCardProps {
  name: string
  sport: string
  imageUrl: string
  position?: string
}

export function AthleteCard({ name, sport, imageUrl, position }: AthleteCardProps) {
  return (
    <Card className="overflow-hidden border-2 border-black/10 hover:border-black/20 transition-all duration-300 hover:shadow-lg group">
      <div className="relative h-80 rounded-b-lg">
        <Image
          src={imageUrl}
          alt={name}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-500 rounded-b-lg"
        />
      </div>
      <div className="p-4 text-center bg-linear-to-br from-stone-50 to-amber-50">
        <h3 className="font-bold text-lg">{name}</h3>
        <p className="text-sm text-muted-foreground">{position || sport}</p>
      </div>
    </Card>
  )
}
