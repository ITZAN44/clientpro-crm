"use client";

import dynamic from 'next/dynamic';
import { Loader2 } from 'lucide-react';

// Lazy load the heavy Reportes component (charts + PDF export)
const ReportesClient = dynamic(() => import('./reportes-client'), {
  loading: () => (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-slate-900 dark:via-purple-900/20 dark:to-slate-900">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
        <p className="text-sm text-slate-600 dark:text-slate-400">Cargando módulo de reportes...</p>
      </div>
    </div>
  ),
  ssr: false, // Disable SSR for charts (client-side only)
});

export default function ReportesPage() {
  return <ReportesClient />;
}
