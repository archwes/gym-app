'use client';

import { useEffect } from 'react';
import { useAppStore } from '@/store/useAppStore';
import PageHeader from '@/components/ui/PageHeader';
import StatCard from '@/components/ui/StatCard';
import ProgressBar from '@/components/ui/ProgressBar';
import { LayoutDashboard, Dumbbell, Calendar, TrendingUp, Target, Flame, Clock } from 'lucide-react';
import Link from 'next/link';
import { formatDateBR } from '@/lib/format';

export default function StudentDashboard() {
  const { currentUser, workoutPlans, sessions, progress, fetchWorkouts, fetchSessions, fetchProgress } = useAppStore();

  useEffect(() => {
    fetchWorkouts();
    fetchSessions();
    if (currentUser) fetchProgress(currentUser.id);
  }, [fetchWorkouts, fetchSessions, fetchProgress, currentUser]);

  if (!currentUser) return null;

  const myPlans = workoutPlans.filter(
    (p) => p.student_id === currentUser.id && p.is_active
  );
  const myProgress = progress.filter((p) => p.student_id === currentUser.id);
  const latestProgress = myProgress[myProgress.length - 1];
  const previousProgress = myProgress[myProgress.length - 2];
  const mySessions = sessions.filter(
    (s) => s.student_id === currentUser.id && s.status === 'scheduled'
  );
  const completedThisWeek = sessions.filter(
    (s) => s.student_id === currentUser.id && s.status === 'completed'
  ).length;

  const weightChange = latestProgress && previousProgress
    ? (latestProgress.weight - previousProgress.weight).toFixed(1)
    : null;

  const daysOfWeek = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
  const today = daysOfWeek[new Date().getDay()];
  const todayPlan = myPlans.find((p) => {
    try {
      const days: string[] = JSON.parse(p.day_of_week);
      return days.includes(today);
    } catch { return false; }
  });

  return (
    <div>
      <PageHeader
        title={`Olá, ${currentUser.name.split(' ')[0]}! 💪`}
        subtitle="Vamos treinar hoje?"
        icon={<LayoutDashboard size={24} />}
      />

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">
        <StatCard
          title="Treinos Ativos"
          value={myPlans.length}
          icon={<Dumbbell size={24} />}
          color="primary"
          href="/meus-treinos"
        />
        <StatCard
          title="Peso Atual"
          value={latestProgress ? `${latestProgress.weight}kg` : '--'}
          icon={<Target size={24} />}
          trend={weightChange ? `${Number(weightChange) > 0 ? '+' : ''}${weightChange}kg` : undefined}
          trendUp={weightChange ? Number(weightChange) < 0 : undefined}
          color="secondary"
          href="/progresso"
        />
        <StatCard
          title="Treinos na Semana"
          value={completedThisWeek}
          icon={<Flame size={24} />}
          color="accent"
          href="/meus-treinos"
        />
        <StatCard
          title="Próximas Sessões"
          value={mySessions.length}
          icon={<Calendar size={24} />}
          color="primary"
          href="/agenda"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
        {/* Today's Workout */}
        <div className="rounded-2xl bg-dark-light border border-dark-lighter p-3 sm:p-5 animate-fade-in">
          <div className="flex items-center justify-between mb-3 sm:mb-4">
            <h2 className="text-base sm:text-lg font-bold text-gray-lighter">
              Treino de Hoje - {today}
            </h2>
            <Link href="/meus-treinos" className="text-xs text-primary hover:text-primary-light font-medium">
              Ver todos →
            </Link>
          </div>
          {todayPlan ? (
            <div>
              <div className="flex items-center gap-3 mb-4 p-3 rounded-xl bg-primary/5 border border-primary/10">
                <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
                  <Dumbbell size={20} className="text-primary" />
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-lighter">{todayPlan.name}</p>
                  <p className="text-xs text-gray">{todayPlan.exercises.length} exercícios</p>
                </div>
              </div>
              <div className="relative">
                <div className="space-y-2">
                  {todayPlan.exercises.slice(0, 4).map((ex, idx) => (
                    <div key={idx} className={`flex items-center gap-3 p-2.5 rounded-lg bg-dark/50 ${idx === 3 ? 'opacity-40' : ''}`}>
                      <span className="w-6 h-6 rounded-md bg-dark-lighter text-[10px] font-bold flex items-center justify-center text-gray">
                        {idx + 1}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-gray-lighter truncate">{ex.exercise_name}</p>
                        <p className="text-xs text-gray">
                          {ex.sets}x{ex.reps} {ex.weight && `· ${ex.weight}`} · {ex.rest_seconds}s descanso
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
                {todayPlan.exercises.length > 3 && (
                  <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-dark-light to-transparent pointer-events-none rounded-b-2xl" />
                )}
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-sm text-gray">Hoje é dia de descanso! 🧘</p>
              <p className="text-xs text-gray mt-1">Aproveite para se recuperar</p>
            </div>
          )}
        </div>

        {/* Progress Overview */}
        <div className="rounded-2xl bg-dark-light border border-dark-lighter p-3 sm:p-5 animate-fade-in">
          <div className="flex items-center justify-between mb-3 sm:mb-4">
            <h2 className="text-base sm:text-lg font-bold text-gray-lighter">Progresso</h2>
            <Link href="/progresso" className="text-xs text-primary hover:text-primary-light font-medium">
              Ver detalhes →
            </Link>
          </div>
          {latestProgress ? (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-xl bg-dark/50 border border-dark-lighter/50">
                  <p className="text-xs text-gray mb-1">Peso</p>
                  <p className="text-xl font-bold text-gray-lighter">{latestProgress.weight}kg</p>
                </div>
                <div className="p-3 rounded-xl bg-dark/50 border border-dark-lighter/50">
                  <p className="text-xs text-gray mb-1">% Gordura</p>
                  <p className="text-xl font-bold text-gray-lighter">{latestProgress.body_fat ?? '--'}%</p>
                </div>
              </div>

              <div className="space-y-3">
                <p className="text-xs text-gray font-medium uppercase tracking-wider">Medidas (cm)</p>
                <ProgressBar value={latestProgress.chest || 0} max={120} label="Peito" color="primary" />
                <ProgressBar value={latestProgress.waist || 0} max={100} label="Cintura" color="secondary" />
                <ProgressBar value={latestProgress.arms || 0} max={50} label="Braços" color="accent" />
                <ProgressBar value={latestProgress.thighs || 0} max={80} label="Coxas" color="primary" />
              </div>

              {/* Weight History Mini Chart */}
              <div className="mt-4">
                <p className="text-xs text-gray font-medium uppercase tracking-wider mb-3">Evolução do Peso</p>
                <div className="flex items-end gap-1 h-20">
                  {myProgress.map((p, idx) => {
                    const max = Math.max(...myProgress.map(pr => pr.weight));
                    const min = Math.min(...myProgress.map(pr => pr.weight));
                    const range = max - min || 1;
                    const height = ((p.weight - min) / range) * 100;
                    return (
                      <div
                        key={idx}
                        className="flex-1 bg-gradient-to-t from-primary to-primary-light rounded-t-sm transition-all hover:opacity-80 relative group"
                        style={{ height: `${Math.max(height, 10)}%` }}
                      >
                        <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-[9px] text-gray opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                          {p.weight}kg
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          ) : (
            <p className="text-sm text-gray text-center py-8">Nenhum registro de progresso ainda</p>
          )}
        </div>
      </div>

      {/* Upcoming Sessions */}
      {mySessions.length > 0 && (
        <div className="mt-4 sm:mt-6 rounded-2xl bg-dark-light border border-dark-lighter p-3 sm:p-5 animate-fade-in">
          <h2 className="text-base sm:text-lg font-bold text-gray-lighter mb-3 sm:mb-4">Próximas Sessões</h2>
          <div className="relative">
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {mySessions.slice(0, 4).map((session, idx) => (
                <div
                  key={session.id}
                  className={`flex items-center gap-3 p-3 rounded-xl bg-dark/50 border border-dark-lighter/50 ${idx === 3 ? 'opacity-40' : ''}`}
                >
                  <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center">
                    <Clock size={18} className="text-accent" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-lighter">{formatDateBR(session.date)}</p>
                    <p className="text-xs text-gray">{session.time} · {session.type}</p>
                  </div>
                </div>
              ))}
            </div>
            {mySessions.length > 3 && (
              <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-dark-light to-transparent pointer-events-none rounded-b-2xl" />
            )}
          </div>
        </div>
      )}
    </div>
  );
}
