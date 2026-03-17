import { MarketsPanel } from "@/features/markets/MarketsPanel"
import { ChartPanel } from "@/features/charts/ChartPanel"
import { SwapPanel } from "@/features/swap/SwapPanel"
import { TradeHistoryPanel } from "@/features/history/TradeHistoryPanel"

/**
 * Professional Trading Dashboard Layout (Binance/Bybit style)
 *
 * Desktop (xl+):
 * ┌─────────────┬──────────────────────────────────┬─────────────────┐
 * │  Markets    │           Trading Chart          │  Swap Widget    │
 * │   Panel     │                                  │                 │
 * │  (280px)    │            (flex-1)              ├─────────────────┤
 * │             │                                  │  Trade History  │
 * │             │                                  │                 │
 * └─────────────┴──────────────────────────────────┴─────────────────┘
 *
 * Tablet/Mobile: Stacked single column layout
 */
export default function TradingPage() {
  return (
    <div className="grid h-[calc(100vh-3.5rem-2rem)] gap-3 xl:grid-cols-[280px_1fr_340px]">
      {/* LEFT: Markets / Pairs list */}
      <aside className="hidden xl:block overflow-hidden">
        <MarketsPanel />
      </aside>

      {/* CENTER: Trading Chart — takes full available height */}
      <main className="min-h-0 overflow-hidden">
        <ChartPanel />
      </main>

      {/* RIGHT: Swap Widget + Trade History */}
      <aside className="hidden xl:flex xl:flex-col gap-3 overflow-hidden">
        <div className="shrink-0">
          <SwapPanel />
        </div>
        <div className="flex-1 min-h-0 overflow-hidden">
          <TradeHistoryPanel />
        </div>
      </aside>

      {/* Mobile: Show only chart + swap stacked */}
      <div className="xl:hidden col-span-full flex flex-col gap-3">
        <SwapPanel />
      </div>
    </div>
  )
}
