"use client";

import { useState, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { motion } from "framer-motion";
import { FileText, TrendingUp, Users, Loader2, ArrowLeft, BarChart3, ArrowUpDown, Calendar as CalendarIcon, X, Download, Clock, Zap } from "lucide-react";
import { format, subDays, startOfWeek, startOfMonth } from "date-fns";
import { es } from "date-fns/locale";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { getConversion, getComparativas, getRendimientoUsuarios } from "@/lib/api/reportes";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from "recharts";

// Animation variants (GPU-optimized: opacity + transform only)
const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

const scaleIn = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: { opacity: 1, scale: 1 },
};

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
      const dateText = dateRange.fechaInicio && dateRange.fechaFin
        ? `Período: ${format(new Date(dateRange.fechaInicio), "d MMM yyyy", { locale: es })} - ${format(new Date(dateRange.fechaFin), "d MMM yyyy", { locale: es })}`
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
        pdf.text(
          `Página ${i} de ${totalPages} | ClientPro CRM`,
          pageWidth / 2,
          pageHeight - 5,
          { align: 'center' }
        );
      }
      
      pdf.save(`reportes-crm-${format(new Date(), 'yyyy-MM-dd')}.pdf`);
    } catch (error) {
      console.error('Error al exportar PDF:', error);
    } finally {
      setIsExporting(false);
    }
  };

  // Queries para los 3 reportes (con staleTime optimizado)
  const { data: conversion, isLoading: loadingConversion, error: errorConversion } = useQuery({
    queryKey: ["reportes", "conversion", dateRange],
    queryFn: async () => {
      if (!session?.accessToken) throw new Error("No token");
      return getConversion(session.accessToken, dateRange);
    },
    enabled: !!session?.accessToken,
    staleTime: 5 * 60 * 1000, // 5 minutos
  });

  const { data: comparativas, isLoading: loadingComparativas, error: errorComparativas } = useQuery({
    queryKey: ["reportes", "comparativas"],
    queryFn: async () => {
      if (!session?.accessToken) throw new Error("No token");
      return getComparativas(session.accessToken);
    },
    enabled: !!session?.accessToken,
    staleTime: 5 * 60 * 1000,
  });

  const { data: rendimiento, isLoading: loadingRendimiento, error: errorRendimiento } = useQuery({
    queryKey: ["reportes", "rendimiento", dateRange],
    queryFn: async () => {
      if (!session?.accessToken) throw new Error("No token");
      return getRendimientoUsuarios(session.accessToken, dateRange);
    },
    enabled: !!session?.accessToken,
    staleTime: 5 * 60 * 1000,
  });

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-slate-900 dark:via-purple-900/20 dark:to-slate-900">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
          <p className="text-sm text-slate-600 dark:text-slate-400">Cargando reportes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-slate-900 dark:via-purple-900/20 dark:to-slate-900">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-slate-200/50 dark:border-slate-700/50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <Link href="/dashboard">
                <Button variant="ghost" size="sm" className="gap-2 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                  <ArrowLeft className="h-4 w-4" />
                  Dashboard
                </Button>
              </Link>
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-purple-600 shadow-lg shadow-blue-500/30">
                  <BarChart3 className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    Reportes Avanzados
                  </h1>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    Análisis detallado de conversión, comparativas y rendimiento
                  </p>
                </div>
              </div>
            </div>

            {/* Filtros de fecha y exportar */}
            <div className="flex items-center gap-3">
              <Button
                onClick={exportToPDF}
                disabled={isExporting || loadingConversion || loadingComparativas || loadingRendimiento}
                className="gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg shadow-blue-500/30 transition-all duration-300 hover:shadow-xl hover:shadow-blue-500/40 hover:-translate-y-0.5"
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
                <div className="flex items-center gap-2 px-4 py-2 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-800 backdrop-blur-sm">
                  <CalendarIcon className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  <span className="text-sm font-medium text-blue-900 dark:text-blue-300">
                    {format(new Date(dateRange.fechaInicio), "d MMM", { locale: es })} - {format(new Date(dateRange.fechaFin), "d MMM yyyy", { locale: es })}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearDateFilter}
                    className="h-5 w-5 p-0 hover:bg-blue-100 dark:hover:bg-blue-900/50 rounded-full"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              )}

              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="gap-2 border-slate-300 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                    <CalendarIcon className="h-4 w-4" />
                    Filtrar por fecha
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 backdrop-blur-xl bg-white/90 dark:bg-slate-800/90 border-slate-200 dark:border-slate-700 shadow-xl" align="end">
                  <div className="p-4 space-y-4">
                    {/* Quick Filters Pills */}
                    <div className="space-y-2">
                      <label className="text-xs font-medium text-slate-700 dark:text-slate-300 uppercase tracking-wide">Filtros rápidos</label>
                      <div className="flex flex-wrap gap-2">
                        <Button
                          onClick={() => applyQuickFilter(0)}
                          size="sm"
                          variant="outline"
                          className="rounded-full border-blue-300 dark:border-blue-700 hover:bg-blue-100 dark:hover:bg-blue-900/30 hover:border-blue-500 transition-all"
                        >
                          Hoy
                        </Button>
                        <Button
                          onClick={applyWeekFilter}
                          size="sm"
                          variant="outline"
                          className="rounded-full border-purple-300 dark:border-purple-700 hover:bg-purple-100 dark:hover:bg-purple-900/30 hover:border-purple-500 transition-all"
                        >
                          Esta semana
                        </Button>
                        <Button
                          onClick={applyMonthFilter}
                          size="sm"
                          variant="outline"
                          className="rounded-full border-pink-300 dark:border-pink-700 hover:bg-pink-100 dark:hover:bg-pink-900/30 hover:border-pink-500 transition-all"
                        >
                          Este mes
                        </Button>
                      </div>
                    </div>

                    <div className="border-t border-slate-200 dark:border-slate-700 pt-4 space-y-3">
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Fecha inicio</label>
                        <Calendar
                          mode="single"
                          selected={dateFrom}
                          onSelect={setDateFrom}
                          locale={es}
                          className="rounded-lg border dark:border-slate-700"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Fecha fin</label>
                        <Calendar
                          mode="single"
                          selected={dateTo}
                          onSelect={setDateTo}
                          locale={es}
                          disabled={(date) => dateFrom ? date < dateFrom : false}
                          className="rounded-lg border dark:border-slate-700"
                        />
                      </div>
                    </div>

                    <div className="flex gap-2 pt-2 border-t border-slate-200 dark:border-slate-700">
                      <Button
                        onClick={applyDateFilter}
                        disabled={!dateFrom || !dateTo}
                        className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                      >
                        Aplicar
                      </Button>
                      <Button
                        variant="outline"
                        onClick={clearDateFilter}
                        className="flex-1"
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
          <TabsList className="grid w-full grid-cols-3 bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm shadow-lg border border-slate-200 dark:border-slate-700 p-1 rounded-xl">
            <TabsTrigger 
              value="conversion" 
              className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-purple-600 data-[state=active]:text-white rounded-lg transition-all duration-300 hover:bg-slate-100 dark:hover:bg-slate-700 data-[state=active]:shadow-lg"
            >
              <TrendingUp className="h-4 w-4" />
              Conversión del Pipeline
            </TabsTrigger>
            <TabsTrigger 
              value="comparativas" 
              className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-purple-600 data-[state=active]:text-white rounded-lg transition-all duration-300 hover:bg-slate-100 dark:hover:bg-slate-700 data-[state=active]:shadow-lg"
            >
              <FileText className="h-4 w-4" />
              Comparativas Mensuales
            </TabsTrigger>
            <TabsTrigger 
              value="rendimiento" 
              className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-purple-600 data-[state=active]:text-white rounded-lg transition-all duration-300 hover:bg-slate-100 dark:hover:bg-slate-700 data-[state=active]:shadow-lg"
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
          <Card data-pdf-section className="backdrop-blur-sm bg-white/90 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-700 shadow-xl hover:shadow-2xl transition-all duration-300">
            <CardHeader>
              <CardTitle className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Conversión del Pipeline
              </CardTitle>
              <CardDescription className="text-slate-600 dark:text-slate-400">
                Analiza el flujo de negocios a través de las etapas del pipeline
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loadingConversion ? (
                <div className="flex flex-col items-center justify-center h-64 gap-4">
                  <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
                  <p className="text-sm text-slate-600 dark:text-slate-400">Cargando datos de conversión...</p>
                </div>
              ) : conversion ? (
                <div className="space-y-6">
                  {/* Stats cards con glassmorphism */}
                  <div className="grid gap-4 md:grid-cols-2">
                    <motion.div
                      initial="hidden"
                      animate="visible"
                      variants={scaleIn}
                      transition={{ delay: 0.1, duration: 0.3 }}
                    >
                    <Card className="backdrop-blur-md bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 border border-blue-200 dark:border-blue-800 shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                      <CardHeader className="pb-3">
                        <div className="flex items-center gap-3">
                          <div className="h-12 w-12 rounded-full bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center shadow-lg shadow-blue-500/30">
                            <BarChart3 className="h-6 w-6 text-white" />
                          </div>
                          <div>
                            <CardDescription className="text-slate-600 dark:text-slate-400 text-xs font-medium">Total de Negocios</CardDescription>
                            <CardTitle className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">{conversion.total}</CardTitle>
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
                    <Card className="backdrop-blur-md bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border border-green-200 dark:border-green-800 shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                      <CardHeader className="pb-3">
                        <div className="flex items-center gap-3">
                          <div className="h-12 w-12 rounded-full bg-gradient-to-br from-green-600 to-emerald-600 flex items-center justify-center shadow-lg shadow-green-500/30">
                            <TrendingUp className="h-6 w-6 text-white" />
                          </div>
                          <div>
                            <CardDescription className="text-slate-600 dark:text-slate-400 text-xs font-medium">Tasa de Cierre</CardDescription>
                            <CardTitle className="text-4xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">{conversion.tasaCierre}%</CardTitle>
                          </div>
                        </div>
                      </CardHeader>
                    </Card>
                    </motion.div>
                  </div>

                  {/* Conversion funnel chart con glassmorphism */}
                  <div className="border border-slate-200 dark:border-slate-700 rounded-xl p-6 backdrop-blur-md bg-white/80 dark:bg-slate-800/80 shadow-lg">
                    <h3 className="font-semibold mb-6 text-lg bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Embudo de Conversión</h3>
                    <ResponsiveContainer width="100%" height={400}>
                      <BarChart
                        data={conversion.conversion.map(etapa => ({
                          etapa: etapa.etapa.replace(/_/g, ' '),
                          cantidad: etapa.cantidad,
                          porcentaje: etapa.conversionDesdeInicio || 0
                        }))}
                        layout="vertical"
                        margin={{ top: 5, right: 30, left: 120, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" className="stroke-slate-200 dark:stroke-slate-700" opacity={0.3} />
                        <XAxis type="number" className="fill-slate-600 dark:fill-slate-400" />
                        <YAxis dataKey="etapa" type="category" className="fill-slate-600 dark:fill-slate-400" width={110} />
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: 'rgba(255, 255, 255, 0.95)',
                            backdropFilter: 'blur(12px)',
                            border: '1px solid rgba(203, 213, 225, 0.5)',
                            borderRadius: '12px',
                            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                            color: '#1e293b'
                          }}
                          formatter={(value: number | undefined, name: string | undefined) => {
                            if (value === undefined) return ['N/A', name || ''];
                            if (name === 'cantidad') return [value, 'Negocios'];
                            if (name === 'porcentaje') return [value.toFixed(1) + '%', 'Conversión'];
                            return [value, name || ''];
                          }}
                        />
                        <Legend />
                        <Bar dataKey="cantidad" name="Negocios" radius={[0, 8, 8, 0]}>
                          {conversion.conversion.map((entry, index) => {
                            const colors = ['#3b82f6', '#8b5cf6', '#d946ef', '#f59e0b', '#22c55e'];
                            return <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />;
                          })}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                    
                    {/* Conversion rates table */}
                    <div className="mt-6 space-y-2">
                      <h4 className="font-medium text-sm text-slate-700 dark:text-slate-300 mb-3">Tasas de Conversión</h4>
                      {conversion.conversion.map((etapa, index) => (
                        <div key={etapa.etapa} className="flex items-center justify-between p-3 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors border border-slate-100 dark:border-slate-700 backdrop-blur-sm">
                          <div className="flex items-center gap-3">
                            <div 
                              className="h-3 w-3 rounded-full shadow-lg" 
                              style={{ 
                                backgroundColor: ['#3b82f6', '#8b5cf6', '#d946ef', '#f59e0b', '#22c55e'][index % 5],
                                boxShadow: `0 0 12px ${['#3b82f6', '#8b5cf6', '#d946ef', '#f59e0b', '#22c55e'][index % 5]}40`
                              }}
                            />
                            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                              {etapa.etapa.replace(/_/g, ' ')}
                            </span>
                          </div>
                          <div className="flex items-center gap-6">
                            <span className="text-sm text-slate-600 dark:text-slate-400">
                              {etapa.cantidad} negocios
                            </span>
                            {etapa.conversionDesdeInicio !== undefined && (
                              <span className="text-sm font-semibold bg-gradient-to-r from-blue-100 to-purple-100 dark:from-blue-900/30 dark:to-purple-900/30 text-blue-700 dark:text-blue-400 px-3 py-1 rounded-full min-w-[60px] text-center shadow-sm">
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
                  <p className="text-slate-500 dark:text-slate-400">No hay datos disponibles</p>
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
          <Card data-pdf-section className="backdrop-blur-sm bg-white/90 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-700 shadow-xl hover:shadow-2xl transition-all duration-300">
            <CardHeader>
              <CardTitle className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Comparativas Mensuales
              </CardTitle>
              <CardDescription className="text-slate-600 dark:text-slate-400">
                Compara el rendimiento del mes actual contra el mes anterior
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loadingComparativas ? (
                <div className="flex flex-col items-center justify-center h-64 gap-4">
                  <Loader2 className="h-12 w-12 animate-spin text-purple-600" />
                  <p className="text-sm text-slate-600 dark:text-slate-400">Cargando comparativas...</p>
                </div>
              ) : comparativas ? (
                <div className="space-y-6">
                  {/* Stats cards con glassmorphism y tendencias */}
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <Card className="backdrop-blur-md bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 border border-blue-200 dark:border-blue-800 shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between mb-2">
                          <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-600 to-cyan-600 flex items-center justify-center shadow-lg shadow-blue-500/30">
                            <Users className="h-5 w-5 text-white" />
                          </div>
                          <span className={`text-xs font-semibold px-2 py-1 rounded-full ${comparativas.clientes.cambio >= 0 ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'}`}>
                            {comparativas.clientes.cambio > 0 ? '+' : ''}{comparativas.clientes.cambio.toFixed(1)}%
                          </span>
                        </div>
                        <CardDescription className="text-slate-600 dark:text-slate-400 text-xs font-medium">Clientes Nuevos</CardDescription>
                        <CardTitle className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">{comparativas.clientes.actual}</CardTitle>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">vs {comparativas.clientes.anterior} mes anterior</p>
                      </CardHeader>
                    </Card>

                    <Card className="backdrop-blur-md bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 border border-purple-200 dark:border-purple-800 shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between mb-2">
                          <div className="h-10 w-10 rounded-full bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center shadow-lg shadow-purple-500/30">
                            <TrendingUp className="h-5 w-5 text-white" />
                          </div>
                          <span className={`text-xs font-semibold px-2 py-1 rounded-full ${comparativas.negociosGanados.cambio >= 0 ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'}`}>
                            {comparativas.negociosGanados.cambio > 0 ? '+' : ''}{comparativas.negociosGanados.cambio.toFixed(1)}%
                          </span>
                        </div>
                        <CardDescription className="text-slate-600 dark:text-slate-400 text-xs font-medium">Negocios Ganados</CardDescription>
                        <CardTitle className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">{comparativas.negociosGanados.actual}</CardTitle>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">vs {comparativas.negociosGanados.anterior} mes anterior</p>
                      </CardHeader>
                    </Card>

                    <Card className="backdrop-blur-md bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border border-green-200 dark:border-green-800 shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between mb-2">
                          <div className="h-10 w-10 rounded-full bg-gradient-to-br from-green-600 to-emerald-600 flex items-center justify-center shadow-lg shadow-green-500/30">
                            <BarChart3 className="h-5 w-5 text-white" />
                          </div>
                          <span className={`text-xs font-semibold px-2 py-1 rounded-full ${comparativas.valorTotal.cambio >= 0 ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'}`}>
                            {comparativas.valorTotal.cambio > 0 ? '+' : ''}{comparativas.valorTotal.cambio.toFixed(1)}%
                          </span>
                        </div>
                        <CardDescription className="text-slate-600 dark:text-slate-400 text-xs font-medium">Valor Total</CardDescription>
                        <CardTitle className="text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                          ${(comparativas.valorTotal.actual / 1000).toFixed(0)}k
                        </CardTitle>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">vs ${(comparativas.valorTotal.anterior / 1000).toFixed(0)}k mes anterior</p>
                      </CardHeader>
                    </Card>

                    <Card className="backdrop-blur-md bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-900/20 dark:to-amber-900/20 border border-orange-200 dark:border-orange-800 shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between mb-2">
                          <div className="h-10 w-10 rounded-full bg-gradient-to-br from-orange-600 to-amber-600 flex items-center justify-center shadow-lg shadow-orange-500/30">
                            <Zap className="h-5 w-5 text-white" />
                          </div>
                          <span className={`text-xs font-semibold px-2 py-1 rounded-full ${comparativas.actividades.cambio >= 0 ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'}`}>
                            {comparativas.actividades.cambio > 0 ? '+' : ''}{comparativas.actividades.cambio.toFixed(1)}%
                          </span>
                        </div>
                        <CardDescription className="text-slate-600 dark:text-slate-400 text-xs font-medium">Actividades</CardDescription>
                        <CardTitle className="text-3xl font-bold bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent">{comparativas.actividades.actual}</CardTitle>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">vs {comparativas.actividades.anterior} mes anterior</p>
                      </CardHeader>
                    </Card>
                  </div>

                  {/* Comparison bar chart con glassmorphism */}
                  <div className="border border-slate-200 dark:border-slate-700 rounded-xl p-6 backdrop-blur-md bg-white/80 dark:bg-slate-800/80 shadow-lg">
                    <h3 className="font-semibold mb-6 text-lg bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Comparación Mes a Mes</h3>
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
                        <CartesianGrid strokeDasharray="3 3" className="stroke-slate-200 dark:stroke-slate-700" opacity={0.3} />
                        <XAxis dataKey="categoria" className="fill-slate-600 dark:fill-slate-400" />
                        <YAxis className="fill-slate-600 dark:fill-slate-400" />
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: 'rgba(255, 255, 255, 0.95)',
                            backdropFilter: 'blur(12px)',
                            border: '1px solid rgba(203, 213, 225, 0.5)',
                            borderRadius: '12px',
                            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                            color: '#1e293b'
                          }}
                        />
                        <Legend />
                        <Bar dataKey="Mes Anterior" fill="#94a3b8" radius={[8, 8, 0, 0]} />
                        <Bar dataKey="Mes Actual" fill="#d946ef" radius={[8, 8, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12">
                  <p className="text-slate-500 dark:text-slate-400">No hay datos disponibles</p>
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
          <Card data-pdf-section className="backdrop-blur-sm bg-white/90 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-700 shadow-xl hover:shadow-2xl transition-all duration-300">
            <CardHeader>
              <CardTitle className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Rendimiento por Usuario
              </CardTitle>
              <CardDescription className="text-slate-600 dark:text-slate-400">
                Ranking de vendedores por negocios ganados y valor generado
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loadingRendimiento ? (
                <div className="flex flex-col items-center justify-center h-64 gap-4">
                  <Loader2 className="h-12 w-12 animate-spin text-green-600" />
                  <p className="text-sm text-slate-600 dark:text-slate-400">Cargando rendimiento...</p>
                </div>
              ) : rendimiento ? (
                <div className="space-y-6">
                  {/* Bar chart de rendimiento con glassmorphism */}
                  <div className="border border-slate-200 dark:border-slate-700 rounded-xl p-6 backdrop-blur-md bg-white/80 dark:bg-slate-800/80 shadow-lg">
                    <h3 className="font-semibold mb-6 text-lg bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Comparación de Vendedores</h3>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart
                        data={rendimiento.rendimiento.map(item => ({
                          nombre: item.usuario.nombre.split(' ')[0],
                          'Valor Generado (Miles)': Math.round(item.metricas.valorGenerado / 1000),
                          'Negocios Ganados': item.metricas.negociosGanados,
                        }))}
                        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" className="stroke-slate-200 dark:stroke-slate-700" opacity={0.3} />
                        <XAxis dataKey="nombre" className="fill-slate-600 dark:fill-slate-400" />
                        <YAxis className="fill-slate-600 dark:fill-slate-400" />
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: 'rgba(255, 255, 255, 0.95)',
                            backdropFilter: 'blur(12px)',
                            border: '1px solid rgba(203, 213, 225, 0.5)',
                            borderRadius: '12px',
                            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                            color: '#1e293b'
                          }}
                        />
                        <Legend />
                        <Bar dataKey="Valor Generado (Miles)" fill="#22c55e" radius={[8, 8, 0, 0]} />
                        <Bar dataKey="Negocios Ganados" fill="#3b82f6" radius={[8, 8, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>

                  {/* Tabla de rendimiento con glassmorphism */}
                  <div className="border border-slate-200 dark:border-slate-700 rounded-xl backdrop-blur-md bg-white/80 dark:bg-slate-800/80 shadow-lg overflow-hidden">
                    <div className="p-4 border-b border-slate-200 dark:border-slate-700 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20">
                      <h3 className="font-semibold text-lg bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Ranking de Vendedores</h3>
                    </div>
                    <Table>
                      <TableHeader className="bg-slate-50/80 dark:bg-slate-900/50 backdrop-blur-sm">
                        <TableRow className="border-b border-slate-200 dark:border-slate-700">
                          <TableHead className="w-16 text-slate-700 dark:text-slate-300 font-semibold">#</TableHead>
                          <TableHead className="text-slate-700 dark:text-slate-300 font-semibold">Vendedor</TableHead>
                          <TableHead className="text-right text-slate-700 dark:text-slate-300">
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              onClick={() => setSortBy('negocios')}
                              className={`hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors ${sortBy === 'negocios' ? 'text-blue-600 dark:text-blue-400 font-semibold' : ''}`}
                            >
                              Negocios <ArrowUpDown className="ml-2 h-4 w-4" />
                            </Button>
                          </TableHead>
                          <TableHead className="text-right text-slate-700 dark:text-slate-300">
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              onClick={() => setSortBy('valor')}
                              className={`hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors ${sortBy === 'valor' ? 'text-blue-600 dark:text-blue-400 font-semibold' : ''}`}
                            >
                              Valor Generado <ArrowUpDown className="ml-2 h-4 w-4" />
                            </Button>
                          </TableHead>
                          <TableHead className="text-right text-slate-700 dark:text-slate-300">
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              onClick={() => setSortBy('conversion')}
                              className={`hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors ${sortBy === 'conversion' ? 'text-blue-600 dark:text-blue-400 font-semibold' : ''}`}
                            >
                              Conversión <ArrowUpDown className="ml-2 h-4 w-4" />
                            </Button>
                          </TableHead>
                          <TableHead className="text-right text-slate-700 dark:text-slate-300 font-semibold">Actividades</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {[...rendimiento.rendimiento].sort((a, b) => {
                          if (sortBy === 'negocios') return b.metricas.negociosGanados - a.metricas.negociosGanados;
                          if (sortBy === 'valor') return b.metricas.valorGenerado - a.metricas.valorGenerado;
                          return b.metricas.tasaConversion - a.metricas.tasaConversion;
                        }).map((item, index) => (
                          <TableRow key={item.usuario.id} className="hover:bg-gradient-to-r hover:from-blue-50/50 hover:to-purple-50/50 dark:hover:from-blue-900/10 dark:hover:to-purple-900/10 border-b border-slate-200 dark:border-slate-700 transition-all duration-200">
                            <TableCell>
                              <div className={`h-10 w-10 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-lg transition-transform hover:scale-110 ${
                                index === 0 
                                  ? 'bg-gradient-to-br from-yellow-400 to-yellow-600 shadow-yellow-500/50' 
                                  : index === 1 
                                  ? 'bg-gradient-to-br from-slate-300 to-slate-500 shadow-slate-500/50' 
                                  : index === 2 
                                  ? 'bg-gradient-to-br from-orange-400 to-orange-600 shadow-orange-500/50' 
                                  : 'bg-gradient-to-br from-slate-200 to-slate-400 text-slate-700'
                              }`}>
                                {index + 1}
                              </div>
                            </TableCell>
                            <TableCell>
                              <div>
                                <p className="font-semibold text-slate-900 dark:text-slate-100">{item.usuario.nombre}</p>
                                <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
                                  <span className="inline-block h-1.5 w-1.5 rounded-full bg-blue-500"></span>
                                  {item.usuario.rol}
                                </p>
                              </div>
                            </TableCell>
                            <TableCell className="text-right">
                              <div>
                                <p className="font-bold text-slate-900 dark:text-slate-100">{item.metricas.negociosGanados}</p>
                                <p className="text-xs text-slate-500 dark:text-slate-400">de {item.metricas.totalNegocios}</p>
                              </div>
                            </TableCell>
                            <TableCell className="text-right">
                              <p className="font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent text-lg">
                                ${(item.metricas.valorGenerado / 1000).toFixed(1)}k
                              </p>
                            </TableCell>
                            <TableCell className="text-right">
                              <span className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold bg-gradient-to-r from-blue-100 to-purple-100 dark:from-blue-900/30 dark:to-purple-900/30 text-blue-700 dark:text-blue-400 shadow-sm">
                                {item.metricas.tasaConversion}%
                              </span>
                            </TableCell>
                            <TableCell className="text-right">
                              <p className="text-sm text-slate-600 dark:text-slate-400 font-medium">{item.metricas.actividadesCompletadas}</p>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12">
                  <p className="text-slate-500 dark:text-slate-400">No hay datos disponibles</p>
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
