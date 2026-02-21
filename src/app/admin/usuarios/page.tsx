'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAppStore } from '@/store/useAppStore';
import {
  apiAdminGetUsers,
  apiAdminCreateUser,
  apiAdminUpdateUser,
  apiAdminDeleteUser,
} from '@/lib/api';
import type { User, UserRole } from '@/types';
import { formatPhone, formatCREF, getPasswordStrength } from '@/lib/format';
import PageHeader from '@/components/ui/PageHeader';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import {
  Users,
  Plus,
  Search,
  Pencil,
  Trash2,
  Loader2,
  AlertCircle,
  Check,
  Filter,
  Eye,
  EyeOff,
} from 'lucide-react';

const roleLabels: Record<string, string> = { admin: 'Admin', trainer: 'Trainer', student: 'Aluno' };
const roleBadge: Record<string, string> = {
  admin: 'bg-accent/20 text-accent',
  trainer: 'bg-primary/20 text-primary',
  student: 'bg-secondary/20 text-secondary',
};

export default function AdminUsuariosPage() {
  const { currentUser } = useAppStore();
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<User | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<User | null>(null);

  // Form state
  const [formName, setFormName] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formPassword, setFormPassword] = useState('');
  const [formRole, setFormRole] = useState<UserRole>('student');
  const [formPhone, setFormPhone] = useState('');
  const [formCref, setFormCref] = useState('');
  const [formVerified, setFormVerified] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const fetchUsers = useCallback(async () => {
    try {
      const data = await apiAdminGetUsers({ search, role: roleFilter });
      setUsers(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [search, roleFilter]);

  useEffect(() => {
    if (!currentUser || currentUser.role !== 'admin') {
      router.push('/');
      return;
    }
    const t = setTimeout(() => fetchUsers(), 300);
    return () => clearTimeout(t);
  }, [currentUser, router, fetchUsers]);

  const resetForm = () => {
    setFormName(''); setFormEmail(''); setFormPassword('');
    setFormRole('student'); setFormPhone(''); setFormCref('');
    setFormVerified(false); setShowPassword(false);
    setErrorMsg(''); setSuccessMsg('');
    setEditing(null);
  };

  const openCreate = () => {
    resetForm();
    setShowModal(true);
  };

  const openEdit = (u: User) => {
    resetForm();
    setEditing(u);
    setFormName(u.name);
    setFormEmail(u.email);
    setFormRole(u.role);
    setFormPhone(u.phone ? formatPhone(u.phone) : '');
    setFormCref(u.cref ? formatCREF(u.cref) : '');
    setFormVerified(!!u.email_verified);
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorMsg('');
    setSuccessMsg('');
    try {
      if (editing) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const payload: any = { name: formName, email: formEmail, role: formRole, phone: formPhone, cref: formCref, email_verified: formVerified ? 1 : 0 };
        if (formPassword) payload.password = formPassword;
        await apiAdminUpdateUser(editing.id, payload);
        setSuccessMsg('Usuário atualizado com sucesso!');
      } else {
        if (!formPassword) { setErrorMsg('Senha obrigatória para novo usuário'); setSubmitting(false); return; }
        await apiAdminCreateUser({ name: formName, email: formEmail, password: formPassword, role: formRole, phone: formPhone, cref: formCref, email_verified: formVerified ? 1 : 0 });
        setSuccessMsg('Usuário criado com sucesso!');
      }
      setTimeout(() => { setShowModal(false); resetForm(); fetchUsers(); }, 800);
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'Erro ao salvar');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!confirmDelete) return;
    try {
      await apiAdminDeleteUser(confirmDelete.id);
      setConfirmDelete(null);
      fetchUsers();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Erro ao excluir');
    }
  };

  if (!currentUser || currentUser.role !== 'admin') return null;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Gerenciar Usuários"
        subtitle="Adicione, edite ou remova usuários da plataforma"
        icon={<Users size={28} />}
        action={<Button icon={<Plus size={18} />} onClick={openCreate}>Novo Usuário</Button>}
      />

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 animate-fade-in">
        <div className="relative flex-1">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray" />
          <input
            type="text"
            placeholder="Buscar por nome ou email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-dark-light border border-dark-lighter text-gray-lighter text-sm focus:border-primary focus:outline-none"
          />
        </div>
        <div className="relative">
          <Filter size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray" />
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="pl-10 pr-8 py-2.5 rounded-xl bg-dark-light border border-dark-lighter text-gray-lighter text-sm focus:border-primary focus:outline-none appearance-none cursor-pointer"
          >
            <option value="">Todos os papéis</option>
            <option value="admin">Admin</option>
            <option value="trainer">Trainer</option>
            <option value="student">Aluno</option>
          </select>
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 size={32} className="text-primary animate-spin" />
        </div>
      ) : users.length === 0 ? (
        <div className="text-center py-16 animate-fade-in">
          <Users size={48} className="mx-auto text-gray mb-3" />
          <p className="text-gray">Nenhum usuário encontrado.</p>
        </div>
      ) : (
        <div className="rounded-2xl bg-dark-light border border-dark-lighter overflow-hidden animate-fade-in">
          <div className="w-full">
            <table className="w-full text-sm table-fixed">
              <thead>
                <tr className="border-b border-dark-lighter text-left">
                  <th className="px-2 sm:px-4 py-3 text-gray font-semibold w-[45%] sm:w-[30%]">Usuário</th>
                  <th className="px-2 sm:px-4 py-3 text-gray font-semibold hidden sm:table-cell w-[25%]">Email</th>
                  <th className="px-2 sm:px-4 py-3 text-gray font-semibold w-[30%] sm:w-[12%]">Papel</th>
                  <th className="px-2 sm:px-4 py-3 text-gray font-semibold hidden lg:table-cell w-[13%]">Telefone</th>
                  <th className="px-2 sm:px-4 py-3 text-gray font-semibold hidden md:table-cell w-[10%]">Verificado</th>
                  <th className="px-2 sm:px-4 py-3 text-gray font-semibold text-right w-[25%] sm:w-[10%]">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-dark-lighter/50">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-dark-lighter/30 transition-colors">
                    <td className="px-2 sm:px-4 py-3">
                      <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary/30 to-secondary/30 flex items-center justify-center text-sm shrink-0">
                          {u.avatar}
                        </div>
                        <span className="font-medium text-gray-lighter truncate">{u.name}</span>
                      </div>
                    </td>
                    <td className="px-2 sm:px-4 py-3 text-gray hidden sm:table-cell truncate">{u.email}</td>
                    <td className="px-2 sm:px-4 py-3">
                      <span className={`text-[11px] px-2 py-0.5 rounded-full font-semibold ${roleBadge[u.role] || ''}`}>
                        {roleLabels[u.role] || u.role}
                      </span>
                    </td>
                    <td className="px-2 sm:px-4 py-3 text-gray text-sm hidden lg:table-cell">{u.phone ? formatPhone(u.phone) : '—'}</td>
                    <td className="px-2 sm:px-4 py-3 hidden md:table-cell">
                      {u.email_verified ? (
                        <Check size={16} className="text-secondary" />
                      ) : (
                        <AlertCircle size={16} className="text-danger" />
                      )}
                    </td>
                    <td className="px-2 sm:px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => openEdit(u)} className="p-1.5 rounded-lg text-gray hover:text-primary hover:bg-primary/10 transition-colors" title="Editar">
                          <Pencil size={16} />
                        </button>
                        <button onClick={() => setConfirmDelete(u)} className="p-1.5 rounded-lg text-gray hover:text-danger hover:bg-danger/10 transition-colors" title="Excluir">
                          <Trash2 size={16} />
                        </button>
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
      <Modal isOpen={showModal} onClose={() => { setShowModal(false); resetForm(); }} title={editing ? 'Editar Usuário' : 'Novo Usuário'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          {errorMsg && (
            <div className="flex items-center gap-2 p-3 rounded-xl bg-danger/10 border border-danger/20 text-danger text-sm">
              <AlertCircle size={16} /> {errorMsg}
            </div>
          )}
          {successMsg && (
            <div className="flex items-center gap-2 p-3 rounded-xl bg-secondary/10 border border-secondary/20 text-secondary text-sm">
              <Check size={16} /> {successMsg}
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-gray-lighter mb-1">Nome</label>
            <input type="text" required value={formName} onChange={(e) => setFormName(e.target.value)} className="w-full px-4 py-2.5 rounded-xl bg-dark border border-dark-lighter text-gray-lighter text-sm focus:border-primary focus:outline-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-lighter mb-1">Email</label>
            <input type="email" required value={formEmail} onChange={(e) => setFormEmail(e.target.value)} className="w-full px-4 py-2.5 rounded-xl bg-dark border border-dark-lighter text-gray-lighter text-sm focus:border-primary focus:outline-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-lighter mb-1">Senha {editing && <span className="text-gray text-xs">(deixe em branco para manter)</span>}</label>
            <div className="relative">
              <input type={showPassword ? 'text' : 'password'} value={formPassword} onChange={(e) => setFormPassword(e.target.value)} className="w-full px-4 py-2.5 pr-10 rounded-xl bg-dark border border-dark-lighter text-gray-lighter text-sm focus:border-primary focus:outline-none" {...(!editing ? { required: true } : {})} />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray hover:text-gray-lighter transition-colors">
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {formPassword && (() => {
              const { score, label, color } = getPasswordStrength(formPassword);
              return (
                <div className="mt-2">
                  <div className="flex gap-1 mb-1">
                    {[0, 1, 2, 3].map((i) => (
                      <div key={i} className="h-1 flex-1 rounded-full transition-colors duration-300" style={{ backgroundColor: i < score ? color : 'var(--color-dark-lighter)' }} />
                    ))}
                  </div>
                  <p className="text-xs font-medium" style={{ color }}>{label}</p>
                </div>
              );
            })()}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-lighter mb-1">Papel</label>
              <select value={formRole} onChange={(e) => setFormRole(e.target.value as UserRole)} className="w-full px-4 py-2.5 rounded-xl bg-dark border border-dark-lighter text-gray-lighter text-sm focus:border-primary focus:outline-none">
                <option value="student">Aluno</option>
                <option value="trainer">Trainer</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-lighter mb-1">Telefone</label>
              <input type="tel" value={formPhone} onChange={(e) => setFormPhone(formatPhone(e.target.value))} placeholder="(11) 99999-0000" className="w-full px-4 py-2.5 rounded-xl bg-dark border border-dark-lighter text-gray-lighter text-sm focus:border-primary focus:outline-none" />
            </div>
          </div>
          {formRole === 'trainer' && (
            <div>
              <label className="block text-sm font-medium text-gray-lighter mb-1">CREF</label>
              <input type="text" value={formCref} onChange={(e) => setFormCref(formatCREF(e.target.value))} placeholder="000000-G/SP" className="w-full px-4 py-2.5 rounded-xl bg-dark border border-dark-lighter text-gray-lighter text-sm focus:border-primary focus:outline-none" />
            </div>
          )}
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={formVerified} onChange={(e) => setFormVerified(e.target.checked)} className="w-4 h-4 rounded border-dark-lighter text-primary focus:ring-primary bg-dark" />
            <span className="text-sm text-gray-lighter">Email verificado</span>
          </label>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" type="button" onClick={() => { setShowModal(false); resetForm(); }}>Cancelar</Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? <Loader2 size={16} className="animate-spin" /> : editing ? 'Salvar' : 'Criar'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal isOpen={!!confirmDelete} onClose={() => setConfirmDelete(null)} title="Confirmar Exclusão" size="sm">
        <div className="space-y-4">
          <p className="text-gray-lighter text-sm">
            Tem certeza que deseja excluir o usuário <strong>{confirmDelete?.name}</strong>? Esta ação é irreversível e todos os dados relacionados serão removidos.
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
