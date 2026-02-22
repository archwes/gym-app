'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAppStore } from '@/store/useAppStore';
import {
  apiAdminGetExercises,
  apiAdminCreateExercise,
  apiAdminUpdateExercise,
  apiAdminDeleteExercise,
} from '@/lib/api';
import type { Exercise, MuscleGroup } from '@/types';
import PageHeader from '@/components/ui/PageHeader';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import {
  BookOpen,
  Plus,
  Search,
  Pencil,
  Trash2,
  Loader2,
  AlertCircle,
  Check,
  Filter,
} from 'lucide-react';

const muscleGroups: MuscleGroup[] = [
  'Peito', 'Costas', 'Ombros', 'Bíceps', 'Tríceps',
  'Quadríceps', 'Posterior', 'Glúteos', 'Panturrilha',
  'Abdômen', 'Core', 'Lombar', 'Trapézio', 'Antebraço', 'Corpo Inteiro',
];

const difficulties = ['Iniciante', 'Intermediário', 'Avançado'] as const;

const diffBadge: Record<string, string> = {
  Iniciante: 'bg-secondary/20 text-secondary',
  'Intermediário': 'bg-accent/20 text-accent',
  'Avançado': 'bg-danger/20 text-danger',
};

export default function AdminExerciciosPage() {
  const { currentUser } = useAppStore();
  const router = useRouter();
  const [exercises, setExercises] = useState<(Exercise & { creator_name?: string })[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [muscleFilter, setMuscleFilter] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Exercise | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<Exercise | null>(null);

  // Form
  const [formName, setFormName] = useState('');
  const [formMuscle, setFormMuscle] = useState<MuscleGroup>('Peito');
  const [formEquipment, setFormEquipment] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formDifficulty, setFormDifficulty] = useState<string>('Iniciante');
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const fetchExercises = useCallback(async () => {
    try {
      const data = await apiAdminGetExercises({ search, muscle_group: muscleFilter });
      setExercises(data as (Exercise & { creator_name?: string })[]);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  }, [search, muscleFilter]);

  useEffect(() => {
    if (!currentUser || currentUser.role !== 'admin') { router.push('/'); return; }
    const t = setTimeout(() => fetchExercises(), 300);
    return () => clearTimeout(t);
  }, [currentUser, router, fetchExercises]);

  const resetForm = () => {
    setFormName(''); setFormMuscle('Peito'); setFormEquipment('');
    setFormDescription(''); setFormDifficulty('Iniciante');
    setErrorMsg(''); setSuccessMsg(''); setEditing(null);
  };

  const openCreate = () => { resetForm(); setShowModal(true); };
  const openEdit = (ex: Exercise) => {
    resetForm(); setEditing(ex);
    setFormName(ex.name); setFormMuscle(ex.muscle_group as MuscleGroup);
    setFormEquipment(ex.equipment); setFormDescription(ex.description);
    setFormDifficulty(ex.difficulty); setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true); setErrorMsg(''); setSuccessMsg('');
    try {
      const payload = { name: formName, muscle_group: formMuscle, equipment: formEquipment, description: formDescription, difficulty: formDifficulty };
      if (editing) {
        await apiAdminUpdateExercise(editing.id, payload);
        setSuccessMsg('Exercício atualizado!');
      } else {
        await apiAdminCreateExercise(payload);
        setSuccessMsg('Exercício criado!');
      }
      setTimeout(() => { setShowModal(false); resetForm(); fetchExercises(); }, 800);
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'Erro ao salvar');
    } finally { setSubmitting(false); }
  };

  const handleDelete = async () => {
    if (!confirmDelete) return;
    try { await apiAdminDeleteExercise(confirmDelete.id); setConfirmDelete(null); fetchExercises(); }
    catch (err: unknown) { alert(err instanceof Error ? err.message : 'Erro ao excluir'); }
  };

  if (!currentUser || currentUser.role !== 'admin') return null;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Gerenciar Exercícios"
        subtitle="Adicione, edite ou remova exercícios"
        icon={<BookOpen size={28} />}
        backTo={{ href: '/admin', label: 'Voltar para Dashboard' }}
        action={<Button icon={<Plus size={18} />} onClick={openCreate}>Novo Exercício</Button>}
      />

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 animate-fade-in">
        <div className="relative flex-1">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray" />
          <input type="text" placeholder="Buscar exercício..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-dark-light border border-dark-lighter text-gray-lighter text-sm focus:border-primary focus:outline-none" />
        </div>
        <div className="relative">
          <Filter size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray" />
          <select value={muscleFilter} onChange={(e) => setMuscleFilter(e.target.value)} className="pl-10 pr-8 py-2.5 rounded-xl bg-dark-light border border-dark-lighter text-gray-lighter text-sm focus:border-primary focus:outline-none appearance-none cursor-pointer">
            <option value="">Todos os grupos</option>
            {muscleGroups.map((g) => <option key={g} value={g}>{g}</option>)}
          </select>
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex justify-center py-12"><Loader2 size={32} className="text-primary animate-spin" /></div>
      ) : exercises.length === 0 ? (
        <div className="text-center py-16 animate-fade-in">
          <BookOpen size={48} className="mx-auto text-gray mb-3" />
          <p className="text-gray">Nenhum exercício encontrado.</p>
        </div>
      ) : (
        <div className="rounded-2xl bg-dark-light border border-dark-lighter overflow-hidden animate-fade-in">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-dark-lighter text-left">
                  <th className="px-4 py-3 text-gray font-semibold">Nome</th>
                  <th className="px-4 py-3 text-gray font-semibold hidden sm:table-cell">Grupo Muscular</th>
                  <th className="px-4 py-3 text-gray font-semibold hidden md:table-cell">Equipamento</th>
                  <th className="px-4 py-3 text-gray font-semibold hidden lg:table-cell">Dificuldade</th>
                  <th className="px-4 py-3 text-gray font-semibold hidden lg:table-cell">Criado por</th>
                  <th className="px-4 py-3 text-gray font-semibold text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-dark-lighter/50">
                {exercises.map((ex) => (
                  <tr key={ex.id} className="hover:bg-dark-lighter/30 transition-colors">
                    <td className="px-4 py-3 font-medium text-gray-lighter">{ex.name}</td>
                    <td className="px-4 py-3 text-gray hidden sm:table-cell">
                      <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary">{ex.muscle_group}</span>
                    </td>
                    <td className="px-4 py-3 text-gray hidden md:table-cell">{ex.equipment || '—'}</td>
                    <td className="px-4 py-3 hidden lg:table-cell">
                      <span className={`text-[11px] px-2 py-0.5 rounded-full font-semibold ${diffBadge[ex.difficulty] || ''}`}>{ex.difficulty}</span>
                    </td>
                    <td className="px-4 py-3 text-gray text-xs hidden lg:table-cell">{(ex as { creator_name?: string }).creator_name || '—'}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => openEdit(ex)} className="p-1.5 rounded-lg text-gray hover:text-primary hover:bg-primary/10 transition-colors"><Pencil size={16} /></button>
                        <button onClick={() => setConfirmDelete(ex)} className="p-1.5 rounded-lg text-gray hover:text-danger hover:bg-danger/10 transition-colors"><Trash2 size={16} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Create/Edit Modal */}
      <Modal isOpen={showModal} onClose={() => { setShowModal(false); resetForm(); }} title={editing ? 'Editar Exercício' : 'Novo Exercício'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          {errorMsg && <div className="flex items-center gap-2 p-3 rounded-xl bg-danger/10 border border-danger/20 text-danger text-sm"><AlertCircle size={16} /> {errorMsg}</div>}
          {successMsg && <div className="flex items-center gap-2 p-3 rounded-xl bg-secondary/10 border border-secondary/20 text-secondary text-sm"><Check size={16} /> {successMsg}</div>}
          <div>
            <label className="block text-sm font-medium text-gray-lighter mb-1">Nome</label>
            <input type="text" required value={formName} onChange={(e) => setFormName(e.target.value)} className="w-full px-4 py-2.5 rounded-xl bg-dark border border-dark-lighter text-gray-lighter text-sm focus:border-primary focus:outline-none" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-lighter mb-1">Grupo Muscular</label>
              <select value={formMuscle} onChange={(e) => setFormMuscle(e.target.value as MuscleGroup)} className="w-full px-4 py-2.5 rounded-xl bg-dark border border-dark-lighter text-gray-lighter text-sm focus:border-primary focus:outline-none">
                {muscleGroups.map((g) => <option key={g} value={g}>{g}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-lighter mb-1">Dificuldade</label>
              <select value={formDifficulty} onChange={(e) => setFormDifficulty(e.target.value)} className="w-full px-4 py-2.5 rounded-xl bg-dark border border-dark-lighter text-gray-lighter text-sm focus:border-primary focus:outline-none">
                {difficulties.map((d) => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-lighter mb-1">Equipamento</label>
            <input type="text" value={formEquipment} onChange={(e) => setFormEquipment(e.target.value)} className="w-full px-4 py-2.5 rounded-xl bg-dark border border-dark-lighter text-gray-lighter text-sm focus:border-primary focus:outline-none" placeholder="Ex: Barra, Halteres, Corpo Livre" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-lighter mb-1">Descrição</label>
            <textarea value={formDescription} onChange={(e) => setFormDescription(e.target.value)} rows={3} className="w-full px-4 py-2.5 rounded-xl bg-dark border border-dark-lighter text-gray-lighter text-sm focus:border-primary focus:outline-none resize-none" />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" type="button" onClick={() => { setShowModal(false); resetForm(); }}>Cancelar</Button>
            <Button type="submit" disabled={submitting}>{submitting ? <Loader2 size={16} className="animate-spin" /> : editing ? 'Salvar' : 'Criar'}</Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <Modal isOpen={!!confirmDelete} onClose={() => setConfirmDelete(null)} title="Confirmar Exclusão" size="sm">
        <div className="space-y-4">
          <p className="text-gray-lighter text-sm">Tem certeza que deseja excluir o exercício <strong>{confirmDelete?.name}</strong>? Esta ação é irreversível.</p>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setConfirmDelete(null)}>Cancelar</Button>
            <Button variant="danger" onClick={handleDelete}>Excluir</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
