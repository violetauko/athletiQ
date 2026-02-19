import Link from 'next/link'
import { Card } from '@/components/ui/card'
import { ArrowUpRight } from 'lucide-react'
import Image from 'next/image'

interface CategoryCardProps {
  name: string
  icon?: React.ReactNode
  imageUrl?: string
  href: string
  color?: string
}

export function CategoryCard({ 
  name, 
  icon, 
  imageUrl, 
  href,
  color = 'from-stone-200 to-amber-100'
}: CategoryCardProps) {
  return (
    <Link href={href}>
      <Card
        className={`group relative overflow-hidden h-80 bg-linear-to-br ${color} border-0 cursor-pointer transition-all duration-300 hover:shadow-2xl hover:scale-[1.02]`}
      >
        {/* Bottom Background Image */}
        {imageUrl && (
          <div className="absolute inset-x-0 bottom-0 h-50 overflow-hidden">
            <Image
              src={imageUrl}
              alt={name}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-110 rounded-2xl"
            />

            {/* Optional gradient overlay for readability */}
            <div className="absolute inset-0 bg-linear-to-t from-black/50 to-transparent" />
          </div>
        )}

        {/* Content Layer */}
        <div className="absolute inset-0 z-10 p-6 flex flex-col justify-between">
          
          {/* Header */}
          <div className="flex items-start justify-between">
            <h3 className="text-2xl font-bold max-w-[70%] text-white">
              {name}
            </h3>

            <div className="w-12 h-12 rounded-full bg-black/10 border border-black/20 flex items-center justify-center backdrop-blur-sm">
              {icon}
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between text-white">
            <span className="text-sm font-medium opacity-90">
              View more
            </span>

            <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm border border-white/30 flex items-center justify-center group-hover:bg-white/30 transition-colors">
              <ArrowUpRight className="w-5 h-5" />
            </div>
          </div>

        </div>
      </Card>
    </Link>

  )
}
