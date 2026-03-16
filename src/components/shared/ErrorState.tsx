import type { LucideIcon } from "lucide-react"
import { AlertTriangle } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

interface ErrorStateProps {
  icon?: LucideIcon
  title?: string
  description?: string
  onRetry?: () => void
  className?: string
}

export function ErrorState({
  icon: Icon = AlertTriangle,
  title = "Something went wrong",
  description,
  onRetry,
  className,
}: ErrorStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-3 rounded-md border border-state-negative/30 bg-state-negative/5 px-6 py-10 text-center",
        className,
      )}
    >
      <Icon className="h-8 w-8 text-state-negative" strokeWidth={1} />
      <div className="space-y-1">
        <p className="text-sm font-medium text-text-primary">{title}</p>
        {description && (
          <p className="text-xs text-text-secondary">{description}</p>
        )}
      </div>
      {onRetry && (
        <Button
          size="sm"
          variant="outline"
          className="border-border-subtle text-text-secondary hover:text-text-primary"
          onClick={onRetry}
        >
          Try again
        </Button>
      )}
    </div>
  )
}
