'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAppStore } from '@/store/useAppStore';
import PageHeader from '@/components/ui/PageHeader';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  Clock,
  Plus,
  CheckCircle2,
  XCircle,
  AlertCircle,
} from 'lucide-react';

const statusConfig: Record<string, { label: string; icon: typeof AlertCircle; color: string }> = {
  scheduled: { label: 'Agendado', icon: AlertCircle, color: 'bg-accent/10 text-accent' },
  completed: { label: 'Concluído', icon: CheckCircle2, color: 'bg-secondary/10 text-secondary' },
  cancelled: { label: 'Cancelado', icon: XCircle, color: 'bg-danger/10 text-danger' },
};

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year: number, month: number) {
  return new Date(year, month, 1).getDay();
}

const monthNames = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
];

export default function AgendaPage() {
  const { currentUser, users, sessions, addSession, cancelSession, fetchUsers, fetchSessions } = useAppStore();
  const router = useRouter();

  const now = new Date();
  const todayStr = now.toISOString().split('T')[0];
  const [currentMonth, setCurrentMonth] = useState(now.getMonth());
  const [currentYear, setCurrentYear] = useState(now.getFullYear());
  const [selectedDate, setSelectedDate] = useState<string | null>(todayStr);
  const [showNewSessionModal, setShowNewSessionModal] = useState(false);
  const [newSessionStudent, setNewSessionStudent] = useState('');
  const [newSessionDate, setNewSessionDate] = useState('');
  const [newSessionTime, setNewSessionTime] = useState('');
  const [newSessionType, setNewSessionType] = useState<'Treino' | 'Avaliação' | 'Consulta'>('Treino');

  useEffect(() => {
    if (!currentUser) {
      router.push('/');
      return;
    }
    fetchUsers();
    fetchSessions();
  }, [currentUser, router, fetchUsers, fetchSessions]);

  if (!currentUser) return null;

  const isTrainer = currentUser.role === 'trainer';
  const students = users.filter((u) => u.role === 'student');

  const mySessions = sessions.filter((s) =>
    isTrainer ? s.trainer_id === currentUser.id : s.student_id === currentUser.id
  );

  const selectedDateSessions = selectedDate
    ? mySessions.filter((s) => s.date === selectedDate)
    : [];

  const daysInMonth = getDaysInMonth(currentYear, currentMonth);
  const firstDay = getFirstDayOfMonth(currentYear, currentMonth);

  const prevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };

  const nextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };

  const getSessionsForDay = (day: number) => {
    const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return mySessions.filter((s) => s.date === dateStr);
  };

  const handleCreateSession = async () => {
    if (!newSessionStudent || !newSessionDate || !newSessionTime) return;

    await addSession({
      student_id: newSessionStudent,
      date: newSessionDate,
      time: newSessionTime,
      duration: 60,
      type: newSessionType,
    });
    setShowNewSessionModal(false);
    setNewSessionStudent('');
    setNewSessionDate('');
    setNewSessionTime('');
  };

  return (
    <div>
      <PageHeader
        title="Agenda"
        subtitle={isTrainer ? 'Gerencie suas sessões e aulas' : 'Suas sessões agendadas'}
        icon={<Calendar size={24} />}
        action={
          isTrainer ? (
            <Button icon={<Plus size={18} />} onClick={() => setShowNewSessionModal(true)}>
              Nova Sessão
            </Button>
          ) : undefined
        }
      />

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Calendar */}
        <div className="lg:col-span-2 rounded-2xl bg-dark-light border border-dark-lighter p-5 animate-fade-in">
          {/* Month nav */}
          <div className="flex items-center justify-between mb-6">
            <button onClick={prevMonth} className="p-2 rounded-lg hover:bg-dark-lighter transition-colors text-gray hover:text-gray-lighter">
              <ChevronLeft size={20} />
            </button>
            <h2 className="text-lg font-bold text-gray-lighter">
              {monthNames[currentMonth]} {currentYear}
            </h2>
            <button onClick={nextMonth} className="p-2 rounded-lg hover:bg-dark-lighter transition-colors text-gray hover:text-gray-lighter">
              <ChevronRight size={20} />
            </button>
          </div>

          {/* Day headers */}
          <div className="grid grid-cols-7 gap-1 mb-2">
            {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map((d) => (
              <div key={d} className="text-center text-xs font-semibold text-gray py-2">
                {d}
              </div>
            ))}
          </div>

          {/* Day cells */}
          <div className="grid grid-cols-7 gap-1">
            {Array.from({ length: firstDay }, (_, i) => (
              <div key={`empty-${i}`} className="aspect-square" />
            ))}
            {Array.from({ length: daysInMonth }, (_, i) => {
              const day = i + 1;
              const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
              const daySessions = getSessionsForDay(day);
              const isSelected = selectedDate === dateStr;
              const isToday = dateStr === todayStr;

              return (
                <button
                  key={day}
                  onClick={() => setSelectedDate(dateStr)}
                  className={`aspect-square rounded-xl flex flex-col items-center justify-center gap-0.5 text-sm transition-all relative ${
                    isSelected
                      ? 'bg-primary text-white font-bold'
                      : isToday
                      ? 'bg-primary/10 text-primary font-semibold border border-primary/30'
                      : 'text-gray-light hover:bg-dark-lighter'
                  }`}
                >
                  {day}
                  {daySessions.length > 0 && (
                    <div className="flex gap-0.5">
                      {daySessions.slice(0, 3).map((s, idx) => (
                        <div
                          key={idx}
                          className={`w-1 h-1 rounded-full ${
                            isSelected
                              ? 'bg-white'
                              : s.status === 'completed'
                              ? 'bg-secondary'
                              : s.status === 'cancelled'
                              ? 'bg-danger'
                              : 'bg-accent'
                          }`}
                        />
                      ))}
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Selected Day Sessions */}
        <div className="rounded-2xl bg-dark-light border border-dark-lighter p-5 animate-fade-in">
          <h3 className="text-lg font-bold text-gray-lighter mb-4">
            {selectedDate
              ? new Date(selectedDate + 'T12:00:00').toLocaleDateString('pt-BR', {
                  weekday: 'long',
                  day: 'numeric',
                  month: 'long',
                })
              : 'Selecione um dia'}
          </h3>

          {selectedDateSessions.length === 0 ? (
            <div className="text-center py-8">
              <Calendar size={32} className="text-gray mx-auto mb-2" />
              <p className="text-sm text-gray">Nenhuma sessão neste dia</p>
            </div>
          ) : (
            <div className="space-y-3">
              {selectedDateSessions
                .sort((a, b) => a.time.localeCompare(b.time))
                .map((session) => {
                  const StatusIcon = statusConfig[session.status].icon;
                  return (
                    <div
                      key={session.id}
                      className="p-3 rounded-xl bg-dark/50 border border-dark-lighter/50"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Clock size={14} className="text-gray" />
                          <span className="text-sm font-bold text-gray-lighter">{session.time}</span>
                          <span className="text-xs text-gray">· {session.duration}min</span>
                        </div>
                        <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold flex items-center gap-1 ${statusConfig[session.status].color}`}>
                          <StatusIcon size={10} />
                          {statusConfig[session.status].label}
                        </span>
                      </div>
                      <p className="text-sm text-gray-lighter font-medium">
                        {isTrainer ? session.student_name : session.trainer_name}
                      </p>
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-xs text-gray">{session.type}</span>
                        {session.status === 'scheduled' && (
                          <button
                            onClick={() => cancelSession(session.id)}
                            className="text-xs text-danger hover:text-red-400 font-medium"
                          >
                            Cancelar
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
            </div>
          )}
        </div>
      </div>

      {/* New Session Modal */}
      <Modal
        isOpen={showNewSessionModal}
        onClose={() => setShowNewSessionModal(false)}
        title="Agendar Nova Sessão"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-gray mb-1.5">Aluno</label>
            <select
              value={newSessionStudent}
              onChange={(e) => setNewSessionStudent(e.target.value)}
              className="w-full bg-dark border border-dark-lighter rounded-xl px-3 py-2.5 text-sm text-gray-lighter focus:outline-none focus:border-primary"
            >
              <option value="">Selecione um aluno</option>
              {students.map((s) => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray mb-1.5">Data</label>
              <input
                type="date"
                value={newSessionDate}
                onChange={(e) => setNewSessionDate(e.target.value)}
                className="w-full bg-dark border border-dark-lighter rounded-xl px-3 py-2.5 text-sm text-gray-lighter focus:outline-none focus:border-primary"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray mb-1.5">Horário</label>
              <input
                type="time"
                value={newSessionTime}
                onChange={(e) => setNewSessionTime(e.target.value)}
                className="w-full bg-dark border border-dark-lighter rounded-xl px-3 py-2.5 text-sm text-gray-lighter focus:outline-none focus:border-primary"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray mb-1.5">Tipo</label>
            <div className="flex gap-2">
              {(['Treino', 'Avaliação', 'Consulta'] as const).map((type) => (
                <button
                  key={type}
                  onClick={() => setNewSessionType(type)}
                  className={`flex-1 px-3 py-2 rounded-xl text-xs font-medium transition-colors ${
                    newSessionType === type
                      ? 'bg-primary text-white'
                      : 'bg-dark border border-dark-lighter text-gray hover:text-gray-lighter'
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => setShowNewSessionModal(false)}>
              Cancelar
            </Button>
            <Button
              onClick={handleCreateSession}
              disabled={!newSessionStudent || !newSessionDate || !newSessionTime}
            >
              Agendar
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
