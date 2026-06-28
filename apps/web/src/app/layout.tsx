import type { Metadata } from 'next'
import { Inter, Sora } from 'next/font/google'
import { ThemeProvider } from 'next-themes'
import './globals.css'

const inter = Inter({
  subsets: ['latin', 'cyrillic'],
  variable: '--font-inter',
  display: 'swap',
})

const sora = Sora({
  subsets: ['latin'],
  variable: '--font-sora',
  display: 'swap',
})

export const metadata: Metadata = {
  title: {
    default: 'EspañolPro — Spanish Language School',
    template: '%s | EspañolPro',
  },
  description:
    'Complete platform for Spanish language learning. Online courses, live classes, certificates, and AI-powered conversation practice.',
  keywords: ['spanish', 'language school', 'online courses', 'DELE', 'español'],
  authors: [{ name: 'EspañolPro' }],
  openGraph: {
    type: 'website',
    locale: 'es_ES',
    siteName: 'EspañolPro',
  },
  manifest: '/manifest.json',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body className={`${inter.variable} ${sora.variable}`}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}
