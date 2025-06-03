import './globals.css'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Call Recording Analyzer',
  description: 'AI-powered call recording analysis tool',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
