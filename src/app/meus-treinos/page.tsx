'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAppStore } from '@/store/useAppStore';
import PageHeader from '@/components/ui/PageHeader';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import { apiSendWorkoutFeedback } from '@/lib/api';
import {
  Dumbbell,
  ChevronDown,
  ChevronUp,
  Clock,
  Target,
  CheckCircle2,
  Circle,
  Play,
  Square,
  Timer,
  Trophy,
  Star,
  MessageSquare,
  Zap,
  Loader2,
} from 'lucide-react';

export default function MeusTreinosPage() {
  const { currentUser, workoutPlans, fetchWorkouts } = useAppStore();
  const router = useRouter();
  const [expandedPlan, setExpandedPlan] = useState<string | null>(null);
  const [activeWorkout, setActiveWorkout] = useState<string | null>(null);
  const [completedExercises, setCompletedExercises] = useState<Record<string, boolean>>({});
  const [workoutStartTime, setWorkoutStartTime] = useState<number | null>(null);
  const [elapsed, setElapsed] = useState(0);
  const [restTimer, setRestTimer] = useState(0);
  const [restActive, setRestActive] = useState(false);
  const [showFinishMsg, setShowFinishMsg] = useState(false);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [feedbackRating, setFeedbackRating] = useState(0);
  const [feedbackIntensity, setFeedbackIntensity] = useState('');
  const [feedbackObs, setFeedbackObs] = useState('');
  const [sendingFeedback, setSendingFeedback] = useState(false);
  const [feedbackSent, setFeedbackSent] = useState(false);
  const [finalElapsed, setFinalElapsed] = useState(0);

  useEffect(() => {
    if (!currentUser || currentUser.role !== 'student') {
      router.push('/');
      return;
    }
    fetchWorkouts();
  }, [currentUser, router, fetchWorkouts]);

  // Workout elapsed time
  useEffect(() => {
    if (!workoutStartTime) return;
    const interval = setInterval(() => {
      setElapsed(Math.floor((Date.now() - workoutStartTime) / 1000));
    }, 1000);
    return () => clearInterval(interval);
  }, [workoutStartTime]);

  // Rest timer countdown
  useEffect(() => {
    if (!restActive || restTimer <= 0) {
      if (restActive && restTimer <= 0) setRestActive(false);
      return;
    }
    const interval = setInterval(() => {
      setRestTimer((prev) => {
        if (prev <= 1) {
          setRestActive(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [restActive, restTimer]);

  const formatTime = useCallback((seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  }, []);

  if (!currentUser) return null;

  const myPlans = workoutPlans.filter(
    (p) => p.student_id === currentUser.id && p.is_active
  );

  const parseDays = (dayOfWeek: string): string[] => {
    try { return JSON.parse(dayOfWeek); } catch { return []; }
  };

  const startWorkout = (planId: string) => {
    setActiveWorkout(planId);
    setExpandedPlan(planId);
    setWorkoutStartTime(Date.now());
    setCompletedExercises({});
    setElapsed(0);
    setShowFinishMsg(false);
  };

  const finishWorkout = () => {
    // Freeze the timer immediately
    const frozenTime = workoutStartTime ? Math.floor((Date.now() - workoutStartTime) / 1000) : elapsed;
    setFinalElapsed(frozenTime);
    setWorkoutStartTime(null);
    setRestActive(false);
    setRestTimer(0);
    setFeedbackRating(0);
    setFeedbackIntensity('');
    setFeedbackObs('');
    setFeedbackSent(false);
    setShowFeedbackModal(true);
  };

  const submitFeedback = async () => {
    if (!activeWorkout) return;
    setSendingFeedback(true);
    try {
      await apiSendWorkoutFeedback({
        workoutPlanId: activeWorkout,
        duration: formatTime(finalElapsed),
        rating: feedbackRating,
        intensity: feedbackIntensity,
        observations: feedbackObs,
      });
      setFeedbackSent(true);
      setTimeout(() => {
        setShowFeedbackModal(false);
        setActiveWorkout(null);
        setWorkoutStartTime(null);
        setCompletedExercises({});
        setElapsed(0);
        setFinalElapsed(0);
        setShowFinishMsg(false);
      }, 1500);
    } catch {
      // still close
      setShowFeedbackModal(false);
      setActiveWorkout(null);
      setWorkoutStartTime(null);
      setCompletedExercises({});
      setElapsed(0);
      setFinalElapsed(0);
    } finally {
      setSendingFeedback(false);
    }
  };

  const skipFeedback = () => {
    setShowFeedbackModal(false);
    setShowFinishMsg(true);
    setTimeout(() => {
      setActiveWorkout(null);
      setWorkoutStartTime(null);
      setCompletedExercises({});
      setElapsed(0);
      setFinalElapsed(0);
      setShowFinishMsg(false);
    }, 2000);
  };

  const toggleExercise = (planId: string, exerciseIdx: number, restSeconds: number) => {
    if (activeWorkout !== planId) return;
    const key = `${planId}-${exerciseIdx}`;
    const isNowCompleted = !completedExercises[key];
    setCompletedExercises((prev) => ({ ...prev, [key]: isNowCompleted }));

    // Start rest timer when completing an exercise
    if (isNowCompleted && restSeconds > 0) {
      setRestTimer(restSeconds);
      setRestActive(true);
    }
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

      {/* Active workout timer bar */}
      {activeWorkout && !showFinishMsg && (
        <div className="mb-6 p-4 rounded-2xl bg-gradient-to-r from-primary/10 to-secondary/10 border border-primary/20 animate-fade-in">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center shrink-0">
                <Timer size={20} className="text-primary" />
              </div>
              <div>
                <p className="text-xs text-gray font-medium">Treino em andamento</p>
                <p className="text-2xl font-bold text-gray-lighter font-mono">{formatTime(elapsed)}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {restActive && (
                <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-accent/10 border border-accent/20 animate-fade-in min-w-0 h-[42px]">
                  <Clock size={16} className="text-accent shrink-0" />
                  <div className="min-w-0">
                    <p className="text-[10px] text-accent font-medium leading-none">Descanso</p>
                    <p className="text-sm font-bold text-accent font-mono leading-tight">{formatTime(restTimer)}</p>
                  </div>
                </div>
              )}
              <button
                onClick={finishWorkout}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-danger/10 text-danger text-sm font-semibold hover:bg-danger/20 transition-colors shrink-0 h-[42px]"
              >
                <Square size={16} /> Finalizar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Finish message */}
      {showFinishMsg && (
        <div className="mb-6 p-6 rounded-2xl bg-gradient-to-r from-secondary/10 to-accent/10 border border-secondary/20 text-center animate-fade-in">
          <Trophy size={40} className="text-accent mx-auto mb-3" />
          <h3 className="text-lg font-bold text-gray-lighter mb-1">Treino Finalizado!</h3>
          <p className="text-sm text-gray">Tempo total: {formatTime(finalElapsed)}</p>
        </div>
      )}

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
            const isActive = activeWorkout === plan.id;
            const completedCount = getCompletedCount(plan.id, plan.exercises.length);
            const progressPercent = plan.exercises.length > 0
              ? Math.round((completedCount / plan.exercises.length) * 100)
              : 0;
            const planDays = parseDays(plan.day_of_week);
            const allDone = completedCount === plan.exercises.length && plan.exercises.length > 0;

            return (
              <div
                key={plan.id}
                className={`rounded-2xl bg-dark-light border overflow-hidden card-hover animate-fade-in ${
                  isActive ? 'border-primary/40 shadow-lg shadow-primary/5' : 'border-dark-lighter'
                }`}
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <button
                  onClick={() => setExpandedPlan(isExpanded ? null : plan.id)}
                  className="w-full flex items-center justify-between p-5 text-left"
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-14 h-14 rounded-xl flex items-center justify-center relative ${
                      isActive
                        ? 'bg-gradient-to-br from-primary/30 to-secondary/30'
                        : 'bg-gradient-to-br from-primary/20 to-secondary/20'
                    }`}>
                      <Dumbbell size={24} className="text-primary" />
                      {allDone && isActive && (
                        <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-secondary flex items-center justify-center">
                          <CheckCircle2 size={12} className="text-white" />
                        </div>
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-gray-lighter">{plan.name}</h3>
                        {isActive && (
                          <span className="px-2 py-0.5 rounded-md bg-primary/10 text-primary text-[10px] font-bold uppercase">Em andamento</span>
                        )}
                      </div>
                      <p className="text-xs text-gray mt-0.5">
                        {planDays.join(', ')} · {plan.exercises.length} exercícios
                      </p>
                      {isActive && (
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
                      )}
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

                    {/* Start workout button */}
                    {!isActive && !activeWorkout && (
                      <button
                        onClick={() => startWorkout(plan.id)}
                        className="w-full flex items-center justify-center gap-2 mb-4 py-3 rounded-xl bg-gradient-to-r from-primary to-secondary text-white font-semibold text-sm hover:shadow-lg hover:shadow-primary/25 transition-all"
                      >
                        <Play size={18} /> Iniciar Treino
                      </button>
                    )}

                    {!isActive && activeWorkout && (
                      <div className="mb-4 p-3 rounded-xl bg-dark/50 border border-dark-lighter text-center">
                        <p className="text-xs text-gray">Finalize o treino em andamento antes de iniciar outro</p>
                      </div>
                    )}

                    <div className="space-y-2">
                      {plan.exercises.map((ex, idx) => {
                        const isCompleted = completedExercises[`${plan.id}-${idx}`];
                        const canInteract = isActive;
                        return (
                          <button
                            key={idx}
                            onClick={() => canInteract && toggleExercise(plan.id, idx, ex.rest_seconds)}
                            disabled={!canInteract}
                            className={`w-full flex items-center gap-3 p-3 rounded-xl border transition-all text-left ${
                              isCompleted
                                ? 'bg-secondary/5 border-secondary/20'
                                : canInteract
                                  ? 'bg-dark/50 border-dark-lighter/50 hover:border-primary/20 cursor-pointer'
                                  : 'bg-dark/30 border-dark-lighter/30 opacity-60 cursor-not-allowed'
                            }`}
                          >
                            {isCompleted ? (
                              <CheckCircle2 size={22} className="text-secondary flex-shrink-0" />
                            ) : canInteract ? (
                              <Circle size={22} className="text-gray flex-shrink-0" />
                            ) : (
                              <Circle size={22} className="text-gray/40 flex-shrink-0" />
                            )}
                            <div className="flex-1 min-w-0">
                              <p
                                className={`text-sm font-semibold ${
                                  isCompleted ? 'text-secondary line-through' : canInteract ? 'text-gray-lighter' : 'text-gray'
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
                                  <Clock size={12} /> {ex.rest_seconds}s descanso
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

                    {/* Auto-finish when all done */}
                    {isActive && allDone && (
                      <div className="mt-4 text-center animate-fade-in">
                        <button
                          onClick={finishWorkout}
                          className="flex items-center justify-center gap-2 mx-auto px-6 py-3 rounded-xl bg-gradient-to-r from-secondary to-accent text-white font-semibold text-sm hover:shadow-lg hover:shadow-secondary/25 transition-all"
                        >
                          <Trophy size={18} /> Concluir Treino
                        </button>

                    {/* Feedback Modal */}
                    <Modal isOpen={showFeedbackModal} onClose={skipFeedback} title="Treino Finalizado!" size="md">
                      {feedbackSent ? (
                        <div className="text-center py-6 animate-fade-in">
                          <Trophy size={48} className="text-accent mx-auto mb-3" />
                          <h3 className="text-lg font-bold text-gray-lighter mb-1">Feedback enviado!</h3>
                          <p className="text-sm text-gray">Seu personal foi notificado.</p>
                        </div>
                      ) : (
                        <div className="space-y-5">
                          {/* Duration */}
                          <div className="flex items-center gap-3 p-4 rounded-xl bg-dark border border-dark-lighter">
                            <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center shrink-0">
                              <Timer size={20} className="text-primary" />
                            </div>
                            <div>
                              <p className="text-xs text-gray font-medium">Tempo de treino</p>
                              <p className="text-2xl font-bold text-gray-lighter font-mono">{formatTime(finalElapsed)}</p>
                            </div>
                          </div>

                          {/* Rating */}
                          <div>
                            <label className="block text-xs font-medium text-gray mb-2 flex items-center gap-1.5">
                              <Star size={14} className="text-accent" /> Nota do treino
                            </label>
                            <div className="flex gap-2">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <button
                                  key={star}
                                  type="button"
                                  onClick={() => setFeedbackRating(star)}
                                  className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
                                    feedbackRating >= star
                                      ? 'bg-accent/20 text-accent border border-accent/30 scale-110'
                                      : 'bg-dark border border-dark-lighter text-gray hover:border-accent/20 hover:text-accent/60'
                                  }`}
                                >
                                  <Star size={20} fill={feedbackRating >= star ? 'currentColor' : 'none'} />
                                </button>
                              ))}
                            </div>
                          </div>

                          {/* Intensity */}
                          <div>
                            <label className="block text-xs font-medium text-gray mb-2 flex items-center gap-1.5">
                              <Zap size={14} className="text-secondary" /> Intensidade
                            </label>
                            <div className="grid grid-cols-2 gap-2">
                              {[
                                { value: 'light', label: 'Leve', emoji: '🟢' },
                                { value: 'moderate', label: 'Moderada', emoji: '🟡' },
                                { value: 'intense', label: 'Intensa', emoji: '🔴' },
                                { value: 'extreme', label: 'Extrema', emoji: '💀' },
                              ].map((opt) => (
                                <button
                                  key={opt.value}
                                  type="button"
                                  onClick={() => setFeedbackIntensity(opt.value)}
                                  className={`flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                                    feedbackIntensity === opt.value
                                      ? 'bg-secondary/15 text-secondary border border-secondary/30'
                                      : 'bg-dark border border-dark-lighter text-gray hover:border-secondary/20'
                                  }`}
                                >
                                  <span>{opt.emoji}</span> {opt.label}
                                </button>
                              ))}
                            </div>
                          </div>

                          {/* Observations */}
                          <div>
                            <label className="block text-xs font-medium text-gray mb-1.5 flex items-center gap-1.5">
                              <MessageSquare size={14} className="text-primary" /> Observações
                            </label>
                            <textarea
                              value={feedbackObs}
                              onChange={(e) => setFeedbackObs(e.target.value)}
                              placeholder="Como foi o treino? Alguma dificuldade?"
                              rows={3}
                              className="w-full bg-dark border border-dark-lighter rounded-xl px-3 py-2.5 text-sm text-gray-lighter placeholder:text-gray focus:outline-none focus:border-primary resize-none"
                            />
                          </div>

                          {/* Actions */}
                          <div className="flex justify-end gap-2 pt-2">
                            <Button variant="outline" onClick={skipFeedback}>
                              Pular
                            </Button>
                            <Button
                              onClick={submitFeedback}
                              disabled={sendingFeedback}
                              icon={sendingFeedback ? <Loader2 size={16} className="animate-spin" /> : <Trophy size={16} />}
                            >
                              Enviar Feedback
                            </Button>
                          </div>
                        </div>
                      )}
                    </Modal>
                      </div>
                    )}
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
