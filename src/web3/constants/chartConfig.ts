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
 * - windowSeconds: how far back to fetch (optimized for ~500-1000 candles)
 * - label: display label for the timeframe button
 *
 * Candle counts:
 * - 1H: 1min res × 500 candles = 500 min = ~8 hours
 * - 4H: 5min res × 500 candles = 2500 min = ~42 hours
 * - 1D: 15min res × 500 candles = 7500 min = ~5 days
 * - 1W: 60min res × 500 candles = 30000 min = ~21 days
 * - 1M: 240min (4h) res × 500 candles = 120000 min = ~83 days
 */
export interface Timeframe {
  label: string
  resolution: string
  /** How far back (in seconds) to fetch from now */
  windowSeconds: number
}

export const CHART_TIMEFRAMES: Timeframe[] = [
  { label: "1H", resolution: "1", windowSeconds: 500 * 60 },            // 500 1-min candles = 8h
  { label: "4H", resolution: "5", windowSeconds: 500 * 5 * 60 },        // 500 5-min candles = 42h
  { label: "1D", resolution: "15", windowSeconds: 500 * 15 * 60 },      // 500 15-min candles = 5 days
  { label: "1W", resolution: "60", windowSeconds: 500 * 60 * 60 },      // 500 1-hr candles = 21 days
  { label: "1M", resolution: "240", windowSeconds: 500 * 240 * 60 },    // 500 4-hr candles = 83 days
]

export const DEFAULT_TIMEFRAME = CHART_TIMEFRAMES[2] // 1D

// Re-export so consumers don't need separate imports
export { PYTH_HERMES_URL }
