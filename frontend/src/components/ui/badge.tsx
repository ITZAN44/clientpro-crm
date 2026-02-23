import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center justify-center rounded-full border px-2.5 py-0.5 text-xs font-semibold w-fit whitespace-nowrap shrink-0 [&>svg]:size-3 gap-1.5 [&>svg]:pointer-events-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-blue-500/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive transition-all duration-200 overflow-hidden",
  {
    variants: {
      variant: {
        default:
          "border-blue-200 bg-blue-50 text-blue-700 [a&]:hover:bg-blue-100 dark:border-blue-800 dark:bg-blue-900/50 dark:text-blue-300 dark:[a&]:hover:bg-blue-800/50",
        secondary:
          "border-slate-200 bg-slate-100 text-slate-700 [a&]:hover:bg-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:[a&]:hover:bg-slate-700",
        destructive:
          "border-red-200 bg-red-50 text-red-700 [a&]:hover:bg-red-100 dark:border-red-800 dark:bg-red-900/50 dark:text-red-300 dark:[a&]:hover:bg-red-800/50",
        success:
          "border-green-200 bg-green-50 text-green-700 [a&]:hover:bg-green-100 dark:border-green-800 dark:bg-green-900/50 dark:text-green-300 dark:[a&]:hover:bg-green-800/50",
        warning:
          "border-yellow-200 bg-yellow-50 text-yellow-700 [a&]:hover:bg-yellow-100 dark:border-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300 dark:[a&]:hover:bg-yellow-800/50",
        info:
          "border-cyan-200 bg-cyan-50 text-cyan-700 [a&]:hover:bg-cyan-100 dark:border-cyan-800 dark:bg-cyan-900/50 dark:text-cyan-300 dark:[a&]:hover:bg-cyan-800/50",
        outline:
          "border-slate-300 text-slate-700 [a&]:hover:bg-slate-100 dark:border-slate-600 dark:text-slate-300 dark:[a&]:hover:bg-slate-800/50",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

function Badge({
  className,
  variant,
  asChild = false,
  ...props
}: React.ComponentProps<"span"> &
  VariantProps<typeof badgeVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot : "span"

  return (
    <Comp
      data-slot="badge"
      className={cn(badgeVariants({ variant }), className)}
      {...props}
    />
  )
}

export { Badge, badgeVariants }
