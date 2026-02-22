'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAppStore } from '@/store/useAppStore';
import { apiGetSession, apiUpdateSession } from '@/lib/api';
import { formatDateBR } from '@/lib/format';
import PageHeader from '@/components/ui/PageHeader';
import Button from '@/components/ui/Button';
import type { ScheduleSession } from '@/types';
import {
  Calendar,
  Clock,
  User as UserIcon,
  Zap,
  Timer,
  FileText,
  CheckCircle2,
  XCircle,
  AlertCircle,
  RefreshCw,
  Loader2,
  Save,
} from 'lucide-react';

const statusConfig: Record<string, { label: string; icon: typeof AlertCircle; color: string; bg: string }> = {
  scheduled: { label: 'Agendado', icon: AlertCircle, color: 'text-accent', bg: 'bg-accent/10 text-accent' },
  completed: { label: 'Concluído', icon: CheckCircle2, color: 'text-secondary', bg: 'bg-secondary/10 text-secondary' },
  cancelled: { label: 'Cancelado', icon: XCircle, color: 'text-danger', bg: 'bg-danger/10 text-danger' },
  rescheduled: { label: 'Re-agendado', icon: RefreshCw, color: 'text-warning', bg: 'bg-warning/10 text-warning' },
};

export default function SessionDetailPage() {
  const { currentUser } = useAppStore();
  const router = useRouter();
  const params = useParams();
  const sessionId = params.id as string;

  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState<ScheduleSession | null>(null);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editNotes, setEditNotes] = useState('');
  const [editStatus, setEditStatus] = useState('');
  const [saveSuccess, setSaveSuccess] = useState(false);

  const fetchSession = useCallback(async () => {
    try {
      setLoading(true);
      const data = await apiGetSession(sessionId);
      setSession(data);
      setEditNotes(data.notes || '');
      setEditStatus(data.status);
    } catch {
      router.push('/agenda');
    } finally {
      setLoading(false);
    }
  }, [sessionId, router]);

  useEffect(() => {
    if (!currentUser) {
      router.push('/');
      return;
    }
    fetchSession();
  }, [currentUser, router, fetchSession]);

  const handleSave = async () => {
    if (!session) return;
    setSaving(true);
    try {
      const updated = await apiUpdateSession(session.id, {
        status: editStatus as ScheduleSession['status'],
        notes: editNotes || undefined,
      });
      setSession({ ...session, ...updated });
      setEditing(false);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2000);
    } catch {
      /* ignore */
    }
    setSaving(false);
  };

  if (!currentUser) return null;

  const isTrainer = currentUser.role === 'trainer';

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 size={32} className="animate-spin text-primary" />
      </div>
    );
  }

  if (!session) return null;

  const status = statusConfig[session.status] || statusConfig.scheduled;
  const StatusIcon = status.icon;

  return (
    <div>
      <PageHeader
        title="Detalhes da Sessão"
        subtitle={`${session.type} — ${formatDateBR(session.date)}`}
        icon={<Calendar size={24} />}
        backTo={{ href: '/agenda', label: 'Voltar para Agenda' }}
      />

      <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
        {/* Status banner */}
        <div className={`rounded-2xl p-4 flex items-center gap-3 border ${
          session.status === 'completed' ? 'bg-secondary/5 border-secondary/20' :
          session.status === 'cancelled' ? 'bg-danger/5 border-danger/20' :
          session.status === 'rescheduled' ? 'bg-warning/5 border-warning/20' :
          'bg-accent/5 border-accent/20'
        }`}>
          <StatusIcon size={24} className={status.color} />
          <div>
            <p className={`text-sm font-bold ${status.color}`}>{status.label}</p>
            <p className="text-xs text-gray">Status atual da sessão</p>
          </div>
        </div>

        {/* Session info card */}
        <div className="rounded-2xl bg-dark-light border border-dark-lighter p-5 sm:p-6">
          <div className="grid sm:grid-cols-2 gap-5">
            {/* Type */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                <Zap size={18} className="text-primary" />
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-wider text-gray font-semibold">Tipo</p>
                <p className="text-sm font-bold text-gray-lighter">{session.type}</p>
              </div>
            </div>

            {/* Date */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-secondary/10 flex items-center justify-center shrink-0">
                <Calendar size={18} className="text-secondary" />
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-wider text-gray font-semibold">Data</p>
                <p className="text-sm font-bold text-gray-lighter">{formatDateBR(session.date)}</p>
              </div>
            </div>

            {/* Time */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center shrink-0">
                <Clock size={18} className="text-accent" />
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-wider text-gray font-semibold">Horário</p>
                <p className="text-sm font-bold text-gray-lighter">{session.time}</p>
              </div>
            </div>

            {/* Duration */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-warning/10 flex items-center justify-center shrink-0">
                <Timer size={18} className="text-warning" />
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-wider text-gray font-semibold">Duração</p>
                <p className="text-sm font-bold text-gray-lighter">{session.duration} minutos</p>
              </div>
            </div>

            {/* Student / Trainer */}
            <div className="flex items-center gap-3 sm:col-span-2">
              <div className="w-10 h-10 rounded-xl bg-dark-lighter flex items-center justify-center shrink-0 text-lg">
                {isTrainer ? (session.student_avatar || '💪') : (session.trainer_avatar || '💪')}
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-wider text-gray font-semibold">
                  {isTrainer ? 'Aluno' : 'Personal'}
                </p>
                <p className="text-sm font-bold text-gray-lighter">
                  {isTrainer ? session.student_name : session.trainer_name}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Notes section */}
        <div className="rounded-2xl bg-dark-light border border-dark-lighter p-5 sm:p-6">
          <h3 className="text-sm font-semibold text-gray-lighter mb-3 flex items-center gap-2">
            <FileText size={16} className="text-primary" /> Observações
          </h3>

          {editing && isTrainer ? (
            <textarea
              value={editNotes}
              onChange={(e) => setEditNotes(e.target.value)}
              rows={4}
              placeholder="Adicione observações sobre a sessão..."
              className="w-full bg-dark border border-dark-lighter rounded-xl px-3 py-2.5 text-sm text-gray-lighter placeholder:text-gray focus:outline-none focus:border-primary resize-none"
            />
          ) : (
            <p className="text-sm text-gray leading-relaxed">
              {session.notes || <span className="italic text-gray/60">Nenhuma observação registrada</span>}
            </p>
          )}
        </div>

        {/* Trainer action area */}
        {isTrainer && (
          <div className="rounded-2xl bg-dark-light border border-dark-lighter p-5 sm:p-6">
            <h3 className="text-sm font-semibold text-gray-lighter mb-4 flex items-center gap-2">
              <UserIcon size={16} className="text-primary" /> Ações do Trainer
            </h3>

            {editing ? (
              <div className="space-y-4">
                {/* Status selector */}
                <div>
                  <label className="block text-xs font-medium text-gray mb-2">Alterar Status</label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {(['scheduled', 'completed', 'rescheduled', 'cancelled'] as const).map(s => {
                      const cfg = statusConfig[s];
                      const Icon = cfg.icon;
                      const isActive = editStatus === s;
                      return (
                        <button
                          key={s}
                          onClick={() => setEditStatus(s)}
                          className={`flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl text-xs font-medium transition-all border ${
                            isActive
                              ? `${cfg.bg} border-current`
                              : 'bg-dark border-dark-lighter text-gray hover:text-gray-lighter hover:border-gray'
                          }`}
                        >
                          <Icon size={14} />
                          {cfg.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex justify-end gap-2 pt-2">
                  <Button variant="outline" onClick={() => {
                    setEditing(false);
                    setEditNotes(session.notes || '');
                    setEditStatus(session.status);
                  }}>
                    Cancelar
                  </Button>
                  <Button onClick={handleSave} disabled={saving}>
                    {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                    Salvar Alterações
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Button onClick={() => setEditing(true)}>
                  <FileText size={16} />
                  Editar Sessão
                </Button>
                {saveSuccess && (
                  <span className="text-xs text-secondary flex items-center gap-1 animate-fade-in">
                    <CheckCircle2 size={14} /> Salvo com sucesso
                  </span>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
