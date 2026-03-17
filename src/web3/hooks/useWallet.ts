"use client"

import { useAccount, useChainId } from "wagmi"
import { TARGET_CHAIN_ID } from "@/web3/config/chains"

export interface WalletState {
  address: `0x${string}` | undefined
  isConnected: boolean
  isConnecting: boolean
  chainId: number | undefined
  /** True when the connected wallet is on the Tessera target network. */
  isCorrectNetwork: boolean
}

/**
 * Wraps wagmi account + chain state.
 * UI components must use this hook instead of importing from wagmi directly.
 */
export function useWallet(): WalletState {
  const { address, isConnected, isConnecting } = useAccount()
  const chainId = useChainId()

  return {
    address,
    isConnected,
    isConnecting,
    chainId,
    isCorrectNetwork: isConnected && chainId === TARGET_CHAIN_ID,
  }
}
