"use client"

import {
  createContext,
  useContext,
  useState,
  useCallback,
  type ReactNode,
} from "react"
import { FX_PAIRS } from "@/web3/constants/pairs"
import type { FxPair } from "@/types/market"

interface TradingContextValue {
  /** Currently selected trading pair */
  selectedPair: FxPair
  /** Index in FX_PAIRS array */
  selectedPairIndex: number
  /** Update the selected pair by index */
  setSelectedPairIndex: (index: number) => void
  /** Update the selected pair by symbol */
  setSelectedPairBySymbol: (symbol: string) => void
}

const TradingContext = createContext<TradingContextValue | null>(null)

interface TradingProviderProps {
  children: ReactNode
}

/**
 * Global trading context provider.
 * Manages the currently selected trading pair across all components:
 * Chart, Markets panel, Swap widget, etc.
 */
export function TradingProvider({ children }: TradingProviderProps) {
  const [selectedPairIndex, setSelectedPairIndex] = useState(0)

  const selectedPair = FX_PAIRS[selectedPairIndex]

  const setSelectedPairBySymbol = useCallback((symbol: string) => {
    const index = FX_PAIRS.findIndex((p) => p.symbol === symbol)
    if (index !== -1) {
      setSelectedPairIndex(index)
    }
  }, [])

  return (
    <TradingContext.Provider
      value={{
        selectedPair,
        selectedPairIndex,
        setSelectedPairIndex,
        setSelectedPairBySymbol,
      }}
    >
      {children}
    </TradingContext.Provider>
  )
}

/**
 * Hook to access the global trading context.
 * Must be used within a TradingProvider.
 */
export function useTradingContext() {
  const context = useContext(TradingContext)
  if (!context) {
    throw new Error("useTradingContext must be used within a TradingProvider")
  }
  return context
}
