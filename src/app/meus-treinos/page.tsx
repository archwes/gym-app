'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAppStore } from '@/store/useAppStore';
import PageHeader from '@/components/ui/PageHeader';
import {
  Dumbbell,
  ChevronDown,
  ChevronUp,
  Clock,
  Target,
  CheckCircle2,
  Circle,
} from 'lucide-react';

export default function MeusTreinosPage() {
  const { currentUser, workoutPlans, fetchWorkouts } = useAppStore();
  const router = useRouter();
  const [expandedPlan, setExpandedPlan] = useState<string | null>(null);
  const [completedExercises, setCompletedExercises] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (!currentUser || currentUser.role !== 'student') {
      router.push('/');
      return;
    }
    fetchWorkouts();
  }, [currentUser, router, fetchWorkouts]);

  if (!currentUser) return null;

  const myPlans = workoutPlans.filter(
    (p) => p.student_id === currentUser.id && p.is_active
  );

  const parseDays = (dayOfWeek: string): string[] => {
    try { return JSON.parse(dayOfWeek); } catch { return []; }
  };

  const toggleExercise = (planId: string, exerciseIdx: number) => {
    const key = `${planId}-${exerciseIdx}`;
    setCompletedExercises((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const getCompletedCount = (planId: string, total: number) => {
    let count = 0;
    for (let i = 0; i < total; i++) {
      if (completedExercises[`${planId}-${i}`]) count++;
    }
    return count;
  };

  return (
    <div>
      <PageHeader
        title="Meus Treinos"
        subtitle="Seus planos de treino ativos"
        icon={<Dumbbell size={24} />}
      />

      <div className="space-y-4">
        {myPlans.length === 0 ? (
          <div className="text-center py-16 animate-fade-in">
            <div className="w-20 h-20 rounded-2xl bg-dark-lighter flex items-center justify-center text-gray mx-auto mb-4">
              <Dumbbell size={36} />
            </div>
            <h3 className="text-lg font-semibold text-gray-lighter mb-2">Nenhum treino ativo</h3>
            <p className="text-sm text-gray">Seu personal irá criar um plano de treino para você.</p>
          </div>
        ) : (
          myPlans.map((plan, index) => {
            const isExpanded = expandedPlan === plan.id;
            const completedCount = getCompletedCount(plan.id, plan.exercises.length);
            const progressPercent = plan.exercises.length > 0
              ? Math.round((completedCount / plan.exercises.length) * 100)
              : 0;
            const planDays = parseDays(plan.day_of_week);

            return (
              <div
                key={plan.id}
                className="rounded-2xl bg-dark-light border border-dark-lighter overflow-hidden card-hover animate-fade-in"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <button
                  onClick={() => setExpandedPlan(isExpanded ? null : plan.id)}
                  className="w-full flex items-center justify-between p-5 text-left"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center relative">
                      <Dumbbell size={24} className="text-primary" />
                      {completedCount === plan.exercises.length && completedCount > 0 && (
                        <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-secondary flex items-center justify-center">
                          <CheckCircle2 size={12} className="text-white" />
                        </div>
                      )}
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-lighter">{plan.name}</h3>
                      <p className="text-xs text-gray mt-0.5">
                        {planDays.join(', ')} · {plan.exercises.length} exercícios
                      </p>
                      {/* Mini progress bar */}
                      <div className="flex items-center gap-2 mt-1.5">
                        <div className="w-24 h-1.5 bg-dark-lighter rounded-full overflow-hidden">
                          <div
                            className="h-full bg-secondary rounded-full progress-bar"
                            style={{ width: `${progressPercent}%` }}
                          />
                        </div>
                        <span className="text-[10px] text-gray font-medium">
                          {completedCount}/{plan.exercises.length}
                        </span>
                      </div>
                    </div>
                  </div>
                  {isExpanded ? (
                    <ChevronUp size={20} className="text-gray" />
                  ) : (
                    <ChevronDown size={20} className="text-gray" />
                  )}
                </button>

                {isExpanded && (
                  <div className="px-5 pb-5 border-t border-dark-lighter pt-4 animate-fade-in">
                    {plan.description && (
                      <p className="text-sm text-gray mb-4">{plan.description}</p>
                    )}
                    <div className="space-y-2">
                      {plan.exercises.map((ex, idx) => {
                        const isCompleted = completedExercises[`${plan.id}-${idx}`];
                        return (
                          <button
                            key={idx}
                            onClick={() => toggleExercise(plan.id, idx)}
                            className={`w-full flex items-center gap-3 p-3 rounded-xl border transition-all text-left ${
                              isCompleted
                                ? 'bg-secondary/5 border-secondary/20'
                                : 'bg-dark/50 border-dark-lighter/50 hover:border-primary/20'
                            }`}
                          >
                            {isCompleted ? (
                              <CheckCircle2 size={22} className="text-secondary flex-shrink-0" />
                            ) : (
                              <Circle size={22} className="text-gray flex-shrink-0" />
                            )}
                            <div className="flex-1 min-w-0">
                              <p
                                className={`text-sm font-semibold ${
                                  isCompleted ? 'text-secondary line-through' : 'text-gray-lighter'
                                }`}
                              >
                                {ex.exercise_name}
                              </p>
                              <div className="flex items-center gap-3 text-xs text-gray mt-0.5">
                                <span className="flex items-center gap-1">
                                  <Target size={12} /> {ex.sets}x{ex.reps}
                                </span>
                                {ex.weight && <span>💪 {ex.weight}</span>}
                                <span className="flex items-center gap-1">
                                  <Clock size={12} /> {ex.rest_seconds}s
                                </span>
                              </div>
                            </div>
                            <span className="px-2 py-0.5 rounded-md bg-dark-lighter text-[10px] text-gray font-medium hidden sm:block">
                              {ex.muscle_group}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
