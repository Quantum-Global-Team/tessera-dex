"use client"

import { useReadContract } from "wagmi"
import { erc20Abi, formatUnits, type Address } from "viem"
import type { TokenMetadata } from "@/types/token"

export interface UseTokenBalanceResult {
  /** Raw on-chain balance as bigint, or null if unavailable */
  rawBalance: bigint | null
  /** Human-readable balance string rounded to 6 significant figures */
  formatted: string
  isLoading: boolean
  isError: boolean
}

/**
 * Reads an ERC-20 token balance for a given wallet address.
 *
 * Returns zero-balance result (not an error) when:
 * - The contract address is not yet deployed (null)
 * - The wallet address is not provided
 *
 * Uses wagmi useReadContract under the hood.
 */
export function useTokenBalance(
  token: TokenMetadata,
  walletAddress: Address | undefined,
): UseTokenBalanceResult {
  const contractAddress = token.address as Address | null

  const { data, isLoading, isError } = useReadContract({
    address: contractAddress ?? undefined,
    abi: erc20Abi,
    functionName: "balanceOf",
    args: walletAddress ? [walletAddress] : undefined,
    query: {
      enabled: !!contractAddress && !!walletAddress,
    },
  })

  const rawBalance = typeof data === "bigint" ? data : null
  const formatted =
    rawBalance !== null
      ? parseFloat(formatUnits(rawBalance, token.decimals)).toFixed(4)
      : "0.0000"

  // isLoading is only meaningful when the query is enabled
  const effectiveLoading = isLoading && !!contractAddress && !!walletAddress

  return {
    rawBalance,
    formatted,
    isLoading: effectiveLoading,
    isError,
  }
}
