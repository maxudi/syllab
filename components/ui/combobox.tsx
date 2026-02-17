"use client"

import * as React from "react"
import { Check, ChevronsUpDown, Search } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

interface ComboboxProps {
  options: { value: string; label: string; subtitle?: string }[]
  value?: string
  onValueChange?: (value: string) => void
  placeholder?: string
  emptyMessage?: string
  disabled?: boolean
  className?: string
  searchPlaceholder?: string
  enableSearch?: boolean
}

export function Combobox({
  options,
  value,
  onValueChange,
  placeholder = "Selecione...",
  emptyMessage = "Nenhum resultado encontrado.",
  disabled = false,
  className,
  searchPlaceholder = "Buscar...",
  enableSearch = true,
}: ComboboxProps) {
  const [open, setOpen] = React.useState(false)
  const [searchQuery, setSearchQuery] = React.useState("")

  const selectedOption = options.find((option) => option.value === value)

  const filteredOptions = React.useMemo(() => {
    if (!searchQuery || !enableSearch) return options
    const query = searchQuery.toLowerCase()
    return options.filter(
      (option) =>
        option.label.toLowerCase().includes(query) ||
        option.subtitle?.toLowerCase().includes(query)
    )
  }, [options, searchQuery, enableSearch])

  return (
    <div className={cn("relative", className)}>
      <Button
        variant="outline"
        role="combobox"
        aria-expanded={open}
        disabled={disabled}
        className="w-full justify-between"
        onClick={() => setOpen(!open)}
        type="button"
      >
        {selectedOption ? selectedOption.label : placeholder}
        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
      </Button>
      {open && (
        <div className="absolute z-50 mt-2 w-full rounded-md border border-slate-200 bg-white shadow-md">
          {enableSearch && (
            <div className="p-2 border-b border-slate-200">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-slate-400" />
                <Input
                  placeholder={searchPlaceholder}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8"
                  autoFocus
                />
              </div>
            </div>
          )}
          <div className="max-h-[300px] overflow-auto p-1">
            {filteredOptions.length === 0 ? (
              <div className="px-2 py-6 text-center text-sm text-slate-500">
                {emptyMessage}
              </div>
            ) : (
              filteredOptions.map((option) => (
                <div
                  key={option.value}
                  className={cn(
                    "relative flex cursor-pointer select-none items-center rounded-sm px-2 py-2.5 text-sm outline-none hover:bg-slate-100",
                    value === option.value && "bg-slate-100"
                  )}
                  onClick={() => {
                    onValueChange?.(option.value)
                    setOpen(false)
                    setSearchQuery("")
                  }}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      value === option.value ? "opacity-100" : "opacity-0"
                    )}
                  />
                  <div className="flex-1">
                    <div>{option.label}</div>
                    {option.subtitle && (
                      <div className="text-xs text-slate-500">{option.subtitle}</div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}
