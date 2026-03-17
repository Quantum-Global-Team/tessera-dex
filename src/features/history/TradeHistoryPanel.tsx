"use client"

import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { useWallet } from "@/web3/hooks/useWallet"
import { Wallet, Clock, ArrowRightLeft } from "lucide-react"

/**
 * Trade History Panel
 *
 * Shows recent swap transactions for the connected wallet.
 * If no wallet connected, shows a prompt to connect.
 */
export function TradeHistoryPanel() {
  const wallet = useWallet()

  return (
    <Card className="h-full border-border-subtle bg-bg-panel border-top-accent flex flex-col">
      <CardHeader className="px-4 pb-2 pt-4 shrink-0">
        <div className="flex items-center justify-between">
          <span className="font-mono text-xs font-medium tracking-widest text-text-secondary uppercase">
            Trade History
          </span>
          <Clock className="h-3.5 w-3.5 text-text-muted" />
        </div>
      </CardHeader>

      <CardContent className="flex-1 px-4 pb-4 overflow-auto">
        {!wallet.isConnected ? (
          <NotConnectedState />
        ) : (
          <EmptyHistoryState />
        )}
      </CardContent>
    </Card>
  )
}

function NotConnectedState() {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-3 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-bg-elevated border border-border-subtle">
        <Wallet className="h-5 w-5 text-text-muted" />
      </div>
      <div>
        <p className="font-mono text-xs text-text-secondary">
          Connect Wallet
        </p>
        <p className="mt-1 font-mono text-[10px] text-text-muted">
          View your trade history
        </p>
      </div>
    </div>
  )
}

function EmptyHistoryState() {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-3 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-bg-elevated border border-border-subtle">
        <ArrowRightLeft className="h-5 w-5 text-text-muted" />
      </div>
      <div>
        <p className="font-mono text-xs text-text-secondary">
          No trades yet
        </p>
        <p className="mt-1 font-mono text-[10px] text-text-muted">
          Your swaps will appear here
        </p>
      </div>
    </div>
  )
}
