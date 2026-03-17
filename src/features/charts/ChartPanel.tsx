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
import { usePythOHLC, type OhlcBar } from "@/web3/hooks/usePythOHLC"
import { usePythPrices } from "@/web3/hooks/usePythPrices"
import { usePyth24hChange } from "@/web3/hooks/usePyth24hChange"
import {
  BENCHMARK_SYMBOLS,
  CHART_TIMEFRAMES,
  DEFAULT_TIMEFRAME,
  type Timeframe,
} from "@/web3/constants/chartConfig"
import { FX_PAIRS } from "@/web3/constants/pairs"
import { formatPrice, formatChange, changeDirection } from "@/lib/format"

// ── Series styles ────────────────────────────────────────────────────────────

const CANDLE_STYLE: DeepPartial<CandlestickSeriesOptions> = {
  upColor: "#2EE6A6",
  downColor: "#FF5C7A",
  borderUpColor: "#2EE6A6",
  borderDownColor: "#FF5C7A",
  wickUpColor: "rgba(46,230,166,0.6)",
  wickDownColor: "rgba(255,92,122,0.6)",
}

const VOLUME_STYLE: DeepPartial<HistogramSeriesOptions> = {
  priceScaleId: "vol",
  lastValueVisible: false,
  priceLineVisible: false,
}

// ── Helpers ──────────────────────────────────────────────────────────────────

type VolBar = { time: OhlcBar["time"]; value: number; color: string }

/** Derive a normalized volatility proxy from OHLC range (no real FX volume exists). */
function toVolBars(bars: OhlcBar[]): VolBar[] {
  return bars.map((bar) => ({
    time: bar.time,
    value: ((bar.high - bar.low) / bar.open) * 10_000,
    color:
      bar.close >= bar.open
        ? "rgba(46,230,166,0.28)"
        : "rgba(255,92,122,0.22)",
  }))
}

// ── Chart panel ──────────────────────────────────────────────────────────────

export function ChartPanel() {
  const [selectedPairIndex, setSelectedPairIndex] = useState(0)
  const [selectedTimeframe, setSelectedTimeframe] =
    useState<Timeframe>(DEFAULT_TIMEFRAME)

  const selectedPair = FX_PAIRS[selectedPairIndex]
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
  const change24h =
    livePrice && historicalPrice
      ? ((livePrice.value - historicalPrice) / historicalPrice) * 100
      : null
  const direction = changeDirection(change24h)

  return (
    <Card className="border-border-subtle bg-bg-panel border-top-accent">
      <CardHeader className="px-4 pb-2 pt-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Pair tabs */}
          <div className="flex items-center gap-0.5">
            {FX_PAIRS.map((pair, i) => (
              <button
                key={pair.symbol}
                onClick={() => setSelectedPairIndex(i)}
                className={cn(
                  "rounded-md px-2.5 py-1 font-mono text-xs tracking-wide transition-colors",
                  i === selectedPairIndex
                    ? "bg-brand-primary/15 text-brand-primary"
                    : "text-text-muted hover:text-text-secondary",
                )}
              >
                {pair.symbol}
              </button>
            ))}
          </div>

          {/* Live price + 24h change */}
          {livePrice ? (
            <div className="flex items-baseline gap-2">
              <span className="font-mono text-base font-semibold tabular-nums text-text-primary">
                {formatPrice(livePrice.value, selectedPair.displayDecimals)}
              </span>
              {change24h !== null && (
                <span
                  className={cn(
                    "font-mono text-xs tabular-nums",
                    direction === "positive" && "text-state-positive",
                    direction === "negative" && "text-state-negative",
                    direction === "neutral" && "text-text-muted",
                  )}
                >
                  {formatChange(change24h)}
                </span>
              )}
            </div>
          ) : (
            <div className="h-5 w-28 animate-pulse rounded bg-bg-elevated" />
          )}

          {/* Timeframe selector */}
          <div className="flex items-center gap-0.5 rounded-lg bg-bg-elevated p-0.5">
            {CHART_TIMEFRAMES.map((tf) => (
              <button
                key={tf.label}
                onClick={() => setSelectedTimeframe(tf)}
                className={cn(
                  "rounded px-2.5 py-1 font-mono text-[11px] tracking-wider transition-colors",
                  tf.label === selectedTimeframe.label
                    ? "bg-bg-panel text-text-primary shadow-sm"
                    : "text-text-muted hover:text-text-secondary",
                )}
              >
                {tf.label}
              </button>
            ))}
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        <CandlestickChart bars={bars} isLoading={isLoading} isError={isError} />
      </CardContent>
    </Card>
  )
}

// ── Inner chart component ─────────────────────────────────────────────────────

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

  // Create chart + series once on mount
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
        vertLines: { color: "rgba(255,255,255,0.035)" },
        horzLines: { color: "rgba(255,255,255,0.035)" },
      },
      crosshair: {
        horzLine: {
          color: "rgba(255,182,221,0.4)",
          labelBackgroundColor: "#2A1436",
          width: 1,
          style: 2,
        },
        vertLine: {
          color: "rgba(255,182,221,0.4)",
          labelBackgroundColor: "#2A1436",
          width: 1,
          style: 2,
        },
      },
      rightPriceScale: {
        borderColor: "rgba(255,255,255,0.06)",
        textColor: "#A892AD",
        scaleMargins: { top: 0.06, bottom: 0.26 },
      },
      timeScale: {
        borderColor: "rgba(255,255,255,0.06)",
        timeVisible: true,
        secondsVisible: false,
        fixRightEdge: true,
      },
    })

    chartRef.current = chart

    // Candlestick series on the default right price scale
    seriesRef.current = chart.addSeries(CandlestickSeries, CANDLE_STYLE)

    // Volume histogram on its own isolated scale
    volumeRef.current = chart.addSeries(HistogramSeries, VOLUME_STYLE)
    volumeRef.current.priceScale().applyOptions({
      scaleMargins: { top: 0.82, bottom: 0 },
    })

    return () => {
      chart.remove()
      chartRef.current = null
      seriesRef.current = null
      volumeRef.current = null
    }
  }, [])

  // Push new bar data whenever `bars` changes
  useEffect(() => {
    if (!seriesRef.current || !volumeRef.current || bars.length === 0) return
    seriesRef.current.setData(bars)
    volumeRef.current.setData(toVolBars(bars))
    chartRef.current?.timeScale().fitContent()
  }, [bars])

  return (
    <div className="relative h-[26rem] w-full">
      <div ref={containerRef} className="absolute inset-0" />

      {/* Loading skeleton */}
      {isLoading && (
        <div className="absolute inset-0 p-4">
          <Skeleton className="h-full w-full rounded-none opacity-30" />
        </div>
      )}

      {/* Error state */}
      {isError && !isLoading && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <p className="font-mono text-xs text-state-negative">
              Chart data unavailable
            </p>
            <p className="mt-1 font-mono text-[10px] text-text-muted">
              Unable to load price history
            </p>
          </div>
        </div>
      )}

      {/* Empty bars after load */}
      {!isLoading && !isError && bars.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center">
          <p className="font-mono text-xs text-text-muted">
            No data available for this timeframe
          </p>
        </div>
      )}
    </div>
  )
}
