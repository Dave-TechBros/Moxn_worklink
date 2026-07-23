import { cn, STATUS_CONFIG } from "@/lib/utils"
import type { ApplicationStatus } from "@/lib/utils"

interface StatusBadgeProps {
  status: ApplicationStatus
  className?: string
}

const icons: Record<string, string> = {
  inbox: "\u2193",
  search: "\u2315",
  calendar: "\u25A0",
  check: "\u2713",
  x: "\u2717",
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = STATUS_CONFIG[status]
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium",
        config.color,
        className
      )}
    >
      <span className="text-current" aria-hidden="true">{icons[config.icon]}</span>
      <span>{config.label}</span>
    </span>
  )
}
