import type { Metadata } from "next"
import { Inter, Geist_Mono } from "next/font/google"

import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { cn } from "@/lib/utils"

const fontSans = Inter({ subsets: ["latin"], variable: "--font-sans" })
const fontMono = Geist_Mono({ subsets: ["latin"], variable: "--font-mono" })

export const metadata: Metadata = {
  title: "Tessera — Institutional Forex DEX",
  description:
    "Trade tokenized fiat assets with institutional precision. Tessera brings TradFi-grade forex to the Polkadot EVM.",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      className="dark"
      suppressHydrationWarning
    >
      <body
        className={cn(
          "min-h-screen bg-background antialiased",
          fontSans.variable,
          fontMono.variable,
          "font-sans",
        )}
      >
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  )
}
