import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import Script from "next/script"
import { ThemeProvider } from '@/lib/themeContext'
import { AuthProvider } from '@/lib/auth'
import "./globals.css"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  metadataBase: new URL("https://www.portalos.ru"),
  title: {
    default: "Portal – AI Chat Assistant",
    template: "%s | Portal",
  },
  description:
    "Portal lets you chat with 300+ AI models—OpenAI, Gemini, Claude, Perplexity, DeepSeek, Grok, and more—in one place. Compare responses and stay in flow.",
  applicationName: "Portal",
  generator: "Portal",
  keywords: [
    // Brand focus: Portal variations
    "Portal",
    "OpenFiesta",
    "openfiesta",
    "open-fiesta",
    "Open-Fiesta",
    "Portal",
    "openfiesta.app",
    "www.openfiesta.app",
    "open-fiesta.app",
    "Portal website",
    "openfiesta website",
    "Portal app",
    "OpenFiesta app",
    "openfiesta app",
    "open-fiesta app",
    "Portal AI",
    "OpenFiesta AI",
    "openfiesta ai",
    "openfiesta ai chat",
    "open-fiesta ai chat",
    "Portal chat",
    "open-fiesta chat",
    // Common misspellings people type
    "openfista",
    "open-feista",
    "openfiestaa",
    "open fiest",
    "Portala",
    "openbfiesta",
    // Brand focus: AI Fiesta variations
    "AI Fiesta",
    "AIFiesta",
    "ai-fiesta",
    "ai fiesta",
    "AI Fiesta app",
    "AIFiesta app",
    "ai-fiesta.app",
    "aifiesta",
    "ai fiesta app",
    // App intent combinations
    "Portal chat app",
    "Portal AI app",
    "openfiesta chat",
    "openfiesta ai app",
    "AI fiesta chat",
    "openfiesta compare",
    "Portal compare",
    "openfiesta openrouter",
    "Portal openrouter",
    "openfiesta open router",
    // Primary intents
    "AI chat",
    "AI assistant",
    "compare AI models",
    "multi model AI chat",
    "GPT alternative",
    // Brands / providers
    "OpenAI",
    "Anthropic Claude",
    "Google Gemini",
    "Perplexity",
    "DeepSeek",
    "Grok xAI",
    "OpenRouter",
    // Use cases
    "research assistant",
    "coding assistant",
    "writing assistant",
    "prompt engineering",
    "brainstorming with AI",
    // Product
    "AI compare",
    "chat with multiple models",
    "evaluate AI responses",
    "side by side AI",
    // Long-tail
    "chat with 300+ AI models",
    "best AI chat alternatives",
    "compare GPT vs Claude vs Gemini",
    "multi-provider AI chat app",
    "multi provider ai chat",
    "multi model chat app",
    "side by side ai chat",
    "compare LLMs",
    "LLM comparator",
    "AI model benchmark",
    "prompt A/B testing",
    "prompt testing tool",
    "compare ChatGPT vs Claude vs Gemini",
    "openrouter models",
    "use OpenRouter with chat app",
    "OpenAI vs Claude",
    "GPT-4o vs Claude 3.5",
    "Gemini 1.5 vs GPT-4o",
    "DeepSeek R1 compare",
    "o3-mini compare",
    "Grok vs GPT",
    "best AI model for coding",
    "best AI model for writing",
    "research with AI assistants",
    "compare reasoning models",
    "evaluate AI answer quality",
    "AI productivity tool",
    // Brand
    "Portal",
  ].join(", "),
  authors: [{ name: "Portal", url: "https://www.portalos.ru" }],
  creator: "Portal",
  publisher: "Portal",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-video-preview": -1,
      "max-snippet": -1,
    },
  },
  icons: {
    icon: "/favicon.ico",
  },
  classification: "AI Tools, Developer Tools, Productivity, Chatbots",
  category: [
    "AI Chat",
    "Developer Productivity",
    "Prompt Engineering",
    "Research Tools",
    "Writing Tools",
    "Open Source",
  ].join(", "),
  other: {
    "application-name": "Portal",
    "apple-mobile-web-app-capable": "yes",
    "mobile-web-app-capable": "yes",
    "theme-color": "#000000",
  },
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    url: "https://www,portalos.ru/",
    siteName: "Portal",
    title: "Portal – Use Open Source LLMs",
    description:
      "Portal lets you chat with 300+ AI models—OpenAI, Gemini, Claude, Perplexity, DeepSeek, Grok, and more—in one place. Compare responses and stay in flow.",
    images: [
      {
        url: "https://openfiesta.app/og.png",
        width: 1200,
        height: 630,
        alt: "Portal",
      },
    ],
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    site: "@portal",
    creator: "@portal",
    title: "Portal – AI Chat Assistant",
    description:
      "Portal lets you chat with 300+ AI models—OpenAI, Gemini, Claude, Perplexity, DeepSeek, Grok, and more—in one place. Compare responses and stay in flow.",
    images: ["https://openfiesta.app/og.png"],
  },
}

/**
 * Root layout component for the application.
 *
 * Renders the top-level HTML structure, global <head> metadata (SEO, social, and PWA tags),
 * and site-wide JSON-LD structured data. Wraps page content with authentication and theme
 * providers so all pages share the same context and styles.
 *
 * @param children - React node(s) to be rendered inside the app providers.
 * @returns The root HTML element tree for the application.
 */
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="dark">
      <head>
        {/* Explicit OG/Twitter image for maximum compatibility */}
        <title>Portal – Use Open Source LLMs</title>
        <meta name="description" content="Portal lets you chat with 300+ AI models—OpenAI, Gemini, Claude, Perplexity, DeepSeek, Grok, and more—in one place. Compare responses and stay in flow." />
        <meta property="og:title" content="Portal – Use Open Source LLMs" />
        <meta property="og:description" content="Portal lets you chat with 300+ AI models—OpenAI, Gemini, Claude, Perplexity, DeepSeek, Grok, and more—in one place. Compare responses and stay in flow." />
        <meta property="og:url" content="https://www.portalos.ru" />
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content="Portal" />
        <meta property="og:locale" content="en_US" />
        <meta property="og:image" content="https://openfiesta.app/og.png" />
        <meta property="og:image:secure_url" content="https://openfiesta.app/og.png" />
        <meta property="og:image:type" content="image/png" />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:image:alt" content="Portal" />
        {/* Generic image hints for Google/LinkedIn/others */}
        <meta itemProp="image" content="https://openfiesta.app/og.png" />
        <link rel="image_src" href="https://openfiesta.app/og.png" />
        <meta name="thumbnail" content="https://openfiesta.app/og.png" />
        <meta name="twitter:image" content="https://openfiesta.app/og.png" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Portal – Use Open Source LLMs" />
        <meta name="twitter:description" content="Portal lets you chat with 300+ AI models—OpenAI, Gemini, Claude, Perplexity, DeepSeek, Grok, and more—in one place. Compare responses and stay in flow." />
        <meta property="twitter:domain" content="openfiesta.app" />
        <meta property="twitter:url" content="https://www.portalos.ru" />
        <meta name="twitter:site" content="@byteHumi" />
        <meta name="twitter:creator" content="@byteHumi" />
        {/* Optional: helps Discord/Slack fetch quickly */}
        <meta httpEquiv="x-dns-prefetch-control" content="on" />
        
        {/* PWA Meta Tags */}
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#000000" />
        <meta name="background-color" content="#000000" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="Open Fiesta" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="msapplication-TileColor" content="#000000" />
        <meta name="msapplication-tap-highlight" content="no" />
        <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no, user-scalable=no, viewport-fit=cover" />
        
        {/* Apple Touch Icons */}
        <link rel="apple-touch-icon" href="/icons/icon-192x192.svg" />
        <link rel="apple-touch-icon" sizes="152x152" href="/icons/icon-152x152.svg" />
        <link rel="apple-touch-icon" sizes="180x180" href="/icons/icon-192x192.svg" />
        
        {/* Favicon */}
        <link rel="icon" type="image/svg+xml" href="/icons/icon-192x192.svg" />
        <link rel="shortcut icon" href="/favicon.ico" />
        
        {/* Microsoft Tiles */}
        <meta name="msapplication-TileImage" content="/icons/icon-144x144.svg" />
        <meta name="msapplication-config" content="/browserconfig.xml" />
      </head>
      <body className={inter.className}>
        <AuthProvider>
          <ThemeProvider>{children}</ThemeProvider>
        </AuthProvider>
        {/* Structured Data */}
        <Script id="ld-org" type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Organization",
            name: "Portal",
            url: "https://www.portalos.ru",
            logo: "https://openfiesta.app/brand.png",
            sameAs: [
              "https://x.com/byteHumi",
              "https://www.portalos.ru/Open-Fiesta"
            ]
          })}
        </Script>
        <Script id="ld-website" type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebSite",
            name: "Portal",
            url: "https://www.portalos.ru",
            potentialAction: {
              "@type": "SearchAction",
              target: "https://ichat.portalos.ru/?q={search_term_string}",
              "query-input": "required name=search_term_string"
            }
          })}
        </Script>
        <Script id="ld-webapp" type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebApplication",
            name: "Portal",
            description:
              "Chat with and compare 300+ AI models (OpenAI, Claude, Gemini, Perplexity, DeepSeek, Grok) side-by-side in one place.",
            url: "https://www.portalos.ru",
            applicationCategory: "DeveloperApplication",
            operatingSystem: "Web",
            offers: {
              "@type": "Offer",
              price: "0",
              priceCurrency: "USD",
              availability: "https://schema.org/InStock"
            },
            publisher: {
              "@type": "Organization",
              name: "Portal",
              url: "https://www.portalos.ru"
            },
            author: {
              "@type": "Person",
              name: "Portal",
              url: "https://www.portalos.ru"
            },
            inLanguage: "en-US",
            isAccessibleForFree: true,
            keywords:
              "AI chat, compare AI models, GPT alternative, OpenAI, Claude, Gemini, Perplexity, DeepSeek, Grok, OpenRouter",
          })}
        </Script>
      </body>
    </html>
  )
}
