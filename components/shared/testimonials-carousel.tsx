'use client'

import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ChevronLeft, ChevronRight, Star } from 'lucide-react'
import { useState } from 'react'
import Image from 'next/image'

interface Testimonial {
  name: string
  role: string
  organization: string
  quote: string
  rating: number
  imageUrl: string
}

const testimonials: Testimonial[] = [
  {
    name: 'Alex Thompson',
    role: 'Professional Athlete',
    organization: 'Track & Field',
    quote: 'I am writing to express my sincere appreciation for the support you provided during my recruitment journey. Your expertise and guidance were invaluable in helping me navigate the process and ultimately secure a position that is a great fit for my skills and career goals.',
    rating: 5,
    imageUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&q=80',
  },
  {
    name: 'Maria Garcia',
    role: 'College Athlete',
    organization: 'Basketball',
    quote: 'AthletiQ made my college recruitment process seamless. The platform connected me with coaches who truly valued my skills, and I found the perfect fit for my academic and athletic goals. I couldn\'t be happier with where I ended up!',
    rating: 5,
    imageUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&q=80',
  },
  {
    name: 'James Wilson',
    role: 'Coach',
    organization: 'Elite Sports Academy',
    quote: 'As a recruiter, AthletiQ has become our go-to platform for finding top talent. The quality of athletes and the detailed profiles make it easy to identify candidates who align with our program\'s values and needs.',
    rating: 5,
    imageUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&q=80',
  },
]

export function TestimonialsCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0)

  const next = () => {
    setCurrentIndex((prev) => (prev + 1) % testimonials.length)
  }

  const previous = () => {
    setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length)
  }

  const current = testimonials[currentIndex]

  return (
    <div className="space-y-6">
      <Card className="bg-gradient-to-br from-stone-100 to-amber-50 border-stone-200 shadow-lg">
        <div className="p-8 md:p-12">
          <div className="flex flex-col md:flex-row gap-8 items-start">
            {/* Avatar */}
            <div className="relative w-24 h-24 rounded-full overflow-hidden flex-shrink-0 border-4 border-white shadow-md">
              <Image
                src={current.imageUrl}
                alt={current.name}
                fill
                className="object-cover"
              />
            </div>

            {/* Content */}
            <div className="flex-1 space-y-4">
              {/* Rating */}
              <div className="flex gap-1">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={`w-5 h-5 ${
                      i < current.rating
                        ? 'fill-amber-400 text-amber-400'
                        : 'text-stone-300'
                    }`}
                  />
                ))}
              </div>

              {/* Quote */}
              <blockquote className="text-lg md:text-xl text-muted-foreground leading-relaxed">
                "{current.quote}"
              </blockquote>

              {/* Author */}
              <div className="pt-4 border-t border-stone-300">
                <p className="font-bold text-lg">{current.name}</p>
                <p className="text-sm text-muted-foreground">{current.role}</p>
                <p className="text-sm font-semibold text-amber-700">
                  {current.organization}
                </p>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          size="icon"
          onClick={previous}
          className="rounded-full"
        >
          <ChevronLeft className="w-4 h-4" />
        </Button>

        {/* Dots Indicator */}
        <div className="flex gap-2">
          {testimonials.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`w-2 h-2 rounded-full transition-all ${
                index === currentIndex
                  ? 'bg-black w-8'
                  : 'bg-stone-300 hover:bg-stone-400'
              }`}
              aria-label={`Go to testimonial ${index + 1}`}
            />
          ))}
        </div>

        <Button
          variant="outline"
          size="icon"
          onClick={next}
          className="rounded-full"
        >
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  )
}
