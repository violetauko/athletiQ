import Image from 'next/image'
import { Card } from '@/components/ui/card'

interface MemberCardProps {
  name: string
  imageUrl: string
  position?: string
}

export function MemberCard({ name, imageUrl, position }: MemberCardProps) {
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
        <p className="text-sm text-muted-foreground">{position }</p>
      </div>
    </Card>
  )
}
