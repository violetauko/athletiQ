import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { ReactQueryProvider } from '@/lib/react-query-provider'
import { AuthProvider } from '@/components/layout/auth-provider'
import { Toaster } from '@/components/ui/sonner'


export const metadata: Metadata = {
  title: 'AthletiQ - Athlete Recruitment Platform',
  description: 'Connect talented athletes with sports organizations worldwide',
  icons: {
    icon: [
      { url: "/favicon.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon-1.png", sizes: "48x48", type: "image/png" },
    ]  
  },
}
const inter = Inter({
  subsets: ["latin"],
  display: "swap",
});
export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>
          <ReactQueryProvider>
            <div className="min-h-screen">
              <Header />
              <main className="container mx-auto px-2 sm:px-0 lg:px-0">
                {children}
                <Toaster 
                  position="top-right"
                  richColors
                  closeButton
                  theme="light"
                />
              </main>
              <Footer />
            </div>
          </ReactQueryProvider>
        </AuthProvider>
      </body>
    </html>
  )
}
