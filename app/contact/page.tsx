import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Mail, Phone, MapPin, Clock } from 'lucide-react'

export default function ContactPage() {
  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-stone-900 to-black text-white py-20">
        <div className="container">
          <div className="max-w-3xl">
            <h1 className="text-5xl md:text-6xl font-bold mb-6">
              Get In Touch
            </h1>
            <p className="text-xl text-white/80">
              Have questions? We'd love to hear from you. Send us a message and we'll respond as soon as possible.
            </p>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-20 bg-gradient-to-br from-white to-stone-50">
        <div className="container">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Contact Form */}
            <Card className="p-8 shadow-lg">
              <h2 className="text-3xl font-bold mb-6">Send Us a Message</h2>
              <form className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name</Label>
                    <Input id="firstName" placeholder="John" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input id="lastName" placeholder="Doe" />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" placeholder="john.doe@example.com" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input id="phone" type="tel" placeholder="+1 (555) 000-0000" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="subject">Subject</Label>
                  <Input id="subject" placeholder="How can we help?" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="message">Message</Label>
                  <textarea
                    id="message"
                    rows={5}
                    className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    placeholder="Tell us more about your inquiry..."
                  />
                </div>

                <Button className="w-full bg-black hover:bg-black/90 rounded-full" size="lg">
                  Send Message
                </Button>
              </form>
            </Card>

            {/* Contact Information */}
            <div className="space-y-8">
              <div>
                <h2 className="text-3xl font-bold mb-6">Contact Information</h2>
                <p className="text-muted-foreground mb-8">
                  Fill up the form and our team will get back to you within 24 hours.
                </p>
              </div>

              <div className="space-y-6">
                <Card className="p-6 flex items-start gap-4 hover:shadow-lg transition-shadow">
                  <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-amber-200 to-amber-100 rounded-xl flex items-center justify-center">
                    <Mail className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">Email</h3>
                    <p className="text-muted-foreground">info@athletiq.com</p>
                    <p className="text-muted-foreground">support@athletiq.com</p>
                  </div>
                </Card>

                <Card className="p-6 flex items-start gap-4 hover:shadow-lg transition-shadow">
                  <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-amber-200 to-amber-100 rounded-xl flex items-center justify-center">
                    <Phone className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">Phone</h3>
                    <p className="text-muted-foreground">+1 (555) 123-4567</p>
                    <p className="text-muted-foreground">+1 (555) 123-4568</p>
                  </div>
                </Card>

                <Card className="p-6 flex items-start gap-4 hover:shadow-lg transition-shadow">
                  <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-amber-200 to-amber-100 rounded-xl flex items-center justify-center">
                    <MapPin className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">Address</h3>
                    <p className="text-muted-foreground">123 Sports Avenue</p>
                    <p className="text-muted-foreground">Los Angeles, CA 90001</p>
                  </div>
                </Card>

                <Card className="p-6 flex items-start gap-4 hover:shadow-lg transition-shadow">
                  <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-amber-200 to-amber-100 rounded-xl flex items-center justify-center">
                    <Clock className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">Business Hours</h3>
                    <p className="text-muted-foreground">Monday - Friday: 9:00 AM - 6:00 PM</p>
                    <p className="text-muted-foreground">Saturday: 10:00 AM - 4:00 PM</p>
                    <p className="text-muted-foreground">Sunday: Closed</p>
                  </div>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Map Section (Placeholder) */}
      <section className="h-96 bg-stone-200">
        <div className="w-full h-full flex items-center justify-center text-muted-foreground">
          <div className="text-center">
            <MapPin className="w-12 h-12 mx-auto mb-4" />
            <p>Map Integration Placeholder</p>
            <p className="text-sm mt-2">Integrate Google Maps or Mapbox here</p>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 bg-white">
        <div className="container max-w-4xl">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">Frequently Asked Questions</h2>
            <p className="text-xl text-muted-foreground">
              Quick answers to common questions
            </p>
          </div>

          <div className="space-y-4">
            {[
              {
                question: 'How do I create an athlete profile?',
                answer: 'Click on "Register" in the top navigation, select "Athlete" as your account type, and fill in your profile information including your sports background, achievements, and media.',
              },
              {
                question: 'Is AthletiQ free to use?',
                answer: 'Yes! Creating an athlete profile and applying to opportunities is completely free. Organizations pay a subscription to post opportunities.',
              },
              {
                question: 'How long does it take to get a response?',
                answer: 'Response times vary by organization, but most recruiters respond within 5-7 business days. You can track your application status in your dashboard.',
              },
              {
                question: 'Can I apply to multiple opportunities?',
                answer: 'Absolutely! You can apply to as many opportunities as you like. We recommend tailoring your application to each position for the best results.',
              },
            ].map((faq, index) => (
              <Card key={index} className="p-6">
                <h3 className="font-semibold text-lg mb-2">{faq.question}</h3>
                <p className="text-muted-foreground">{faq.answer}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}