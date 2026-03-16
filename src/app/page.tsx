import { MarketsPanelShell } from "@/features/markets/MarketsPanelShell"
import { ChartPanelShell } from "@/features/charts/ChartPanelShell"
import { SwapPanelShell } from "@/features/swap/SwapPanelShell"
import { PortfolioPanelShell } from "@/features/portfolio/PortfolioPanelShell"

export default function TradingPage() {
  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-[280px_1fr]">
      {/* Left column — markets list */}
      <MarketsPanelShell />

      {/* Right column — chart + swap + portfolio */}
      <div className="flex flex-col gap-4">
        <ChartPanelShell />
        <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
          <SwapPanelShell />
          <PortfolioPanelShell />
        </div>
      </div>
    </div>
  )
}
