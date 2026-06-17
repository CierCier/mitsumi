import type { Metadata } from 'next'
import { Toaster } from 'sonner'
import { FlowerBackground } from '@/components/flower-bg'
import { StealthNav } from '@/components/stealth-nav'
import './globals.css'

export const metadata: Metadata = {
  title: 'Mitsumi',
  description: 'Fast, ephemeral URL shortener',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=DM+Serif+Display&family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;500&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <FlowerBackground />
        <StealthNav />
        <main className="relative z-10">
          {children}
        </main>
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: '#FFFFFF',
              color: '#1C1814',
              border: '1px solid #EDE9E4',
              borderRadius: '8px',
              fontSize: '14px',
            },
          }}
        />
      </body>
    </html>
  )
}
