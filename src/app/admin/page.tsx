'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAppStore } from '@/store/useAppStore';
import { apiAdminDashboard } from '@/lib/api';
import PageHeader from '@/components/ui/PageHeader';
import StatCard from '@/components/ui/StatCard';
import {
  ShieldCheck,
  Users,
  Dumbbell,
  BookOpen,
  Calendar,
  ClipboardList,
  CheckCircle,
  XCircle,
  Loader2,
} from 'lucide-react';

interface DashboardData {
  stats: {
    totalUsers: number;
    totalTrainers: number;
    totalStudents: number;
    totalExercises: number;
    totalWorkouts: number;
    totalSessions: number;
    verifiedUsers: number;
    unverifiedUsers: number;
  };
  recentUsers: { id: string; name: string; email: string; role: string; avatar: string; created_at: string }[];
  todaySessions: { id: string; trainer_name: string; student_name: string; time: string; status: string; type: string }[];
}

export default function AdminDashboardPage() {
  const { currentUser } = useAppStore();
  const router = useRouter();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!currentUser || currentUser.role !== 'admin') {
      router.push('/');
      return;
    }
    apiAdminDashboard()
      .then(setData)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [currentUser, router]);

  if (!currentUser || currentUser.role !== 'admin') return null;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 size={32} className="text-primary animate-spin" />
      </div>
    );
  }

  if (!data) return null;
  const { stats, recentUsers, todaySessions } = data;

  return (
    <div className="space-y-4 sm:space-y-8">
      <PageHeader
        title="Painel Administrativo"
        subtitle="Visão geral de toda a plataforma"
        icon={<ShieldCheck size={28} />}
      />

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 animate-fade-in">
        <StatCard title="Usuários" value={stats.totalUsers} icon={<Users size={24} />} color="primary" href="/admin/usuarios" />
        <StatCard title="Personal Trainers" value={stats.totalTrainers} icon={<Users size={24} />} color="secondary" href="/admin/usuarios" />
        <StatCard title="Alunos" value={stats.totalStudents} icon={<Users size={24} />} color="accent" href="/admin/usuarios" />
        <StatCard title="Exercícios" value={stats.totalExercises} icon={<BookOpen size={24} />} color="primary" href="/admin/exercicios" />
        <StatCard title="Treinos" value={stats.totalWorkouts} icon={<Dumbbell size={24} />} color="secondary" href="/admin/treinos" />
        <StatCard title="Sessões" value={stats.totalSessions} icon={<ClipboardList size={24} />} color="accent" href="/admin/sessoes" />
        <StatCard title="Verificados" value={stats.verifiedUsers} icon={<CheckCircle size={24} />} color="secondary" href="/admin/usuarios" />
        <StatCard title="Não Verificados" value={stats.unverifiedUsers} icon={<XCircle size={24} />} color="danger" href="/admin/usuarios" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
        {/* Recent Users */}
        <div className="rounded-2xl bg-dark-light border border-dark-lighter p-3 sm:p-5 animate-fade-in">
          <div className="flex items-center justify-between mb-3 sm:mb-4">
            <h2 className="text-base sm:text-lg font-bold text-gray-lighter">Usuários Recentes</h2>
            <Link href="/admin/usuarios" className="text-xs text-primary hover:text-primary-light font-medium">
              Gerenciar →
            </Link>
          </div>
          {recentUsers.length === 0 ? (
            <p className="text-sm text-gray">Nenhum usuário recente.</p>
          ) : (
            <div className="relative">
              <div className="space-y-2">
                {recentUsers.slice(0, 4).map((u, idx) => (
                  <div key={u.id} className={`flex items-center gap-3 p-3 rounded-xl bg-dark/50 border border-dark-lighter/50 ${idx === 3 ? 'opacity-40' : ''}`}>
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary/30 to-secondary/30 flex items-center justify-center text-sm">
                      {u.avatar}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-lighter truncate">{u.name}</p>
                      <p className="text-xs text-gray truncate">{u.email}</p>
                    </div>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${
                      u.role === 'admin' ? 'bg-accent/20 text-accent' : u.role === 'trainer' ? 'bg-primary/20 text-primary' : 'bg-secondary/20 text-secondary'
                    }`}>
                      {u.role === 'admin' ? 'Admin' : u.role === 'trainer' ? 'Trainer' : 'Aluno'}
                    </span>
                  </div>
                ))}
              </div>
              {recentUsers.length > 3 && (
                <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-dark-light to-transparent pointer-events-none rounded-b-2xl" />
              )}
            </div>
          )}
        </div>

        {/* Today's Sessions */}
        <div className="rounded-2xl bg-dark-light border border-dark-lighter p-3 sm:p-5 animate-fade-in">
          <div className="flex items-center justify-between mb-3 sm:mb-4">
            <h2 className="text-base sm:text-lg font-bold text-gray-lighter">Sessões de Hoje</h2>
            <Link href="/admin/sessoes" className="text-xs text-primary hover:text-primary-light font-medium">
              Gerenciar →
            </Link>
          </div>
          {todaySessions.length === 0 ? (
            <p className="text-sm text-gray">Nenhuma sessão agendada para hoje.</p>
          ) : (
            <div className="relative">
              <div className="space-y-2">
                {todaySessions.slice(0, 4).map((s, idx) => (
                  <div key={s.id} className={`flex items-center gap-3 p-3 rounded-xl bg-dark/50 border border-dark-lighter/50 ${idx === 3 ? 'opacity-40' : ''}`}>
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-accent/30 to-primary/30 flex items-center justify-center">
                      <Calendar size={16} className="text-accent" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-lighter truncate">{s.trainer_name} → {s.student_name}</p>
                      <p className="text-xs text-gray">{s.time} • {s.type}</p>
                    </div>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${
                      s.status === 'completed' ? 'bg-secondary/20 text-secondary' : s.status === 'cancelled' ? 'bg-danger/20 text-danger' : 'bg-primary/20 text-primary'
                    }`}>
                      {s.status === 'completed' ? 'Concluída' : s.status === 'cancelled' ? 'Cancelada' : 'Agendada'}
                    </span>
                  </div>
                ))}
              </div>
              {todaySessions.length > 3 && (
                <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-dark-light to-transparent pointer-events-none rounded-b-2xl" />
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
