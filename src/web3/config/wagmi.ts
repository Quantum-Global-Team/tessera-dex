import { getDefaultConfig } from "@rainbow-me/rainbowkit"
import { moonbaseAlpha } from "./chains"

/**
 * wagmi + RainbowKit configuration.
 * getDefaultConfig handles transports, connectors, and WalletConnect.
 * ssr: true is required for Next.js App Router.
 *
 * Cached as singleton to prevent multiple WalletConnect initializations
 * during HMR in development.
 */
let cachedConfig: ReturnType<typeof getDefaultConfig> | null = null

function createWagmiConfig() {
  if (cachedConfig) return cachedConfig

  const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID

  if (!projectId) {
    console.warn(
      "[wagmi] NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID not set. WalletConnect will not work. Get a free project ID at https://cloud.walletconnect.com"
    )
  }

  cachedConfig = getDefaultConfig({
    appName: "PrismaFi DEX",
    projectId: projectId ?? "dummy-project-id",
    chains: [moonbaseAlpha],
    ssr: true,
  })

  return cachedConfig
}

export const wagmiConfig = createWagmiConfig()
