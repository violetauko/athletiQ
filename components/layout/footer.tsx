import Link from 'next/link'
import { Heart, Facebook, Linkedin, Twitter } from 'lucide-react'
import { Input } from '@/components/ui/input'

export function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="w-full border-t bg-band-100 pb-10">
      <div className="container">
        <div className="border-t border-gray-800 mt-5 mb-16"></div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo and Brand */}
          <div className="space-y-4">
            <Link href="/" className="flex items-center space-x-2">
              <div className="flex items-center justify-center w-10 h-10 bg-black rounded-full">
                <Heart className="w-5 h-5 text-white fill-white" />
              </div>
              <span className="font-bold text-xl">AthletiQ</span>
            </Link>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2 text-foreground">
              <li>
                <Link href="/about" className="text-sm hover:text-muted-foreground transition-colors">
                  Our Story
                </Link>
              </li>
              <li>
                <Link href="/opportunities" className="text-sm hover:hover:text-muted-foreground transition-colors">
                  Opportunities
                </Link>
              </li>
              <li>
                <Link href="/athletes" className="text-sm hover:hover:text-muted-foreground transition-colors">
                  Athletes
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-sm hover:hover:text-muted-foreground transition-colors">
                  Contact Us
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Us */}
          <div>
            <h3 className="font-semibold mb-4">Contact Us</h3>
            <div className="space-y-2">
              <Input 
                placeholder="Email: info@athletiq.com" 
                readOnly 
                className="bg-white/50 border-stone-300"
              />
              <Input 
                placeholder="Phone: +1234567890" 
                readOnly 
                className="bg-white/50 border-stone-300"
              />
              <Input 
                placeholder="Address: Your City" 
                readOnly 
                className="bg-white/50 border-stone-300"
              />
            </div>
          </div>

          {/* Follow Us */}
          <div>
            <h3 className="font-semibold mb-4">Follow Us</h3>
            <div className="flex gap-4">
              <Link href="#" className="w-10 h-10 rounded-full bg-white/50 border border-stone-300 flex items-center justify-center hover:bg-white transition-colors">
                <Facebook className="w-5 h-5" />
              </Link>
              <Link href="#" className="w-10 h-10 rounded-full bg-white/50 border border-stone-300 flex items-center justify-center hover:bg-white transition-colors">
                <Linkedin className="w-5 h-5" />
              </Link>
              <Link href="#" className="w-10 h-10 rounded-full bg-white/50 border border-stone-300 flex items-center justify-center hover:bg-white transition-colors">
                <Twitter className="w-5 h-5" />
              </Link>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-20 pt-8 text-center space-y-2">
          <div className="flex items-center justify-center gap-4 text-sm text-foreground">
            <Link href="/privacy" className="text-foreground transition-colors">
              Privacy Policy
            </Link>
            <span>|</span>
            <Link href="/terms" className="text-foreground transition-colors">
              Terms & Conditions
            </Link>
            <span>|</span>
            <span>AthletiQ © {currentYear}</span>
          </div>
          <p className="text-sm text-muted-foreground">
            Powered with <Heart className="inline w-4 h-4 text-red-500 fill-red-500" /> by AthletiQ
          </p>
        </div>
      </div>
    </footer>
  )
}
