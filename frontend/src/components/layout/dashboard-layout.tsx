'use client';

import { useState } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  LayoutDashboard,
  Users,
  Briefcase,
  Calendar,
  BarChart3,
  Settings,
  LogOut,
  Menu,
  X,
  Shield,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { ThemeToggle } from '@/components/theme/theme-toggle';
import { NotificationDropdown } from '@/components/notifications/notification-dropdown';
import { KeyboardShortcutsHelp } from '@/components/keyboard-shortcuts-help';
import { cn } from '@/lib/utils';
import { RolUsuario } from '@/types/rol';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const navigation = [
  {
    name: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
  },
  {
    name: 'Clientes',
    href: '/clientes',
    icon: Users,
  },
  {
    name: 'Negocios',
    href: '/negocios',
    icon: Briefcase,
  },
  {
    name: 'Actividades',
    href: '/actividades',
    icon: Calendar,
  },
  {
    name: 'Reportes',
    href: '/reportes',
    icon: BarChart3,
  },
];

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const { data: session } = useSession();
  const pathname = usePathname();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getRoleBadgeVariant = (rol?: string) => {
    switch (rol) {
      case RolUsuario.ADMIN:
        return 'default';
      case RolUsuario.MANAGER:
        return 'secondary';
      default:
        return 'outline';
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Sidebar - Desktop */}
      <aside
        className={cn(
          'fixed left-0 top-0 z-40 h-screen transition-all duration-300 ease-in-out hidden lg:block',
          sidebarCollapsed ? 'w-20' : 'w-64'
        )}
      >
        <div className="h-full bg-sidebar border-r border-sidebar-border flex flex-col">
          {/* Logo */}
          <div className="h-16 flex items-center justify-between px-4 border-b border-sidebar-border shrink-0">
            {!sidebarCollapsed && (
              <Link href="/dashboard" className="flex items-center gap-3">
                <div className="h-10 w-10 bg-primary/10 border border-primary/20 rounded-xl flex items-center justify-center">
                  <LayoutDashboard className="h-5 w-5 text-primary" strokeWidth={2.5} />
                </div>
                <div>
                  <h1 className="text-lg font-bold font-serif text-primary tracking-tight">
                    ClientPro CRM
                  </h1>
                  <p className="text-xs text-muted-foreground">Professional</p>
                </div>
              </Link>
            )}
            {sidebarCollapsed && (
              <Link href="/dashboard" className="w-full flex justify-center">
                <div className="h-10 w-10 bg-primary/10 border border-primary/20 rounded-xl flex items-center justify-center">
                  <LayoutDashboard className="h-5 w-5 text-primary" strokeWidth={2.5} />
                </div>
              </Link>
            )}
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
            {navigation.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    'flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-all duration-200',
                    isActive
                      ? 'bg-primary/10 text-primary border-l-2 border-primary'
                      : 'text-muted-foreground hover:text-foreground hover:bg-accent',
                    sidebarCollapsed && 'justify-center'
                  )}
                  title={sidebarCollapsed ? item.name : undefined}
                >
                  <item.icon className="h-5 w-5 flex-shrink-0" />
                  {!sidebarCollapsed && <span>{item.name}</span>}
                </Link>
              );
            })}
          </nav>

          {/* User Section */}
          <div className="p-4 border-t border-sidebar-border shrink-0">
            {!sidebarCollapsed ? (
              <div className="flex items-center gap-3 mb-3">
                <Avatar className="h-10 w-10 ring-2 ring-primary/30">
                  <AvatarFallback className="bg-primary/10 text-primary font-bold text-sm">
                    {session?.user?.name ? getInitials(session.user.name) : 'U'}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-foreground truncate">
                    {session?.user?.name}
                  </p>
                  <div className="flex items-center gap-1">
                    <Badge variant={getRoleBadgeVariant(session?.user?.rol)} className="text-xs">
                      <Shield className="h-3 w-3 mr-1" />
                      {session?.user?.rol}
                    </Badge>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex justify-center mb-3">
                <Avatar className="h-10 w-10 ring-2 ring-primary/30">
                  <AvatarFallback className="bg-primary/10 text-primary font-bold text-sm">
                    {session?.user?.name ? getInitials(session.user.name) : 'U'}
                  </AvatarFallback>
                </Avatar>
              </div>
            )}

            <div className={cn('space-y-1', sidebarCollapsed && 'flex flex-col items-center')}>
              {!sidebarCollapsed ? (
                <>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full justify-start text-muted-foreground hover:text-foreground hover:bg-accent"
                    onClick={() => router.push('/settings')}
                  >
                    <Settings className="h-4 w-4 mr-2" />
                    Configuración
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full justify-start text-destructive hover:text-destructive hover:bg-destructive/10"
                    onClick={() => signOut({ callbackUrl: '/login' })}
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Cerrar Sesión
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-muted-foreground hover:text-foreground hover:bg-accent"
                    onClick={() => router.push('/settings')}
                    title="Configuración"
                  >
                    <Settings className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-destructive hover:text-destructive hover:bg-destructive/10"
                    onClick={() => signOut({ callbackUrl: '/login' })}
                    title="Cerrar Sesión"
                  >
                    <LogOut className="h-4 w-4" />
                  </Button>
                </>
              )}
            </div>

            {/* Collapse Toggle */}
            <Button
              variant="ghost"
              size="sm"
              className="w-full mt-2 text-muted-foreground hover:text-foreground hover:bg-accent"
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            >
              {sidebarCollapsed ? (
                <ChevronRight className="h-4 w-4" />
              ) : (
                <>
                  <ChevronLeft className="h-4 w-4 mr-2" />
                  Colapsar
                </>
              )}
            </Button>
          </div>
        </div>
      </aside>

      {/* Mobile Sidebar Overlay */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Mobile Sidebar */}
      <aside
        className={cn(
          'fixed left-0 top-0 z-50 h-screen w-64 transform transition-transform duration-300 ease-in-out lg:hidden',
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="h-full bg-sidebar border-r border-sidebar-border flex flex-col">
          {/* Mobile Logo & Close */}
          <div className="h-16 flex items-center justify-between px-4 border-b border-sidebar-border shrink-0">
            <Link
              href="/dashboard"
              className="flex items-center gap-3"
              onClick={() => setMobileMenuOpen(false)}
            >
              <div className="h-10 w-10 bg-primary/10 border border-primary/20 rounded-xl flex items-center justify-center">
                <LayoutDashboard className="h-5 w-5 text-primary" strokeWidth={2.5} />
              </div>
              <div>
                <h1 className="text-lg font-bold font-serif text-primary tracking-tight">
                  ClientPro CRM
                </h1>
                <p className="text-xs text-muted-foreground">Professional</p>
              </div>
            </Link>
            <Button
              variant="ghost"
              size="icon"
              className="text-muted-foreground hover:text-foreground"
              onClick={() => setMobileMenuOpen(false)}
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Mobile Navigation */}
          <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
            {navigation.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={cn(
                    'flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-all duration-200',
                    isActive
                      ? 'bg-primary/10 text-primary border-l-2 border-primary'
                      : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                  )}
                >
                  <item.icon className="h-5 w-5" />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>

          {/* Mobile User Section */}
          <div className="p-4 border-t border-sidebar-border shrink-0">
            <div className="flex items-center gap-3 mb-3">
              <Avatar className="h-10 w-10 ring-2 ring-primary/30">
                <AvatarFallback className="bg-primary/10 text-primary font-bold text-sm">
                  {session?.user?.name ? getInitials(session.user.name) : 'U'}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-foreground truncate">
                  {session?.user?.name}
                </p>
                <p className="text-xs text-muted-foreground truncate">{session?.user?.email}</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-start text-destructive hover:text-destructive hover:bg-destructive/10"
              onClick={() => signOut({ callbackUrl: '/login' })}
            >
              <LogOut className="h-4 w-4 mr-2" />
              Cerrar Sesión
            </Button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div
        className={cn(
          'transition-all duration-300 ease-in-out',
          sidebarCollapsed ? 'lg:pl-20' : 'lg:pl-64'
        )}
      >
        {/* Top Navbar */}
        <header className="sticky top-0 z-30 h-16 border-b border-border bg-background/80 backdrop-blur-xl">
          <div className="h-full px-4 flex items-center justify-between gap-4">
            {/* Mobile Menu Toggle */}
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden text-muted-foreground hover:text-foreground"
              onClick={() => setMobileMenuOpen(true)}
            >
              <Menu className="h-5 w-5" />
            </Button>

            {/* Page Title - Hidden on mobile when not needed */}
            <div className="flex-1 hidden sm:block">
              {/* This can be filled by page-specific content if needed */}
            </div>

            {/* Right Actions */}
            <div className="flex items-center gap-2">
              <KeyboardShortcutsHelp />
              <NotificationDropdown />
              <ThemeToggle />

              {/* Desktop User Info */}
              <div className="hidden lg:flex items-center gap-3 ml-2 pl-3 border-l border-border">
                <Avatar className="h-9 w-9 ring-2 ring-primary/30">
                  <AvatarFallback className="bg-primary/10 text-primary font-bold text-xs">
                    {session?.user?.name ? getInitials(session.user.name) : 'U'}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm font-semibold text-foreground">{session?.user?.name}</p>
                  <p className="text-xs text-muted-foreground">{session?.user?.email}</p>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="min-h-[calc(100vh-4rem)]">{children}</main>
      </div>
    </div>
  );
}
