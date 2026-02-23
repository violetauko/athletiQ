import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { ReactQueryProvider } from '@/lib/react-query-provider'
import { AuthProvider } from '@/components/layout/auth-provider'


export const metadata: Metadata = {
  title: 'AthletiQ - Athlete Recruitment Platform',
  description: 'Connect talented athletes with sports organizations worldwide',
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
              <main className="container mx-auto px-2 sm:px-0 lg:px-0">{children}</main>
              <Footer />
            </div>
          </ReactQueryProvider>
        </AuthProvider>
      </body>
    </html>
  )
}
