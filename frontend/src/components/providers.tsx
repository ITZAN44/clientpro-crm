"use client";

import { SessionProvider } from "next-auth/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactNode, useState } from "react";
import { Toaster } from "sonner";
import { NotificationProvider } from "./providers/notification-provider";
import { ThemeProvider } from "./providers/theme-provider";
import { KeyboardShortcuts } from "@/hooks/use-keyboard-shortcuts";

export function Providers({ children }: { children: ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 5 * 60 * 1000, // 5 minutos (reducir refetches innecesarios)
            gcTime: 10 * 60 * 1000, // 10 minutos en caché
            refetchOnWindowFocus: false,
            retry: 1, // Solo 1 reintento en caso de error
            refetchOnMount: false, // No refetch si hay datos en caché
          },
        },
      })
  );

  return (
    <SessionProvider>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider defaultTheme="system" storageKey="clientpro-theme">
          <NotificationProvider>
            <KeyboardShortcuts />
            {children}
            <Toaster 
              position="top-right" 
              richColors 
              expand={true}
              duration={4000}
              closeButton
              toastOptions={{
                classNames: {
                  toast: 'group toast shadow-lg',
                  title: 'text-sm font-semibold',
                  description: 'text-sm',
                  actionButton: 'group-[.toast]:bg-primary group-[.toast]:text-primary-foreground',
                  cancelButton: 'group-[.toast]:bg-muted group-[.toast]:text-muted-foreground',
                },
              }}
            />
          </NotificationProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </SessionProvider>
  );
}
