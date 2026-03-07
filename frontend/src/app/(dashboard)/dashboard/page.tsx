'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { getStatsGenerales } from '@/lib/api/stats';
import { getActividades } from '@/lib/api/actividades';
import { TIPO_ACTIVIDAD_CONFIG, TIPO_ACTIVIDAD_LABELS } from '@/types/actividad';
import { RoleGuard } from '@/components/auth';
import { RolUsuario } from '@/types/rol';
import { DashboardSkeleton } from '@/components/ui/skeleton-loaders';
import { format, formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import { fadeInUp, staggerContainer } from '@/lib/motion';
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
  Shield,
} from 'lucide-react';

export default function DashboardPage() {
  const { data: session } = useSession();
  const router = useRouter();

  // Query para obtener estadísticas generales (optimizado con staleTime)
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['stats-generales'],
    queryFn: () =>
      session?.accessToken ? getStatsGenerales(session.accessToken) : Promise.reject('No session'),
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
        initial="hidden"
        animate="visible"
        variants={staggerContainer}
      >
        {/* Welcome Section */}
        <motion.div className="flex items-start justify-between" variants={fadeInUp}>
          <div>
            <h2 className="font-serif text-4xl text-foreground mb-2">
              Bienvenido de nuevo, {session?.user?.name?.split(' ')[0]}
            </h2>
            <p className="text-muted-foreground flex items-center gap-2 text-sm">
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
            <span className="px-4 py-2 rounded-full text-sm font-semibold bg-primary/10 text-primary border border-primary/30 flex items-center gap-1.5">
              <Award className="h-4 w-4" />
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
            <Card className="p-6 bg-card border border-border hover:border-primary/30 hover:-translate-y-1 transition-all duration-300 group relative overflow-hidden">
              <div className="flex items-start justify-between mb-6">
                <div className="bg-primary/10 rounded-lg p-2 text-primary">
                  <Users className="h-6 w-6" />
                </div>
                {stats && stats.clientes.porcentajeCrecimiento !== 0 && (
                  <motion.span
                    className={`font-mono text-xs px-2.5 py-1 rounded-md flex items-center gap-1 ${
                      stats.clientes.porcentajeCrecimiento > 0
                        ? 'text-success bg-success/10'
                        : 'text-destructive bg-destructive/10'
                    }`}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.2, type: 'spring' }}
                  >
                    <ArrowUpRight
                      className={`h-3 w-3 ${stats.clientes.porcentajeCrecimiento < 0 ? 'rotate-180' : ''}`}
                    />
                    {stats.clientes.porcentajeCrecimiento > 0 ? '+' : ''}
                    {stats.clientes.porcentajeCrecimiento}%
                  </motion.span>
                )}
              </div>

              <h3 className="font-mono text-2xl text-foreground mb-1">
                {statsLoading ? '...' : stats?.clientes.total || 0}
              </h3>
              <p className="text-muted-foreground text-sm mb-4">Total Clientes</p>

              <div className="pt-4 border-t border-border flex items-center justify-between">
                <p className="text-xs text-muted-foreground">
                  {statsLoading ? '...' : `${stats?.clientes.nuevosEsteMes || 0} nuevos este mes`}
                </p>
                <Link
                  href="/clientes"
                  className="text-xs font-medium text-primary hover:text-primary/80 flex items-center gap-1 transition-colors"
                >
                  Ver
                  <ArrowUpRight className="h-3 w-3" />
                </Link>
              </div>
            </Card>
          </motion.div>

          {/* Negocios Activos */}
          <motion.div variants={fadeInUp}>
            <Card className="p-6 bg-card border border-border hover:border-primary/30 hover:-translate-y-1 transition-all duration-300 group relative overflow-hidden">
              <div className="flex items-start justify-between mb-6">
                <div className="bg-primary/10 rounded-lg p-2 text-primary">
                  <Briefcase className="h-6 w-6" />
                </div>
                {stats && stats.negocios.porcentajeCrecimiento !== 0 && (
                  <motion.span
                    className={`font-mono text-xs px-2.5 py-1 rounded-md flex items-center gap-1 ${
                      stats.negocios.porcentajeCrecimiento > 0
                        ? 'text-success bg-success/10'
                        : 'text-destructive bg-destructive/10'
                    }`}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.3, type: 'spring' }}
                  >
                    <ArrowUpRight
                      className={`h-3 w-3 ${stats.negocios.porcentajeCrecimiento < 0 ? 'rotate-180' : ''}`}
                    />
                    {stats.negocios.porcentajeCrecimiento > 0 ? '+' : ''}
                    {stats.negocios.porcentajeCrecimiento}%
                  </motion.span>
                )}
              </div>

              <h3 className="font-mono text-2xl text-foreground mb-1">
                {statsLoading ? '...' : stats?.negocios.activos || 0}
              </h3>
              <p className="text-muted-foreground text-sm mb-4">Negocios Activos</p>

              <div className="pt-4 border-t border-border flex items-center justify-between">
                <p className="text-xs text-muted-foreground">
                  {statsLoading
                    ? '...'
                    : `$${(stats?.negocios.valorPipeline || 0).toLocaleString('es-MX')} en pipeline`}
                </p>
                <Link
                  href="/negocios"
                  className="text-xs font-medium text-primary hover:text-primary/80 flex items-center gap-1 transition-colors"
                >
                  Ver
                  <ArrowUpRight className="h-3 w-3" />
                </Link>
              </div>
            </Card>
          </motion.div>

          {/* Ventas del Mes */}
          <motion.div variants={fadeInUp}>
            <Card className="p-6 bg-card border border-border hover:border-primary/30 hover:-translate-y-1 transition-all duration-300 group relative overflow-hidden">
              <div className="flex items-start justify-between mb-6">
                <div className="bg-primary/10 rounded-lg p-2 text-primary">
                  <DollarSign className="h-6 w-6" />
                </div>
                {stats && stats.ventas.porcentajeCrecimiento !== 0 && (
                  <motion.span
                    className={`font-mono text-xs px-2.5 py-1 rounded-md flex items-center gap-1 ${
                      stats.ventas.porcentajeCrecimiento > 0
                        ? 'text-success bg-success/10'
                        : 'text-destructive bg-destructive/10'
                    }`}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.4, type: 'spring' }}
                  >
                    <ArrowUpRight
                      className={`h-3 w-3 ${stats.ventas.porcentajeCrecimiento < 0 ? 'rotate-180' : ''}`}
                    />
                    {stats.ventas.porcentajeCrecimiento > 0 ? '+' : ''}
                    {stats.ventas.porcentajeCrecimiento}%
                  </motion.span>
                )}
              </div>

              <h3 className="font-mono text-2xl text-foreground mb-1">
                {statsLoading
                  ? '...'
                  : `$${(stats?.ventas.totalEsteMes || 0).toLocaleString('es-MX')}`}
              </h3>
              <p className="text-muted-foreground text-sm mb-4">Ventas este Mes</p>

              <div className="pt-4 border-t border-border">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs text-muted-foreground">Objetivo mensual</p>
                  <p className="font-mono text-xs text-success">
                    {statsLoading ? '...' : `${stats?.ventas.porcentajeObjetivo || 0}%`}
                  </p>
                </div>
                <div className="w-full bg-primary/20 rounded-full h-1.5 overflow-hidden">
                  <motion.div
                    className="h-full bg-primary rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${stats?.ventas.porcentajeObjetivo || 0}%` }}
                    transition={{ delay: 0.5, duration: 1, ease: 'easeOut' }}
                  />
                </div>
              </div>
            </Card>
          </motion.div>

          {/* Tareas Pendientes */}
          <motion.div variants={fadeInUp}>
            <Card className="p-6 bg-card border border-border hover:border-primary/30 hover:-translate-y-1 transition-all duration-300 group relative overflow-hidden">
              <div className="flex items-start justify-between mb-6">
                <div className="bg-primary/10 rounded-lg p-2 text-primary">
                  <Target className="h-6 w-6" />
                </div>
                <motion.span
                  className="font-mono text-xs text-destructive bg-destructive/10 px-2.5 py-1 rounded-md flex items-center gap-1"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.5, type: 'spring' }}
                >
                  <Clock className="h-3 w-3" />
                  Urgente
                </motion.span>
              </div>

              <h3 className="font-mono text-2xl text-foreground mb-1">18</h3>
              <p className="text-muted-foreground text-sm mb-4">Tareas Pendientes</p>

              <div className="pt-4 border-t border-border flex items-center justify-between">
                <p className="text-xs text-muted-foreground">5 vencen hoy</p>
                <div className="flex items-center gap-1.5">
                  <div className="h-1.5 w-1.5 rounded-full bg-destructive animate-pulse" />
                  <p className="font-mono text-xs text-destructive">Atención</p>
                </div>
              </div>
            </Card>
          </motion.div>
        </motion.div>

        {/* Two Column Layout */}
        <motion.div className="grid gap-6 lg:grid-cols-3" variants={staggerContainer}>
          {/* Actividad Reciente */}
          <motion.div variants={fadeInUp} className="lg:col-span-2">
            <Card className="p-6 bg-card border border-border">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="font-serif text-lg text-foreground flex items-center gap-2">
                    <Activity className="h-5 w-5 text-primary" />
                    Actividad Reciente
                  </h3>
                  <p className="text-sm text-muted-foreground mt-1">Últimas acciones en el CRM</p>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  className="text-primary border-primary/30 hover:bg-primary/10 hover:border-primary/50"
                >
                  Ver todas
                </Button>
              </div>

              <div className="space-y-1">
                {actividadesRecientes && actividadesRecientes.data.length > 0 ? (
                  <div className="border-l border-border ml-4 space-y-0">
                    {actividadesRecientes.data.slice(0, 5).map((actividad, index) => {
                      const config = TIPO_ACTIVIDAD_CONFIG[actividad.tipo];
                      const getTipoIcon = () => {
                        const iconProps = { className: 'h-4 w-4 text-primary' };
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
                        ? formatDistanceToNow(new Date(actividad.completadaEn), {
                            locale: es,
                            addSuffix: true,
                          })
                        : actividad.fechaVencimiento
                          ? `Vence ${format(new Date(actividad.fechaVencimiento), "d 'de' MMM", { locale: es })}`
                          : formatDistanceToNow(new Date(actividad.creadoEn), {
                              locale: es,
                              addSuffix: true,
                            });

                      return (
                        <motion.div
                          key={actividad.id}
                          className="relative flex items-start gap-4 pl-6 pb-5 last:pb-0"
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                        >
                          {/* Timeline node */}
                          <div className="absolute -left-[7px] top-1 h-3.5 w-3.5 rounded-full bg-primary border-2 border-background flex-shrink-0" />

                          <div className="flex items-start gap-3 flex-1 p-3 rounded-lg hover:bg-muted/50 transition-colors">
                            <div className="bg-primary/10 rounded-md p-1.5 flex-shrink-0">
                              {getTipoIcon()}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-foreground">
                                {TIPO_ACTIVIDAD_LABELS[actividad.tipo]}
                                {actividad.completada && (
                                  <span className="ml-2 text-xs text-success font-mono">
                                    ✓ Completada
                                  </span>
                                )}
                              </p>
                              <p className="text-sm text-muted-foreground mt-0.5 line-clamp-1">
                                {actividad.titulo}
                              </p>
                              {(actividad.cliente || actividad.negocio) && (
                                <p className="text-xs text-muted-foreground mt-0.5">
                                  {actividad.cliente?.nombre || actividad.negocio?.titulo}
                                </p>
                              )}
                              <p className="font-mono text-xs text-muted-foreground mt-1.5 flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {timeAgo}
                              </p>
                            </div>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                ) : (
                  <motion.div
                    className="text-center py-12 text-muted-foreground"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                  >
                    <Calendar className="h-16 w-16 mx-auto mb-4 text-muted-foreground/30" />
                    <p className="text-sm font-medium">No hay actividades recientes</p>
                  </motion.div>
                )}
              </div>
            </Card>
          </motion.div>

          {/* Quick Actions */}
          <motion.div variants={fadeInUp}>
            <Card className="p-6 bg-card border border-border">
              <h3 className="font-serif text-lg text-foreground mb-1 flex items-center gap-2">
                <motion.div
                  animate={{ rotate: [0, 5, -5, 0] }}
                  transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
                >
                  <Zap className="h-5 w-5 text-primary" />
                </motion.div>
                Acciones Rápidas
              </h3>
              <p className="text-muted-foreground text-sm mb-6">Atajos para tareas comunes</p>

              <div className="space-y-2">
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Button
                    onClick={() => router.push('/clientes')}
                    className="w-full justify-start bg-primary/10 border border-primary/20 text-primary hover:bg-primary/20 transition-colors"
                    variant="ghost"
                  >
                    <Users className="h-4 w-4 mr-2" />
                    Ver Clientes
                  </Button>
                </motion.div>

                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Button
                    onClick={() => router.push('/negocios')}
                    className="w-full justify-start bg-primary/10 border border-primary/20 text-primary hover:bg-primary/20 transition-colors"
                    variant="ghost"
                  >
                    <Briefcase className="h-4 w-4 mr-2" />
                    Ver Negocios
                  </Button>
                </motion.div>

                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Button
                    onClick={() => router.push('/actividades')}
                    className="w-full justify-start bg-primary/10 border border-primary/20 text-primary hover:bg-primary/20 transition-colors"
                    variant="ghost"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Nueva Actividad
                  </Button>
                </motion.div>

                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Button
                    onClick={() => router.push('/reportes')}
                    className="w-full justify-start bg-primary/10 border border-primary/20 text-primary hover:bg-primary/20 transition-colors"
                    variant="ghost"
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
                      className="w-full justify-start bg-destructive/10 border border-destructive/20 text-destructive hover:bg-destructive/20 transition-colors"
                      variant="ghost"
                    >
                      <Shield className="h-4 w-4 mr-2" />
                      Admin Usuarios
                    </Button>
                  </motion.div>
                </RoleGuard>
              </div>

              <div className="mt-6 pt-5 border-t border-border">
                <h4 className="font-serif text-sm text-muted-foreground mb-3">Tu Información</h4>
                <div className="space-y-2">
                  <div className="flex items-center gap-3 text-sm p-2.5 rounded-lg bg-muted/50">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground truncate text-xs font-mono">
                      {session?.user?.email}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-sm p-2.5 rounded-lg bg-muted/50">
                    <Award className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground text-xs font-mono">
                      ID: {session?.user?.id?.slice(0, 8)}...
                    </span>
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>
        </motion.div>

        {/* Next Steps */}
        <motion.div variants={fadeInUp}>
          <Card className="p-8 bg-card border border-border relative overflow-hidden">
            <div className="flex items-start gap-4">
              <motion.div
                className="h-12 w-12 bg-primary/10 rounded-lg flex items-center justify-center text-primary flex-shrink-0"
                whileHover={{ rotate: 360 }}
                transition={{ duration: 0.6 }}
              >
                <TrendingUp className="h-6 w-6" />
              </motion.div>
              <div className="flex-1">
                <h3 className="font-serif text-2xl text-foreground mb-1">
                  Próximos Pasos del Desarrollo
                </h3>
                <p className="text-muted-foreground text-sm mb-6">
                  Funcionalidades pendientes del CRM
                </p>
                <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
                  {[
                    { title: 'Módulo de Clientes', desc: 'CRUD completo' },
                    { title: 'Pipeline de Ventas', desc: 'Kanban interactivo' },
                    { title: 'Dashboard Métricas', desc: 'Gráficas y reportes' },
                    { title: 'Gestión Actividades', desc: 'Calendario y tareas' },
                  ].map((item, index) => (
                    <motion.div
                      key={index}
                      className="flex items-start gap-3 p-4 rounded-lg bg-muted/30 border border-border hover:border-primary/30 hover:bg-muted/50 transition-all"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.6 + index * 0.1 }}
                      whileHover={{ scale: 1.02 }}
                    >
                      <CheckCircle2 className="h-5 w-5 text-success flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-foreground">{item.title}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">{item.desc}</p>
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
