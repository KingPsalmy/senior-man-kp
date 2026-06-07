import type { Metadata } from "next"
import "./globals.css"
import Footer from "@/components/layout/Footer"
import PlayerWrapper from "@/components/player/PlayerWrapper"

export const metadata: Metadata = {
  title: "Senior Man KP — Official Beat Store",
  description:
    "Premium beats by Senior Man KP. Browse, preview and license cinematic Afro-fusion instrumentals.",
  keywords: [
    "beats",
    "afrobeats",
    "afro-fusion",
    "buy beats",
    "Senior Man KP",
    "Nigerian producer",
  ],
  openGraph: {
    title: "Senior Man KP — Official Beat Store",
    description: "Premium beats by Senior Man KP",
    type: "website",
  },
  icons: {
    icon: [
      { url: "/favicon.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon.png", sizes: "64x64", type: "image/png" },
      { url: "/favicon.png", sizes: "192x192", type: "image/png" },
    ],
    apple: "/favicon.png",
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      data-scroll-behavior="smooth"
    >
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
           href="https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=Barlow:ital,wght@0,400;0,500;0,600;0,700;0,800;0,900;1,700&family=Barlow+Condensed:wght@600;700;800;900&family=JetBrains+Mono:wght@400;500&display=swap"
      rel="stylesheet"
    />
            <script async src="https://js.paystack.co/v1/inline.js" />
      </head>
      <body>
        {children}
        <PlayerWrapper />
        <Footer />
      </body>
    </html>
  )
}