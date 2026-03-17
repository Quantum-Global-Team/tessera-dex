import type { FxPair } from "@/types/market"

/**
 * Normalizes a Pyth price for display based on the trading pair.
 *
 * Pyth provides:
 * - EUR/USD (direct: 1 EUR = X USD)
 * - GBP/USD (direct: 1 GBP = X USD)
 * - USD/JPY (inverted: 1 USD = X JPY)
 *
 * For tJPY/USDC, we want "1 JPY = X USD", so we invert USD/JPY.
 *
 * @param price - Raw price from Pyth feed
 * @param pair - FX pair metadata
 * @returns Normalized price in "USD per 1 unit of base currency"
 */
export function normalizeFxPrice(price: number, pair: FxPair): number {
  // USD/JPY feed is inverted - we need JPY/USD
  if (pair.base === "JPY") {
    return 1 / price
  }

  // EUR/USD and GBP/USD are direct
  return price
}
