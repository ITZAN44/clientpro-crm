"use client";

import { Moon, Sun, Monitor } from "lucide-react";
import { useTheme } from "../providers/theme-provider";
import { Button } from "../ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";

export function ThemeToggle() {
  const { theme, setTheme, actualTheme } = useTheme();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          size="icon"
          className="relative w-9 h-9 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-all duration-200"
          title={`Tema actual: ${theme === "light" ? "Claro" : theme === "dark" ? "Oscuro" : "Sistema"}`}
        >
          <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all duration-300 dark:-rotate-90 dark:scale-0 text-amber-500" />
          <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all duration-300 dark:rotate-0 dark:scale-100 text-blue-400" />
          <span className="sr-only">Cambiar tema</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent 
        align="end" 
        className="w-40 backdrop-blur-md bg-white/95 dark:bg-slate-900/95 border-slate-200 dark:border-slate-700"
      >
        <DropdownMenuItem 
          onClick={() => setTheme("light")}
          className="cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          <Sun className="mr-2 h-4 w-4 text-amber-500" />
          <span>Claro</span>
          {theme === "light" && (
            <span className="ml-auto text-xs text-blue-600 dark:text-blue-400 font-semibold">✓</span>
          )}
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => setTheme("dark")}
          className="cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          <Moon className="mr-2 h-4 w-4 text-blue-400" />
          <span>Oscuro</span>
          {theme === "dark" && (
            <span className="ml-auto text-xs text-blue-600 dark:text-blue-400 font-semibold">✓</span>
          )}
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => setTheme("system")}
          className="cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          <Monitor className="mr-2 h-4 w-4 text-slate-600 dark:text-slate-400" />
          <span>Sistema</span>
          {theme === "system" && (
            <span className="ml-auto text-xs text-blue-600 dark:text-blue-400 font-semibold">✓</span>
          )}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
