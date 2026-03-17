"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { ConnectButton } from "@rainbow-me/rainbowkit"

import { NAV_ITEMS } from "@/lib/navigation"
import { cn } from "@/lib/utils"

export function Header() {
  const pathname = usePathname()

  return (
    <header className="fixed inset-x-0 top-0 z-50 h-14 border-b border-border-subtle bg-bg-primary/80 backdrop-blur-md">
      <div className="mx-auto flex h-full max-w-screen-2xl items-center gap-8 px-6">
        {/* Wordmark */}
        <Link href="/" className="flex shrink-0 items-center gap-3">
          <span className="font-mono text-sm font-bold tracking-[0.18em] text-text-primary uppercase">
            PrismaFi
          </span>
          <span className="hidden font-mono text-[10px] tracking-widest text-text-muted sm:block">
            FOREX DEX
          </span>
        </Link>

        {/* Navigation */}
        <nav className="hidden flex-1 items-center gap-0 md:flex">
          {NAV_ITEMS.map(({ label, href, icon: Icon }) => {
            const isActive = pathname === href
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  "relative flex items-center gap-1.5 px-4 py-4 font-mono text-xs tracking-wider uppercase transition-colors",
                  isActive
                    ? "text-brand-primary after:absolute after:bottom-0 after:inset-x-4 after:h-px after:bg-brand-primary"
                    : "text-text-secondary hover:text-text-primary",
                )}
              >
                <Icon className="h-3.5 w-3.5" strokeWidth={1.5} />
                {label}
              </Link>
            )
          })}
        </nav>

        {/* Right: RainbowKit Wallet Connection */}
        <div className="ml-auto">
          <ConnectButton.Custom>
            {({
              account,
              chain,
              openAccountModal,
              openChainModal,
              openConnectModal,
              mounted,
            }) => {
              const ready = mounted
              const connected = ready && account && chain

              return (
                <div
                  {...(!ready && {
                    "aria-hidden": true,
                    style: {
                      opacity: 0,
                      pointerEvents: "none",
                      userSelect: "none",
                    },
                  })}
                >
                  {(() => {
                    if (!connected) {
                      return (
                        <button
                          onClick={openConnectModal}
                          className="rounded-lg border border-brand-primary/40 px-4 py-2 font-mono text-xs tracking-wider text-brand-primary uppercase transition-all hover:border-brand-primary hover:bg-brand-primary/10 glow-brand-sm"
                        >
                          Connect Wallet
                        </button>
                      )
                    }

                    if (chain.unsupported) {
                      return (
                        <button
                          onClick={openChainModal}
                          className="rounded-lg border border-state-negative/40 px-4 py-2 font-mono text-xs tracking-wider text-state-negative uppercase transition-all hover:border-state-negative hover:bg-state-negative/10"
                        >
                          Wrong Network
                        </button>
                      )
                    }

                    return (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={openChainModal}
                          className="flex items-center gap-1.5 rounded-lg border border-border-subtle px-3 py-2 font-mono text-[10px] text-text-secondary transition-all hover:border-border-strong hover:text-text-primary"
                        >
                          {chain.hasIcon && chain.iconUrl && (
                            <img
                              alt={chain.name ?? "Chain icon"}
                              src={chain.iconUrl}
                              className="h-4 w-4 rounded-full"
                            />
                          )}
                          {chain.name}
                        </button>

                        <button
                          onClick={openAccountModal}
                          className="rounded-lg border border-brand-primary/40 px-4 py-2 font-mono text-xs tracking-wider text-brand-primary transition-all hover:border-brand-primary hover:bg-brand-primary/10 glow-brand-sm"
                        >
                          {account.displayName}
                        </button>
                      </div>
                    )
                  })()}
                </div>
              )
            }}
          </ConnectButton.Custom>
        </div>
      </div>
    </header>
  )
}
