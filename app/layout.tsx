import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import Script from "next/script"
import { ThemeProvider } from '@/lib/themeContext'
import { AuthProvider } from '@/lib/auth'
import "./globals.css"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  metadataBase: new URL("https://openfiesta.app"),
  title: {
    default: "Open Fiesta – AI Chat Assistant",
    template: "%s | Open Fiesta",
  },
  description:
    "Open Fiesta lets you chat with 300+ AI models—OpenAI, Gemini, Claude, Perplexity, DeepSeek, Grok, and more—in one place. Compare responses and stay in flow.",
  applicationName: "Open Fiesta",
  generator: "Open Fiesta",
  keywords: [
    "Open Fiesta",
    "openfiesta",
    "AI chat",
    "AI assistant",
    "GPT alternative",
    "OpenRouter",
    "Gemini",
    "Claude",
    "AI compare",
    "Niladri Hazra",
  ],
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    url: "https://openfiesta.app/",
    siteName: "Open Fiesta",
    title: "Open Fiesta – AI Chat Assistant",
    description:
      "Open Fiesta lets you chat with 300+ AI models—OpenAI, Gemini, Claude, Perplexity, DeepSeek, Grok, and more—in one place. Compare responses and stay in flow.",
    images: [
      {
        url: "/brand.png",
        width: 1200,
        height: 630,
        alt: "Open Fiesta",
      },
    ],
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    site: "@byteHumi",
    creator: "@byteHumi",
    title: "Open Fiesta – AI Chat Assistant",
    description:
      "Open Fiesta lets you chat with 200+ AI models—OpenAI, Gemini, Claude, Perplexity, DeepSeek, Grok, and more—in one place. Compare responses and stay in flow.",
    images: ["/brand.png"],
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="dark">
      <body className={inter.className}>
        <AuthProvider>
          <ThemeProvider>{children}</ThemeProvider>
        </AuthProvider>
        {/* Structured Data */}
        <Script id="ld-org" type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Organization",
            name: "Open Fiesta",
            url: "https://openfiesta.app",
            logo: "https://openfiesta.app/brand.png",
            sameAs: [
              "https://x.com/byteHumi",
              "https://github.com/NiladriHazra/Open-Fiesta"
            ]
          })}
        </Script>
        <Script id="ld-website" type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebSite",
            name: "Open Fiesta",
            url: "https://openfiesta.app",
            potentialAction: {
              "@type": "SearchAction",
              target: "https://openfiesta.app/?q={search_term_string}",
              "query-input": "required name=search_term_string"
            }
          })}
        </Script>
      </body>
    </html>
  )
}
