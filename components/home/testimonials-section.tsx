import { Button } from '@/components/ui/button'
import { Star } from 'lucide-react'

const testimonials = [
  {
    name: 'Alex Thompson',
    role: 'Professional Athlete',
    sport: 'Rugby',
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&q=80',
    content: "I am writing to express my sincere appreciation for the support you provided during my recruitment journey. Your expertise and guidance were invaluable in helping me navigate the process and ultimately secure a position that is a great fit for my skills and career goals.",
    rating: 5
  },
  {
    name: 'Sarah Martinez',
    role: 'College Coach',
    sport: 'Rugby',
    image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&q=80',
    content: "The platform has been instrumental in helping us find talented athletes. The verification process and quality of candidates is outstanding.",
    rating: 5
  }
]

export function TestimonialsSection() {
  return (
    <section className="py-6 md:py-16">
      <div className="container">
        <div className="border-t border-gray-500 mb-20"></div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-12 items-center">
          <div className="space-y-3 md:space-y-6">
            <p className="text-sm font-semibold text-amber-600 tracking-wider uppercase">
              Testimonials
            </p>
            <h2 className="text-2xl md:text-4xl font-bold">What People Say About Us</h2>
            <p className="text-muted-foreground text-sm md:text-lg">
              Hear what athletes and organizations say about their experience with AthletiQ
            </p>
            <Button className="bg-black hover:bg-black/90 rounded-full">
              Read More Stories
            </Button>
          </div>

          <div className="space-y-4 md:space-y-6">
            {testimonials.map((testimonial, index) => (
              <div
                key={index}
                className="bg-linear-to-br from-stone-100 to-amber-50 rounded-2xl p-4 md:p-8 shadow-lg border border-stone-200"
              >
                <div className="flex items-start gap-2 md:gap-4 mb-4 md:mb-6">
                  <div className="w-16 h-16 rounded-full overflow-hidden shrink-0 border-2 border-white shadow-md">
                    <img
                      src={testimonial.image}
                      alt={testimonial.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg">{testimonial.name}</h3>
                    <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                    <p className="text-sm text-muted-foreground font-semibold">{testimonial.sport}</p>
                    <div className="flex gap-1 mt-1">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                      ))}
                    </div>
                  </div>
                </div>
                <p className="text-muted-foreground leading-relaxed italic text-sm md:text-base">
                  &quot;{testimonial.content}&quot;
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="border-t border-gray-500 mt-10 md:mt-20"></div>
      </div>
    </section>
  )
}