"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { getStatsGenerales } from "@/lib/api/stats";
import { getActividades } from "@/lib/api/actividades";
import { TIPO_ACTIVIDAD_CONFIG, TIPO_ACTIVIDAD_LABELS } from "@/types/actividad";
import { RoleGuard } from "@/components/auth";
import { RolUsuario } from "@/types/rol";
import { DashboardSkeleton } from "@/components/ui/skeleton-loaders";
import { format, formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";
import {
  Zap,
  Users,
  TrendingUp,
  Mail,
  Briefcase,
  Calendar,
  Target,
  DollarSign,
  Activity,
  Award,
  BarChart3,
  Clock,
  CheckCircle2,
  ArrowUpRight,
  Plus,
  Phone,
  FileText,
  Shield
} from "lucide-react";

// Animaciones Framer Motion
const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1
    }
  }
};

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.4, ease: "easeOut" }
};

const scaleIn = {
  initial: { opacity: 0, scale: 0.95 },
  animate: { opacity: 1, scale: 1 },
  transition: { duration: 0.3 }
};

export default function DashboardPage() {
  const { data: session } = useSession();
  const router = useRouter();

  // Query para obtener estadísticas generales (optimizado con staleTime)
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['stats-generales'],
    queryFn: () => session?.accessToken 
      ? getStatsGenerales(session.accessToken)
      : Promise.reject('No session'),
    enabled: !!session?.accessToken,
    staleTime: 2 * 60 * 1000, // 2 minutos (stats no cambian tan rápido)
    refetchOnWindowFocus: false,
  });

  // Query para obtener actividades recientes (optimizado)
  const { data: actividadesRecientes } = useQuery({
    queryKey: ['actividades-recientes'],
    queryFn: () => {
      const token = (session as any)?.accessToken;
      if (!token) throw new Error('No hay token');
      return getActividades(token, { page: 1, limit: 5 });
    },
    enabled: !!session?.accessToken,
    staleTime: 1 * 60 * 1000, // 1 minuto
    refetchOnWindowFocus: false,
  });

  if (statsLoading) {
    return (
      <div className="container mx-auto px-6 py-8">
        <DashboardSkeleton />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-6 py-8">
      <motion.div 
        className="space-y-8"
        initial="initial"
        animate="animate"
        variants={staggerContainer}
      >
        {/* Welcome Section */}
        <motion.div 
          className="flex items-start justify-between"
          variants={fadeInUp}
        >
          <div>
            <h2 className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
              ¡Bienvenido de nuevo, {session?.user?.name?.split(" ")[0]}! 👋
            </h2>
            <p className="text-slate-600 dark:text-slate-400 flex items-center gap-2">
              <Activity className="h-4 w-4" />
              Aquí está un resumen de tu actividad hoy
            </p>
          </div>
          <motion.div 
            className="flex items-center gap-2"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            <span className="px-5 py-2.5 rounded-full text-sm font-semibold shadow-lg bg-gradient-to-r from-blue-600 to-purple-600 text-white">
              <Award className="h-4 w-4 inline mr-1" />
              {session?.user?.rol}
            </span>
          </motion.div>
        </motion.div>

        {/* Stats Cards */}
        <motion.div 
          className="grid gap-6 md:grid-cols-2 lg:grid-cols-4"
          variants={staggerContainer}
        >
          {/* Total Clientes */}
          <motion.div variants={fadeInUp}>
            <Card className="p-6 backdrop-blur-md bg-white/90 dark:bg-slate-900/90 border-slate-200/50 dark:border-slate-700/50 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 group relative overflow-hidden">
              {/* Gradient background effect */}
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              
              <div className="relative">
                <div className="flex items-start justify-between mb-6">
                  <div className="h-14 w-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/50 group-hover:shadow-blue-500/70 transition-shadow duration-300 group-hover:scale-110 transform">
                    <Users className="h-7 w-7 text-white" />
                  </div>
                  {stats && stats.clientes.porcentajeCrecimiento !== 0 && (
                    <motion.span 
                      className={`text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-1 shadow-md ${
                        stats.clientes.porcentajeCrecimiento > 0 
                          ? 'text-green-700 bg-gradient-to-r from-green-100 to-green-50 dark:text-green-300 dark:from-green-900/40 dark:to-green-900/20' 
                          : 'text-red-700 bg-gradient-to-r from-red-100 to-red-50 dark:text-red-300 dark:from-red-900/40 dark:to-red-900/20'
                      }`}
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.2, type: "spring" }}
                    >
                      <ArrowUpRight className={`h-3.5 w-3.5 ${stats.clientes.porcentajeCrecimiento < 0 ? 'rotate-180' : ''}`} />
                      {stats.clientes.porcentajeCrecimiento > 0 ? '+' : ''}{stats.clientes.porcentajeCrecimiento}%
                    </motion.span>
                  )}
                </div>
                
                <h3 className="text-4xl font-extrabold bg-gradient-to-r from-blue-600 to-blue-800 dark:from-blue-400 dark:to-blue-600 bg-clip-text text-transparent mb-2">
                  {statsLoading ? '...' : stats?.clientes.total || 0}
                </h3>
                <p className="text-sm font-semibold text-slate-600 dark:text-slate-400 mb-4">Total Clientes</p>
                
                <div className="pt-4 border-t border-slate-200/70 dark:border-slate-700/70 flex items-center justify-between">
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                    {statsLoading ? '...' : `${stats?.clientes.nuevosEsteMes || 0} nuevos este mes`}
                  </p>
                  <Link 
                    href="/clientes"
                    className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 flex items-center gap-1 group/link"
                  >
                    Ver 
                    <ArrowUpRight className="h-3 w-3 group-hover/link:translate-x-0.5 group-hover/link:-translate-y-0.5 transition-transform" />
                  </Link>
                </div>
              </div>
            </Card>
          </motion.div>

          {/* Negocios Activos */}
          <motion.div variants={fadeInUp}>
            <Card className="p-6 backdrop-blur-md bg-white/90 dark:bg-slate-900/90 border-slate-200/50 dark:border-slate-700/50 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 group relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              
              <div className="relative">
                <div className="flex items-start justify-between mb-6">
                  <div className="h-14 w-14 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg shadow-purple-500/50 group-hover:shadow-purple-500/70 transition-shadow duration-300 group-hover:scale-110 transform">
                    <Briefcase className="h-7 w-7 text-white" />
                  </div>
                  {stats && stats.negocios.porcentajeCrecimiento !== 0 && (
                    <motion.span 
                      className={`text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-1 shadow-md ${
                        stats.negocios.porcentajeCrecimiento > 0 
                          ? 'text-green-700 bg-gradient-to-r from-green-100 to-green-50 dark:text-green-300 dark:from-green-900/40 dark:to-green-900/20' 
                          : 'text-red-700 bg-gradient-to-r from-red-100 to-red-50 dark:text-red-300 dark:from-red-900/40 dark:to-red-900/20'
                      }`}
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.3, type: "spring" }}
                    >
                      <ArrowUpRight className={`h-3.5 w-3.5 ${stats.negocios.porcentajeCrecimiento < 0 ? 'rotate-180' : ''}`} />
                      {stats.negocios.porcentajeCrecimiento > 0 ? '+' : ''}{stats.negocios.porcentajeCrecimiento}%
                    </motion.span>
                  )}
                </div>
                
                <h3 className="text-4xl font-extrabold bg-gradient-to-r from-purple-600 to-purple-800 dark:from-purple-400 dark:to-purple-600 bg-clip-text text-transparent mb-2">
                  {statsLoading ? '...' : stats?.negocios.activos || 0}
                </h3>
                <p className="text-sm font-semibold text-slate-600 dark:text-slate-400 mb-4">Negocios Activos</p>
                
                <div className="pt-4 border-t border-slate-200/70 dark:border-slate-700/70 flex items-center justify-between">
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                    {statsLoading ? '...' : `$${(stats?.negocios.valorPipeline || 0).toLocaleString('es-MX')} en pipeline`}
                  </p>
                  <Link 
                    href="/negocios"
                    className="text-xs font-bold text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 flex items-center gap-1 group/link"
                  >
                    Ver 
                    <ArrowUpRight className="h-3 w-3 group-hover/link:translate-x-0.5 group-hover/link:-translate-y-0.5 transition-transform" />
                  </Link>
                </div>
              </div>
            </Card>
          </motion.div>

          {/* Ventas del Mes */}
          <motion.div variants={fadeInUp}>
            <Card className="p-6 backdrop-blur-md bg-white/90 dark:bg-slate-900/90 border-slate-200/50 dark:border-slate-700/50 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 group relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              
              <div className="relative">
                <div className="flex items-start justify-between mb-6">
                  <div className="h-14 w-14 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center shadow-lg shadow-green-500/50 group-hover:shadow-green-500/70 transition-shadow duration-300 group-hover:scale-110 transform">
                    <DollarSign className="h-7 w-7 text-white" />
                  </div>
                  {stats && stats.ventas.porcentajeCrecimiento !== 0 && (
                    <motion.span 
                      className={`text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-1 shadow-md ${
                        stats.ventas.porcentajeCrecimiento > 0 
                          ? 'text-green-700 bg-gradient-to-r from-green-100 to-green-50 dark:text-green-300 dark:from-green-900/40 dark:to-green-900/20' 
                          : 'text-red-700 bg-gradient-to-r from-red-100 to-red-50 dark:text-red-300 dark:from-red-900/40 dark:to-red-900/20'
                      }`}
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.4, type: "spring" }}
                    >
                      <ArrowUpRight className={`h-3.5 w-3.5 ${stats.ventas.porcentajeCrecimiento < 0 ? 'rotate-180' : ''}`} />
                      {stats.ventas.porcentajeCrecimiento > 0 ? '+' : ''}{stats.ventas.porcentajeCrecimiento}%
                    </motion.span>
                  )}
                </div>
                
                <h3 className="text-4xl font-extrabold bg-gradient-to-r from-green-600 to-emerald-800 dark:from-green-400 dark:to-emerald-600 bg-clip-text text-transparent mb-2">
                  {statsLoading ? '...' : `$${(stats?.ventas.totalEsteMes || 0).toLocaleString('es-MX')}`}
                </h3>
                <p className="text-sm font-semibold text-slate-600 dark:text-slate-400 mb-4">Ventas este Mes</p>
                
                <div className="pt-4 border-t border-slate-200/70 dark:border-slate-700/70">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Objetivo mensual</p>
                    <p className="text-xs font-bold text-green-600 dark:text-green-400">
                      {statsLoading ? '...' : `${stats?.ventas.porcentajeObjetivo || 0}%`}
                    </p>
                  </div>
                  <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2 overflow-hidden">
                    <motion.div 
                      className="h-full bg-gradient-to-r from-green-500 to-emerald-600 rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${stats?.ventas.porcentajeObjetivo || 0}%` }}
                      transition={{ delay: 0.5, duration: 1, ease: "easeOut" }}
                    />
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>

          {/* Tareas Pendientes */}
          <motion.div variants={fadeInUp}>
            <Card className="p-6 backdrop-blur-md bg-white/90 dark:bg-slate-900/90 border-slate-200/50 dark:border-slate-700/50 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 group relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              
              <div className="relative">
                <div className="flex items-start justify-between mb-6">
                  <div className="h-14 w-14 bg-gradient-to-br from-amber-500 to-orange-600 rounded-2xl flex items-center justify-center shadow-lg shadow-amber-500/50 group-hover:shadow-amber-500/70 transition-shadow duration-300 group-hover:scale-110 transform">
                    <Target className="h-7 w-7 text-white" />
                  </div>
                  <motion.span 
                    className="text-xs font-bold text-amber-700 dark:text-amber-300 bg-gradient-to-r from-amber-100 to-amber-50 dark:from-amber-900/40 dark:to-amber-900/20 px-3 py-1.5 rounded-full flex items-center gap-1 shadow-md"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.5, type: "spring" }}
                  >
                    <Clock className="h-3.5 w-3.5" />
                    Urgente
                  </motion.span>
                </div>
                
                <h3 className="text-4xl font-extrabold bg-gradient-to-r from-amber-600 to-orange-800 dark:from-amber-400 dark:to-orange-600 bg-clip-text text-transparent mb-2">
                  18
                </h3>
                <p className="text-sm font-semibold text-slate-600 dark:text-slate-400 mb-4">Tareas Pendientes</p>
                
                <div className="pt-4 border-t border-slate-200/70 dark:border-slate-700/70 flex items-center justify-between">
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">5 vencen hoy</p>
                  <div className="flex items-center gap-1.5">
                    <div className="h-2 w-2 rounded-full bg-red-500 animate-pulse" />
                    <p className="text-xs font-bold text-red-600 dark:text-red-400">Atención</p>
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>
        </motion.div>

        {/* Two Column Layout */}
        <motion.div 
          className="grid gap-6 lg:grid-cols-3"
          variants={staggerContainer}
        >
          {/* Actividad Reciente */}
          <motion.div variants={fadeInUp} className="lg:col-span-2">
            <Card className="p-6 backdrop-blur-md bg-white/90 dark:bg-slate-900/90 border-slate-200/50 dark:border-slate-700/50 shadow-xl">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent flex items-center gap-2">
                    <Activity className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    Actividad Reciente
                  </h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Últimas acciones en el CRM</p>
                </div>
                <Button size="sm" variant="outline" className="text-blue-600 border-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20">
                  Ver todas
                </Button>
              </div>
              
              <div className="space-y-3">
                {actividadesRecientes && actividadesRecientes.data.length > 0 ? (
                  actividadesRecientes.data.slice(0, 5).map((actividad, index) => {
                    const config = TIPO_ACTIVIDAD_CONFIG[actividad.tipo];
                    const getTipoIcon = () => {
                      const iconProps = { className: "h-5 w-5", style: { color: config.color } };
                      switch (actividad.tipo) {
                        case 'LLAMADA':
                          return <Phone {...iconProps} />;
                        case 'EMAIL':
                          return <Mail {...iconProps} />;
                        case 'REUNION':
                          return <Users {...iconProps} />;
                        case 'TAREA':
                          return <CheckCircle2 {...iconProps} />;
                        case 'NOTA':
                          return <FileText {...iconProps} />;
                      }
                    };

                    const timeAgo = actividad.completadaEn 
                      ? formatDistanceToNow(new Date(actividad.completadaEn), { locale: es, addSuffix: true })
                      : actividad.fechaVencimiento
                      ? `Vence ${format(new Date(actividad.fechaVencimiento), "d 'de' MMM", { locale: es })}`
                      : formatDistanceToNow(new Date(actividad.creadoEn), { locale: es, addSuffix: true });

                    return (
                      <motion.div
                        key={actividad.id}
                        className="flex items-start gap-4 p-4 rounded-xl border border-slate-200/70 dark:border-slate-700/70 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:shadow-md transition-all duration-200 hover:-translate-y-0.5"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                      >
                        <motion.div
                          className="h-11 w-11 rounded-xl flex items-center justify-center flex-shrink-0 shadow-md"
                          style={{ backgroundColor: config.bgColor }}
                          whileHover={{ scale: 1.1, rotate: 5 }}
                          transition={{ type: "spring", stiffness: 300 }}
                        >
                          {getTipoIcon()}
                        </motion.div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                            {TIPO_ACTIVIDAD_LABELS[actividad.tipo]}
                            {actividad.completada && (
                              <span className="ml-2 text-xs text-green-600 dark:text-green-400 font-bold">
                                ✓ Completada
                              </span>
                            )}
                          </p>
                          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1 line-clamp-1">{actividad.titulo}</p>
                          {(actividad.cliente || actividad.negocio) && (
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium">
                              {actividad.cliente?.nombre || actividad.negocio?.titulo}
                            </p>
                          )}
                          <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {timeAgo}
                          </p>
                        </div>
                      </motion.div>
                    );
                  })
                ) : (
                  <motion.div 
                    className="text-center py-12 text-slate-500 dark:text-slate-400"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                  >
                    <Calendar className="h-16 w-16 mx-auto mb-4 text-slate-300 dark:text-slate-600" />
                    <p className="text-sm font-medium">No hay actividades recientes</p>
                  </motion.div>
                )}
              </div>
            </Card>
          </motion.div>

          {/* Quick Actions */}
          <motion.div variants={fadeInUp}>
            <Card className="p-6 backdrop-blur-md bg-gradient-to-br from-slate-900 to-slate-800 dark:from-slate-950 dark:to-slate-900 border-slate-700 dark:border-slate-800 shadow-2xl text-white relative overflow-hidden">
              {/* Animated gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 via-purple-600/10 to-pink-600/10 opacity-50" />
              
              <div className="relative">
                <h3 className="text-xl font-bold mb-2 flex items-center gap-2">
                  <motion.div
                    animate={{ rotate: [0, 5, -5, 0] }}
                    transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
                  >
                    <Zap className="h-5 w-5 text-blue-400" />
                  </motion.div>
                  Acciones Rápidas
                </h3>
                <p className="text-slate-300 dark:text-slate-400 text-sm mb-6">Atajos para tareas comunes</p>
                
                <div className="space-y-3">
                  <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                    <Button 
                      onClick={() => router.push('/clientes')}
                      className="w-full justify-start bg-white/10 hover:bg-white/20 text-white border-white/20 backdrop-blur-sm"
                    >
                      <Users className="h-4 w-4 mr-2" />
                      Ver Clientes
                    </Button>
                  </motion.div>
                  
                  <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                    <Button 
                      onClick={() => router.push('/negocios')}
                      className="w-full justify-start bg-white/10 hover:bg-white/20 text-white border-white/20 backdrop-blur-sm"
                    >
                      <Briefcase className="h-4 w-4 mr-2" />
                      Ver Negocios
                    </Button>
                  </motion.div>
                  
                  <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                    <Button 
                      onClick={() => router.push('/actividades')}
                      className="w-full justify-start bg-white/10 hover:bg-white/20 text-white border-white/20 backdrop-blur-sm"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Nueva Actividad
                    </Button>
                  </motion.div>
                  
                  <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                    <Button 
                      onClick={() => router.push('/reportes')}
                      className="w-full justify-start bg-gradient-to-r from-blue-600/20 to-purple-600/20 hover:from-blue-600/30 hover:to-purple-600/30 text-white border-blue-600/30 backdrop-blur-sm"
                    >
                      <BarChart3 className="h-4 w-4 mr-2" />
                      Ver Reportes
                    </Button>
                  </motion.div>
                  
                  {/* Solo visible para ADMIN */}
                  <RoleGuard roles={[RolUsuario.ADMIN]}>
                    <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                      <Button 
                        onClick={() => router.push('/admin/usuarios')}
                        className="w-full justify-start bg-gradient-to-r from-red-500/20 to-red-600/20 hover:from-red-500/30 hover:to-red-600/30 text-white border-red-500/30 backdrop-blur-sm"
                      >
                        <Shield className="h-4 w-4 mr-2" />
                        Admin Usuarios
                      </Button>
                    </motion.div>
                  </RoleGuard>
                </div>

                <div className="mt-8 pt-6 border-t border-white/10 dark:border-white/5">
                  <h4 className="text-sm font-semibold mb-4 text-slate-300 dark:text-slate-400">Tu Información</h4>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 text-sm p-3 rounded-lg bg-white/5 backdrop-blur-sm">
                      <Mail className="h-4 w-4 text-slate-400 dark:text-slate-500" />
                      <span className="text-slate-300 dark:text-slate-400 truncate">{session?.user?.email}</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm p-3 rounded-lg bg-white/5 backdrop-blur-sm">
                      <Award className="h-4 w-4 text-slate-400 dark:text-slate-500" />
                      <span className="text-slate-300 dark:text-slate-400">ID: {session?.user?.id?.slice(0, 8)}...</span>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>
        </motion.div>

        {/* Next Steps */}
        <motion.div variants={fadeInUp}>
          <Card className="p-8 backdrop-blur-md bg-gradient-to-r from-blue-50 via-purple-50 to-pink-50 dark:from-blue-900/20 dark:via-purple-900/20 dark:to-pink-900/20 border-blue-200/50 dark:border-blue-800/50 shadow-xl relative overflow-hidden">
            {/* Animated background pattern */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-0 left-0 w-64 h-64 bg-blue-400 rounded-full blur-3xl" />
              <div className="absolute bottom-0 right-0 w-64 h-64 bg-purple-400 rounded-full blur-3xl" />
            </div>
            
            <div className="relative flex items-start gap-4">
              <motion.div 
                className="h-14 w-14 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center shadow-xl flex-shrink-0"
                whileHover={{ rotate: 360 }}
                transition={{ duration: 0.6 }}
              >
                <TrendingUp className="h-7 w-7 text-white" />
              </motion.div>
              <div className="flex-1">
                <h3 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
                  Próximos Pasos del Desarrollo
                </h3>
                <p className="text-slate-600 dark:text-slate-400 mb-6">Funcionalidades pendientes del CRM</p>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                  {[
                    { title: "Módulo de Clientes", desc: "CRUD completo" },
                    { title: "Pipeline de Ventas", desc: "Kanban interactivo" },
                    { title: "Dashboard Métricas", desc: "Gráficas y reportes" },
                    { title: "Gestión Actividades", desc: "Calendario y tareas" }
                  ].map((item, index) => (
                    <motion.div
                      key={index}
                      className="flex items-start gap-3 p-4 rounded-xl bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm border border-slate-200/50 dark:border-slate-700/50 shadow-sm hover:shadow-md transition-all"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.6 + index * 0.1 }}
                      whileHover={{ scale: 1.02 }}
                    >
                      <CheckCircle2 className="h-6 w-6 text-green-500 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm font-bold text-slate-900 dark:text-slate-100">{item.title}</p>
                        <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">{item.desc}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          </Card>
        </motion.div>
      </motion.div>
    </div>
  );
}
