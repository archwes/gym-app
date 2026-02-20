'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAppStore } from '@/store/useAppStore';
import PageHeader from '@/components/ui/PageHeader';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import {
  Dumbbell,
  Plus,
  ChevronDown,
  ChevronUp,
  Trash2,
  Clock,
  Target,
  Filter,
} from 'lucide-react';

interface NewPlanExercise {
  exercise_id: string;
  exercise_name: string;
  muscle_group: string;
  sets: number;
  reps: string;
  rest_seconds: number;
  weight?: string;
}

export default function TreinosPage() {
  const { currentUser, users, workoutPlans, exercises, addWorkoutPlan, deleteWorkoutPlan, fetchUsers, fetchWorkouts, fetchExercises } = useAppStore();
  const router = useRouter();
  const [selectedStudent, setSelectedStudent] = useState<string>('all');
  const [expandedPlan, setExpandedPlan] = useState<string | null>(null);
  const [showNewPlanModal, setShowNewPlanModal] = useState(false);
  const [newPlanName, setNewPlanName] = useState('');
  const [newPlanDesc, setNewPlanDesc] = useState('');
  const [newPlanStudent, setNewPlanStudent] = useState('');
  const [newPlanDays, setNewPlanDays] = useState<string[]>([]);
  const [newPlanExercises, setNewPlanExercises] = useState<NewPlanExercise[]>([]);

  useEffect(() => {
    if (!currentUser || currentUser.role !== 'trainer') {
      router.push('/');
      return;
    }
    fetchUsers();
    fetchWorkouts();
    fetchExercises();
  }, [currentUser, router, fetchUsers, fetchWorkouts, fetchExercises]);

  if (!currentUser) return null;

  const students = users.filter((u) => u.role === 'student');

  const filteredPlans =
    selectedStudent === 'all'
      ? workoutPlans
      : workoutPlans.filter((p) => p.student_id === selectedStudent);

  const days = ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado', 'Domingo'];

  const addExerciseToPlan = (exerciseId: string) => {
    const exercise = exercises.find((e) => e.id === exerciseId);
    if (!exercise) return;
    setNewPlanExercises([
      ...newPlanExercises,
      { exercise_id: exerciseId, exercise_name: exercise.name, muscle_group: exercise.muscle_group, sets: 3, reps: '10-12', rest_seconds: 60 },
    ]);
  };

  const removeExerciseFromPlan = (index: number) => {
    setNewPlanExercises(newPlanExercises.filter((_, i) => i !== index));
  };

  const handleCreatePlan = async () => {
    if (!newPlanName || !newPlanStudent || newPlanExercises.length === 0) return;

    await addWorkoutPlan({
      name: newPlanName,
      description: newPlanDesc,
      student_id: newPlanStudent,
      day_of_week: newPlanDays,
      exercises: newPlanExercises.map((ex) => ({
        exercise_id: ex.exercise_id,
        sets: ex.sets,
        reps: ex.reps,
        rest_seconds: ex.rest_seconds,
        weight: ex.weight,
      })),
    });
    setShowNewPlanModal(false);
    setNewPlanName('');
    setNewPlanDesc('');
    setNewPlanStudent('');
    setNewPlanDays([]);
    setNewPlanExercises([]);
  };

  const parseDays = (dayOfWeek: string): string[] => {
    try { return JSON.parse(dayOfWeek); } catch { return []; }
  };

  return (
    <div>
      <PageHeader
        title="Treinos"
        subtitle="Gerencie os planos de treino dos seus alunos"
        icon={<Dumbbell size={24} />}
        action={
          <Button
            icon={<Plus size={18} />}
            onClick={() => setShowNewPlanModal(true)}
          >
            Novo Treino
          </Button>
        }
      />

      {/* Filter */}
      <div className="flex items-center gap-3 mb-6 animate-fade-in">
        <Filter size={16} className="text-gray" />
        <select
          value={selectedStudent}
          onChange={(e) => setSelectedStudent(e.target.value)}
          className="bg-dark-light border border-dark-lighter rounded-xl px-3 py-2 text-sm text-gray-lighter focus:outline-none focus:border-primary"
        >
          <option value="all">Todos os alunos</option>
          {students.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </select>
      </div>

      {/* Plans */}
      <div className="space-y-4">
        {filteredPlans.map((plan, index) => {
          const student = users.find((u) => u.id === plan.student_id);
          const isExpanded = expandedPlan === plan.id;
          const planDays = parseDays(plan.day_of_week);

          return (
            <div
              key={plan.id}
              className="rounded-2xl bg-dark-light border border-dark-lighter overflow-hidden card-hover animate-fade-in"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <button
                onClick={() => setExpandedPlan(isExpanded ? null : plan.id)}
                className="w-full flex items-center justify-between p-5 text-left"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                    <Dumbbell size={22} className="text-primary" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-lighter">{plan.name}</h3>
                    <p className="text-xs text-gray mt-0.5">
                      {student?.name || plan.student?.name} · {plan.exercises.length} exercícios · {planDays.join(', ')}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span
                    className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider ${
                      plan.is_active
                        ? 'bg-secondary/10 text-secondary'
                        : 'bg-gray/10 text-gray'
                    }`}
                  >
                    {plan.is_active ? 'Ativo' : 'Inativo'}
                  </span>
                  {isExpanded ? (
                    <ChevronUp size={20} className="text-gray" />
                  ) : (
                    <ChevronDown size={20} className="text-gray" />
                  )}
                </div>
              </button>

              {isExpanded && (
                <div className="px-5 pb-5 border-t border-dark-lighter pt-4 animate-fade-in">
                  {plan.description && (
                    <p className="text-sm text-gray mb-4">{plan.description}</p>
                  )}
                  <div className="space-y-2 mb-4">
                    {plan.exercises.map((ex, idx) => (
                      <div
                        key={idx}
                        className="flex items-center gap-3 p-3 rounded-xl bg-dark/50 border border-dark-lighter/50"
                      >
                        <span className="w-8 h-8 rounded-lg bg-primary/10 text-primary text-xs font-bold flex items-center justify-center">
                          {idx + 1}
                        </span>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-gray-lighter">
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
                        <span className="px-2 py-0.5 rounded-md bg-dark-lighter text-[10px] text-gray font-medium">
                          {ex.muscle_group}
                        </span>
                      </div>
                    ))}
                  </div>
                  <div className="flex justify-end">
                    <Button
                      variant="danger"
                      size="sm"
                      icon={<Trash2 size={14} />}
                      onClick={() => deleteWorkoutPlan(plan.id)}
                    >
                      Excluir
                    </Button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* New Plan Modal */}
      <Modal
        isOpen={showNewPlanModal}
        onClose={() => setShowNewPlanModal(false)}
        title="Novo Plano de Treino"
        size="lg"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-gray mb-1.5">Nome do Treino</label>
            <input
              type="text"
              value={newPlanName}
              onChange={(e) => setNewPlanName(e.target.value)}
              placeholder="Ex: Treino A - Peito e Tríceps"
              className="w-full bg-dark border border-dark-lighter rounded-xl px-3 py-2.5 text-sm text-gray-lighter placeholder:text-gray focus:outline-none focus:border-primary"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray mb-1.5">Descrição</label>
            <textarea
              value={newPlanDesc}
              onChange={(e) => setNewPlanDesc(e.target.value)}
              placeholder="Descrição do treino..."
              rows={2}
              className="w-full bg-dark border border-dark-lighter rounded-xl px-3 py-2.5 text-sm text-gray-lighter placeholder:text-gray focus:outline-none focus:border-primary resize-none"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray mb-1.5">Aluno</label>
            <select
              value={newPlanStudent}
              onChange={(e) => setNewPlanStudent(e.target.value)}
              className="w-full bg-dark border border-dark-lighter rounded-xl px-3 py-2.5 text-sm text-gray-lighter focus:outline-none focus:border-primary"
            >
              <option value="">Selecione um aluno</option>
              {students.map((s) => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray mb-1.5">Dias da Semana</label>
            <div className="flex flex-wrap gap-2">
              {days.map((day) => (
                <button
                  key={day}
                  onClick={() =>
                    setNewPlanDays(
                      newPlanDays.includes(day)
                        ? newPlanDays.filter((d) => d !== day)
                        : [...newPlanDays, day]
                    )
                  }
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                    newPlanDays.includes(day)
                      ? 'bg-primary text-white'
                      : 'bg-dark border border-dark-lighter text-gray hover:text-gray-lighter'
                  }`}
                >
                  {day.substring(0, 3)}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray mb-1.5">Adicionar Exercício</label>
            <select
              onChange={(e) => {
                if (e.target.value) {
                  addExerciseToPlan(e.target.value);
                  e.target.value = '';
                }
              }}
              className="w-full bg-dark border border-dark-lighter rounded-xl px-3 py-2.5 text-sm text-gray-lighter focus:outline-none focus:border-primary"
            >
              <option value="">Selecione um exercício</option>
              {exercises.map((ex) => (
                <option key={ex.id} value={ex.id}>
                  {ex.name} ({ex.muscle_group})
                </option>
              ))}
            </select>
          </div>

          {newPlanExercises.length > 0 && (
            <div className="space-y-2">
              {newPlanExercises.map((ex, idx) => (
                <div key={idx} className="flex items-center gap-2 p-2 rounded-lg bg-dark/50 border border-dark-lighter/50">
                  <span className="text-xs font-bold text-gray w-5">{idx + 1}</span>
                  <span className="flex-1 text-sm text-gray-lighter truncate">{ex.exercise_name}</span>
                  <input
                    type="number"
                    value={ex.sets}
                    onChange={(e) => {
                      const updated = [...newPlanExercises];
                      updated[idx] = { ...updated[idx], sets: Number(e.target.value) };
                      setNewPlanExercises(updated);
                    }}
                    className="w-14 bg-dark border border-dark-lighter rounded-lg px-2 py-1 text-xs text-center text-gray-lighter"
                    placeholder="Sets"
                  />
                  <span className="text-xs text-gray">x</span>
                  <input
                    type="text"
                    value={ex.reps}
                    onChange={(e) => {
                      const updated = [...newPlanExercises];
                      updated[idx] = { ...updated[idx], reps: e.target.value };
                      setNewPlanExercises(updated);
                    }}
                    className="w-16 bg-dark border border-dark-lighter rounded-lg px-2 py-1 text-xs text-center text-gray-lighter"
                    placeholder="Reps"
                  />
                  <button
                    onClick={() => removeExerciseFromPlan(idx)}
                    className="p-1 text-gray hover:text-danger transition-colors"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => setShowNewPlanModal(false)}>
              Cancelar
            </Button>
            <Button
              onClick={handleCreatePlan}
              disabled={!newPlanName || !newPlanStudent || newPlanExercises.length === 0}
            >
              Criar Treino
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
