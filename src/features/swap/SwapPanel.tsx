"use client"

import { useState } from "react"
import { ArrowUpDown, Settings2 } from "lucide-react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"
import { useSwapQuote } from "@/web3/hooks/useSwapQuote"
import { useWallet } from "@/web3/hooks/useWallet"
import { useWalletActions } from "@/web3/hooks/useWalletActions"
import {
  TOKENS,
  FX_TOKEN_SYMBOLS,
  QUOTE_TOKEN_SYMBOL,
  type TokenSymbol,
} from "@/web3/constants/tokens"

const ALL_SWAP_TOKENS: TokenSymbol[] = [...FX_TOKEN_SYMBOLS, QUOTE_TOKEN_SYMBOL]
const SLIPPAGE_OPTIONS = [0.1, 0.5, 1.0]

export function SwapPanel() {
  const [inputSymbol, setInputSymbol] = useState<TokenSymbol>("tEUR")
  const [outputSymbol, setOutputSymbol] = useState<TokenSymbol>("USDC")
  const [inputAmount, setInputAmount] = useState("")
  const [slippage, setSlippage] = useState(0.5)

  const { quote } = useSwapQuote(inputSymbol, outputSymbol, inputAmount)
  const wallet = useWallet()
  const { openConnectModal } = useWalletActions()

  function handleFlip() {
    const prevInput = inputSymbol
    const prevOutput = outputSymbol
    setInputSymbol(prevOutput)
    setOutputSymbol(prevInput)
    if (quote) setInputAmount(quote.outputAmount)
  }

  function handleInputChange(value: string) {
    // Allow only numeric input with optional decimal point
    if (/^\d*\.?\d*$/.test(value)) setInputAmount(value)
  }

  function handleInputSymbolChange(symbol: TokenSymbol) {
    setInputSymbol(symbol)
    // Prevent same-pair selection
    if (symbol === outputSymbol) {
      setOutputSymbol(
        ALL_SWAP_TOKENS.find((s) => s !== symbol) ?? QUOTE_TOKEN_SYMBOL,
      )
    }
  }

  function handleOutputSymbolChange(symbol: TokenSymbol) {
    setOutputSymbol(symbol)
    if (symbol === inputSymbol) {
      setInputSymbol(
        ALL_SWAP_TOKENS.find((s) => s !== symbol) ?? FX_TOKEN_SYMBOLS[0],
      )
    }
  }

  const ctaLabel = (() => {
    if (!wallet.isConnected) return "Connect Wallet"
    if (!wallet.isCorrectNetwork) return "Wrong Network"
    if (!inputAmount || parseFloat(inputAmount) <= 0) return "Enter Amount"
    if (!quote) return "Fetching Quote…"
    return "Swap"
  })()

  const canSwap =
    wallet.isConnected &&
    wallet.isCorrectNetwork &&
    !!quote &&
    parseFloat(inputAmount) > 0

  return (
    <Card className="border-border-subtle bg-bg-panel border-top-accent">
      <CardHeader className="px-4 pb-2 pt-4">
        <div className="flex items-center justify-between">
          <span className="font-mono text-xs font-medium tracking-widest text-text-secondary uppercase">
            Swap
          </span>
          <span className="font-mono text-[10px] text-text-muted">
            Powered by Pyth
          </span>
        </div>
      </CardHeader>

      <CardContent className="space-y-2 px-4 pb-4">
        {/* Sell (input) */}
        <AmountBox
          label="You pay"
          amount={inputAmount}
          symbol={inputSymbol}
          availableTokens={ALL_SWAP_TOKENS}
          onAmountChange={handleInputChange}
          onSymbolChange={handleInputSymbolChange}
          readonly={false}
        />

        {/* Flip button */}
        <div className="flex justify-center py-0.5">
          <button
            onClick={handleFlip}
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-border-subtle bg-bg-elevated text-text-muted transition-all hover:border-brand-primary/40 hover:text-brand-primary hover:rotate-180 duration-300"
            aria-label="Flip tokens"
          >
            <ArrowUpDown className="h-3.5 w-3.5" />
          </button>
        </div>

        {/* Buy (output) */}
        <AmountBox
          label="You receive"
          amount={quote?.outputAmountAfterFee ?? ""}
          symbol={outputSymbol}
          availableTokens={ALL_SWAP_TOKENS.filter((s) => s !== inputSymbol)}
          onAmountChange={() => undefined}
          onSymbolChange={handleOutputSymbolChange}
          readonly
          placeholder={quote ? undefined : "—"}
        />

        {/* Quote details */}
        {quote && (
          <>
            <Separator className="bg-border-subtle" />
            <div className="space-y-1.5 px-1">
              <QuoteRow label="Rate" value={quote.rateFormatted} />
              <QuoteRow
                label="Fee"
                value={`${quote.feePercent}%`}
              />
              <QuoteRow
                label="Min. received"
                value={`${(
                  parseFloat(quote.outputAmountAfterFee) *
                  (1 - slippage / 100)
                ).toFixed(5)} ${outputSymbol}`}
                muted
              />
            </div>
          </>
        )}

        {/* Slippage */}
        <div className="flex items-center justify-between px-1 pt-1">
          <div className="flex items-center gap-1 text-text-muted">
            <Settings2 className="h-3 w-3" />
            <span className="font-mono text-[10px]">Slippage</span>
          </div>
          <div className="flex gap-1">
            {SLIPPAGE_OPTIONS.map((pct) => (
              <button
                key={pct}
                onClick={() => setSlippage(pct)}
                className={cn(
                  "rounded px-2 py-0.5 font-mono text-[10px] transition-colors",
                  slippage === pct
                    ? "bg-brand-primary/15 text-brand-primary"
                    : "text-text-muted hover:text-text-secondary",
                )}
              >
                {pct}%
              </button>
            ))}
          </div>
        </div>

        {/* CTA */}
        <Button
          className={cn(
            "w-full font-mono text-xs tracking-wider uppercase",
            canSwap
              ? "bg-brand-primary text-bg-primary hover:bg-brand-secondary glow-brand-sm"
              : "border border-border-subtle bg-transparent text-text-muted cursor-default",
          )}
          onClick={!wallet.isConnected ? openConnectModal : undefined}
          disabled={wallet.isConnected && !canSwap}
        >
          {ctaLabel}
        </Button>
      </CardContent>
    </Card>
  )
}

interface AmountBoxProps {
  label: string
  amount: string
  symbol: TokenSymbol
  availableTokens: TokenSymbol[]
  onAmountChange: (v: string) => void
  onSymbolChange: (s: TokenSymbol) => void
  readonly: boolean
  placeholder?: string
}

function AmountBox({
  label,
  amount,
  symbol,
  availableTokens,
  onAmountChange,
  onSymbolChange,
  readonly,
  placeholder,
}: AmountBoxProps) {
  return (
    <div className="rounded-lg bg-bg-elevated px-3 py-2.5">
      <span className="font-mono text-[10px] text-text-muted">{label}</span>
      <div className="mt-1 flex items-center gap-3">
        <input
          type="text"
          inputMode="decimal"
          value={amount}
          onChange={(e) => onAmountChange(e.target.value)}
          readOnly={readonly}
          placeholder={placeholder ?? "0.00"}
          className="min-w-0 flex-1 bg-transparent font-mono text-xl tabular-nums text-text-primary outline-none placeholder:text-text-muted"
        />
        <Select
          value={symbol}
          onValueChange={(v) => onSymbolChange(v as TokenSymbol)}
        >
          <SelectTrigger className="h-8 w-auto shrink-0 gap-1.5 border-border-subtle bg-bg-panel px-2.5 font-mono text-xs text-text-primary hover:border-brand-primary/40">
            <span>{TOKENS[symbol].logoSymbol}</span>
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="border-border-subtle bg-bg-elevated font-mono text-xs">
            {availableTokens.map((sym) => (
              <SelectItem
                key={sym}
                value={sym}
                className="font-mono text-xs text-text-primary focus:bg-bg-panel"
              >
                {TOKENS[sym].logoSymbol} {sym}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}

interface QuoteRowProps {
  label: string
  value: string
  muted?: boolean
}

function QuoteRow({ label, value, muted }: QuoteRowProps) {
  return (
    <div className="flex items-center justify-between">
      <span className="font-mono text-[10px] text-text-muted">{label}</span>
      <span
        className={cn(
          "font-mono text-[11px] tabular-nums",
          muted ? "text-text-muted" : "text-text-secondary",
        )}
      >
        {value}
      </span>
    </div>
  )
}
