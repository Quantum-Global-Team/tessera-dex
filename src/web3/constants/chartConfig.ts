import { PYTH_HERMES_URL } from "./priceFeedIds"

/**
 * Base URL for the Pyth Benchmarks API.
 *
 * Benchmarks provides TradingView UDF-compatible OHLC history for Pyth feeds.
 * https://benchmarks.pyth.network
 */
export const PYTH_BENCHMARKS_URL =
  process.env.NEXT_PUBLIC_PYTH_BENCHMARKS_URL ??
  "https://benchmarks.pyth.network"

/**
 * Mapping from PrismaFi pair symbol to Pyth Benchmarks symbol identifier.
 *
 * Format: "{asset_type}.{base_currency}/{quote_currency}"
 * Verify at: https://benchmarks.pyth.network/v1/shims/tradingview/symbol_info
 *
 * NOTE: Pyth Benchmarks uses USD/JPY (not JPY/USD). Chart OHLC data will be
 * in USD/JPY format and should be inverted for display if showing JPY/USD.
 */
export const BENCHMARK_SYMBOLS: Record<string, string> = {
  "tEUR/USDC": "FX.EUR/USD",
  "tGBP/USDC": "FX.GBP/USD",
  "tJPY/USDC": "FX.USD/JPY", // Pyth provides USD/JPY, not JPY/USD
}

/**
 * Chart timeframe definitions.
 * - resolution: Pyth Benchmarks bar resolution (minutes, or "1D")
 * - seconds: seconds that a full chart window spans
 * - label: display label for the timeframe button
 */
export interface Timeframe {
  label: string
  resolution: string
  /** How far back (in seconds) to fetch from now */
  windowSeconds: number
}

export const CHART_TIMEFRAMES: Timeframe[] = [
  { label: "1H", resolution: "1", windowSeconds: 60 * 60 },
  { label: "4H", resolution: "5", windowSeconds: 4 * 60 * 60 },
  { label: "1D", resolution: "15", windowSeconds: 24 * 60 * 60 },
  { label: "1W", resolution: "60", windowSeconds: 7 * 24 * 60 * 60 },
  { label: "1M", resolution: "240", windowSeconds: 30 * 24 * 60 * 60 },
]

export const DEFAULT_TIMEFRAME = CHART_TIMEFRAMES[2] // 1D

// Re-export so consumers don't need separate imports
export { PYTH_HERMES_URL }
