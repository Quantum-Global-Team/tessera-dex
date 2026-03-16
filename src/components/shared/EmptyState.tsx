import type { LucideIcon } from "lucide-react"
import { InboxIcon } from "lucide-react"

import { cn } from "@/lib/utils"

interface EmptyStateProps {
  icon?: LucideIcon
  title: string
  description?: string
  action?: React.ReactNode
  className?: string
}

export function EmptyState({
  icon: Icon = InboxIcon,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-3 rounded-md border border-border-subtle bg-bg-primary px-6 py-10 text-center",
        className,
      )}
    >
      <Icon className="h-8 w-8 text-text-secondary" strokeWidth={1} />
      <div className="space-y-1">
        <p className="text-sm font-medium text-text-primary">{title}</p>
        {description && (
          <p className="text-xs text-text-secondary">{description}</p>
        )}
      </div>
      {action}
    </div>
  )
}
