import type { LucideIcon } from "lucide-react"
import { ArrowLeftRight, BarChart3, Clock, Wallet } from "lucide-react"

export interface NavItem {
  label: string
  href: string
  icon: LucideIcon
}

export const NAV_ITEMS: NavItem[] = [
  { label: "Trade", href: "/", icon: ArrowLeftRight },
  { label: "Markets", href: "/markets", icon: BarChart3 },
  { label: "Portfolio", href: "/portfolio", icon: Wallet },
  { label: "History", href: "/history", icon: Clock },
]
