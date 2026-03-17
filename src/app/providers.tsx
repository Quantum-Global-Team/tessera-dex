"use client"

import { useState, type ReactNode } from "react"
import { WagmiProvider } from "wagmi"
import { RainbowKitProvider, darkTheme } from "@rainbow-me/rainbowkit"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { wagmiConfig } from "@/web3/config/wagmi"
import { TradingProvider } from "@/contexts/TradingContext"

interface ProvidersProps {
  children: ReactNode
}

/**
 * Client-side Web3 provider tree.
 *
 * Order matters:
 *   WagmiProvider (config + transports)
 *   └─ QueryClientProvider (data fetching)
 *      └─ RainbowKitProvider (wallet UI)
 *         └─ TradingProvider (selected pair state)
 *
 * QueryClient is lazily initialised via useState to avoid issues with
 * React Server Components and HMR in development.
 */
export function Providers({ children }: ProvidersProps) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 30_000,
            refetchOnWindowFocus: false,
            retry: 2,
          },
        },
      }),
  )

  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider
          theme={darkTheme({
            accentColor: "#FF4FA3",
            accentColorForeground: "#0F0A14",
            borderRadius: "small",
            fontStack: "system",
          })}
        >
          <TradingProvider>{children}</TradingProvider>
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  )
}
