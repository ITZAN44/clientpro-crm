'use client';

import { useState, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { fadeInUp, scaleIn } from '@/lib/motion';
import {
  FileText,
  TrendingUp,
  Users,
  Loader2,
  ArrowLeft,
  BarChart3,
  ArrowUpDown,
  Calendar as CalendarIcon,
  X,
  Download,
  Zap,
} from 'lucide-react';
import { format, subDays, startOfWeek, startOfMonth } from 'date-fns';
import { es } from 'date-fns/locale';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { getConversion, getComparativas, getRendimientoUsuarios } from '@/lib/api/reportes';
import { CHART_COLORS } from '@/lib/chart-colors';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from 'recharts';

// Pipeline stage → CHART_COLORS key mapping
const PIPELINE_COLORS: Record<string, string> = {
  PROSPECTO: CHART_COLORS.prospecto,
  CALIFICACION: CHART_COLORS.calificacion,
  PROPUESTA: CHART_COLORS.propuesta,
  NEGOCIACION: CHART_COLORS.negociacion,
  CERRADO_PERDIDO: CHART_COLORS.perdido,
  CERRADO_GANADO: CHART_COLORS.calificacion,
};

function getPipelineColor(etapa: string, fallbackIndex: number): string {
  const key = etapa.toUpperCase().replace(/ /g, '_');
  if (PIPELINE_COLORS[key]) return PIPELINE_COLORS[key];
  const fallback = Object.values(PIPELINE_COLORS);
  return fallback[fallbackIndex % fallback.length];
}

export default function ReportesClient() {
  const { data: session, status } = useSession();
  const [dateRange, setDateRange] = useState<{
    fechaInicio?: string;
    fechaFin?: string;
  }>({});
  const [sortBy, setSortBy] = useState<'negocios' | 'valor' | 'conversion'>('valor');
  const [dateFrom, setDateFrom] = useState<Date | undefined>();
  const [dateTo, setDateTo] = useState<Date | undefined>();
  const [isExporting, setIsExporting] = useState(false);
  const [activeQuickFilter, setActiveQuickFilter] = useState<string | null>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  // Quick filters para fecha
  const applyQuickFilter = (days: number) => {
    const today = new Date();
    const startDate = subDays(today, days);
    setDateFrom(startDate);
    setDateTo(today);
    setDateRange({
      fechaInicio: format(startDate, 'yyyy-MM-dd'),
      fechaFin: format(today, 'yyyy-MM-dd'),
    });
    setActiveQuickFilter(`${days}`);
  };

  const applyWeekFilter = () => {
    const today = new Date();
    const weekStart = startOfWeek(today, { locale: es });
    setDateFrom(weekStart);
    setDateTo(today);
    setDateRange({
      fechaInicio: format(weekStart, 'yyyy-MM-dd'),
      fechaFin: format(today, 'yyyy-MM-dd'),
    });
    setActiveQuickFilter('week');
  };

  const applyMonthFilter = () => {
    const today = new Date();
    const monthStart = startOfMonth(today);
    setDateFrom(monthStart);
    setDateTo(today);
    setDateRange({
      fechaInicio: format(monthStart, 'yyyy-MM-dd'),
      fechaFin: format(today, 'yyyy-MM-dd'),
    });
    setActiveQuickFilter('month');
  };

  // Aplicar filtros de fecha
  const applyDateFilter = () => {
    if (dateFrom && dateTo) {
      setDateRange({
        fechaInicio: format(dateFrom, 'yyyy-MM-dd'),
        fechaFin: format(dateTo, 'yyyy-MM-dd'),
      });
    }
  };

  // Limpiar filtros
  const clearDateFilter = () => {
    setDateFrom(undefined);
    setDateTo(undefined);
    setDateRange({});
    setActiveQuickFilter(null);
  };

  // Exportar a PDF
  const exportToPDF = async () => {
    if (!contentRef.current) return;

    setIsExporting(true);
    try {
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();

      // Título del documento
      pdf.setFontSize(20);
      pdf.setTextColor(31, 41, 55);
      pdf.text('Reportes Avanzados - CRM', pageWidth / 2, 15, { align: 'center' });

      pdf.setFontSize(10);
      pdf.setTextColor(107, 114, 128);
      const dateText =
        dateRange.fechaInicio && dateRange.fechaFin
          ? `Período: ${format(new Date(dateRange.fechaInicio), 'd MMM yyyy', { locale: es })} - ${format(new Date(dateRange.fechaFin), 'd MMM yyyy', { locale: es })}`
          : `Generado: ${format(new Date(), "d 'de' MMMM 'de' yyyy", { locale: es })}`;
      pdf.text(dateText, pageWidth / 2, 22, { align: 'center' });

      // Capturar cada sección
      const sections = contentRef.current.querySelectorAll('[data-pdf-section]');
      let yOffset = 30;

      for (let i = 0; i < sections.length; i++) {
        const section = sections[i] as HTMLElement;

        const canvas = await html2canvas(section, {
          scale: 2,
          useCORS: true,
          logging: false,
          // Tailwind v4 declara sus colores en oklch/oklab, que html2canvas no
          // sabe parsear ('unsupported color function'). getComputedStyle en
          // Chrome devuelve esos valores en el mismo espacio (lab/oklab), así que
          // no alcanza con copiarlos: los pintamos en un canvas 1x1 y leemos el
          // píxel ya resuelto a sRGB para forzar rgba en el clon.
          onclone: (clonedDoc) => {
            const swatch = document.createElement('canvas');
            swatch.width = swatch.height = 1;
            const ctx = swatch.getContext('2d', { willReadFrequently: true });
            const isModern = (v: string) => /oklab|oklch|\blab\(|\blch\(|color\(/.test(v);
            const toRgb = (v: string) => {
              if (!ctx || !isModern(v)) return v;
              ctx.clearRect(0, 0, 1, 1);
              ctx.fillStyle = '#000';
              ctx.fillStyle = v;
              ctx.fillRect(0, 0, 1, 1);
              const [r, g, b, a] = ctx.getImageData(0, 0, 1, 1).data;
              return `rgba(${r}, ${g}, ${b}, ${a / 255})`;
            };
            const colorProps = [
              'color',
              'backgroundColor',
              'borderTopColor',
              'borderRightColor',
              'borderBottomColor',
              'borderLeftColor',
              'outlineColor',
              'textDecorationColor',
            ] as const;
            clonedDoc.querySelectorAll<HTMLElement>('*').forEach((el) => {
              const cs = window.getComputedStyle(el);
              colorProps.forEach((p) => {
                const v = cs[p];
                if (isModern(v)) el.style[p] = toRgb(v);
              });
              // Gradientes y sombras con stops modernos: se descartan (no aportan
              // al PDF y romperían el parser).
              if (isModern(cs.backgroundImage)) el.style.backgroundImage = 'none';
              if (isModern(cs.boxShadow)) el.style.boxShadow = 'none';
            });
          },
        });

        const imgData = canvas.toDataURL('image/png');
        const imgWidth = pageWidth - 20;
        const imgHeight = (canvas.height * imgWidth) / canvas.width;

        // Si no cabe en la página actual, crear nueva página
        if (yOffset + imgHeight > pageHeight - 10) {
          pdf.addPage();
          yOffset = 10;
        }

        pdf.addImage(imgData, 'PNG', 10, yOffset, imgWidth, imgHeight);
        yOffset += imgHeight + 10;
      }

      // Pie de página en la última página
      const totalPages = pdf.internal.pages.length - 1;
      for (let i = 1; i <= totalPages; i++) {
        pdf.setPage(i);
        pdf.setFontSize(8);
        pdf.setTextColor(156, 163, 175);
        pdf.text(`Página ${i} de ${totalPages} | ClientPro CRM`, pageWidth / 2, pageHeight - 5, {
          align: 'center',
        });
      }

      pdf.save(`reportes-crm-${format(new Date(), 'yyyy-MM-dd')}.pdf`);
    } catch (error) {
      console.error('Error al exportar PDF:', error);
    } finally {
      setIsExporting(false);
    }
  };

  // Queries para los 3 reportes (con staleTime optimizado)
  const {
    data: conversion,
    isLoading: loadingConversion,
    error: errorConversion,
  } = useQuery({
    queryKey: ['reportes', 'conversion', dateRange],
    queryFn: async () => {
      if (!session?.accessToken) throw new Error('No token');
      return getConversion(session.accessToken, dateRange);
    },
    enabled: !!session?.accessToken,
    staleTime: 5 * 60 * 1000, // 5 minutos
  });

  const {
    data: comparativas,
    isLoading: loadingComparativas,
    error: errorComparativas,
  } = useQuery({
    queryKey: ['reportes', 'comparativas'],
    queryFn: async () => {
      if (!session?.accessToken) throw new Error('No token');
      return getComparativas(session.accessToken);
    },
    enabled: !!session?.accessToken,
    staleTime: 5 * 60 * 1000,
  });

  const {
    data: rendimiento,
    isLoading: loadingRendimiento,
    error: errorRendimiento,
  } = useQuery({
    queryKey: ['reportes', 'rendimiento', dateRange],
    queryFn: async () => {
      if (!session?.accessToken) throw new Error('No token');
      return getRendimientoUsuarios(session.accessToken, dateRange);
    },
    enabled: !!session?.accessToken,
    staleTime: 5 * 60 * 1000,
  });

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Cargando reportes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-xl">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <Link href="/dashboard">
                <Button
                  variant="ghost"
                  size="sm"
                  className="gap-2 hover:bg-muted transition-colors"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Dashboard
                </Button>
              </Link>
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 border border-primary/30">
                  <BarChart3 className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h1 className="font-serif text-2xl font-bold text-foreground">
                    Reportes Avanzados
                  </h1>
                  <p className="text-sm text-muted-foreground">
                    Análisis detallado de conversión, comparativas y rendimiento
                  </p>
                </div>
              </div>
            </div>

            {/* Filtros de fecha y exportar */}
            <div className="flex items-center gap-3">
              <Button
                onClick={exportToPDF}
                disabled={
                  isExporting || loadingConversion || loadingComparativas || loadingRendimiento
                }
                variant="outline"
                className="gap-2 border-primary/30 text-primary hover:bg-primary/10 transition-colors"
              >
                {isExporting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Exportando...
                  </>
                ) : (
                  <>
                    <Download className="h-4 w-4" />
                    Exportar PDF
                  </>
                )}
              </Button>

              {dateRange.fechaInicio && dateRange.fechaFin && (
                <div className="flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-xl border border-primary/30">
                  <CalendarIcon className="h-4 w-4 text-primary" />
                  <span className="text-sm font-medium text-primary">
                    {format(new Date(dateRange.fechaInicio), 'd MMM', { locale: es })} -{' '}
                    {format(new Date(dateRange.fechaFin), 'd MMM yyyy', { locale: es })}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearDateFilter}
                    className="h-5 w-5 p-0 hover:bg-primary/20 rounded-full"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              )}

              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="gap-2 bg-input border-border hover:bg-muted transition-colors"
                  >
                    <CalendarIcon className="h-4 w-4" />
                    Filtrar por fecha
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 bg-card border-border shadow-xl" align="end">
                  <div className="p-4 space-y-4">
                    {/* Quick Filters Pills */}
                    <div className="space-y-2">
                      <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                        Filtros rápidos
                      </label>
                      <div className="flex flex-wrap gap-2">
                        <Button
                          onClick={() => applyQuickFilter(0)}
                          size="sm"
                          variant="outline"
                          className={`rounded-full transition-all ${
                            activeQuickFilter === '0'
                              ? 'bg-primary/10 text-primary border border-primary/30'
                              : 'bg-muted border-border hover:bg-primary/10 hover:text-primary hover:border-primary/30'
                          }`}
                        >
                          Hoy
                        </Button>
                        <Button
                          onClick={applyWeekFilter}
                          size="sm"
                          variant="outline"
                          className={`rounded-full transition-all ${
                            activeQuickFilter === 'week'
                              ? 'bg-primary/10 text-primary border border-primary/30'
                              : 'bg-muted border-border hover:bg-primary/10 hover:text-primary hover:border-primary/30'
                          }`}
                        >
                          Esta semana
                        </Button>
                        <Button
                          onClick={applyMonthFilter}
                          size="sm"
                          variant="outline"
                          className={`rounded-full transition-all ${
                            activeQuickFilter === 'month'
                              ? 'bg-primary/10 text-primary border border-primary/30'
                              : 'bg-muted border-border hover:bg-primary/10 hover:text-primary hover:border-primary/30'
                          }`}
                        >
                          Este mes
                        </Button>
                      </div>
                    </div>

                    <div className="border-t border-border pt-4 space-y-3">
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-foreground">Fecha inicio</label>
                        <Calendar
                          mode="single"
                          selected={dateFrom}
                          onSelect={setDateFrom}
                          locale={es}
                          className="rounded-lg border border-border bg-card"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-foreground">Fecha fin</label>
                        <Calendar
                          mode="single"
                          selected={dateTo}
                          onSelect={setDateTo}
                          locale={es}
                          disabled={(date) => (dateFrom ? date < dateFrom : false)}
                          className="rounded-lg border border-border bg-card"
                        />
                      </div>
                    </div>

                    <div className="flex gap-2 pt-2 border-t border-border">
                      <Button
                        onClick={applyDateFilter}
                        disabled={!dateFrom || !dateTo}
                        className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90"
                      >
                        Aplicar
                      </Button>
                      <Button
                        variant="outline"
                        onClick={clearDateFilter}
                        className="flex-1 border-border hover:bg-muted"
                      >
                        Limpiar
                      </Button>
                    </div>
                  </div>
                </PopoverContent>
              </Popover>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main ref={contentRef} className="container mx-auto px-6 py-8 space-y-6">
        {/* Tabs para las 3 secciones */}
        <Tabs defaultValue="conversion" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 bg-card border border-border p-1 rounded-xl">
            <TabsTrigger
              value="conversion"
              className="flex items-center gap-2 rounded-lg transition-all duration-200
                data-[state=active]:bg-transparent data-[state=active]:text-primary
                data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-none
                hover:bg-muted text-muted-foreground data-[state=active]:font-semibold"
            >
              <TrendingUp className="h-4 w-4" />
              Conversión del Pipeline
            </TabsTrigger>
            <TabsTrigger
              value="comparativas"
              className="flex items-center gap-2 rounded-lg transition-all duration-200
                data-[state=active]:bg-transparent data-[state=active]:text-primary
                data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-none
                hover:bg-muted text-muted-foreground data-[state=active]:font-semibold"
            >
              <FileText className="h-4 w-4" />
              Comparativas Mensuales
            </TabsTrigger>
            <TabsTrigger
              value="rendimiento"
              className="flex items-center gap-2 rounded-lg transition-all duration-200
                data-[state=active]:bg-transparent data-[state=active]:text-primary
                data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-none
                hover:bg-muted text-muted-foreground data-[state=active]:font-semibold"
            >
              <Users className="h-4 w-4" />
              Rendimiento por Usuario
            </TabsTrigger>
          </TabsList>

          {/* TAB 1: Conversión del Pipeline */}
          <TabsContent value="conversion" className="space-y-4">
            <motion.div
              initial="hidden"
              animate="visible"
              variants={fadeInUp}
              transition={{ duration: 0.4 }}
            >
              <Card data-pdf-section className="bg-card border border-border shadow-xl">
                <CardHeader>
                  <CardTitle className="text-2xl font-serif font-bold text-foreground">
                    Conversión del Pipeline
                  </CardTitle>
                  <CardDescription className="text-muted-foreground">
                    Analiza el flujo de negocios a través de las etapas del pipeline
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {loadingConversion ? (
                    <div className="flex flex-col items-center justify-center h-64 gap-4">
                      <Loader2 className="h-12 w-12 animate-spin text-primary" />
                      <p className="text-sm text-muted-foreground">
                        Cargando datos de conversión...
                      </p>
                    </div>
                  ) : conversion ? (
                    <div className="space-y-6">
                      {/* Stats cards */}
                      <div className="grid gap-4 md:grid-cols-2">
                        <motion.div
                          initial="hidden"
                          animate="visible"
                          variants={scaleIn}
                          transition={{ delay: 0.1, duration: 0.3 }}
                        >
                          <Card className="bg-card border border-border shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                            <CardHeader className="pb-3">
                              <div className="flex items-center gap-3">
                                <div className="h-12 w-12 rounded-full bg-primary/10 border border-primary/30 flex items-center justify-center">
                                  <BarChart3 className="h-6 w-6 text-primary" />
                                </div>
                                <div>
                                  <CardDescription className="text-muted-foreground text-xs font-medium uppercase tracking-wide">
                                    Total de Negocios
                                  </CardDescription>
                                  <CardTitle className="text-4xl font-mono font-bold text-primary">
                                    {conversion.total}
                                  </CardTitle>
                                </div>
                              </div>
                            </CardHeader>
                          </Card>
                        </motion.div>
                        <motion.div
                          initial="hidden"
                          animate="visible"
                          variants={scaleIn}
                          transition={{ delay: 0.2, duration: 0.3 }}
                        >
                          <Card className="bg-card border border-border shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                            <CardHeader className="pb-3">
                              <div className="flex items-center gap-3">
                                <div className="h-12 w-12 rounded-full bg-primary/10 border border-primary/30 flex items-center justify-center">
                                  <TrendingUp className="h-6 w-6 text-primary" />
                                </div>
                                <div>
                                  <CardDescription className="text-muted-foreground text-xs font-medium uppercase tracking-wide">
                                    Tasa de Cierre
                                  </CardDescription>
                                  <CardTitle className="text-4xl font-mono font-bold text-primary">
                                    {conversion.tasaCierre.toFixed(1)}%
                                  </CardTitle>
                                </div>
                              </div>
                            </CardHeader>
                          </Card>
                        </motion.div>
                      </div>

                      {/* Conversion funnel chart */}
                      <div className="border border-border rounded-xl p-6 bg-card shadow-lg">
                        <h3 className="font-serif font-semibold mb-6 text-lg text-foreground">
                          Embudo de Conversión
                        </h3>
                        <ResponsiveContainer width="100%" height={400}>
                          <BarChart
                            data={conversion.conversion.map((etapa) => ({
                              etapa: etapa.etapa.replace(/_/g, ' '),
                              cantidad: etapa.cantidad,
                              porcentaje: etapa.conversionDesdeInicio || 0,
                              _etapaRaw: etapa.etapa,
                            }))}
                            layout="vertical"
                            margin={{ top: 5, right: 30, left: 120, bottom: 5 }}
                          >
                            <CartesianGrid
                              strokeDasharray="3 3"
                              stroke={CHART_COLORS.gridLine}
                              opacity={0.8}
                            />
                            <XAxis
                              type="number"
                              stroke={CHART_COLORS.text}
                              tick={{ fill: CHART_COLORS.text }}
                            />
                            <YAxis
                              dataKey="etapa"
                              type="category"
                              stroke={CHART_COLORS.text}
                              tick={{ fill: CHART_COLORS.text }}
                              width={110}
                            />
                            <Tooltip
                              contentStyle={{
                                backgroundColor: CHART_COLORS.tooltip,
                                border: `1px solid ${CHART_COLORS.gridLine}`,
                                borderRadius: '8px',
                                color: '#E5E5E7',
                              }}
                              formatter={(value: number | undefined, name: string | undefined) => {
                                if (value === undefined) return ['N/A', name || ''];
                                if (name === 'cantidad') return [value, 'Negocios'];
                                if (name === 'porcentaje')
                                  return [value.toFixed(1) + '%', 'Conversión'];
                                return [value, name || ''];
                              }}
                            />
                            <Legend wrapperStyle={{ color: CHART_COLORS.text }} />
                            <Bar dataKey="cantidad" name="Negocios" radius={[0, 8, 8, 0]}>
                              {conversion.conversion.map((entry, index) => (
                                <Cell
                                  key={`cell-${index}`}
                                  fill={getPipelineColor(entry.etapa, index)}
                                />
                              ))}
                            </Bar>
                          </BarChart>
                        </ResponsiveContainer>

                        {/* Conversion rates table */}
                        <div className="mt-6 space-y-2">
                          <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wide mb-3">
                            Tasas de Conversión
                          </h4>
                          {conversion.conversion.map((etapa, index) => (
                            <div
                              key={etapa.etapa}
                              className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 transition-colors border border-border"
                            >
                              <div className="flex items-center gap-3">
                                <div
                                  className="h-3 w-3 rounded-full"
                                  style={{ backgroundColor: getPipelineColor(etapa.etapa, index) }}
                                />
                                <span className="text-sm font-medium text-foreground">
                                  {etapa.etapa.replace(/_/g, ' ')}
                                </span>
                              </div>
                              <div className="flex items-center gap-6">
                                <span className="text-sm font-mono text-muted-foreground">
                                  {etapa.cantidad} negocios
                                </span>
                                {etapa.conversionDesdeInicio !== undefined && (
                                  <span className="text-sm font-mono font-semibold bg-primary/10 text-primary border border-primary/30 px-3 py-1 rounded-full min-w-[60px] text-center">
                                    {etapa.conversionDesdeInicio.toFixed(1)}%
                                  </span>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <p className="text-muted-foreground">No hay datos disponibles</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>

          {/* TAB 2: Comparativas Mensuales */}
          <TabsContent value="comparativas" className="space-y-4">
            <motion.div
              initial="hidden"
              animate="visible"
              variants={fadeInUp}
              transition={{ duration: 0.4 }}
            >
              <Card data-pdf-section className="bg-card border border-border shadow-xl">
                <CardHeader>
                  <CardTitle className="text-2xl font-serif font-bold text-foreground">
                    Comparativas Mensuales
                  </CardTitle>
                  <CardDescription className="text-muted-foreground">
                    Compara el rendimiento del mes actual contra el mes anterior
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {loadingComparativas ? (
                    <div className="flex flex-col items-center justify-center h-64 gap-4">
                      <Loader2 className="h-12 w-12 animate-spin text-primary" />
                      <p className="text-sm text-muted-foreground">Cargando comparativas...</p>
                    </div>
                  ) : comparativas ? (
                    <div className="space-y-6">
                      {/* Stats cards comparativas */}
                      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                        <Card className="bg-card border border-border shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                          <CardHeader className="pb-3">
                            <div className="flex items-center justify-between mb-2">
                              <div className="h-10 w-10 rounded-full bg-primary/10 border border-primary/30 flex items-center justify-center">
                                <Users className="h-5 w-5 text-primary" />
                              </div>
                              <span
                                className={`text-xs font-mono font-semibold px-2 py-1 rounded-full border ${comparativas.clientes.cambio >= 0 ? 'bg-success/10 text-success border-success/30' : 'bg-destructive/10 text-destructive border-destructive/30'}`}
                              >
                                {comparativas.clientes.cambio > 0 ? '+' : ''}
                                {comparativas.clientes.cambio.toFixed(1)}%
                              </span>
                            </div>
                            <CardDescription className="text-muted-foreground text-xs font-medium uppercase tracking-wide">
                              Clientes Nuevos
                            </CardDescription>
                            <CardTitle className="text-3xl font-mono font-bold text-primary">
                              {comparativas.clientes.actual}
                            </CardTitle>
                            <p className="text-xs text-muted-foreground mt-1">
                              vs <span className="font-mono">{comparativas.clientes.anterior}</span>{' '}
                              mes anterior
                            </p>
                          </CardHeader>
                        </Card>

                        <Card className="bg-card border border-border shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                          <CardHeader className="pb-3">
                            <div className="flex items-center justify-between mb-2">
                              <div className="h-10 w-10 rounded-full bg-primary/10 border border-primary/30 flex items-center justify-center">
                                <TrendingUp className="h-5 w-5 text-primary" />
                              </div>
                              <span
                                className={`text-xs font-mono font-semibold px-2 py-1 rounded-full border ${comparativas.negociosGanados.cambio >= 0 ? 'bg-success/10 text-success border-success/30' : 'bg-destructive/10 text-destructive border-destructive/30'}`}
                              >
                                {comparativas.negociosGanados.cambio > 0 ? '+' : ''}
                                {comparativas.negociosGanados.cambio.toFixed(1)}%
                              </span>
                            </div>
                            <CardDescription className="text-muted-foreground text-xs font-medium uppercase tracking-wide">
                              Negocios Ganados
                            </CardDescription>
                            <CardTitle className="text-3xl font-mono font-bold text-primary">
                              {comparativas.negociosGanados.actual}
                            </CardTitle>
                            <p className="text-xs text-muted-foreground mt-1">
                              vs{' '}
                              <span className="font-mono">
                                {comparativas.negociosGanados.anterior}
                              </span>{' '}
                              mes anterior
                            </p>
                          </CardHeader>
                        </Card>

                        <Card className="bg-card border border-border shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                          <CardHeader className="pb-3">
                            <div className="flex items-center justify-between mb-2">
                              <div className="h-10 w-10 rounded-full bg-primary/10 border border-primary/30 flex items-center justify-center">
                                <BarChart3 className="h-5 w-5 text-primary" />
                              </div>
                              <span
                                className={`text-xs font-mono font-semibold px-2 py-1 rounded-full border ${comparativas.valorTotal.cambio >= 0 ? 'bg-success/10 text-success border-success/30' : 'bg-destructive/10 text-destructive border-destructive/30'}`}
                              >
                                {comparativas.valorTotal.cambio > 0 ? '+' : ''}
                                {comparativas.valorTotal.cambio.toFixed(1)}%
                              </span>
                            </div>
                            <CardDescription className="text-muted-foreground text-xs font-medium uppercase tracking-wide">
                              Valor Total
                            </CardDescription>
                            <CardTitle className="text-3xl font-mono font-bold text-primary">
                              ${(comparativas.valorTotal.actual / 1000).toFixed(0)}k
                            </CardTitle>
                            <p className="text-xs text-muted-foreground mt-1">
                              vs{' '}
                              <span className="font-mono">
                                ${(comparativas.valorTotal.anterior / 1000).toFixed(0)}k
                              </span>{' '}
                              mes anterior
                            </p>
                          </CardHeader>
                        </Card>

                        <Card className="bg-card border border-border shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                          <CardHeader className="pb-3">
                            <div className="flex items-center justify-between mb-2">
                              <div className="h-10 w-10 rounded-full bg-primary/10 border border-primary/30 flex items-center justify-center">
                                <Zap className="h-5 w-5 text-primary" />
                              </div>
                              <span
                                className={`text-xs font-mono font-semibold px-2 py-1 rounded-full border ${comparativas.actividades.cambio >= 0 ? 'bg-success/10 text-success border-success/30' : 'bg-destructive/10 text-destructive border-destructive/30'}`}
                              >
                                {comparativas.actividades.cambio > 0 ? '+' : ''}
                                {comparativas.actividades.cambio.toFixed(1)}%
                              </span>
                            </div>
                            <CardDescription className="text-muted-foreground text-xs font-medium uppercase tracking-wide">
                              Actividades
                            </CardDescription>
                            <CardTitle className="text-3xl font-mono font-bold text-primary">
                              {comparativas.actividades.actual}
                            </CardTitle>
                            <p className="text-xs text-muted-foreground mt-1">
                              vs{' '}
                              <span className="font-mono">{comparativas.actividades.anterior}</span>{' '}
                              mes anterior
                            </p>
                          </CardHeader>
                        </Card>
                      </div>

                      {/* Comparison bar chart */}
                      <div className="border border-border rounded-xl p-6 bg-card shadow-lg">
                        <h3 className="font-serif font-semibold mb-6 text-lg text-foreground">
                          Comparación Mes a Mes
                        </h3>
                        <ResponsiveContainer width="100%" height={350}>
                          <BarChart
                            data={[
                              {
                                categoria: 'Clientes',
                                'Mes Anterior': comparativas.clientes.anterior,
                                'Mes Actual': comparativas.clientes.actual,
                              },
                              {
                                categoria: 'Negocios',
                                'Mes Anterior': comparativas.negociosGanados.anterior,
                                'Mes Actual': comparativas.negociosGanados.actual,
                              },
                              {
                                categoria: 'Valor (Miles)',
                                'Mes Anterior': Math.round(comparativas.valorTotal.anterior / 1000),
                                'Mes Actual': Math.round(comparativas.valorTotal.actual / 1000),
                              },
                              {
                                categoria: 'Actividades',
                                'Mes Anterior': comparativas.actividades.anterior,
                                'Mes Actual': comparativas.actividades.actual,
                              },
                            ]}
                            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                          >
                            <CartesianGrid
                              strokeDasharray="3 3"
                              stroke={CHART_COLORS.gridLine}
                              opacity={0.8}
                            />
                            <XAxis
                              dataKey="categoria"
                              stroke={CHART_COLORS.text}
                              tick={{ fill: CHART_COLORS.text }}
                            />
                            <YAxis stroke={CHART_COLORS.text} tick={{ fill: CHART_COLORS.text }} />
                            <Tooltip
                              contentStyle={{
                                backgroundColor: CHART_COLORS.tooltip,
                                border: `1px solid ${CHART_COLORS.gridLine}`,
                                borderRadius: '8px',
                                color: '#E5E5E7',
                              }}
                            />
                            <Legend wrapperStyle={{ color: CHART_COLORS.text }} />
                            <Bar
                              dataKey="Mes Anterior"
                              fill={CHART_COLORS.text}
                              radius={[8, 8, 0, 0]}
                            />
                            <Bar
                              dataKey="Mes Actual"
                              fill={CHART_COLORS.prospecto}
                              radius={[8, 8, 0, 0]}
                            />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <p className="text-muted-foreground">No hay datos disponibles</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>

          {/* TAB 3: Rendimiento por Usuario */}
          <TabsContent value="rendimiento" className="space-y-4">
            <motion.div
              initial="hidden"
              animate="visible"
              variants={fadeInUp}
              transition={{ duration: 0.4 }}
            >
              <Card data-pdf-section className="bg-card border border-border shadow-xl">
                <CardHeader>
                  <CardTitle className="text-2xl font-serif font-bold text-foreground">
                    Rendimiento por Usuario
                  </CardTitle>
                  <CardDescription className="text-muted-foreground">
                    Ranking de vendedores por negocios ganados y valor generado
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {loadingRendimiento ? (
                    <div className="flex flex-col items-center justify-center h-64 gap-4">
                      <Loader2 className="h-12 w-12 animate-spin text-primary" />
                      <p className="text-sm text-muted-foreground">Cargando rendimiento...</p>
                    </div>
                  ) : rendimiento ? (
                    <div className="space-y-6">
                      {/* Bar chart rendimiento */}
                      <div className="border border-border rounded-xl p-6 bg-card shadow-lg">
                        <h3 className="font-serif font-semibold mb-6 text-lg text-foreground">
                          Comparación de Vendedores
                        </h3>
                        <ResponsiveContainer width="100%" height={300}>
                          <BarChart
                            data={rendimiento.rendimiento.map((item) => ({
                              nombre: item.usuario.nombre.split(' ')[0],
                              'Valor Generado (Miles)': Math.round(
                                item.metricas.valorGenerado / 1000
                              ),
                              'Negocios Ganados': item.metricas.negociosGanados,
                            }))}
                            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                          >
                            <CartesianGrid
                              strokeDasharray="3 3"
                              stroke={CHART_COLORS.gridLine}
                              opacity={0.8}
                            />
                            <XAxis
                              dataKey="nombre"
                              stroke={CHART_COLORS.text}
                              tick={{ fill: CHART_COLORS.text }}
                            />
                            <YAxis stroke={CHART_COLORS.text} tick={{ fill: CHART_COLORS.text }} />
                            <Tooltip
                              contentStyle={{
                                backgroundColor: CHART_COLORS.tooltip,
                                border: `1px solid ${CHART_COLORS.gridLine}`,
                                borderRadius: '8px',
                                color: '#E5E5E7',
                              }}
                            />
                            <Legend wrapperStyle={{ color: CHART_COLORS.text }} />
                            <Bar
                              dataKey="Valor Generado (Miles)"
                              fill={CHART_COLORS.calificacion}
                              radius={[8, 8, 0, 0]}
                            />
                            <Bar
                              dataKey="Negocios Ganados"
                              fill={CHART_COLORS.propuesta}
                              radius={[8, 8, 0, 0]}
                            />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>

                      {/* Tabla de rendimiento */}
                      <div className="border border-border rounded-xl bg-card shadow-lg overflow-hidden">
                        <div className="p-4 border-b border-border bg-muted/30">
                          <h3 className="font-serif font-semibold text-lg text-foreground">
                            Ranking de Vendedores
                          </h3>
                        </div>
                        <Table>
                          <TableHeader className="bg-muted/20">
                            <TableRow className="border-b border-border hover:bg-transparent">
                              <TableHead className="w-16 text-muted-foreground font-semibold uppercase text-xs tracking-wide">
                                #
                              </TableHead>
                              <TableHead className="text-muted-foreground font-semibold uppercase text-xs tracking-wide">
                                Vendedor
                              </TableHead>
                              <TableHead className="text-right text-muted-foreground uppercase text-xs tracking-wide">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => setSortBy('negocios')}
                                  className={`hover:bg-muted transition-colors uppercase text-xs tracking-wide ${sortBy === 'negocios' ? 'text-primary font-semibold' : 'text-muted-foreground'}`}
                                >
                                  Negocios <ArrowUpDown className="ml-2 h-3 w-3" />
                                </Button>
                              </TableHead>
                              <TableHead className="text-right text-muted-foreground uppercase text-xs tracking-wide">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => setSortBy('valor')}
                                  className={`hover:bg-muted transition-colors uppercase text-xs tracking-wide ${sortBy === 'valor' ? 'text-primary font-semibold' : 'text-muted-foreground'}`}
                                >
                                  Valor Generado <ArrowUpDown className="ml-2 h-3 w-3" />
                                </Button>
                              </TableHead>
                              <TableHead className="text-right text-muted-foreground uppercase text-xs tracking-wide">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => setSortBy('conversion')}
                                  className={`hover:bg-muted transition-colors uppercase text-xs tracking-wide ${sortBy === 'conversion' ? 'text-primary font-semibold' : 'text-muted-foreground'}`}
                                >
                                  Conversión <ArrowUpDown className="ml-2 h-3 w-3" />
                                </Button>
                              </TableHead>
                              <TableHead className="text-right text-muted-foreground font-semibold uppercase text-xs tracking-wide">
                                Actividades
                              </TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {[...rendimiento.rendimiento]
                              .sort((a, b) => {
                                if (sortBy === 'negocios')
                                  return b.metricas.negociosGanados - a.metricas.negociosGanados;
                                if (sortBy === 'valor')
                                  return b.metricas.valorGenerado - a.metricas.valorGenerado;
                                return b.metricas.tasaConversion - a.metricas.tasaConversion;
                              })
                              .map((item, index) => (
                                <TableRow
                                  key={item.usuario.id}
                                  className="hover:bg-muted/30 border-b border-border transition-colors duration-150"
                                >
                                  <TableCell>
                                    <div
                                      className={`h-10 w-10 rounded-full flex items-center justify-center text-white font-mono font-bold text-sm transition-transform hover:scale-110 ${
                                        index === 0
                                          ? 'bg-primary/20 border border-primary/40 text-primary'
                                          : index === 1
                                            ? 'bg-muted border border-border text-muted-foreground'
                                            : index === 2
                                              ? 'bg-muted border border-border text-muted-foreground'
                                              : 'bg-muted/50 border border-border text-muted-foreground'
                                      }`}
                                    >
                                      {index + 1}
                                    </div>
                                  </TableCell>
                                  <TableCell>
                                    <div>
                                      <p className="font-semibold text-foreground">
                                        {item.usuario.nombre}
                                      </p>
                                      <p className="text-xs text-muted-foreground flex items-center gap-1">
                                        <span className="inline-block h-1.5 w-1.5 rounded-full bg-primary"></span>
                                        {item.usuario.rol}
                                      </p>
                                    </div>
                                  </TableCell>
                                  <TableCell className="text-right">
                                    <div>
                                      <p className="font-mono font-bold text-foreground">
                                        {item.metricas.negociosGanados}
                                      </p>
                                      <p className="text-xs text-muted-foreground font-mono">
                                        de {item.metricas.totalNegocios}
                                      </p>
                                    </div>
                                  </TableCell>
                                  <TableCell className="text-right">
                                    <p className="font-mono font-bold text-primary text-lg">
                                      ${(item.metricas.valorGenerado / 1000).toFixed(1)}k
                                    </p>
                                  </TableCell>
                                  <TableCell className="text-right">
                                    <span
                                      className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-mono font-semibold border ${
                                        item.metricas.tasaConversion > 50
                                          ? 'bg-success/10 text-success border-success/30'
                                          : item.metricas.tasaConversion < 30
                                            ? 'bg-destructive/10 text-destructive border-destructive/30'
                                            : 'bg-primary/10 text-primary border-primary/30'
                                      }`}
                                    >
                                      {item.metricas.tasaConversion}%
                                    </span>
                                  </TableCell>
                                  <TableCell className="text-right">
                                    <p className="text-sm font-mono text-muted-foreground">
                                      {item.metricas.actividadesCompletadas}
                                    </p>
                                  </TableCell>
                                </TableRow>
                              ))}
                          </TableBody>
                        </Table>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <p className="text-muted-foreground">No hay datos disponibles</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
