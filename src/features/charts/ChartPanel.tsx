"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import {
  createChart,
  CandlestickSeries,
  HistogramSeries,
  ColorType,
  type IChartApi,
  type ISeriesApi,
  type DeepPartial,
  type CandlestickSeriesOptions,
  type HistogramSeriesOptions,
  type LogicalRange,
  type UTCTimestamp,
} from "lightweight-charts"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { normalizeFxPrice } from "@/lib/fxPrice"
import { usePythPrices } from "@/web3/hooks/usePythPrices"
import { usePyth24hChange } from "@/web3/hooks/usePyth24hChange"
import {
  BENCHMARK_SYMBOLS,
  CHART_TIMEFRAMES,
  DEFAULT_TIMEFRAME,
  type Timeframe,
} from "@/web3/constants/chartConfig"
import { formatPrice, formatChange, changeDirection } from "@/lib/format"
import { useTradingContext } from "@/contexts/TradingContext"
import {
  PairSelectorModal,
  PairSelectorTrigger,
} from "@/features/trading/PairSelectorModal"

// ── Types ────────────────────────────────────────────────────────────────────

interface OhlcBar {
  time: UTCTimestamp
  open: number
  high: number
  low: number
  close: number
}

type VolBar = { time: UTCTimestamp; value: number; color: string }

// ── Series configuration ──────────────────────────────────────────────────────

const CANDLE_STYLE: DeepPartial<CandlestickSeriesOptions> = {
  upColor: "#2EE6A6",
  downColor: "#FF5C7A",
  borderUpColor: "#2EE6A6",
  borderDownColor: "#FF5C7A",
  wickUpColor: "rgba(46,230,166,0.65)",
  wickDownColor: "rgba(255,92,122,0.65)",
}

const VOLUME_STYLE: DeepPartial<HistogramSeriesOptions> = {
  priceScaleId: "vol",
  lastValueVisible: false,
  priceLineVisible: false,
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function toVolBars(bars: OhlcBar[]): VolBar[] {
  return bars.map((bar) => ({
    time: bar.time,
    value: Math.abs((bar.high - bar.low) / bar.open) * 10_000,
    color:
      bar.close >= bar.open
        ? "rgba(46,230,166,0.25)"
        : "rgba(255,92,122,0.20)",
  }))
}

/** Compute resolution in seconds from timeframe resolution string */
function getResolutionSeconds(resolution: string): number {
  const num = parseInt(resolution, 10)
  if (resolution.endsWith("D")) return 86400
  if (resolution.endsWith("W")) return 604800
  return num * 60 // minutes → seconds
}

// ── Chart panel ───────────────────────────────────────────────────────────────

export function ChartPanel() {
  const { selectedPair } = useTradingContext()
  const [selectedTimeframe, setSelectedTimeframe] = useState<Timeframe>(DEFAULT_TIMEFRAME)
  const [pairModalOpen, setPairModalOpen] = useState(false)

  const benchmarkSymbol = BENCHMARK_SYMBOLS[selectedPair.symbol] ?? ""
  const feedId = selectedPair.priceFeedId

  const { prices } = usePythPrices([feedId])
  const { historicalPrices } = usePyth24hChange([feedId])

  const normId = feedId.toLowerCase().startsWith("0x")
    ? feedId.toLowerCase()
    : `0x${feedId.toLowerCase()}`

  const livePrice = prices.get(normId)
  const historicalPrice = historicalPrices.get(normId)

  const normalizedLive = livePrice
    ? normalizeFxPrice(livePrice.value, selectedPair)
    : null
  const normalizedHistorical = historicalPrice
    ? normalizeFxPrice(historicalPrice, selectedPair)
    : null

  const change24h =
    normalizedLive !== null && normalizedHistorical !== null
      ? ((normalizedLive - normalizedHistorical) / normalizedHistorical) * 100
      : null
  const direction = changeDirection(change24h)

  // Detect if we need to invert (USD/JPY → JPY/USD)
  const shouldInvert = benchmarkSymbol.includes("USD/JPY")

  return (
    <>
      <Card className="h-full border-border-subtle bg-bg-panel border-top-accent overflow-hidden flex flex-col">
        {/* ── Toolbar row ── */}
        <CardHeader className="px-4 pb-3 pt-4 shrink-0">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            {/* Professional Pair Selector */}
            <PairSelectorTrigger
              onClick={() => setPairModalOpen(true)}
              pair={selectedPair}
              price={normalizedLive}
            />

            {/* Timeframe selector */}
            <div className="flex items-center gap-1 rounded-lg bg-bg-elevated/50 p-1">
              {CHART_TIMEFRAMES.map((tf) => (
                <button
                  key={tf.label}
                  onClick={() => setSelectedTimeframe(tf)}
                  className={cn(
                    "rounded-md px-3 py-1.5 font-mono text-[11px] font-medium tracking-wider transition-all",
                    tf.label === selectedTimeframe.label
                      ? "bg-brand-primary text-white shadow-sm"
                      : "text-text-muted hover:text-text-primary hover:bg-bg-elevated"
                  )}
                >
                  {tf.label}
                </button>
              ))}
            </div>
          </div>
        </CardHeader>

        {/* ── Chart area — fills remaining height ── */}
        <CardContent className="p-0 flex-1 min-h-0">
          <div className="relative h-full w-full">
            {/* Price overlay */}
            <div className="absolute left-4 top-3 z-10 pointer-events-none select-none">
              {normalizedLive !== null ? (
                <div className="flex flex-col gap-1">
                  <div className="flex items-baseline gap-3">
                    <span className="font-mono text-3xl sm:text-4xl font-bold tabular-nums tracking-tight text-text-primary">
                      {formatPrice(normalizedLive, selectedPair.displayDecimals)}
                    </span>
                    {change24h !== null && (
                      <span
                        className={cn(
                          "rounded-md px-2 py-0.5 font-mono text-sm font-semibold tabular-nums",
                          direction === "positive" && "bg-state-positive/15 text-state-positive",
                          direction === "negative" && "bg-state-negative/15 text-state-negative",
                          direction === "neutral" && "bg-bg-elevated text-text-muted"
                        )}
                      >
                        {formatChange(change24h)}
                      </span>
                    )}
                  </div>
                  <span className="font-mono text-xs text-text-muted">24h Change</span>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="h-10 w-48 animate-pulse rounded-lg bg-bg-elevated" />
                  <div className="h-4 w-24 animate-pulse rounded bg-bg-elevated" />
                </div>
              )}
            </div>

            <InfiniteScrollChart
              benchmarkSymbol={benchmarkSymbol}
              timeframe={selectedTimeframe}
              shouldInvert={shouldInvert}
            />
          </div>
        </CardContent>
      </Card>

      <PairSelectorModal
        open={pairModalOpen}
        onClose={() => setPairModalOpen(false)}
      />
    </>
  )
}

// ── Infinite Scroll Chart ─────────────────────────────────────────────────────

interface InfiniteScrollChartProps {
  benchmarkSymbol: string
  timeframe: Timeframe
  shouldInvert: boolean
}

function InfiniteScrollChart({
  benchmarkSymbol,
  timeframe,
  shouldInvert,
}: InfiniteScrollChartProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const chartRef = useRef<IChartApi | null>(null)
  const seriesRef = useRef<ISeriesApi<"Candlestick"> | null>(null)
  const volumeRef = useRef<ISeriesApi<"Histogram"> | null>(null)

  // All loaded bars, sorted ascending by time
  const allBarsRef = useRef<OhlcBar[]>([])

  // Track the oldest timestamp we have loaded
  const oldestTimestampRef = useRef<number>(0)

  // Track if we're currently fetching older data
  const isFetchingRef = useRef(false)

  // Loading/error state
  const [isLoading, setIsLoading] = useState(true)
  const [isError, setIsError] = useState(false)

  // Fetch OHLC data from API
  const fetchOHLC = useCallback(
    async (from: number, to: number): Promise<OhlcBar[]> => {
      const params = new URLSearchParams({
        symbol: benchmarkSymbol,
        resolution: timeframe.resolution,
        from: String(from),
        to: String(to),
      })

      const res = await fetch(`/api/pyth/ohlc?${params.toString()}`, {
        cache: "no-store",
      })

      if (!res.ok) throw new Error("Failed to fetch OHLC")

      const data = await res.json()

      if (data.s !== "ok" || !data.t) return []

      const bars: OhlcBar[] = data.t.map((time: number, i: number) => {
        let open = data.o[i]
        let high = data.h[i]
        let low = data.l[i]
        let close = data.c[i]

        // Invert USD/JPY → JPY/USD
        if (shouldInvert) {
          const invertedHigh = 1 / low
          const invertedLow = 1 / high
          open = 1 / open
          close = 1 / close
          high = invertedHigh
          low = invertedLow
        }

        return { time: time as UTCTimestamp, open, high, low, close }
      })

      // Sort ascending
      bars.sort((a, b) => a.time - b.time)
      return bars
    },
    [benchmarkSymbol, timeframe.resolution, shouldInvert]
  )

  // Load initial data
  useEffect(() => {
    if (!benchmarkSymbol) return

    setIsLoading(true)
    setIsError(false)
    allBarsRef.current = []
    oldestTimestampRef.current = 0

    const now = Math.floor(Date.now() / 1000)
    const initialWindow = timeframe.windowSeconds

    fetchOHLC(now - initialWindow, now)
      .then((bars) => {
        if (bars.length > 0) {
          allBarsRef.current = bars
          oldestTimestampRef.current = bars[0].time

          if (seriesRef.current && volumeRef.current) {
            seriesRef.current.setData(bars)
            volumeRef.current.setData(toVolBars(bars))

            // Show last 100 candles initially
            const timeScale = chartRef.current?.timeScale()
            if (timeScale && bars.length > 100) {
              const lastBar = bars[bars.length - 1]
              const startBar = bars[bars.length - 100]
              timeScale.setVisibleRange({ from: startBar.time, to: lastBar.time })
            } else {
              timeScale?.fitContent()
            }
          }
        }
        setIsLoading(false)
      })
      .catch(() => {
        setIsError(true)
        setIsLoading(false)
      })
  }, [benchmarkSymbol, timeframe, fetchOHLC])

  // Fetch older data when user scrolls to the left
  const loadOlderData = useCallback(async () => {
    if (isFetchingRef.current || !benchmarkSymbol) return
    if (oldestTimestampRef.current === 0) return

    isFetchingRef.current = true

    const resolutionSecs = getResolutionSeconds(timeframe.resolution)
    // Fetch 500 more candles worth of data
    const chunkSeconds = 500 * resolutionSecs
    const to = oldestTimestampRef.current - 1
    const from = to - chunkSeconds

    try {
      const olderBars = await fetchOHLC(from, to)

      if (olderBars.length > 0) {
        // Filter out duplicates
        const existingTimes = new Set(allBarsRef.current.map((b) => b.time))
        const newBars = olderBars.filter((b) => !existingTimes.has(b.time))

        if (newBars.length > 0) {
          // Prepend older bars
          allBarsRef.current = [...newBars, ...allBarsRef.current]
          allBarsRef.current.sort((a, b) => a.time - b.time)
          oldestTimestampRef.current = allBarsRef.current[0].time

          // Update chart
          if (seriesRef.current && volumeRef.current) {
            seriesRef.current.setData(allBarsRef.current)
            volumeRef.current.setData(toVolBars(allBarsRef.current))
          }
        }
      }
    } catch {
      // Silently fail - user can try scrolling again
    } finally {
      isFetchingRef.current = false
    }
  }, [benchmarkSymbol, timeframe.resolution, fetchOHLC])

  // Create chart and subscribe to visible range changes
  useEffect(() => {
    const el = containerRef.current
    if (!el) return

    const chart = createChart(el, {
      autoSize: true,
      localization: {
        locale: "en-US",
        dateFormat: "yyyy-MM-dd",
      },
      layout: {
        background: { type: ColorType.Solid, color: "transparent" },
        textColor: "#A892AD",
        fontFamily: "Geist Mono, JetBrains Mono, monospace",
        fontSize: 11,
      },
      grid: {
        vertLines: { color: "rgba(255,255,255,0.03)" },
        horzLines: { color: "rgba(255,255,255,0.03)" },
      },
      crosshair: {
        horzLine: {
          color: "rgba(255,79,163,0.5)",
          labelBackgroundColor: "#2A1436",
          width: 1,
          style: 2,
        },
        vertLine: {
          color: "rgba(255,79,163,0.5)",
          labelBackgroundColor: "#2A1436",
          width: 1,
          style: 2,
        },
      },
      rightPriceScale: {
        borderColor: "rgba(255,255,255,0.08)",
        textColor: "#A892AD",
        scaleMargins: { top: 0.12, bottom: 0.18 },
      },
      timeScale: {
        borderColor: "rgba(255,255,255,0.08)",
        timeVisible: true,
        secondsVisible: false,
        fixRightEdge: false,
        fixLeftEdge: false,
      },
    })

    chartRef.current = chart
    seriesRef.current = chart.addSeries(CandlestickSeries, CANDLE_STYLE)
    volumeRef.current = chart.addSeries(HistogramSeries, VOLUME_STYLE)
    volumeRef.current.priceScale().applyOptions({
      scaleMargins: { top: 0.82, bottom: 0 },
    })

    // Subscribe to visible logical range changes for infinite scroll
    const handleVisibleRangeChange = (range: LogicalRange | null) => {
      if (!range) return

      // If user scrolled to near the left edge (within 20 bars of oldest data),
      // load more older data
      if (range.from < 20 && allBarsRef.current.length > 0) {
        loadOlderData()
      }
    }

    chart.timeScale().subscribeVisibleLogicalRangeChange(handleVisibleRangeChange)

    return () => {
      chart.timeScale().unsubscribeVisibleLogicalRangeChange(handleVisibleRangeChange)
      chart.remove()
      chartRef.current = null
      seriesRef.current = null
      volumeRef.current = null
    }
  }, [loadOlderData])

  return (
    <div className="absolute inset-0">
      <div ref={containerRef} className="h-full w-full" />

      {/* Loading state */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-bg-panel/50">
          <div className="flex flex-col items-center gap-3">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-brand-primary border-t-transparent" />
            <span className="font-mono text-xs text-text-muted">Loading chart...</span>
          </div>
        </div>
      )}

      {/* Error state */}
      {isError && !isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-bg-panel/50">
          <div className="rounded-lg border border-state-negative/20 bg-state-negative/5 px-4 py-3 text-center">
            <p className="font-mono text-sm text-state-negative">Chart unavailable</p>
            <p className="mt-1 font-mono text-xs text-text-muted">Could not load price history</p>
          </div>
        </div>
      )}

      {/* Empty state */}
      {!isLoading && !isError && allBarsRef.current.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center">
          <p className="font-mono text-xs text-text-muted">No data for this timeframe</p>
        </div>
      )}
    </div>
  )
}
