/**
 * Metadata for a single ERC-20 token supported by PrismaFi DEX.
 */
export interface TokenMetadata {
  /** On-chain symbol, e.g. "tEUR" */
  symbol: string
  /** Full display name, e.g. "Prisma Euro" */
  name: string
  /** ERC-20 token decimals */
  decimals: number
  /** Deployed contract address, or null while contracts are pending deployment */
  address: `0x${string}` | null
  /** Chain the token lives on */
  chainId: number
  /** Single character used in avatar/icon fallback, e.g. "€" */
  logoSymbol: string
  /**
   * Pyth price feed ID for this token's USD price.
   * Null for USD-pegged stablecoins where price = 1.
   */
  priceFeedId: string | null
}

/** A token balance, combining metadata with on-chain quantity. */
export interface TokenBalance {
  token: TokenMetadata
  /** Raw on-chain balance as a bigint (use formatUnits to display) */
  rawBalance: bigint
  /** Human-readable balance string, e.g. "1,234.56" */
  formatted: string
  /** USD notional value, or null if price is unavailable */
  usdValue: number | null
}
