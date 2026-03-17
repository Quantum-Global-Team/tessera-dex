"use client"

import { useEffect, useRef, useState } from "react"
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
} from "lightweight-charts"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"
import { normalizeFxPrice } from "@/lib/fxPrice"
import { usePythOHLC, type OhlcBar } from "@/web3/hooks/usePythOHLC"
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

type VolBar = { time: OhlcBar["time"]; value: number; color: string }

function toVolBars(bars: OhlcBar[]): VolBar[] {
  return bars.map((bar) => ({
    time: bar.time,
    value: ((bar.high - bar.low) / bar.open) * 10_000,
    color:
      bar.close >= bar.open
        ? "rgba(46,230,166,0.25)"
        : "rgba(255,92,122,0.20)",
  }))
}

// ── Chart panel ───────────────────────────────────────────────────────────────

export function ChartPanel() {
  const { selectedPair } = useTradingContext()
  const [selectedTimeframe, setSelectedTimeframe] = useState<Timeframe>(DEFAULT_TIMEFRAME)
  const [pairModalOpen, setPairModalOpen] = useState(false)

  const benchmarkSymbol = BENCHMARK_SYMBOLS[selectedPair.symbol] ?? ""
  const feedId = selectedPair.priceFeedId

  const { bars, isLoading, isError } = usePythOHLC(
    benchmarkSymbol,
    selectedTimeframe,
  )
  const { prices } = usePythPrices([feedId])
  const { historicalPrices } = usePyth24hChange([feedId])

  const normId = feedId.toLowerCase().startsWith("0x")
    ? feedId.toLowerCase()
    : `0x${feedId.toLowerCase()}`

  const livePrice = prices.get(normId)
  const historicalPrice = historicalPrices.get(normId)

  // Normalize prices (invert USD/JPY → JPY/USD)
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

  return (
    <>
      <Card className="border-border-subtle bg-bg-panel border-top-accent overflow-hidden">
        {/* ── Toolbar row ── */}
        <CardHeader className="px-4 pb-3 pt-4">
          <div className="flex items-center justify-between gap-4">
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

        {/* ── Chart area ── */}
        <CardContent className="p-0">
          <div className="relative h-[32rem] w-full">
            {/* Price overlay — top-left, large, non-interactive */}
            <div className="absolute left-4 top-3 z-10 pointer-events-none select-none">
              {normalizedLive !== null ? (
                <div className="flex flex-col gap-1">
                  <div className="flex items-baseline gap-3">
                    <span className="font-mono text-4xl font-bold tabular-nums tracking-tight text-text-primary">
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
                  <span className="font-mono text-xs text-text-muted">
                    24h Change
                  </span>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="h-10 w-48 animate-pulse rounded-lg bg-bg-elevated" />
                  <div className="h-4 w-24 animate-pulse rounded bg-bg-elevated" />
                </div>
              )}
            </div>

            <CandlestickChart
              bars={bars}
              isLoading={isLoading}
              isError={isError}
            />
          </div>
        </CardContent>
      </Card>

      {/* Pair Selector Modal */}
      <PairSelectorModal
        open={pairModalOpen}
        onClose={() => setPairModalOpen(false)}
      />
    </>
  )
}

// ── Inner chart ───────────────────────────────────────────────────────────────

interface CandlestickChartProps {
  bars: OhlcBar[]
  isLoading: boolean
  isError: boolean
}

function CandlestickChart({ bars, isLoading, isError }: CandlestickChartProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const chartRef = useRef<IChartApi | null>(null)
  const seriesRef = useRef<ISeriesApi<"Candlestick"> | null>(null)
  const volumeRef = useRef<ISeriesApi<"Histogram"> | null>(null)

  // Create chart once on mount
  useEffect(() => {
    const el = containerRef.current
    if (!el) return

    const chart = createChart(el, {
      autoSize: true,
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
        scaleMargins: { top: 0.15, bottom: 0.22 },
      },
      timeScale: {
        borderColor: "rgba(255,255,255,0.08)",
        timeVisible: true,
        secondsVisible: false,
        fixRightEdge: true,
      },
    })

    chartRef.current = chart

    seriesRef.current = chart.addSeries(CandlestickSeries, CANDLE_STYLE)

    volumeRef.current = chart.addSeries(HistogramSeries, VOLUME_STYLE)
    volumeRef.current.priceScale().applyOptions({
      scaleMargins: { top: 0.85, bottom: 0 },
    })

    return () => {
      chart.remove()
      chartRef.current = null
      seriesRef.current = null
      volumeRef.current = null
    }
  }, [])

  // Update data when bars change
  useEffect(() => {
    if (!seriesRef.current || !volumeRef.current || bars.length === 0) return
    seriesRef.current.setData(bars)
    volumeRef.current.setData(toVolBars(bars))
    chartRef.current?.timeScale().fitContent()
  }, [bars])

  return (
    <div className="absolute inset-0">
      <div ref={containerRef} className="h-full w-full" />

      {/* Loading skeleton */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-bg-panel/50">
          <div className="flex flex-col items-center gap-3">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-brand-primary border-t-transparent" />
            <span className="font-mono text-xs text-text-muted">Loading chart data...</span>
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

      {/* Empty bars */}
      {!isLoading && !isError && bars.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center">
          <p className="font-mono text-xs text-text-muted">
            No data for this timeframe
          </p>
        </div>
      )}
    </div>
  )
}
