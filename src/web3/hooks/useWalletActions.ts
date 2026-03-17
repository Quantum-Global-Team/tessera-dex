"use client"

import { useConnectModal } from "@rainbow-me/rainbowkit"

/**
 * Exposes wallet actions (connect, disconnect) for use in UI components.
 * Abstracts RainbowKit's modal hooks behind the web3 layer.
 */
export function useWalletActions() {
  const { openConnectModal } = useConnectModal()

  return {
    /** Open the RainbowKit connect wallet modal. */
    openConnectModal,
  }
}
