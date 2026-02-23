"use client"

import * as React from "react"
import * as CheckboxPrimitive from "@radix-ui/react-checkbox"
import { CheckIcon } from "lucide-react"

import { cn } from "@/lib/utils"

function Checkbox({
  className,
  ...props
}: React.ComponentProps<typeof CheckboxPrimitive.Root>) {
  return (
    <CheckboxPrimitive.Root
      data-slot="checkbox"
      className={cn(
        "peer border-slate-300 dark:border-slate-600 dark:bg-slate-800/50 data-[state=checked]:bg-blue-600 data-[state=checked]:text-white dark:data-[state=checked]:bg-blue-500 data-[state=checked]:border-blue-600 dark:data-[state=checked]:border-blue-500 focus-visible:border-blue-500 focus-visible:ring-2 focus-visible:ring-blue-500/50 dark:focus-visible:border-blue-400 dark:focus-visible:ring-blue-400/50 aria-invalid:ring-red-500/20 dark:aria-invalid:ring-red-400/40 aria-invalid:border-red-500 dark:aria-invalid:border-red-400 size-4 shrink-0 rounded-[4px] border shadow-sm transition-all duration-200 outline-none disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      {...props}
    >
      <CheckboxPrimitive.Indicator
        data-slot="checkbox-indicator"
        className="grid place-content-center text-current transition-none"
      >
        <CheckIcon className="size-3.5" />
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
  )
}

export { Checkbox }
