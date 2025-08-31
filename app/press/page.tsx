import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Press — Open Fiesta",
  description: "Press kit, logos, and boilerplate for Open Fiesta.",
  alternates: { canonical: "/press" },
  openGraph: {
    title: "Press — Open Fiesta",
    description: "Press kit, logos, and boilerplate for Open Fiesta.",
    images: [
      { url: "/brand.png", width: 1200, height: 630, alt: "Open Fiesta" },
    ],
  },
}

export default function PressPage() {
  return (
    <main className="mx-auto max-w-3xl px-5 py-12 prose dark:prose-invert">
      <h1>Open Fiesta Press Kit</h1>
      <p>
        Open Fiesta lets you chat with and compare <strong>300+ AI models</strong> — OpenAI, Claude,
        Gemini, Perplexity, DeepSeek, Grok, and more — side-by-side in one place.
      </p>

      <h2>Boilerplate</h2>
      <p>
        Open Fiesta is an elegant, fast AI chat assistant that makes it easy to compare responses
        across 300+ models in one interface, so you can think, write, and build faster.
        Learn more at <a href="https://openfiesta.app">openfiesta.app</a>.
      </p>

      <h2>Brand assets</h2>
      <ul>
        <li><a href="/brand.svg" download>Logo (SVG)</a></li>
        <li><a href="/brand.png" download>Social image (PNG, 1200×630)</a></li>
        <li><a href="/Web_logo.svg" download>App mark (SVG, dark)</a></li>
        <li><a href="/Web_logo_light.svg" download>App mark (SVG, light)</a></li>
      </ul>

      <h2>Contact</h2>
      <ul>
        <li>Email: <a href="mailto:press@openfiesta.app">press@openfiesta.app</a></li>
        <li>X: <a href="https://x.com/byteHumi" target="_blank" rel="noreferrer">@byteHumi</a></li>
      </ul>
    </main>
  )
}
