"use client"

import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"
import { normalizeFxPrice } from "@/lib/fxPrice"
import { usePythPrices } from "@/web3/hooks/usePythPrices"
import { usePyth24hChange } from "@/web3/hooks/usePyth24hChange"
import { FX_PAIRS, MARKETS_FEED_IDS } from "@/web3/constants/pairs"
import { TOKENS } from "@/web3/constants/tokens"
import { formatPrice, formatChange, changeDirection } from "@/lib/format"
import { useTradingContext } from "@/contexts/TradingContext"
import type { FxPair } from "@/types/market"

/** Map base currency → token logo symbol */
const LOGO_MAP: Record<string, string> = {
  EUR: TOKENS.tEUR.logoSymbol,
  GBP: TOKENS.tGBP.logoSymbol,
  JPY: TOKENS.tJPY.logoSymbol,
}

const LOGO_COLORS: Record<string, string> = {
  EUR: "bg-blue-500/15 text-blue-300 border-blue-500/25",
  GBP: "bg-violet-500/15 text-violet-300 border-violet-500/25",
  JPY: "bg-amber-500/15 text-amber-300 border-amber-500/25",
}

export function MarketsPanel() {
  const { selectedPair, setSelectedPairBySymbol } = useTradingContext()

  const {
    prices,
    isLoading: livePricesLoading,
    isError: livePricesError,
  } = usePythPrices(MARKETS_FEED_IDS)

  const { historicalPrices, isLoading: historicalLoading } =
    usePyth24hChange(MARKETS_FEED_IDS)

  const isLoading = livePricesLoading

  return (
    <Card className="border-border-subtle bg-bg-panel border-top-accent">
      <CardHeader className="px-4 pb-2 pt-4">
        <div className="flex items-center justify-between">
          <span className="font-mono text-xs font-medium tracking-widest text-text-secondary uppercase">
            Markets
          </span>
          <span className="font-mono text-[10px] text-text-muted">
            {FX_PAIRS.length} pairs
          </span>
        </div>

        {/* Column headers */}
        <div className="mt-3 grid grid-cols-[1fr_auto_auto] gap-x-3 px-1">
          <span className="font-mono text-[10px] tracking-wider text-text-muted uppercase">
            Pair
          </span>
          <span className="font-mono text-[10px] tracking-wider text-text-muted uppercase text-right">
            Price
          </span>
          <span className="w-16 font-mono text-[10px] tracking-wider text-text-muted uppercase text-right">
            24h
          </span>
        </div>
      </CardHeader>

      <CardContent className="px-4 pb-4">
        {livePricesError ? (
          <OracleError />
        ) : isLoading ? (
          <LoadingRows count={FX_PAIRS.length} />
        ) : (
          <div className="space-y-0.5">
            {FX_PAIRS.map((pair) => {
              const normId = pair.priceFeedId.toLowerCase().startsWith("0x")
                ? pair.priceFeedId.toLowerCase()
                : `0x${pair.priceFeedId.toLowerCase()}`

              const livePrice = prices.get(normId)
              const historicalPrice = historicalPrices.get(normId)

              // Normalize prices (invert USD/JPY → JPY/USD)
              const normalizedLive = livePrice
                ? normalizeFxPrice(livePrice.value, pair)
                : null
              const normalizedHistorical = historicalPrice
                ? normalizeFxPrice(historicalPrice, pair)
                : null

              const change24h =
                normalizedLive !== null &&
                normalizedHistorical !== null &&
                !historicalLoading
                  ? ((normalizedLive - normalizedHistorical) /
                      normalizedHistorical) *
                    100
                  : null

              const isSelected = pair.symbol === selectedPair.symbol

              return (
                <MarketRow
                  key={pair.symbol}
                  pair={pair}
                  price={normalizedLive}
                  change24h={change24h}
                  isSelected={isSelected}
                  onSelect={() => setSelectedPairBySymbol(pair.symbol)}
                />
              )
            })}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

interface MarketRowProps {
  pair: FxPair
  price: number | null
  change24h: number | null
  isSelected: boolean
  onSelect: () => void
}

function MarketRow({
  pair,
  price,
  change24h,
  isSelected,
  onSelect,
}: MarketRowProps) {
  const direction = changeDirection(change24h)

  return (
    <button
      onClick={onSelect}
      className={cn(
        "grid w-full grid-cols-[1fr_auto_auto] items-center gap-x-3 rounded-lg px-2 py-2.5 text-left",
        "transition-all",
        isSelected
          ? "bg-brand-primary/10 ring-1 ring-brand-primary/20"
          : "hover:bg-bg-elevated"
      )}
    >
      {/* Pair identity */}
      <div className="flex items-center gap-2 min-w-0">
        <span
          className={cn(
            "flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold border",
            LOGO_COLORS[pair.base] ?? "bg-bg-elevated text-text-secondary border-border-subtle"
          )}
          aria-hidden
        >
          {LOGO_MAP[pair.base] ?? pair.base[0]}
        </span>
        <div className="min-w-0">
          <p className="truncate font-mono text-xs font-semibold text-text-primary leading-tight">
            {pair.symbol}
          </p>
          <p className="font-mono text-[10px] text-text-muted leading-tight">
            {pair.base}/USD
          </p>
        </div>
      </div>

      {/* Price */}
      <span className="font-mono text-xs tabular-nums text-text-primary text-right">
        {price !== null ? formatPrice(price, pair.displayDecimals) : "—"}
      </span>

      {/* 24h change */}
      <span
        className={cn(
          "w-16 font-mono text-xs tabular-nums text-right",
          direction === "positive" && "text-state-positive",
          direction === "negative" && "text-state-negative",
          direction === "neutral" && "text-text-muted"
        )}
      >
        {change24h !== null ? formatChange(change24h) : "—"}
      </span>
    </button>
  )
}

function LoadingRows({ count }: { count: number }) {
  return (
    <div className="space-y-0.5">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="grid grid-cols-[1fr_auto_auto] items-center gap-x-3 px-2 py-2.5"
        >
          <div className="flex items-center gap-2">
            <Skeleton className="h-7 w-7 rounded-full" />
            <div className="space-y-1">
              <Skeleton className="h-3 w-20" />
              <Skeleton className="h-2.5 w-10" />
            </div>
          </div>
          <Skeleton className="h-3 w-16" />
          <Skeleton className="h-3 w-12" />
        </div>
      ))}
    </div>
  )
}

function OracleError() {
  return (
    <div className="rounded-lg border border-state-negative/20 bg-state-negative/5 px-3 py-3 text-center">
      <p className="font-mono text-xs text-state-negative">
        Oracle unavailable
      </p>
      <p className="mt-0.5 font-mono text-[10px] text-text-muted">
        Could not reach Pyth Network
      </p>
    </div>
  )
}
