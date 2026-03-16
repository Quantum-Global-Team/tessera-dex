/**
 * Pyth Network price feed IDs for Forex pairs.
 *
 * These are 32-byte hex identifiers referencing the Pyth oracle price feeds.
 * Verify current IDs at: https://pyth.network/developers/price-feed-ids
 *
 * Asset class: FX (Forex)
 * Quote currency: USD
 */
export const PYTH_PRICE_FEED_IDS = {
  /** EUR/USD — Euro to US Dollar */
  EUR_USD: "0xa995d00bb36a63cef7fd2c287dc105fc8f3d93779f062f09551b0af3e81ec30b",
  /** GBP/USD — British Pound to US Dollar */
  GBP_USD: "0x84c2dde9633d93d1bcad84e7dc41c9d56578b7ec52fabedc1f335d673df0a7c1",
  /** JPY/USD — Japanese Yen to US Dollar */
  JPY_USD: "0xef2c98c804ba503c6a707e38be4dfbb16683b0f3c4dc3f35f54e4be8c2b97b8b",
} as const

export type PythPriceFeedKey = keyof typeof PYTH_PRICE_FEED_IDS
export type PythPriceFeedId =
  (typeof PYTH_PRICE_FEED_IDS)[PythPriceFeedKey]

/**
 * Pyth Hermes REST API base URL.
 * Hermes is the off-chain price service. No wallet required for reads.
 * https://hermes.pyth.network/docs
 */
export const PYTH_HERMES_URL =
  process.env.NEXT_PUBLIC_PYTH_HERMES_URL ?? "https://hermes.pyth.network"

/**
 * Pyth smart contract address on Moonbase Alpha (Chain ID 1287).
 * Used by on-chain contracts to read oracle prices.
 * Verify at: https://docs.pyth.network/price-feeds/contract-addresses/evm
 */
export const PYTH_CONTRACT_ADDRESS_MOONBASE =
  "0xa2aa501b19aff244d90cc15a4cf739d2725b5729" as const
