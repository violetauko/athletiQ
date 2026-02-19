import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { ReactQueryProvider } from '@/lib/react-query-provider'


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
        <ReactQueryProvider>
          <div className="flex min-h-screen flex-col">
            <Header />
            <main className="flex-1">{children}</main>
            <Footer />
          </div>
        </ReactQueryProvider>
      </body>
    </html>
  )
}
