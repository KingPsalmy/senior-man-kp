import type { Metadata } from "next"
import "./globals.css"

export const metadata: Metadata = {
  title: "Senior Man KP — Official Beat Store",
  description: "Premium beats by Senior Man KP. Browse, preview and license cinematic Afro-fusion instrumentals.",
  keywords: ["beats", "afrobeats", "afro-fusion", "buy beats", "Senior Man KP", "Nigerian producer"],
  openGraph: {
    title: "Senior Man KP — Official Beat Store",
    description: "Premium beats by Senior Man KP",
    type: "website",
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
  href="https://fonts.googleapis.com/css2?family=Barlow:ital,wght@0,400;0,500;0,600;0,700;0,800;0,900;1,700;1,800;1,900&family=Barlow+Condensed:wght@500;600;700;800;900&family=JetBrains+Mono:wght@300;400;500&display=swap"
  rel="stylesheet"
/>
      </head>
      <body>
        {children}
      </body>
    </html>
  )
}