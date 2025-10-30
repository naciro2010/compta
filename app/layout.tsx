import type { Metadata } from 'next'
import './globals.css'
import { LocaleProvider } from '@/lib/i18n/LocaleProvider'

export const metadata: Metadata = {
  title: 'MizanPro — Logiciel Comptabilité Maroc | Gestion Comptable CGNC Rabat',
  description: 'MizanPro : Solution de comptabilité marocaine en ligne. Gestion factures, TVA, déclarations fiscales conformes CGNC. Logiciel comptable pour entreprises au Maroc (Rabat, Casablanca). Essai gratuit.',
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
