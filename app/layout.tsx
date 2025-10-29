import type { Metadata } from 'next'
import './globals.css'
import { LocaleProvider } from '@/lib/i18n/LocaleProvider'

export const metadata: Metadata = {
  title: 'CGNC Flow — Comptabilité marocaine moderne',
  description: 'Application de comptabilité générale conforme CGNC pour le marché marocain',
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 5,
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="fr">
      <body>
        <LocaleProvider>{children}</LocaleProvider>
      </body>
    </html>
  )
}
