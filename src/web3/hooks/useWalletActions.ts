"use client"

import { useConnectModal, useAccountModal } from "@rainbow-me/rainbowkit"

/**
 * Exposes wallet actions (connect, account) for use in UI components.
 * Abstracts RainbowKit's modal hooks behind the web3 layer.
 */
export function useWalletActions() {
  const { openConnectModal } = useConnectModal()
  const { openAccountModal } = useAccountModal()

  return {
    /** Open the RainbowKit connect wallet modal. */
    openConnectModal,
    /** Open the RainbowKit account modal (shows address, balance, disconnect). */
    openAccountModal,
  }
}
