'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAppStore } from '@/store/useAppStore';
import { apiGetStudentProfile, apiCreateProgress, apiDeleteProgress } from '@/lib/api';
import { formatDateBR } from '@/lib/format';
import { formatPhone } from '@/lib/format';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import type { WorkoutPlan, ScheduleSession, StudentProgress, Notification } from '@/types';
import {
  ArrowLeft, Mail, Phone, Calendar, Dumbbell, Clock,
  TrendingUp, MessageSquare, Plus, Trash2, ChevronDown,
  ChevronUp, User as UserIcon, Weight, Ruler, Activity,
  Loader2, Star, Zap, Target,
} from 'lucide-react';

interface StudentInfo {
  id: string;
  name: string;
  email: string;
  avatar: string;
  phone?: string;
  created_at: string;
}

type TabKey = 'treinos' | 'sessoes' | 'feedbacks' | 'progresso';

export default function StudentProfilePage() {
  const { currentUser } = useAppStore();
  const router = useRouter();
  const params = useParams();
  const studentId = params.id as string;

  const [loading, setLoading] = useState(true);
  const [student, setStudent] = useState<StudentInfo | null>(null);
  const [workouts, setWorkouts] = useState<WorkoutPlan[]>([]);
  const [sessions, setSessions] = useState<ScheduleSession[]>([]);
  const [progress, setProgress] = useState<StudentProgress[]>([]);
  const [feedbacks, setFeedbacks] = useState<Notification[]>([]);
  const [activeTab, setActiveTab] = useState<TabKey>('treinos');
  const [expandedWorkout, setExpandedWorkout] = useState<string | null>(null);

  // Progress modal
  const [showProgressModal, setShowProgressModal] = useState(false);
  const [progressForm, setProgressForm] = useState({
    date: new Date().toISOString().split('T')[0],
    weight: '',
    body_fat: '',
    chest: '',
    waist: '',
    hips: '',
    arms: '',
    thighs: '',
    notes: '',
  });
  const [submitting, setSubmitting] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const data = await apiGetStudentProfile(studentId);
      setStudent(data.student);
      setWorkouts(data.workouts);
      setSessions(data.sessions);
      setProgress(data.progress);
      setFeedbacks(data.feedbacks);
    } catch {
      router.push('/alunos');
    } finally {
      setLoading(false);
    }
  }, [studentId, router]);

  useEffect(() => {
    if (!currentUser || currentUser.role !== 'trainer') {
      router.push('/');
      return;
    }
    fetchData();
  }, [currentUser, router, fetchData]);

  const handleAddProgress = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await apiCreateProgress({
        student_id: studentId,
        date: progressForm.date,
        weight: progressForm.weight ? Number(progressForm.weight) : undefined,
        body_fat: progressForm.body_fat ? Number(progressForm.body_fat) : undefined,
        chest: progressForm.chest ? Number(progressForm.chest) : undefined,
        waist: progressForm.waist ? Number(progressForm.waist) : undefined,
        hips: progressForm.hips ? Number(progressForm.hips) : undefined,
        arms: progressForm.arms ? Number(progressForm.arms) : undefined,
        thighs: progressForm.thighs ? Number(progressForm.thighs) : undefined,
        notes: progressForm.notes || undefined,
      });
      setShowProgressModal(false);
      setProgressForm({
        date: new Date().toISOString().split('T')[0],
        weight: '', body_fat: '', chest: '', waist: '',
        hips: '', arms: '', thighs: '', notes: '',
      });
      fetchData();
    } catch {
      /* ignore */
    }
    setSubmitting(false);
  };

  const handleDeleteProgress = async (id: string) => {
    if (!confirm('Excluir este registro de progresso?')) return;
    try {
      await apiDeleteProgress(id);
      fetchData();
    } catch {
      /* ignore */
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 size={32} className="animate-spin text-primary" />
      </div>
    );
  }

  if (!student) return null;

  const today = new Date().toISOString().split('T')[0];
  const pastSessions = sessions.filter(s => s.date < today || s.status === 'completed');
  const futureSessions = sessions.filter(s => s.date >= today && s.status !== 'completed' && s.status !== 'cancelled');
  const activePlans = workouts.filter(w => w.is_active);
  const inactivePlans = workouts.filter(w => !w.is_active);
  const latestProgress = progress[0];

  const tabs: { key: TabKey; label: string; icon: React.ReactNode; count: number }[] = [
    { key: 'treinos', label: 'Treinos', icon: <Dumbbell size={16} />, count: workouts.length },
    { key: 'sessoes', label: 'Sessões', icon: <Calendar size={16} />, count: sessions.length },
    { key: 'feedbacks', label: 'Feedbacks', icon: <MessageSquare size={16} />, count: feedbacks.length },
    { key: 'progresso', label: 'Progresso', icon: <TrendingUp size={16} />, count: progress.length },
  ];

  const statusLabels: Record<string, { label: string; color: string }> = {
    scheduled: { label: 'Agendada', color: 'text-accent bg-accent/10' },
    completed: { label: 'Concluída', color: 'text-success bg-success/10' },
    cancelled: { label: 'Cancelada', color: 'text-danger bg-danger/10' },
  };

  const dayNames: Record<string, string> = {
    '0': 'Dom', '1': 'Seg', '2': 'Ter', '3': 'Qua', '4': 'Qui', '5': 'Sex', '6': 'Sáb',
  };

  return (
    <div>
      {/* Back button */}
      <button
        onClick={() => router.push('/alunos')}
        className="flex items-center gap-2 text-gray hover:text-gray-lighter mb-6 transition-colors"
      >
        <ArrowLeft size={18} /> Voltar para Alunos
      </button>

      {/* Student Header Card */}
      <div className="rounded-2xl bg-dark-light border border-dark-lighter p-5 sm:p-6 mb-6 animate-fade-in">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/30 to-secondary/30 flex items-center justify-center text-3xl shrink-0">
            {student.avatar}
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-xl sm:text-2xl font-bold text-gray-lighter">{student.name}</h1>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1.5">
              <span className="flex items-center gap-1.5 text-sm text-gray">
                <Mail size={14} /> {student.email}
              </span>
              {student.phone && (
                <span className="flex items-center gap-1.5 text-sm text-gray">
                  <Phone size={14} /> {formatPhone(student.phone)}
                </span>
              )}
              <span className="flex items-center gap-1.5 text-sm text-gray">
                <UserIcon size={14} /> Desde {formatDateBR(student.created_at.split('T')[0])}
              </span>
            </div>
          </div>

          {/* Quick stats */}
          <div className="grid grid-cols-3 gap-3 sm:gap-4">
            <div className="text-center p-2 sm:p-3 rounded-xl bg-dark/50">
              <p className="text-lg sm:text-xl font-bold text-primary">{activePlans.length}</p>
              <p className="text-[10px] sm:text-xs text-gray">Treinos</p>
            </div>
            <div className="text-center p-2 sm:p-3 rounded-xl bg-dark/50">
              <p className="text-lg sm:text-xl font-bold text-secondary">
                {latestProgress ? latestProgress.weight : '--'}
              </p>
              <p className="text-[10px] sm:text-xs text-gray">Peso (kg)</p>
            </div>
            <div className="text-center p-2 sm:p-3 rounded-xl bg-dark/50">
              <p className="text-lg sm:text-xl font-bold text-accent">
                {latestProgress?.body_fat ? `${latestProgress.body_fat}%` : '--'}
              </p>
              <p className="text-[10px] sm:text-xs text-gray">% Gord.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 rounded-xl bg-dark-light border border-dark-lighter mb-6 overflow-x-auto animate-fade-in">
        {tabs.map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
              activeTab === tab.key
                ? 'bg-primary text-white shadow-lg shadow-primary/20'
                : 'text-gray hover:text-gray-lighter hover:bg-dark-lighter'
            }`}
          >
            {tab.icon}
            <span className="hidden sm:inline">{tab.label}</span>
            <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${
              activeTab === tab.key ? 'bg-white/20' : 'bg-dark-lighter'
            }`}>
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="animate-fade-in">
        {/* ===== TREINOS ===== */}
        {activeTab === 'treinos' && (
          <div className="space-y-4">
            {workouts.length === 0 ? (
              <EmptyState icon={<Dumbbell size={40} />} text="Nenhum treino criado para este aluno" />
            ) : (
              <>
                {activePlans.length > 0 && (
                  <div>
                    <h3 className="text-sm font-semibold text-gray mb-3 flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-success" /> Treinos Ativos ({activePlans.length})
                    </h3>
                    <div className="space-y-3">
                      {activePlans.map(plan => (
                        <WorkoutCard
                          key={plan.id}
                          plan={plan}
                          expanded={expandedWorkout === plan.id}
                          onToggle={() => setExpandedWorkout(expandedWorkout === plan.id ? null : plan.id)}
                          dayNames={dayNames}
                        />
                      ))}
                    </div>
                  </div>
                )}
                {inactivePlans.length > 0 && (
                  <div>
                    <h3 className="text-sm font-semibold text-gray mb-3 flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-gray" /> Treinos Inativos ({inactivePlans.length})
                    </h3>
                    <div className="space-y-3 opacity-60">
                      {inactivePlans.map(plan => (
                        <WorkoutCard
                          key={plan.id}
                          plan={plan}
                          expanded={expandedWorkout === plan.id}
                          onToggle={() => setExpandedWorkout(expandedWorkout === plan.id ? null : plan.id)}
                          dayNames={dayNames}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* ===== SESSÕES ===== */}
        {activeTab === 'sessoes' && (
          <div className="space-y-6">
            {sessions.length === 0 ? (
              <EmptyState icon={<Calendar size={40} />} text="Nenhuma sessão agendada com este aluno" />
            ) : (
              <>
                {futureSessions.length > 0 && (
                  <div>
                    <h3 className="text-sm font-semibold text-gray mb-3 flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-accent" /> Próximas Sessões ({futureSessions.length})
                    </h3>
                    <div className="grid sm:grid-cols-2 gap-3">
                      {futureSessions.map(session => (
                        <SessionCard key={session.id} session={session} statusLabels={statusLabels} />
                      ))}
                    </div>
                  </div>
                )}
                {pastSessions.length > 0 && (
                  <div>
                    <h3 className="text-sm font-semibold text-gray mb-3 flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-gray" /> Sessões Anteriores ({pastSessions.length})
                    </h3>
                    <div className="grid sm:grid-cols-2 gap-3">
                      {pastSessions.map(session => (
                        <SessionCard key={session.id} session={session} statusLabels={statusLabels} />
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* ===== FEEDBACKS ===== */}
        {activeTab === 'feedbacks' && (
          <div className="space-y-3">
            {feedbacks.length === 0 ? (
              <EmptyState icon={<MessageSquare size={40} />} text="Nenhum feedback de treino recebido deste aluno" />
            ) : (
              feedbacks.map(fb => (
                <FeedbackCard key={fb.id} feedback={fb} />
              ))
            )}
          </div>
        )}

        {/* ===== PROGRESSO ===== */}
        {activeTab === 'progresso' && (
          <div className="space-y-4">
            <div className="flex justify-end">
              <Button icon={<Plus size={18} />} onClick={() => setShowProgressModal(true)}>
                Registrar Progresso
              </Button>
            </div>

            {progress.length === 0 ? (
              <EmptyState icon={<TrendingUp size={40} />} text="Nenhum registro de progresso. Clique em 'Registrar Progresso' para começar." />
            ) : (
              <>
                {/* Progress chart (weight over time) */}
                {progress.length > 1 && (
                  <div className="rounded-2xl bg-dark-light border border-dark-lighter p-4 sm:p-5">
                    <h3 className="text-sm font-semibold text-gray-lighter mb-4 flex items-center gap-2">
                      <Activity size={16} className="text-primary" /> Evolução do Peso
                    </h3>
                    <div className="h-32 flex items-end gap-1">
                      {[...progress].reverse().slice(-12).map((p, idx) => {
                        const weights = [...progress].reverse().slice(-12).map(pr => pr.weight);
                        const max = Math.max(...weights);
                        const min = Math.min(...weights);
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
                    <div className="flex justify-between mt-2">
                      <span className="text-[10px] text-gray">
                        {formatDateBR([...progress].reverse().slice(-12)[0]?.date)}
                      </span>
                      <span className="text-[10px] text-gray">
                        {formatDateBR(progress[0]?.date)}
                      </span>
                    </div>
                  </div>
                )}

                {/* Progress entries */}
                <div className="space-y-3">
                  {progress.map((entry) => (
                    <ProgressCard
                      key={entry.id}
                      entry={entry}
                      onDelete={() => handleDeleteProgress(entry.id)}
                    />
                  ))}
                </div>
              </>
            )}
          </div>
        )}
      </div>

      {/* ===== Add Progress Modal ===== */}
      <Modal
        isOpen={showProgressModal}
        onClose={() => setShowProgressModal(false)}
        title="Registrar Progresso"
        size="lg"
      >
        <form onSubmit={handleAddProgress} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-gray mb-1.5">Data *</label>
            <input
              type="date"
              value={progressForm.date}
              onChange={e => setProgressForm({ ...progressForm, date: e.target.value })}
              required
              className="w-full bg-dark border border-dark-lighter rounded-xl px-3 py-2.5 text-sm text-gray-lighter focus:outline-none focus:border-primary"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray mb-1.5 flex items-center gap-1">
                <Weight size={12} /> Peso (kg)
              </label>
              <input
                type="number"
                step="0.1"
                value={progressForm.weight}
                onChange={e => setProgressForm({ ...progressForm, weight: e.target.value })}
                placeholder="75.0"
                className="w-full bg-dark border border-dark-lighter rounded-xl px-3 py-2.5 text-sm text-gray-lighter placeholder:text-gray focus:outline-none focus:border-primary"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray mb-1.5 flex items-center gap-1">
                <Target size={12} /> % Gordura
              </label>
              <input
                type="number"
                step="0.1"
                value={progressForm.body_fat}
                onChange={e => setProgressForm({ ...progressForm, body_fat: e.target.value })}
                placeholder="15.0"
                className="w-full bg-dark border border-dark-lighter rounded-xl px-3 py-2.5 text-sm text-gray-lighter placeholder:text-gray focus:outline-none focus:border-primary"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {[
              { key: 'chest', label: 'Peitoral (cm)', icon: <Ruler size={12} /> },
              { key: 'waist', label: 'Cintura (cm)', icon: <Ruler size={12} /> },
              { key: 'hips', label: 'Quadril (cm)', icon: <Ruler size={12} /> },
              { key: 'arms', label: 'Braços (cm)', icon: <Ruler size={12} /> },
              { key: 'thighs', label: 'Coxas (cm)', icon: <Ruler size={12} /> },
            ].map(field => (
              <div key={field.key}>
                <label className="block text-xs font-medium text-gray mb-1.5 flex items-center gap-1">
                  {field.icon} {field.label}
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={progressForm[field.key as keyof typeof progressForm]}
                  onChange={e => setProgressForm({ ...progressForm, [field.key]: e.target.value })}
                  className="w-full bg-dark border border-dark-lighter rounded-xl px-3 py-2.5 text-sm text-gray-lighter placeholder:text-gray focus:outline-none focus:border-primary"
                />
              </div>
            ))}
          </div>

          <div>
            <label className="block text-xs font-medium text-gray mb-1.5">Observações</label>
            <textarea
              value={progressForm.notes}
              onChange={e => setProgressForm({ ...progressForm, notes: e.target.value })}
              rows={3}
              placeholder="Notas sobre a avaliação..."
              className="w-full bg-dark border border-dark-lighter rounded-xl px-3 py-2.5 text-sm text-gray-lighter placeholder:text-gray focus:outline-none focus:border-primary resize-none"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" type="button" onClick={() => setShowProgressModal(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
              Salvar
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

/* ===== Sub-Components ===== */

function EmptyState({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <div className="text-center py-12 rounded-2xl bg-dark-light border border-dark-lighter">
      <div className="text-gray/40 mb-3 flex justify-center">{icon}</div>
      <p className="text-gray text-sm">{text}</p>
    </div>
  );
}

function WorkoutCard({
  plan,
  expanded,
  onToggle,
  dayNames,
}: {
  plan: WorkoutPlan;
  expanded: boolean;
  onToggle: () => void;
  dayNames: Record<string, string>;
}) {
  let days: string[] = [];
  try {
    days = JSON.parse(plan.day_of_week || '[]');
  } catch { /* ignore */ }

  return (
    <div className="rounded-2xl bg-dark-light border border-dark-lighter overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full flex items-center gap-3 p-4 text-left hover:bg-dark-lighter/50 transition-colors"
      >
        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
          <Dumbbell size={18} className="text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold text-gray-lighter truncate">{plan.name}</p>
          <div className="flex items-center gap-2 mt-0.5">
            {days.length > 0 && (
              <span className="text-[10px] text-gray">
                {days.map(d => dayNames[d] || d).join(', ')}
              </span>
            )}
            <span className="text-[10px] text-gray">
              · {plan.exercises?.length || 0} exercícios
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
            plan.is_active ? 'bg-success/10 text-success' : 'bg-gray/10 text-gray'
          }`}>
            {plan.is_active ? 'Ativo' : 'Inativo'}
          </span>
          {expanded ? <ChevronUp size={16} className="text-gray" /> : <ChevronDown size={16} className="text-gray" />}
        </div>
      </button>
      {expanded && plan.exercises && plan.exercises.length > 0 && (
        <div className="border-t border-dark-lighter px-4 pb-4">
          <div className="space-y-2 mt-3">
            {plan.exercises.map((ex, idx) => (
              <div key={ex.id} className="flex items-center gap-3 p-2.5 rounded-lg bg-dark/50">
                <span className="w-6 h-6 rounded-md bg-dark-lighter text-[10px] font-bold flex items-center justify-center text-gray shrink-0">
                  {idx + 1}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-lighter truncate">{ex.exercise_name}</p>
                  <p className="text-xs text-gray">
                    {ex.sets}x{ex.reps} {ex.weight && `· ${ex.weight}`} · {ex.rest_seconds}s descanso
                  </p>
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-dark-lighter text-gray hidden sm:inline">
                  {ex.muscle_group}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function SessionCard({
  session,
  statusLabels,
}: {
  session: ScheduleSession;
  statusLabels: Record<string, { label: string; color: string }>;
}) {
  const status = statusLabels[session.status] || statusLabels.scheduled;
  return (
    <div className="rounded-2xl bg-dark-light border border-dark-lighter p-4">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-bold text-gray-lighter">{formatDateBR(session.date)}</span>
        <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${status.color}`}>
          {status.label}
        </span>
      </div>
      <div className="flex items-center gap-3 text-xs text-gray">
        <span className="flex items-center gap-1"><Clock size={12} /> {session.time}</span>
        <span className="flex items-center gap-1"><Zap size={12} /> {session.type}</span>
        <span>{session.duration}min</span>
      </div>
      {session.notes && (
        <p className="text-xs text-gray mt-2 italic">{session.notes}</p>
      )}
    </div>
  );
}

function FeedbackCard({ feedback }: { feedback: Notification }) {
  const lines = (feedback.message || '').split('\n');
  return (
    <div className="rounded-2xl bg-dark-light border border-dark-lighter p-4">
      <div className="flex items-center justify-between mb-2">
        <p className="text-sm font-bold text-gray-lighter flex items-center gap-2">
          <Star size={14} className="text-warning" />
          {feedback.title}
        </p>
        <span className="text-[10px] text-gray">
          {feedback.created_at ? formatDateBR(feedback.created_at.split('T')[0]) : ''}
        </span>
      </div>
      <div className="space-y-0.5">
        {lines.map((line, i) => (
          <p key={i} className="text-xs text-gray">{line}</p>
        ))}
      </div>
    </div>
  );
}

function ProgressCard({ entry, onDelete }: { entry: StudentProgress; onDelete: () => void }) {
  const measurements = [
    { label: 'Peso', value: entry.weight, suffix: 'kg' },
    { label: '% Gord.', value: entry.body_fat, suffix: '%' },
    { label: 'Peitoral', value: entry.chest, suffix: 'cm' },
    { label: 'Cintura', value: entry.waist, suffix: 'cm' },
    { label: 'Quadril', value: entry.hips, suffix: 'cm' },
    { label: 'Braços', value: entry.arms, suffix: 'cm' },
    { label: 'Coxas', value: entry.thighs, suffix: 'cm' },
  ].filter(m => m.value != null && m.value !== undefined);

  return (
    <div className="rounded-2xl bg-dark-light border border-dark-lighter p-4">
      <div className="flex items-center justify-between mb-3">
        <p className="text-sm font-bold text-gray-lighter flex items-center gap-2">
          <TrendingUp size={14} className="text-secondary" />
          {formatDateBR(entry.date)}
        </p>
        <button
          onClick={onDelete}
          className="p-1.5 rounded-lg text-gray hover:text-danger hover:bg-danger/10 transition-colors"
          title="Excluir registro"
        >
          <Trash2 size={14} />
        </button>
      </div>
      <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
        {measurements.map(m => (
          <div key={m.label} className="p-2 rounded-lg bg-dark/50 text-center">
            <p className="text-sm font-bold text-gray-lighter">
              {m.value}{m.suffix}
            </p>
            <p className="text-[10px] text-gray">{m.label}</p>
          </div>
        ))}
      </div>
      {entry.notes && (
        <p className="text-xs text-gray mt-3 p-2 rounded-lg bg-dark/30 italic">{entry.notes}</p>
      )}
    </div>
  );
}
