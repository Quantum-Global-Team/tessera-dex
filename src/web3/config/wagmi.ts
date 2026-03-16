import { getDefaultConfig } from "@rainbow-me/rainbowkit"
import { moonbaseAlpha } from "./chains"

/**
 * wagmi + RainbowKit configuration.
 * getDefaultConfig handles transports, connectors, and WalletConnect.
 * ssr: true is required for Next.js App Router.
 */
export const wagmiConfig = getDefaultConfig({
  appName: "Tessera DEX",
  projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID ?? "",
  chains: [moonbaseAlpha],
  ssr: true,
})
