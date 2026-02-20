'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAppStore } from '@/store/useAppStore';
import { WorkoutPlan } from '@/types';
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
  Pencil,
} from 'lucide-react';

interface PlanExercise {
  exercise_id: string;
  exercise_name: string;
  muscle_group: string;
  sets: number;
  reps: string;
  rest_seconds: number;
  weight?: string;
}

export default function TreinosPage() {
  const { currentUser, users, workoutPlans, exercises, addWorkoutPlan, deleteWorkoutPlan, updateWorkoutPlan, fetchUsers, fetchWorkouts, fetchExercises } = useAppStore();
  const router = useRouter();
  const [selectedStudent, setSelectedStudent] = useState<string>('all');
  const [expandedPlan, setExpandedPlan] = useState<string | null>(null);

  // New plan modal state
  const [showNewPlanModal, setShowNewPlanModal] = useState(false);
  const [newPlanName, setNewPlanName] = useState('');
  const [newPlanDesc, setNewPlanDesc] = useState('');
  const [newPlanStudent, setNewPlanStudent] = useState('');
  const [newPlanDays, setNewPlanDays] = useState<string[]>([]);
  const [newPlanExercises, setNewPlanExercises] = useState<PlanExercise[]>([]);

  // Edit plan modal state
  const [showEditModal, setShowEditModal] = useState(false);
  const [editPlanId, setEditPlanId] = useState('');
  const [editPlanName, setEditPlanName] = useState('');
  const [editPlanDesc, setEditPlanDesc] = useState('');
  const [editPlanDays, setEditPlanDays] = useState<string[]>([]);
  const [editPlanExercises, setEditPlanExercises] = useState<PlanExercise[]>([]);

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

  const addExerciseToList = (exerciseId: string, list: PlanExercise[], setList: (l: PlanExercise[]) => void) => {
    const exercise = exercises.find((e) => e.id === exerciseId);
    if (!exercise) return;
    setList([
      ...list,
      { exercise_id: exerciseId, exercise_name: exercise.name, muscle_group: exercise.muscle_group, sets: 3, reps: '10-12', rest_seconds: 60 },
    ]);
  };

  const removeExerciseFromList = (index: number, list: PlanExercise[], setList: (l: PlanExercise[]) => void) => {
    setList(list.filter((_, i) => i !== index));
  };

  const updateExerciseInList = (index: number, field: keyof PlanExercise, value: string | number, list: PlanExercise[], setList: (l: PlanExercise[]) => void) => {
    const updated = [...list];
    updated[index] = { ...updated[index], [field]: value };
    setList(updated);
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

  const openEditModal = (plan: WorkoutPlan) => {
    setEditPlanId(plan.id);
    setEditPlanName(plan.name);
    setEditPlanDesc(plan.description || '');
    setEditPlanDays(parseDays(plan.day_of_week));
    setEditPlanExercises(
      plan.exercises.map((ex) => ({
        exercise_id: ex.exercise_id,
        exercise_name: ex.exercise_name,
        muscle_group: ex.muscle_group,
        sets: ex.sets,
        reps: ex.reps,
        rest_seconds: ex.rest_seconds,
        weight: ex.weight,
      }))
    );
    setShowEditModal(true);
  };

  const handleUpdatePlan = async () => {
    if (!editPlanName || editPlanExercises.length === 0) return;
    await updateWorkoutPlan(editPlanId, {
      name: editPlanName,
      description: editPlanDesc,
      day_of_week: editPlanDays,
      exercises: editPlanExercises.map((ex) => ({
        exercise_id: ex.exercise_id,
        sets: ex.sets,
        reps: ex.reps,
        rest_seconds: ex.rest_seconds,
        weight: ex.weight,
      })),
    });
    setShowEditModal(false);
  };

  const parseDays = (dayOfWeek: string): string[] => {
    try { return JSON.parse(dayOfWeek); } catch { return []; }
  };

  // Shared exercise form builder
  const renderExerciseForm = (
    exList: PlanExercise[],
    setExList: (l: PlanExercise[]) => void,
  ) => (
    <>
      <div>
        <label className="block text-xs font-medium text-gray mb-1.5">Adicionar Exercício</label>
        <select
          onChange={(e) => {
            if (e.target.value) {
              addExerciseToList(e.target.value, exList, setExList);
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

      {exList.length > 0 && (
        <div className="space-y-2">
          <p className="text-[11px] text-gray font-medium uppercase tracking-wider">Exercícios ({exList.length})</p>
          {exList.map((ex, idx) => (
            <div key={idx} className="p-3 rounded-xl bg-dark/50 border border-dark-lighter/50 space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-primary w-5">{idx + 1}</span>
                <span className="flex-1 text-sm text-gray-lighter font-medium truncate">{ex.exercise_name}</span>
                <span className="text-[10px] text-gray bg-dark-lighter px-1.5 py-0.5 rounded">{ex.muscle_group}</span>
                <button
                  type="button"
                  onClick={() => removeExerciseFromList(idx, exList, setExList)}
                  className="p-1 text-gray hover:text-danger transition-colors"
                >
                  <Trash2 size={14} />
                </button>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <div className="flex items-center gap-1">
                  <label className="text-[10px] text-gray">Séries</label>
                  <input
                    type="number"
                    min={1}
                    value={ex.sets}
                    onChange={(e) => updateExerciseInList(idx, 'sets', Number(e.target.value), exList, setExList)}
                    className="w-14 bg-dark border border-dark-lighter rounded-lg px-2 py-1 text-xs text-center text-gray-lighter"
                  />
                </div>
                <span className="text-xs text-gray">x</span>
                <div className="flex items-center gap-1">
                  <label className="text-[10px] text-gray">Reps</label>
                  <input
                    type="text"
                    value={ex.reps}
                    onChange={(e) => updateExerciseInList(idx, 'reps', e.target.value, exList, setExList)}
                    className="w-16 bg-dark border border-dark-lighter rounded-lg px-2 py-1 text-xs text-center text-gray-lighter"
                  />
                </div>
                <div className="flex items-center gap-1">
                  <Clock size={12} className="text-gray" />
                  <input
                    type="number"
                    min={0}
                    step={5}
                    value={ex.rest_seconds}
                    onChange={(e) => updateExerciseInList(idx, 'rest_seconds', Number(e.target.value), exList, setExList)}
                    className="w-16 bg-dark border border-dark-lighter rounded-lg px-2 py-1 text-xs text-center text-gray-lighter"
                  />
                  <label className="text-[10px] text-gray">seg</label>
                </div>
                <div className="flex items-center gap-1">
                  <label className="text-[10px] text-gray">Peso</label>
                  <input
                    type="text"
                    value={ex.weight || ''}
                    onChange={(e) => updateExerciseInList(idx, 'weight', e.target.value, exList, setExList)}
                    placeholder="kg"
                    className="w-16 bg-dark border border-dark-lighter rounded-lg px-2 py-1 text-xs text-center text-gray-lighter placeholder:text-gray/40"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );

  // Shared days selector
  const renderDays = (selectedDays: string[], setDays: (d: string[]) => void) => (
    <div>
      <label className="block text-xs font-medium text-gray mb-1.5">Dias da Semana</label>
      <div className="flex flex-wrap gap-2">
        {days.map((day) => (
          <button
            key={day}
            type="button"
            onClick={() =>
              setDays(
                selectedDays.includes(day)
                  ? selectedDays.filter((d) => d !== day)
                  : [...selectedDays, day]
              )
            }
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              selectedDays.includes(day)
                ? 'bg-primary text-white'
                : 'bg-dark border border-dark-lighter text-gray hover:text-gray-lighter'
            }`}
          >
            {day.substring(0, 3)}
          </button>
        ))}
      </div>
    </div>
  );

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
                              <Clock size={12} /> {ex.rest_seconds}s descanso
                            </span>
                          </div>
                        </div>
                        <span className="px-2 py-0.5 rounded-md bg-dark-lighter text-[10px] text-gray font-medium">
                          {ex.muscle_group}
                        </span>
                      </div>
                    ))}
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      icon={<Pencil size={14} />}
                      onClick={() => openEditModal(plan)}
                    >
                      Editar
                    </Button>
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

          {renderDays(newPlanDays, setNewPlanDays)}
          {renderExerciseForm(newPlanExercises, setNewPlanExercises)}

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

      {/* Edit Plan Modal */}
      <Modal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        title="Editar Treino"
        size="lg"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-gray mb-1.5">Nome do Treino</label>
            <input
              type="text"
              value={editPlanName}
              onChange={(e) => setEditPlanName(e.target.value)}
              className="w-full bg-dark border border-dark-lighter rounded-xl px-3 py-2.5 text-sm text-gray-lighter focus:outline-none focus:border-primary"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray mb-1.5">Descrição</label>
            <textarea
              value={editPlanDesc}
              onChange={(e) => setEditPlanDesc(e.target.value)}
              rows={2}
              className="w-full bg-dark border border-dark-lighter rounded-xl px-3 py-2.5 text-sm text-gray-lighter focus:outline-none focus:border-primary resize-none"
            />
          </div>

          {renderDays(editPlanDays, setEditPlanDays)}
          {renderExerciseForm(editPlanExercises, setEditPlanExercises)}

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => setShowEditModal(false)}>
              Cancelar
            </Button>
            <Button
              onClick={handleUpdatePlan}
              disabled={!editPlanName || editPlanExercises.length === 0}
            >
              Salvar Alterações
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
