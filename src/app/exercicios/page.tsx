'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAppStore } from '@/store/useAppStore';
import PageHeader from '@/components/ui/PageHeader';
import { BookOpen, Search, Dumbbell } from 'lucide-react';
import type { MuscleGroup, Exercise } from '@/types';

function getExerciseGroups(muscleGroup: string): string[] {
  return muscleGroup.split('/').map(g => g.trim());
}

const muscleGroups: MuscleGroup[] = [
  'Peito', 'Costas', 'Ombros', 'Bíceps', 'Tríceps',
  'Quadríceps', 'Posterior', 'Glúteos', 'Panturrilha',
  'Abdômen', 'Core', 'Lombar', 'Trapézio', 'Antebraço', 'Corpo Inteiro',
];

const difficultyColors: Record<string, string> = {
  'Iniciante': 'bg-secondary/10 text-secondary',
  'Intermediário': 'bg-accent/10 text-accent',
  'Avançado': 'bg-danger/10 text-danger',
};

const muscleGroupEmojis: Record<MuscleGroup, string> = {
  'Peito': '🏋️',
  'Costas': '💪',
  'Ombros': '🤸',
  'Bíceps': '💪',
  'Tríceps': '💪',
  'Quadríceps': '🦵',
  'Posterior': '🦵',
  'Glúteos': '🍑',
  'Panturrilha': '🦵',
  'Abdômen': '🔥',
  'Core': '⚡',
  'Lombar': '🔙',
  'Trapézio': '🔺',
  'Antebraço': '✊',
  'Corpo Inteiro': '🏃',
};

export default function ExerciciosPage() {
  const { currentUser, exercises, fetchExercises } = useAppStore();
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [selectedGroup, setSelectedGroup] = useState<string>('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all');
  const [expandedExercise, setExpandedExercise] = useState<string | null>(null);

  useEffect(() => {
    if (!currentUser) {
      router.push('/');
      return;
    }
    fetchExercises();
  }, [currentUser, router, fetchExercises]);

  if (!currentUser) return null;

  const filteredExercises = exercises.filter((ex) => {
    const matchesSearch = ex.name.toLowerCase().includes(search.toLowerCase()) ||
      ex.muscle_group.toLowerCase().includes(search.toLowerCase());
    const matchesGroup = selectedGroup === 'all' || getExerciseGroups(ex.muscle_group).includes(selectedGroup);
    const matchesDiff = selectedDifficulty === 'all' || ex.difficulty === selectedDifficulty;
    return matchesSearch && matchesGroup && matchesDiff;
  });

  // Group exercises by muscle group (multi-category exercises appear in each group)
  const groupedExercises = filteredExercises.reduce((acc, ex) => {
    const groups = getExerciseGroups(ex.muscle_group);
    for (const g of groups) {
      if (!acc[g]) acc[g] = [];
      acc[g].push(ex);
    }
    return acc;
  }, {} as Record<string, Exercise[]>);

  return (
    <div>
      <PageHeader
        title="Biblioteca de Exercícios"
        subtitle={`${exercises.length} exercícios disponíveis`}
        icon={<BookOpen size={24} />}
        backTo={{ href: '/dashboard', label: 'Voltar para Dashboard' }}
      />

      {/* Search & Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6 animate-fade-in">
        <div className="relative flex-1">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar exercício..."
            className="w-full bg-dark-light border border-dark-lighter rounded-xl pl-10 pr-3 py-2.5 text-sm text-gray-lighter placeholder:text-gray focus:outline-none focus:border-primary"
          />
        </div>
        <select
          value={selectedGroup}
          onChange={(e) => setSelectedGroup(e.target.value)}
          className="bg-dark-light border border-dark-lighter rounded-xl px-3 py-2.5 text-sm text-gray-lighter focus:outline-none focus:border-primary"
        >
          <option value="all">Todos os grupos</option>
          {muscleGroups.map((g) => (
            <option key={g} value={g}>{g}</option>
          ))}
        </select>
        <select
          value={selectedDifficulty}
          onChange={(e) => setSelectedDifficulty(e.target.value)}
          className="bg-dark-light border border-dark-lighter rounded-xl px-3 py-2.5 text-sm text-gray-lighter focus:outline-none focus:border-primary"
        >
          <option value="all">Todas as dificuldades</option>
          <option value="Iniciante">Iniciante</option>
          <option value="Intermediário">Intermediário</option>
          <option value="Avançado">Avançado</option>
        </select>
      </div>

      {/* Muscle Group Tags */}
      <div className="flex flex-wrap gap-2 mb-6 animate-fade-in">
        <button
          onClick={() => setSelectedGroup('all')}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
            selectedGroup === 'all'
              ? 'bg-primary text-white'
              : 'bg-dark-light border border-dark-lighter text-gray hover:text-gray-lighter'
          }`}
        >
          Todos
        </button>
        {muscleGroups.map((g) => {
          const count = exercises.filter((e) => getExerciseGroups(e.muscle_group).includes(g)).length;
          if (count === 0) return null;
          return (
            <button
              key={g}
              onClick={() => setSelectedGroup(g)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                selectedGroup === g
                  ? 'bg-primary text-white'
                  : 'bg-dark-light border border-dark-lighter text-gray hover:text-gray-lighter'
              }`}
            >
              {muscleGroupEmojis[g as MuscleGroup]} {g} ({count})
            </button>
          );
        })}
      </div>

      {/* Exercises Grid */}
      {selectedGroup === 'all' && !search ? (
        // Grouped view
        Object.entries(groupedExercises).map(([group, groupExercises]) => (
          <div key={group} className="mb-8 animate-fade-in">
            <h2 className="text-lg font-bold text-gray-lighter mb-3 flex items-center gap-2">
              <span>{muscleGroupEmojis[group as MuscleGroup]}</span>
              {group}
              <span className="text-xs text-gray font-normal">({groupExercises.length})</span>
            </h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3 items-start">
              {groupExercises.map((ex) => (
                <ExerciseCard
                  key={ex.id}
                  exercise={ex}
                  isExpanded={expandedExercise === ex.id}
                  onToggle={() => setExpandedExercise(expandedExercise === ex.id ? null : ex.id)}
                />
              ))}
            </div>
          </div>
        ))
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3 items-start">
          {filteredExercises.map((ex) => (
            <ExerciseCard
              key={ex.id}
              exercise={ex}
              isExpanded={expandedExercise === ex.id}
              onToggle={() => setExpandedExercise(expandedExercise === ex.id ? null : ex.id)}
            />
          ))}
        </div>
      )}

      {filteredExercises.length === 0 && (
        <div className="text-center py-16 animate-fade-in">
          <div className="w-20 h-20 rounded-2xl bg-dark-lighter flex items-center justify-center text-gray mx-auto mb-4">
            <Dumbbell size={36} />
          </div>
          <h3 className="text-lg font-semibold text-gray-lighter mb-2">Nenhum exercício encontrado</h3>
          <p className="text-sm text-gray">Tente alterar os filtros de busca</p>
        </div>
      )}
    </div>
  );
}

function ExerciseCard({
  exercise,
  isExpanded,
  onToggle,
}: {
  exercise: Exercise;
  isExpanded: boolean;
  onToggle: () => void;
}) {
  return (
    <div
      className="rounded-xl bg-dark-light border border-dark-lighter overflow-hidden card-hover cursor-pointer"
      onClick={onToggle}
    >
      <div className="p-4">
        <div className="flex items-start justify-between mb-2">
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <Dumbbell size={18} className="text-primary" />
          </div>
          <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${difficultyColors[exercise.difficulty] || ''}`}>
            {exercise.difficulty}
          </span>
        </div>
        <h3 className="font-bold text-sm text-gray-lighter mb-1">{exercise.name}</h3>
        <div className="flex items-center gap-2 text-xs text-gray flex-wrap">
          <span>{muscleGroupEmojis[getExerciseGroups(exercise.muscle_group)[0] as MuscleGroup]}</span>
          <span>{exercise.muscle_group}</span>
          <span>·</span>
          <span>{exercise.equipment}</span>
        </div>
      </div>
      {isExpanded && (
        <div className="px-4 pb-4 pt-2 border-t border-dark-lighter/50 animate-fade-in">
          <p className="text-sm text-gray leading-relaxed">{exercise.description}</p>
        </div>
      )}
    </div>
  );
}
