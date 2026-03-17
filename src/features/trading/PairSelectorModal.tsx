"use client"

import { useState, useMemo } from "react"
import { Search, ChevronDown, TrendingUp, DollarSign, BarChart3, X } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog"
import { cn } from "@/lib/utils"
import { usePythPrices } from "@/web3/hooks/usePythPrices"
import { normalizeFxPrice } from "@/lib/fxPrice"
import { FX_PAIRS, MARKETS_FEED_IDS } from "@/web3/constants/pairs"
import { formatPrice } from "@/lib/format"
import { useTradingContext } from "@/contexts/TradingContext"
import type { FxPair } from "@/types/market"

type AssetClass = "All" | "Forex" | "Crypto" | "Stocks"

const ASSET_CLASS_TABS: { label: AssetClass; icon: typeof DollarSign }[] = [
  { label: "All", icon: BarChart3 },
  { label: "Forex", icon: DollarSign },
  { label: "Crypto", icon: TrendingUp },
  { label: "Stocks", icon: BarChart3 },
]

const PAIR_ICONS: Record<string, { bg: string; symbol: string }> = {
  "tEUR/USDC": { bg: "bg-blue-500/20 border-blue-500/30", symbol: "€" },
  "tGBP/USDC": { bg: "bg-violet-500/20 border-violet-500/30", symbol: "£" },
  "tJPY/USDC": { bg: "bg-amber-500/20 border-amber-500/30", symbol: "¥" },
}

// ── Trigger button ───────────────────────────────────────────────────────────

interface PairSelectorTriggerProps {
  onClick: () => void
  pair: FxPair
  price: number | null
}

export function PairSelectorTrigger({ onClick, pair, price }: PairSelectorTriggerProps) {
  const iconConfig = PAIR_ICONS[pair.symbol] ?? { bg: "bg-gray-500/20 border-gray-500/30", symbol: "?" }

  return (
    <button
      onClick={onClick}
      className={cn(
        "flex items-center gap-3 rounded-xl px-3 py-2 transition-all",
        "bg-bg-elevated/50 hover:bg-bg-elevated",
        "border border-border-subtle hover:border-border-strong",
        "group"
      )}
    >
      {/* Pair icon */}
      <div
        className={cn(
          "flex h-9 w-9 items-center justify-center rounded-full border text-lg font-bold",
          iconConfig.bg
        )}
      >
        {iconConfig.symbol}
      </div>

      {/* Pair info */}
      <div className="flex flex-col items-start">
        <span className="font-mono text-sm font-semibold text-text-primary">
          {pair.symbol}
        </span>
        {price !== null && (
          <span className="font-mono text-xs tabular-nums text-text-muted">
            ${formatPrice(price, pair.displayDecimals)}
          </span>
        )}
      </div>

      {/* Chevron */}
      <ChevronDown className="ml-1 h-4 w-4 text-text-muted transition-transform group-hover:text-text-secondary" />
    </button>
  )
}

// ── Modal ────────────────────────────────────────────────────────────────────

interface PairSelectorModalProps {
  open: boolean
  onClose: () => void
}

export function PairSelectorModal({ open, onClose }: PairSelectorModalProps) {
  const { selectedPair, setSelectedPairBySymbol } = useTradingContext()
  const [search, setSearch] = useState("")
  const [activeClass, setActiveClass] = useState<AssetClass>("All")

  const { prices } = usePythPrices(MARKETS_FEED_IDS)

  const filteredPairs = useMemo(() => {
    const q = search.toLowerCase().trim()

    return FX_PAIRS.filter((pair) => {
      // Filter by asset class (all current pairs are Forex)
      if (activeClass !== "All" && activeClass !== "Forex") return false

      // Filter by search
      if (q) {
        return (
          pair.symbol.toLowerCase().includes(q) ||
          pair.base.toLowerCase().includes(q)
        )
      }
      return true
    })
  }, [search, activeClass])

  function handleSelect(symbol: string) {
    setSelectedPairBySymbol(symbol)
    onClose()
    setSearch("")
    setActiveClass("All")
  }

  function handleOpenChange(isOpen: boolean) {
    if (!isOpen) {
      onClose()
      setSearch("")
      setActiveClass("All")
    }
  }

  function getPriceForPair(pair: FxPair): number | null {
    const normId = pair.priceFeedId.toLowerCase().startsWith("0x")
      ? pair.priceFeedId.toLowerCase()
      : `0x${pair.priceFeedId.toLowerCase()}`

    const livePrice = prices.get(normId)
    if (!livePrice) return null

    return normalizeFxPrice(livePrice.value, pair)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="w-full max-w-md gap-0 rounded-2xl border border-border-strong bg-bg-panel p-0 shadow-2xl"
      >
        {/* ── Header ── */}
        <div className="flex items-center justify-between border-b border-border-subtle px-5 pb-4 pt-5">
          <DialogTitle className="font-mono text-sm font-semibold tracking-wide text-text-primary uppercase">
            Select Market
          </DialogTitle>
          <button
            onClick={onClose}
            className="flex h-7 w-7 items-center justify-center rounded-lg text-text-muted transition-colors hover:bg-bg-elevated hover:text-text-primary"
            aria-label="Close"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>

        {/* ── Search ── */}
        <div className="px-4 py-3">
          <div className="flex items-center gap-2.5 rounded-xl bg-bg-elevated px-3.5 py-2.5 ring-1 ring-border-subtle transition-all focus-within:ring-brand-primary/50">
            <Search className="h-4 w-4 shrink-0 text-text-muted" />
            <input
              type="text"
              placeholder="Search markets..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex-1 bg-transparent font-mono text-sm text-text-primary outline-none placeholder:text-text-muted"
              autoFocus
            />
          </div>
        </div>

        {/* ── Asset class tabs ── */}
        <div className="flex gap-1 border-b border-border-subtle px-4 pb-3">
          {ASSET_CLASS_TABS.map(({ label, icon: Icon }) => {
            const isDisabled = label === "Crypto" || label === "Stocks"
            return (
              <button
                key={label}
                onClick={() => !isDisabled && setActiveClass(label)}
                disabled={isDisabled}
                className={cn(
                  "flex items-center gap-1.5 rounded-lg px-3 py-1.5 font-mono text-[11px] tracking-wider uppercase transition-all",
                  activeClass === label
                    ? "bg-brand-primary/15 text-brand-primary ring-1 ring-brand-primary/20"
                    : "text-text-muted hover:text-text-secondary",
                  isDisabled && "opacity-40 cursor-not-allowed"
                )}
              >
                <Icon className="h-3 w-3" />
                {label}
                {isDisabled && (
                  <span className="ml-1 text-[9px] text-text-muted/60">Soon</span>
                )}
              </button>
            )
          })}
        </div>

        {/* ── Market list ── */}
        <div className="max-h-[20rem] overflow-y-auto px-2 py-2">
          {filteredPairs.length === 0 ? (
            <div className="flex h-24 items-center justify-center">
              <p className="font-mono text-xs text-text-muted">No markets found</p>
            </div>
          ) : (
            filteredPairs.map((pair) => {
              const price = getPriceForPair(pair)
              const isSelected = pair.symbol === selectedPair.symbol
              const iconConfig = PAIR_ICONS[pair.symbol] ?? {
                bg: "bg-gray-500/20 border-gray-500/30",
                symbol: "?",
              }

              return (
                <button
                  key={pair.symbol}
                  onClick={() => handleSelect(pair.symbol)}
                  className={cn(
                    "flex w-full items-center gap-3.5 rounded-xl px-3 py-3 text-left transition-colors",
                    isSelected
                      ? "bg-brand-primary/10 ring-1 ring-brand-primary/20"
                      : "hover:bg-bg-elevated"
                  )}
                >
                  {/* Icon */}
                  <div
                    className={cn(
                      "flex h-10 w-10 shrink-0 items-center justify-center rounded-full border text-lg font-bold",
                      iconConfig.bg
                    )}
                  >
                    {iconConfig.symbol}
                  </div>

                  {/* Pair details */}
                  <div className="flex flex-1 flex-col gap-0.5 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-sm font-semibold text-text-primary">
                        {pair.symbol}
                      </span>
                      <span className="rounded bg-violet-500/10 px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-wider text-violet-400">
                        Forex
                      </span>
                    </div>
                    <span className="truncate font-mono text-[11px] text-text-muted">
                      {pair.base} / USD Perpetual
                    </span>
                  </div>

                  {/* Price */}
                  <div className="flex flex-col items-end gap-0.5">
                    <span className="font-mono text-sm font-medium tabular-nums text-text-primary">
                      {price !== null ? `$${formatPrice(price, pair.displayDecimals)}` : "—"}
                    </span>
                    <span className="font-mono text-[10px] text-text-muted">
                      Oracle Price
                    </span>
                  </div>
                </button>
              )
            })
          )}
        </div>

        {/* ── Footer ── */}
        <div className="border-t border-border-subtle px-5 py-3">
          <p className="font-mono text-[10px] text-text-muted">
            {FX_PAIRS.length} Forex pairs • Crypto & Stocks coming soon
          </p>
        </div>
      </DialogContent>
    </Dialog>
  )
}
