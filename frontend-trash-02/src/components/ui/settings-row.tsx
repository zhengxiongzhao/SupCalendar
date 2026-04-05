import * as React from "react"
import { cn } from "@/lib/utils"

export function SettingsRow({
  className,
  label,
  children,
  showChevron = false,
  ...props
}: React.ComponentProps<"div"> & {
  label: string
  showChevron?: boolean
}) {
  return (
    <div
      data-slot="settings-row"
      className={cn(
        "flex items-center justify-between min-h-[48px] px-4 py-3 border-b border-border/40 last:border-b-0",
        className
      )}
      {...props}
    >
      <span className="text-sm text-foreground shrink-0">{label}</span>
      <div className="flex items-center gap-1 text-sm text-foreground/70 min-w-0 justify-end">
        <span className="truncate">{children}</span>
        {showChevron && (
          <svg
            className="size-4 text-muted-foreground/60 shrink-0 ml-0.5"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
          </svg>
        )}
      </div>
    </div>
  )
}

export function FormSectionHeader({
  className,
  children,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="form-section-header"
      className={cn(
        "px-4 pt-5 pb-1 text-xs font-medium text-muted-foreground/70 uppercase tracking-wide",
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}

export function InlineSegment<T extends string>({
  options,
  value,
  onChange,
  className,
}: {
  options: { value: T; label: string; icon?: React.ReactNode }[]
  value: T | undefined
  onChange: (value: T) => void
  className?: string
}) {
  return (
    <div
      data-slot="inline-segment"
      className={cn(
        "inline-flex items-center rounded-lg bg-muted/60 p-0.5 gap-0.5",
        className
      )}
    >
      {options.map((opt) => {
        const isActive = value === opt.value
        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange(opt.value)}
            className={cn(
              "inline-flex items-center gap-1 rounded-md px-3 py-1 text-xs font-medium transition-all",
              isActive
                ? "bg-foreground text-background shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            {opt.icon}
            {opt.label}
          </button>
        )
      })}
    </div>
  )
}
