import * as React from "react"

import { cn } from "@/lib/utils"

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "file:text-foreground placeholder:text-slate-400 dark:placeholder:text-slate-500 selection:bg-blue-500 selection:text-white dark:bg-slate-800/50 border-slate-300 dark:border-slate-600 h-9 w-full min-w-0 rounded-md border bg-white px-3 py-1 text-base shadow-sm transition-all duration-200 outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
        "focus:border-blue-500 focus:ring-2 focus:ring-blue-500/50 dark:focus:border-blue-400 dark:focus:ring-blue-400/50",
        "aria-invalid:border-red-500 aria-invalid:ring-2 aria-invalid:ring-red-500/20 dark:aria-invalid:ring-red-400/40 dark:aria-invalid:border-red-400",
        className
      )}
      {...props}
    />
  )
}

export { Input }
