'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAppStore } from '@/store/useAppStore';
import { apiAdminGetSessions, apiAdminDeleteSession } from '@/lib/api';
import PageHeader from '@/components/ui/PageHeader';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import {
  ClipboardList,
  Search,
  Trash2,
  Loader2,
  Filter,
  Calendar,
} from 'lucide-react';

interface AdminSession {
  id: string;
  trainer_id: string;
  student_id: string;
  trainer_name: string;
  trainer_avatar: string;
  student_name: string;
  student_avatar: string;
  date: string;
  time: string;
  duration: number;
  type: string;
  status: string;
  notes?: string;
}

const statusLabels: Record<string, string> = { scheduled: 'Agendada', completed: 'Concluída', cancelled: 'Cancelada' };
const statusBadge: Record<string, string> = {
  scheduled: 'bg-primary/20 text-primary',
  completed: 'bg-secondary/20 text-secondary',
  cancelled: 'bg-danger/20 text-danger',
};

export default function AdminSessoesPage() {
  const { currentUser } = useAppStore();
  const router = useRouter();
  const [sessions, setSessions] = useState<AdminSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [confirmDelete, setConfirmDelete] = useState<AdminSession | null>(null);

  const fetchSessions = useCallback(async () => {
    try {
      const data = await apiAdminGetSessions({ search, status: statusFilter });
      setSessions(data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  }, [search, statusFilter]);

  useEffect(() => {
    if (!currentUser || currentUser.role !== 'admin') { router.push('/'); return; }
    const t = setTimeout(() => fetchSessions(), 300);
    return () => clearTimeout(t);
  }, [currentUser, router, fetchSessions]);

  const handleDelete = async () => {
    if (!confirmDelete) return;
    try { await apiAdminDeleteSession(confirmDelete.id); setConfirmDelete(null); fetchSessions(); }
    catch (err: unknown) { alert(err instanceof Error ? err.message : 'Erro ao excluir'); }
  };

  const formatDate = (dateStr: string) => {
    try {
      const [y, m, d] = dateStr.split('-');
      return `${d}/${m}/${y}`;
    } catch { return dateStr; }
  };

  if (!currentUser || currentUser.role !== 'admin') return null;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Gerenciar Sessões"
        subtitle="Visualize e gerencie todas as sessões agendadas"
        icon={<ClipboardList size={28} />}
      />

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 animate-fade-in">
        <div className="relative flex-1">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray" />
          <input type="text" placeholder="Buscar por trainer ou aluno..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-dark-light border border-dark-lighter text-gray-lighter text-sm focus:border-primary focus:outline-none" />
        </div>
        <div className="relative">
          <Filter size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray" />
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="pl-10 pr-8 py-2.5 rounded-xl bg-dark-light border border-dark-lighter text-gray-lighter text-sm focus:border-primary focus:outline-none appearance-none cursor-pointer">
            <option value="">Todos os status</option>
            <option value="scheduled">Agendada</option>
            <option value="completed">Concluída</option>
            <option value="cancelled">Cancelada</option>
          </select>
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex justify-center py-12"><Loader2 size={32} className="text-primary animate-spin" /></div>
      ) : sessions.length === 0 ? (
        <div className="text-center py-16 animate-fade-in">
          <Calendar size={48} className="mx-auto text-gray mb-3" />
          <p className="text-gray">Nenhuma sessão encontrada.</p>
        </div>
      ) : (
        <div className="rounded-2xl bg-dark-light border border-dark-lighter overflow-hidden animate-fade-in">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-dark-lighter text-left">
                  <th className="px-4 py-3 text-gray font-semibold">Data</th>
                  <th className="px-4 py-3 text-gray font-semibold">Horário</th>
                  <th className="px-4 py-3 text-gray font-semibold hidden sm:table-cell">Trainer</th>
                  <th className="px-4 py-3 text-gray font-semibold hidden sm:table-cell">Aluno</th>
                  <th className="px-4 py-3 text-gray font-semibold hidden md:table-cell">Tipo</th>
                  <th className="px-4 py-3 text-gray font-semibold">Status</th>
                  <th className="px-4 py-3 text-gray font-semibold text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-dark-lighter/50">
                {sessions.map((s) => (
                  <tr key={s.id} className="hover:bg-dark-lighter/30 transition-colors">
                    <td className="px-4 py-3 font-medium text-gray-lighter">{formatDate(s.date)}</td>
                    <td className="px-4 py-3 text-gray-lighter">{s.time}</td>
                    <td className="px-4 py-3 hidden sm:table-cell">
                      <div className="flex items-center gap-2">
                        <span className="text-sm">{s.trainer_avatar}</span>
                        <span className="text-gray text-xs">{s.trainer_name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 hidden sm:table-cell">
                      <div className="flex items-center gap-2">
                        <span className="text-sm">{s.student_avatar}</span>
                        <span className="text-gray text-xs">{s.student_name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray hidden md:table-cell">{s.type}</td>
                    <td className="px-4 py-3">
                      <span className={`text-[11px] px-2 py-0.5 rounded-full font-semibold ${statusBadge[s.status] || ''}`}>
                        {statusLabels[s.status] || s.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end">
                        <button onClick={() => setConfirmDelete(s)} className="p-1.5 rounded-lg text-gray hover:text-danger hover:bg-danger/10 transition-colors"><Trash2 size={16} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      <Modal isOpen={!!confirmDelete} onClose={() => setConfirmDelete(null)} title="Confirmar Exclusão" size="sm">
        <div className="space-y-4">
          <p className="text-gray-lighter text-sm">
            Tem certeza que deseja excluir a sessão de <strong>{confirmDelete?.trainer_name}</strong> com <strong>{confirmDelete?.student_name}</strong> em {confirmDelete ? formatDate(confirmDelete.date) : ''}?
          </p>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setConfirmDelete(null)}>Cancelar</Button>
            <Button variant="danger" onClick={handleDelete}>Excluir</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
