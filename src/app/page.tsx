import { ChartPanel } from "@/features/charts/ChartPanel"
import { SwapPanel } from "@/features/swap/SwapPanel"
import { TradeHistoryPanel } from "@/features/history/TradeHistoryPanel"

/**
 * Professional Trading Dashboard Layout (Binance/Bybit style)
 *
 * Desktop (lg+):
 * ┌──────────────────────────────────────────────┬─────────────────┐
 * │   [Pair Selector ▼]    [1H][4H][1D][1W][1M]  │  Swap Widget    │
 * │                                              │                 │
 * │              Trading Chart                   ├─────────────────┤
 * │    (infinite scroll historical data)         │  Trade History  │
 * │                                              │                 │
 * └──────────────────────────────────────────────┴─────────────────┘
 *
 * Mobile: Single vertical column (Chart → Swap → History)
 */
export default function TradingPage() {
  return (
    <div className="flex flex-col lg:flex-row h-[calc(100vh-3.5rem-2rem)] gap-3">
      {/* MAIN: Trading Chart — takes all available space */}
      <main className="flex-1 min-h-0 min-w-0 overflow-hidden">
        <ChartPanel />
      </main>

      {/* RIGHT SIDEBAR: Swap Widget + Trade History */}
      <aside className="w-full lg:w-[340px] shrink-0 flex flex-col gap-3 overflow-hidden">
        <div className="shrink-0">
          <SwapPanel />
        </div>
        <div className="flex-1 min-h-0 overflow-hidden hidden lg:block">
          <TradeHistoryPanel />
        </div>
      </aside>
    </div>
  )
}
