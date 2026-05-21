import type { Metadata, Viewport } from 'next'
import Script from 'next/script'
import '../src/index.scss'
import '../src/dark-theme.scss'
import '../src/contrast-theme.scss'

export const metadata: Metadata = {
  title: 'The Phase Machine',
  description: 'Algorithmic composition machine',
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <noscript>You need to enable JavaScript to run this app.</noscript>
        {children}
        {/* Google Analytics */}
        <Script src="https://www.googletagmanager.com/gtag/js?id=G-4R58YDCMKZ" strategy="afterInteractive" />
        <Script id="gtag-init" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-4R58YDCMKZ');
          `}
        </Script>
      </body>
    </html>
  )
}
