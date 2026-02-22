'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAppStore } from '@/store/useAppStore';
import { apiAdminGetWorkouts, apiAdminDeleteWorkout } from '@/lib/api';
import PageHeader from '@/components/ui/PageHeader';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import {
  Dumbbell,
  Search,
  Trash2,
  Loader2,
  Eye,
  X,
  Users,
  BookOpen,
} from 'lucide-react';

interface AdminWorkout {
  id: string;
  name: string;
  description: string;
  trainer_name: string;
  trainer_avatar: string;
  student_name: string;
  student_avatar: string;
  day_of_week: string;
  is_active: number;
  exercise_count: number;
  created_at: string;
}

export default function AdminTreinosPage() {
  const { currentUser } = useAppStore();
  const router = useRouter();
  const [workouts, setWorkouts] = useState<AdminWorkout[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [confirmDelete, setConfirmDelete] = useState<AdminWorkout | null>(null);
  const [viewDetail, setViewDetail] = useState<AdminWorkout | null>(null);

  const fetchWorkouts = useCallback(async () => {
    try {
      const data = await apiAdminGetWorkouts({ search });
      setWorkouts(data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  }, [search]);

  useEffect(() => {
    if (!currentUser || currentUser.role !== 'admin') { router.push('/'); return; }
    const t = setTimeout(() => fetchWorkouts(), 300);
    return () => clearTimeout(t);
  }, [currentUser, router, fetchWorkouts]);

  const handleDelete = async () => {
    if (!confirmDelete) return;
    try { await apiAdminDeleteWorkout(confirmDelete.id); setConfirmDelete(null); fetchWorkouts(); }
    catch (err: unknown) { alert(err instanceof Error ? err.message : 'Erro ao excluir'); }
  };

  const formatDays = (dayStr: string) => {
    try {
      const days = JSON.parse(dayStr);
      return Array.isArray(days) ? days.join(', ') : dayStr;
    } catch { return dayStr; }
  };

  if (!currentUser || currentUser.role !== 'admin') return null;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Gerenciar Treinos"
        subtitle="Visualize e gerencie todos os planos de treino"
        icon={<Dumbbell size={28} />}
        backTo={{ href: '/admin', label: 'Voltar para Dashboard' }}
      />

      {/* Search */}
      <div className="flex flex-col sm:flex-row gap-3 animate-fade-in">
        <div className="relative flex-1">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray" />
          <input type="text" placeholder="Buscar por nome, trainer ou aluno..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-dark-light border border-dark-lighter text-gray-lighter text-sm focus:border-primary focus:outline-none" />
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex justify-center py-12"><Loader2 size={32} className="text-primary animate-spin" /></div>
      ) : workouts.length === 0 ? (
        <div className="text-center py-16 animate-fade-in">
          <Dumbbell size={48} className="mx-auto text-gray mb-3" />
          <p className="text-gray">Nenhum treino encontrado.</p>
        </div>
      ) : (
        <div className="rounded-2xl bg-dark-light border border-dark-lighter overflow-hidden animate-fade-in">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-dark-lighter text-left">
                  <th className="px-4 py-3 text-gray font-semibold">Treino</th>
                  <th className="px-4 py-3 text-gray font-semibold hidden sm:table-cell">Trainer</th>
                  <th className="px-4 py-3 text-gray font-semibold hidden sm:table-cell">Aluno</th>
                  <th className="px-4 py-3 text-gray font-semibold hidden md:table-cell">Dias</th>
                  <th className="px-4 py-3 text-gray font-semibold hidden md:table-cell">Exercícios</th>
                  <th className="px-4 py-3 text-gray font-semibold hidden lg:table-cell">Status</th>
                  <th className="px-4 py-3 text-gray font-semibold text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-dark-lighter/50">
                {workouts.map((w) => (
                  <tr key={w.id} className="hover:bg-dark-lighter/30 transition-colors">
                    <td className="px-4 py-3 font-medium text-gray-lighter">{w.name}</td>
                    <td className="px-4 py-3 hidden sm:table-cell">
                      <div className="flex items-center gap-2">
                        <span className="text-sm">{w.trainer_avatar}</span>
                        <span className="text-gray text-xs">{w.trainer_name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 hidden sm:table-cell">
                      <div className="flex items-center gap-2">
                        <span className="text-sm">{w.student_avatar}</span>
                        <span className="text-gray text-xs">{w.student_name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray text-xs hidden md:table-cell">{formatDays(w.day_of_week)}</td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary">{w.exercise_count}</span>
                    </td>
                    <td className="px-4 py-3 hidden lg:table-cell">
                      <span className={`text-[11px] px-2 py-0.5 rounded-full font-semibold ${w.is_active ? 'bg-secondary/20 text-secondary' : 'bg-gray/20 text-gray'}`}>
                        {w.is_active ? 'Ativo' : 'Inativo'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => setViewDetail(w)} className="p-1.5 rounded-lg text-gray hover:text-primary hover:bg-primary/10 transition-colors"><Eye size={16} /></button>
                        <button onClick={() => setConfirmDelete(w)} className="p-1.5 rounded-lg text-gray hover:text-danger hover:bg-danger/10 transition-colors"><Trash2 size={16} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      <Modal isOpen={!!viewDetail} onClose={() => setViewDetail(null)} title="Detalhes do Treino">
        {viewDetail && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 rounded-xl bg-dark/50 border border-dark-lighter/50">
                <p className="text-[11px] text-gray uppercase mb-1">Nome</p>
                <p className="text-sm font-semibold text-gray-lighter">{viewDetail.name}</p>
              </div>
              <div className="p-3 rounded-xl bg-dark/50 border border-dark-lighter/50">
                <p className="text-[11px] text-gray uppercase mb-1">Status</p>
                <p className={`text-sm font-semibold ${viewDetail.is_active ? 'text-secondary' : 'text-gray'}`}>{viewDetail.is_active ? 'Ativo' : 'Inativo'}</p>
              </div>
              <div className="p-3 rounded-xl bg-dark/50 border border-dark-lighter/50">
                <p className="text-[11px] text-gray uppercase mb-1">Trainer</p>
                <div className="flex items-center gap-2">
                  <span>{viewDetail.trainer_avatar}</span>
                  <span className="text-sm text-gray-lighter">{viewDetail.trainer_name}</span>
                </div>
              </div>
              <div className="p-3 rounded-xl bg-dark/50 border border-dark-lighter/50">
                <p className="text-[11px] text-gray uppercase mb-1">Aluno</p>
                <div className="flex items-center gap-2">
                  <span>{viewDetail.student_avatar}</span>
                  <span className="text-sm text-gray-lighter">{viewDetail.student_name}</span>
                </div>
              </div>
              <div className="p-3 rounded-xl bg-dark/50 border border-dark-lighter/50">
                <p className="text-[11px] text-gray uppercase mb-1">Dias</p>
                <p className="text-sm text-gray-lighter">{formatDays(viewDetail.day_of_week)}</p>
              </div>
              <div className="p-3 rounded-xl bg-dark/50 border border-dark-lighter/50">
                <p className="text-[11px] text-gray uppercase mb-1">Exercícios</p>
                <p className="text-sm text-gray-lighter">{viewDetail.exercise_count}</p>
              </div>
            </div>
            {viewDetail.description && (
              <div className="p-3 rounded-xl bg-dark/50 border border-dark-lighter/50">
                <p className="text-[11px] text-gray uppercase mb-1">Descrição</p>
                <p className="text-sm text-gray-lighter">{viewDetail.description}</p>
              </div>
            )}
            <div className="flex justify-end">
              <Button variant="outline" onClick={() => setViewDetail(null)}>Fechar</Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Delete Confirmation */}
      <Modal isOpen={!!confirmDelete} onClose={() => setConfirmDelete(null)} title="Confirmar Exclusão" size="sm">
        <div className="space-y-4">
          <p className="text-gray-lighter text-sm">Tem certeza que deseja excluir o treino <strong>{confirmDelete?.name}</strong>? Todos os exercícios e dados associados serão removidos.</p>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setConfirmDelete(null)}>Cancelar</Button>
            <Button variant="danger" onClick={handleDelete}>Excluir</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
