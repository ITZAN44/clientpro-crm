"use client";

import { useState } from "react";
import { useSession, signOut } from "next-auth/react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
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
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { NotificationDropdown } from "@/components/notifications/notification-dropdown";
import { KeyboardShortcutsHelp } from "@/components/keyboard-shortcuts-help";
import { cn } from "@/lib/utils";
import { RolUsuario } from "@/types/rol";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const navigation = [
  {
    name: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    name: "Clientes",
    href: "/clientes",
    icon: Users,
  },
  {
    name: "Negocios",
    href: "/negocios",
    icon: Briefcase,
  },
  {
    name: "Actividades",
    href: "/actividades",
    icon: Calendar,
  },
  {
    name: "Reportes",
    href: "/reportes",
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
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const getRoleBadgeVariant = (rol?: string) => {
    switch (rol) {
      case RolUsuario.ADMIN:
        return "default";
      case RolUsuario.MANAGER:
        return "secondary";
      default:
        return "outline";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/20 to-purple-50/10 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      {/* Sidebar - Desktop */}
      <aside
        className={cn(
          "fixed left-0 top-0 z-40 h-screen transition-all duration-300 ease-in-out hidden lg:block",
          sidebarCollapsed ? "w-20" : "w-64"
        )}
      >
        <div className="h-full backdrop-blur-md bg-white/80 dark:bg-slate-900/80 border-r border-white/20 dark:border-slate-700/50 shadow-xl">
          {/* Logo */}
          <div className="h-16 flex items-center justify-between px-4 border-b border-white/20 dark:border-slate-700/50">
            {!sidebarCollapsed && (
              <Link href="/dashboard" className="flex items-center gap-3">
                <div className="h-10 w-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                  <LayoutDashboard className="h-5 w-5 text-white" strokeWidth={2.5} />
                </div>
                <div>
                  <h1 className="text-lg font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    ClientPro CRM
                  </h1>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Professional</p>
                </div>
              </Link>
            )}
            {sidebarCollapsed && (
              <Link href="/dashboard" className="w-full flex justify-center">
                <div className="h-10 w-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                  <LayoutDashboard className="h-5 w-5 text-white" strokeWidth={2.5} />
                </div>
              </Link>
            )}
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-3 py-4 space-y-1">
            {navigation.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-all duration-200",
                    isActive
                      ? "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 border-l-4 border-blue-600"
                      : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-100",
                    sidebarCollapsed && "justify-center"
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
          <div className="p-4 border-t border-white/20 dark:border-slate-700/50">
            {!sidebarCollapsed ? (
              <div className="flex items-center gap-3 mb-3">
                <Avatar className="h-10 w-10 ring-2 ring-blue-600/20">
                  <AvatarFallback className="bg-gradient-to-br from-blue-600 to-purple-600 text-white font-bold text-sm">
                    {session?.user?.name ? getInitials(session.user.name) : "U"}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-slate-900 dark:text-slate-100 truncate">
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
                <Avatar className="h-10 w-10 ring-2 ring-blue-600/20">
                  <AvatarFallback className="bg-gradient-to-br from-blue-600 to-purple-600 text-white font-bold text-sm">
                    {session?.user?.name ? getInitials(session.user.name) : "U"}
                  </AvatarFallback>
                </Avatar>
              </div>
            )}

            <div className={cn("space-y-1", sidebarCollapsed && "flex flex-col items-center")}>
              {!sidebarCollapsed ? (
                <>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full justify-start text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100"
                    onClick={() => router.push("/settings")}
                  >
                    <Settings className="h-4 w-4 mr-2" />
                    Configuración
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full justify-start text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20"
                    onClick={() => signOut({ callbackUrl: "/login" })}
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
                    className="text-slate-600 dark:text-slate-400"
                    onClick={() => router.push("/settings")}
                    title="Configuración"
                  >
                    <Settings className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-red-600 dark:text-red-400"
                    onClick={() => signOut({ callbackUrl: "/login" })}
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
              className="w-full mt-2 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
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
          className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Mobile Sidebar */}
      <aside
        className={cn(
          "fixed left-0 top-0 z-50 h-screen w-64 transform transition-transform duration-300 ease-in-out lg:hidden",
          mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="h-full backdrop-blur-md bg-white/95 dark:bg-slate-900/95 border-r border-white/20 dark:border-slate-700/50 shadow-2xl">
          {/* Mobile Logo & Close */}
          <div className="h-16 flex items-center justify-between px-4 border-b border-white/20 dark:border-slate-700/50">
            <Link href="/dashboard" className="flex items-center gap-3" onClick={() => setMobileMenuOpen(false)}>
              <div className="h-10 w-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                <LayoutDashboard className="h-5 w-5 text-white" strokeWidth={2.5} />
              </div>
              <div>
                <h1 className="text-lg font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  ClientPro CRM
                </h1>
                <p className="text-xs text-slate-500 dark:text-slate-400">Professional</p>
              </div>
            </Link>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setMobileMenuOpen(false)}
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Mobile Navigation */}
          <nav className="flex-1 px-3 py-4 space-y-1">
            {navigation.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-all duration-200",
                    isActive
                      ? "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 border-l-4 border-blue-600"
                      : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                  )}
                >
                  <item.icon className="h-5 w-5" />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>

          {/* Mobile User Section */}
          <div className="p-4 border-t border-white/20 dark:border-slate-700/50">
            <div className="flex items-center gap-3 mb-3">
              <Avatar className="h-10 w-10 ring-2 ring-blue-600/20">
                <AvatarFallback className="bg-gradient-to-br from-blue-600 to-purple-600 text-white font-bold text-sm">
                  {session?.user?.name ? getInitials(session.user.name) : "U"}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                  {session?.user?.name}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400">{session?.user?.email}</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-start text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
              onClick={() => signOut({ callbackUrl: "/login" })}
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
          "transition-all duration-300 ease-in-out",
          sidebarCollapsed ? "lg:pl-20" : "lg:pl-64"
        )}
      >
        {/* Top Navbar */}
        <header className="sticky top-0 z-30 h-16 border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl shadow-sm">
          <div className="h-full px-4 flex items-center justify-between gap-4">
            {/* Mobile Menu Toggle */}
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
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
              <div className="hidden lg:flex items-center gap-3 ml-2 pl-3 border-l border-slate-200 dark:border-slate-700">
                <Avatar className="h-9 w-9 ring-2 ring-blue-600/20">
                  <AvatarFallback className="bg-gradient-to-br from-blue-600 to-purple-600 text-white font-bold text-xs">
                    {session?.user?.name ? getInitials(session.user.name) : "U"}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                    {session?.user?.name}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {session?.user?.email}
                  </p>
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
