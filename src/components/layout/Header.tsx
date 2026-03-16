"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Hexagon, Wifi } from "lucide-react"

import { NAV_ITEMS } from "@/lib/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

export function Header() {
  const pathname = usePathname()

  return (
    <header className="fixed inset-x-0 top-0 z-50 h-14 border-b border-border-subtle bg-bg-primary">
      <div className="mx-auto flex h-full max-w-screen-2xl items-center gap-8 px-6">
        {/* Logo */}
        <Link href="/" className="flex shrink-0 items-center gap-2">
          <Hexagon
            className="h-6 w-6 text-brand-primary"
            strokeWidth={1.5}
          />
          <span className="text-sm font-semibold tracking-widest text-text-primary uppercase">
            Tessera
          </span>
          <span className="hidden text-xs font-mono tracking-wider text-text-secondary sm:block">
            / FOREX DEX
          </span>
        </Link>

        {/* Navigation */}
        <nav className="hidden flex-1 items-center gap-1 md:flex">
          {NAV_ITEMS.map(({ label, href, icon: Icon }) => {
            const isActive = pathname === href
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  "flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm transition-colors",
                  isActive
                    ? "bg-bg-panel text-text-primary"
                    : "text-text-secondary hover:bg-bg-panel/60 hover:text-text-primary",
                )}
              >
                <Icon className="h-3.5 w-3.5" strokeWidth={1.5} />
                {label}
              </Link>
            )
          })}
        </nav>

        {/* Right: Network status + Wallet */}
        <div className="ml-auto flex items-center gap-3">
          <NetworkStatus />
          <Button
            size="sm"
            className="bg-brand-primary text-bg-primary font-medium hover:bg-brand-secondary hover:text-text-primary"
          >
            Connect Wallet
          </Button>
        </div>
      </div>
    </header>
  )
}

function NetworkStatus() {
  return (
    <div className="hidden items-center gap-1.5 rounded-md border border-border-subtle px-2.5 py-1 sm:flex">
      <Wifi className="h-3 w-3 text-state-positive" strokeWidth={2} />
      <span className="font-mono text-[11px] text-text-secondary">
        Moonbeam
      </span>
      <span className="h-1.5 w-1.5 rounded-full bg-state-positive" />
    </div>
  )
}
