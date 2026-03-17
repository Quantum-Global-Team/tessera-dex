"use client"

import { useState, useMemo } from "react"
import { Search, Check } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog"
import { cn } from "@/lib/utils"
import { useWallet } from "@/web3/hooks/useWallet"
import { useTokenBalance } from "@/web3/hooks/useTokenBalance"
import {
  TOKENS,
  FX_TOKEN_SYMBOLS,
  QUOTE_TOKEN_SYMBOL,
  type TokenSymbol,
} from "@/web3/constants/tokens"
import type { TokenMetadata } from "@/types/token"

const ALL_TOKENS: TokenSymbol[] = [...FX_TOKEN_SYMBOLS, QUOTE_TOKEN_SYMBOL]

type AssetClass = "All" | "Fiat" | "Stable"

const TOKEN_CLASS: Record<TokenSymbol, AssetClass> = {
  tEUR: "Fiat",
  tGBP: "Fiat",
  tJPY: "Fiat",
  USDC: "Stable",
}

const CLASS_TABS: AssetClass[] = ["All", "Fiat", "Stable"]

const ICON_STYLE: Record<TokenSymbol, string> = {
  tEUR: "bg-blue-500/15 text-blue-300 border-blue-500/20",
  tGBP: "bg-violet-500/15 text-violet-300 border-violet-500/20",
  tJPY: "bg-amber-500/15 text-amber-300 border-amber-500/20",
  USDC: "bg-sky-500/15 text-sky-300 border-sky-500/20",
}

const CLASS_BADGE_STYLE: Record<AssetClass, string> = {
  All: "",
  Fiat: "bg-violet-500/10 text-violet-400",
  Stable: "bg-sky-500/10 text-sky-400",
}

export interface TokenSelectorModalProps {
  open: boolean
  onClose: () => void
  onSelect: (symbol: TokenSymbol) => void
  excludeSymbol?: TokenSymbol
  selectedSymbol?: TokenSymbol
}

export function TokenSelectorModal({
  open,
  onClose,
  onSelect,
  excludeSymbol,
  selectedSymbol,
}: TokenSelectorModalProps) {
  const [search, setSearch] = useState("")
  const [activeClass, setActiveClass] = useState<AssetClass>("All")
  const wallet = useWallet()

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim()
    return ALL_TOKENS.filter((sym) => {
      if (sym === excludeSymbol) return false
      if (activeClass !== "All" && TOKEN_CLASS[sym] !== activeClass) return false
      if (q) {
        return (
          sym.toLowerCase().includes(q) ||
          TOKENS[sym].name.toLowerCase().includes(q)
        )
      }
      return true
    })
  }, [search, activeClass, excludeSymbol])

  function handleSelect(symbol: TokenSymbol) {
    onSelect(symbol)
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

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="w-full max-w-sm gap-0 rounded-2xl border border-border-strong bg-bg-panel p-0 shadow-2xl"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 pb-3 pt-5">
          <DialogTitle className="font-mono text-sm font-semibold tracking-wider text-text-primary">
            Select Asset
          </DialogTitle>
          <button
            onClick={onClose}
            className="flex h-6 w-6 items-center justify-center rounded-md font-mono text-xs text-text-muted transition-colors hover:text-text-primary"
          >
            ✕
          </button>
        </div>

        {/* Search */}
        <div className="px-4 pb-3">
          <div className="flex items-center gap-2 rounded-lg bg-bg-elevated px-3 py-2 ring-1 ring-border-subtle focus-within:ring-brand-primary/40 transition-all">
            <Search className="h-3.5 w-3.5 shrink-0 text-text-muted" />
            <input
              type="text"
              placeholder="Search name or ticker…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex-1 bg-transparent font-mono text-xs text-text-primary outline-none placeholder:text-text-muted"
              autoFocus
            />
          </div>
        </div>

        {/* Asset class tabs */}
        <div className="flex gap-1 px-4 pb-3">
          {CLASS_TABS.map((cls) => (
            <button
              key={cls}
              onClick={() => setActiveClass(cls)}
              className={cn(
                "rounded-md px-3 py-1 font-mono text-[11px] tracking-wider uppercase transition-colors",
                activeClass === cls
                  ? "bg-brand-primary/15 text-brand-primary"
                  : "text-text-muted hover:text-text-secondary",
              )}
            >
              {cls}
            </button>
          ))}
        </div>

        <div className="mx-4 border-t border-border-subtle" />

        {/* Token list */}
        <div className="max-h-72 overflow-y-auto px-2 py-2">
          {filtered.length === 0 ? (
            <div className="flex h-20 items-center justify-center">
              <p className="font-mono text-xs text-text-muted">No assets found</p>
            </div>
          ) : (
            filtered.map((sym) => (
              <TokenRow
                key={sym}
                symbol={sym}
                token={TOKENS[sym]}
                walletAddress={wallet.address}
                isSelected={sym === selectedSymbol}
                onSelect={handleSelect}
              />
            ))
          )}
        </div>

        <div className="border-t border-border-subtle px-5 py-3">
          <p className="font-mono text-[10px] text-text-muted">
            Supported assets on PrismaFi
          </p>
        </div>
      </DialogContent>
    </Dialog>
  )
}

interface TokenRowProps {
  symbol: TokenSymbol
  token: TokenMetadata
  walletAddress: `0x${string}` | undefined
  isSelected: boolean
  onSelect: (symbol: TokenSymbol) => void
}

function TokenRow({
  symbol,
  token,
  walletAddress,
  isSelected,
  onSelect,
}: TokenRowProps) {
  const { formatted, isLoading } = useTokenBalance(token, walletAddress)

  return (
    <button
      onClick={() => onSelect(symbol)}
      className={cn(
        "flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left transition-colors",
        isSelected ? "bg-brand-primary/10" : "hover:bg-bg-elevated",
      )}
    >
      {/* Token icon badge */}
      <div
        className={cn(
          "flex h-9 w-9 shrink-0 items-center justify-center rounded-full border font-mono text-base font-bold",
          ICON_STYLE[symbol],
        )}
      >
        {token.logoSymbol}
      </div>

      {/* Name + symbol */}
      <div className="flex flex-1 flex-col gap-0.5">
        <span className="font-mono text-sm font-semibold text-text-primary">
          {symbol}
        </span>
        <span className="font-mono text-[11px] text-text-muted">{token.name}</span>
      </div>

      {/* Balance + class badge */}
      <div className="flex flex-col items-end gap-1">
        <span
          className={cn(
            "font-mono text-xs tabular-nums",
            isLoading ? "text-text-muted" : "text-text-secondary",
          )}
        >
          {isLoading ? "—" : formatted}
        </span>
        <span
          className={cn(
            "rounded px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-wider",
            CLASS_BADGE_STYLE[TOKEN_CLASS[symbol]],
          )}
        >
          {TOKEN_CLASS[symbol]}
        </span>
      </div>

      {isSelected && (
        <Check className="ml-0.5 h-3.5 w-3.5 shrink-0 text-brand-primary" />
      )}
    </button>
  )
}
