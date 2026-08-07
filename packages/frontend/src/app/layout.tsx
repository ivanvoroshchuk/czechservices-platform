import type { Metadata } from 'next'
import { Geist } from 'next/font/google'
import './globals.css'
import { Providers } from '@/components/providers'
import { Navbar } from '@/components/navbar'
import { Footer } from '@/components/footer'
import { ToastContainer } from '@/components/toast'

const geistSans = Geist({ variable: '--font-geist-sans', subsets: ['latin'] })

export const metadata: Metadata = {
  title: {
    default: 'CzechServices — Platforma pro rezervaci služeb',
    template: '%s | CzechServices',
  },
  description: 'Najděte a rezervujte profesionální služby v České republice. Masáže, focení, jóga, fitness a další.',
  keywords: ['služby', 'rezervace', 'česká republika', 'masáže', 'jóga', 'fitness', 'focení'],
  openGraph: {
    type: 'website',
    locale: 'cs_CZ',
    siteName: 'CzechServices',
    title: 'CzechServices — Platforma pro rezervaci služeb',
    description: 'Najděte a rezervujte profesionální služby v České republice',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="cs" className={`${geistSans.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-gray-50">
        <Providers>
          <Navbar />
          <main className="flex-1">{children}</main>
          <Footer />
          <ToastContainer />
        </Providers>
      </body>
    </html>
  )
}
