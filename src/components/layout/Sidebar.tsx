'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAppStore } from '@/store/useAppStore';
import {
  LayoutDashboard,
  Dumbbell,
  Users,
  Calendar,
  BookOpen,
  TrendingUp,
  Bell,
  LogOut,
  Menu,
  X,
  ChevronRight,
} from 'lucide-react';

const trainerLinks = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/alunos', label: 'Alunos', icon: Users },
  { href: '/treinos', label: 'Treinos', icon: Dumbbell },
  { href: '/agenda', label: 'Agenda', icon: Calendar },
  { href: '/exercicios', label: 'Exercícios', icon: BookOpen },
];

const studentLinks = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/meus-treinos', label: 'Meus Treinos', icon: Dumbbell },
  { href: '/progresso', label: 'Progresso', icon: TrendingUp },
  { href: '/agenda', label: 'Agenda', icon: Calendar },
  { href: '/exercicios', label: 'Exercícios', icon: BookOpen },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { currentUser, sidebarOpen, toggleSidebar, setSidebarOpen, logout, notifications, fetchNotifications } = useAppStore();

  useEffect(() => {
    if (currentUser) {
      fetchNotifications();
    }
  }, [currentUser, fetchNotifications]);

  if (!currentUser) return null;

  const links = currentUser.role === 'trainer' ? trainerLinks : studentLinks;
  const unreadCount = notifications.filter(
    (n) => n.user_id === currentUser.id && !n.is_read
  ).length;

  return (
    <>
      {/* Mobile hamburger */}
      <button
        onClick={toggleSidebar}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-xl bg-dark-light border border-dark-lighter text-gray-light hover:text-primary transition-colors"
        aria-label="Toggle menu"
      >
        {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="lg:hidden fixed inset-0 z-30 mobile-overlay"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 z-40 h-full w-72 bg-dark-light border-r border-dark-lighter flex flex-col transition-transform duration-300 ease-in-out
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`}
      >
        {/* Logo */}
        <div className="p-6 border-b border-dark-lighter">
          <Link href="/dashboard" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
              <Dumbbell size={22} className="text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold gradient-text">FitPro</h1>
              <p className="text-xs text-gray">Gestão de Academia</p>
            </div>
          </Link>
        </div>

        {/* User info */}
        <div className="p-4 mx-3 mt-4 rounded-xl glass-light">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-lg">
              {currentUser.avatar}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-lighter truncate">
                {currentUser.name}
              </p>
              <p className="text-xs text-gray capitalize">
                {currentUser.role === 'trainer' ? 'Personal Trainer' : 'Aluno'}
              </p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-3 mt-2 space-y-1 overflow-y-auto">
          <p className="px-3 py-2 text-[11px] font-semibold text-gray uppercase tracking-wider">
            Menu
          </p>
          {links.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group
                  ${
                    isActive
                      ? 'bg-primary/10 text-primary border border-primary/20'
                      : 'text-gray hover:text-gray-lighter hover:bg-dark-lighter/50'
                  }`}
              >
                <Icon size={20} />
                <span className="flex-1">{link.label}</span>
                {isActive && (
                  <ChevronRight size={16} className="text-primary" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Bottom actions */}
        <div className="p-3 border-t border-dark-lighter space-y-1">
          <Link
            href="/notificacoes"
            onClick={() => setSidebarOpen(false)}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-gray hover:text-gray-lighter hover:bg-dark-lighter/50 transition-all"
          >
            <div className="relative">
              <Bell size={20} />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-danger text-white text-[10px] flex items-center justify-center font-bold">
                  {unreadCount}
                </span>
              )}
            </div>
            <span>Notificações</span>
          </Link>
          <button
            onClick={() => {
              logout();
              setSidebarOpen(false);
            }}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-gray hover:text-danger hover:bg-danger/10 transition-all"
          >
            <LogOut size={20} />
            <span>Sair</span>
          </button>
        </div>
      </aside>
    </>
  );
}
