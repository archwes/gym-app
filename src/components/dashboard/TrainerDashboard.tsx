'use client';

import { useEffect } from 'react';
import { useAppStore } from '@/store/useAppStore';
import PageHeader from '@/components/ui/PageHeader';
import StatCard from '@/components/ui/StatCard';
import { LayoutDashboard, Users, Dumbbell, Calendar, TrendingUp, Clock, BookOpen } from 'lucide-react';
import Link from 'next/link';

export default function TrainerDashboard() {
  const { currentUser, users, workoutPlans, sessions, progress, fetchUsers, fetchWorkouts, fetchSessions, fetchProgress } = useAppStore();

  useEffect(() => {
    fetchUsers();
    fetchWorkouts();
    fetchSessions();
    fetchProgress();
  }, [fetchUsers, fetchWorkouts, fetchSessions, fetchProgress]);

  if (!currentUser) return null;

  const students = users.filter((u) => u.role === 'student');
  const activePlans = workoutPlans.filter((p) => p.is_active);
  const today = new Date().toISOString().split('T')[0];
  const todaySessions = sessions.filter(
    (s) => s.date === today && s.status === 'scheduled'
  );
  const completedSessions = sessions.filter((s) => s.status === 'completed');

  return (
    <div>
      <PageHeader
        title={`Olá, ${currentUser.name.split(' ')[0]}! 👋`}
        subtitle="Aqui está o resumo do seu dia"
        icon={<LayoutDashboard size={24} />}
      />

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">
        <StatCard
          title="Alunos Ativos"
          value={students.length}
          icon={<Users size={24} />}
          trend="+2 este mês"
          trendUp={true}
          color="primary"
          href="/alunos"
        />
        <StatCard
          title="Treinos Ativos"
          value={activePlans.length}
          icon={<Dumbbell size={24} />}
          color="secondary"
          href="/treinos"
        />
        <StatCard
          title="Sessões Hoje"
          value={todaySessions.length}
          icon={<Calendar size={24} />}
          color="accent"
          href="/agenda"
        />
        <StatCard
          title="Sessões Concluídas"
          value={completedSessions.length}
          icon={<TrendingUp size={24} />}
          trend="Esta semana"
          trendUp={true}
          color="primary"
          href="/agenda"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
        {/* Today's Schedule */}
        <div className="rounded-2xl bg-dark-light border border-dark-lighter p-3 sm:p-5 animate-fade-in">
          <div className="flex items-center justify-between mb-3 sm:mb-4">
            <h2 className="text-base sm:text-lg font-bold text-gray-lighter">Agenda de Hoje</h2>
            <Link href="/agenda" className="text-xs text-primary hover:text-primary-light font-medium">
              Ver tudo →
            </Link>
          </div>
          {todaySessions.length === 0 ? (
            <p className="text-sm text-gray py-8 text-center">Nenhuma sessão agendada para hoje</p>
          ) : (
            <div className="relative">
              <div className="space-y-3">
                {todaySessions.slice(0, 4).map((session, idx) => (
                  <Link
                    href={`/agenda/${session.id}`}
                    key={session.id}
                    className={`flex items-center gap-4 p-3 rounded-xl bg-dark/50 border border-dark-lighter/50 hover:border-primary/20 transition-colors ${idx === 3 ? 'opacity-40' : ''}`}
                  >
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                    <Clock size={20} className="text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-lighter truncate">
                      {session.student_name}
                    </p>
                    <p className="text-xs text-gray">
                      {session.time} · {session.duration}min · {session.type}
                    </p>
                  </div>
                  <span
                    className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider ${
                      session.type === 'Treino'
                        ? 'bg-primary/10 text-primary'
                        : session.type === 'Avaliação'
                        ? 'bg-accent/10 text-accent'
                        : 'bg-secondary/10 text-secondary'
                    }`}
                  >
                    {session.type}
                  </span>
                </Link>
              ))}
              </div>
              {todaySessions.length > 3 && (
                <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-dark-light to-transparent pointer-events-none rounded-b-2xl" />
              )}
            </div>
          )}
        </div>

        {/* Recent Students */}
        <div className="rounded-2xl bg-dark-light border border-dark-lighter p-3 sm:p-5 animate-fade-in">
          <div className="flex items-center justify-between mb-3 sm:mb-4">
            <h2 className="text-base sm:text-lg font-bold text-gray-lighter">Alunos Recentes</h2>
            <Link href="/alunos" className="text-xs text-primary hover:text-primary-light font-medium">
              Ver todos →
            </Link>
          </div>
          <div className="relative">
            <div className="space-y-3">
              {students.slice(0, 4).map((student, idx) => {
              const studentPlans = workoutPlans.filter(
                (p) => p.student_id === student.id && p.is_active
              );
              const studentProgress = progress.filter(
                (p) => p.student_id === student.id
              );
              const latestProgress = studentProgress[studentProgress.length - 1];

              return (
                <div
                  key={student.id}
                  className={`flex items-center gap-4 p-3 rounded-xl bg-dark/50 border border-dark-lighter/50 hover:border-primary/20 transition-colors ${idx === 3 ? 'opacity-40' : ''}`}
                >
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/30 to-secondary/30 flex items-center justify-center text-lg">
                    {student.avatar}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-lighter truncate">
                      {student.name}
                    </p>
                    <p className="text-xs text-gray">
                      {studentPlans.length} treino{studentPlans.length !== 1 ? 's' : ''} ativo{studentPlans.length !== 1 ? 's' : ''}
                      {latestProgress && ` · ${latestProgress.weight}kg`}
                    </p>
                  </div>
                  <Link
                    href={`/alunos/${student.id}`}
                    className="text-xs text-primary hover:text-primary-light"
                  >
                    Ver →
                  </Link>
                </div>
              );
            })}
            </div>
            {students.length > 3 && (
              <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-dark-light to-transparent pointer-events-none rounded-b-2xl" />
            )}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mt-4 sm:mt-6 grid grid-cols-2 sm:grid-cols-4 gap-3 animate-fade-in">
        {[
          { href: '/treinos', label: 'Novo Treino', icon: <Dumbbell size={20} />, color: 'bg-primary/10 text-primary' },
          { href: '/alunos', label: 'Ver Alunos', icon: <Users size={20} />, color: 'bg-secondary/10 text-secondary' },
          { href: '/agenda', label: 'Agendar', icon: <Calendar size={20} />, color: 'bg-accent/10 text-accent' },
          { href: '/exercicios', label: 'Exercícios', icon: <BookOpen size={20} />, color: 'bg-primary-light/10 text-primary-light' },
        ].map((action) => (
          <Link
            key={action.label}
            href={action.href}
            className="flex flex-col items-center gap-2 p-4 rounded-xl bg-dark-light border border-dark-lighter hover:border-primary/20 transition-all card-hover"
          >
            <div className={`w-10 h-10 rounded-xl ${action.color} flex items-center justify-center`}>
              {action.icon}
            </div>
            <span className="text-xs font-medium text-gray-light">{action.label}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
