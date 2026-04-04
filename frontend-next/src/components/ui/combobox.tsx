"use client"

import * as React from "react"
import { Check, ChevronDown, X } from "lucide-react"
import { cn } from "@/lib/utils"

interface ComboboxProps {
  value: string
  onValueChange: (value: string) => void
  items: string[]
  placeholder?: string
  className?: string
}

export function Combobox({
  value,
  onValueChange,
  items,
  placeholder = "请输入或选择",
  className,
}: ComboboxProps) {
  const [open, setOpen] = React.useState(false)
  const [inputValue, setInputValue] = React.useState(value)
  const ref = React.useRef<HTMLDivElement>(null)

  const filteredItems = inputValue
    ? items.filter((item) =>
        item.toLowerCase().includes(inputValue.toLowerCase())
      )
    : items

  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  return (
    <div ref={ref} data-slot="combobox" className={cn("relative", className)}>
      <div className="relative">
        <input
          type="text"
          value={inputValue}
          onChange={(e) => {
            setInputValue(e.target.value)
            onValueChange(e.target.value)
            setOpen(true)
          }}
          onFocus={() => setOpen(true)}
          placeholder={placeholder}
          data-slot="combobox-input"
          className={cn(
            "h-8 w-full min-w-0 rounded-lg border border-input bg-transparent px-2.5 py-1 text-base transition-colors outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:cursor-not-allowed disabled:bg-input/50 disabled:opacity-50 pr-10 md:text-sm dark:bg-input/30"
          )}
        />
        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
          {value && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                setInputValue("")
                onValueChange("")
              }}
              className="text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          )}
          <button
            type="button"
            onClick={() => setOpen(!open)}
            className="text-muted-foreground hover:text-foreground"
          >
            <ChevronDown className={cn("h-4 w-4 transition-transform", open && "rotate-180")} />
          </button>
        </div>
      </div>

      {open && filteredItems.length > 0 && (
        <div className="absolute z-50 w-full mt-1 max-h-60 overflow-auto rounded-lg bg-popover p-1 text-popover-foreground shadow-md ring-1 ring-foreground/10">
          {filteredItems.map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => {
                setInputValue(item)
                onValueChange(item)
                setOpen(false)
              }}
              className={cn(
                "relative flex w-full cursor-default items-center gap-1.5 rounded-md px-1.5 py-1 text-sm outline-none select-none hover:bg-accent hover:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
                item === value && "bg-accent"
              )}
            >
              <Check
                className={cn(
                  "size-4",
                  value === item ? "opacity-100" : "opacity-0"
                )}
              />
              {item}
            </button>
          ))}
        </div>
      )}

      {open && filteredItems.length === 0 && inputValue && (
        <div className="absolute z-50 w-full mt-1 rounded-lg bg-popover p-4 text-popover-foreground shadow-md ring-1 ring-foreground/10 text-sm text-center text-muted-foreground">
          按回车使用 &quot;{inputValue}&quot;
        </div>
      )}
    </div>
  )
}
