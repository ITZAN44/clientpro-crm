/**
 * Chart color constants for Recharts.
 * These must be static hex values — Recharts cannot resolve CSS custom properties.
 * Matches the design token map from the Industrial Luxury theme.
 */
export const CHART_COLORS = {
  prospecto: '#F59E0B', // Amber   — --chart-1
  calificacion: '#10B981', // Emerald — --chart-2
  propuesta: '#3B82F6', // Blue    — --chart-3
  negociacion: '#A855F7', // Purple  — --chart-4
  perdido: '#F43F5E', // Rose    — --chart-5
  gridLine: '#1E1E21', // Near-black grid lines
  text: '#898998', // Muted foreground
  tooltip: '#111113', // Card background for tooltip
} as const;

export type ChartColorKey = keyof typeof CHART_COLORS;
