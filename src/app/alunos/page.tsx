'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAppStore } from '@/store/useAppStore';
import { apiSearchStudents } from '@/lib/api';
import { User } from '@/types';
import PageHeader from '@/components/ui/PageHeader';
import {
  Users, Mail, Phone, Plus, Search,
  X, UserPlus, Check, Copy, Loader2, AlertCircle,
  User as UserIcon,
} from 'lucide-react';
import Link from 'next/link';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import { formatPhone } from '@/lib/format';

export default function AlunosPage() {
  const { currentUser, users, workoutPlans, progress, fetchUsers, fetchWorkouts, fetchProgress, addStudent } = useAppStore();
  const router = useRouter();

  const [showModal, setShowModal] = useState(false);
  const [tab, setTab] = useState<'search' | 'new'>('search');

  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [searching, setSearching] = useState(false);

  // New student state
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPhone, setNewPhone] = useState('');

  // Shared state
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [tempPassword, setTempPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!currentUser || currentUser.role !== 'trainer') {
      router.push('/');
      return;
    }
    fetchUsers();
    fetchWorkouts();
    fetchProgress();
  }, [currentUser, router, fetchUsers, fetchWorkouts, fetchProgress]);

  // Debounced search
  useEffect(() => {
    if (searchQuery.length < 2) {
      setSearchResults([]);
      return;
    }
    const timer = setTimeout(async () => {
      setSearching(true);
      try {
        const results = await apiSearchStudents(searchQuery);
        setSearchResults(results);
      } catch {
        setSearchResults([]);
      }
      setSearching(false);
    }, 400);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const resetModal = useCallback(() => {
    setSearchQuery('');
    setSearchResults([]);
    setNewName('');
    setNewEmail('');
    setNewPhone('');
    setSuccessMsg('');
    setTempPassword('');
    setErrorMsg('');
    setCopied(false);
    setTab('search');
  }, []);

  const openModal = () => {
    resetModal();
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    resetModal();
  };

  const handleLinkStudent = async (student: User) => {
    setSubmitting(true);
    setErrorMsg('');
    try {
      const result = await addStudent({ email: student.email });
      setSuccessMsg(result.message);
    } catch (e: unknown) {
      setErrorMsg(e instanceof Error ? e.message : 'Erro ao vincular aluno');
    }
    setSubmitting(false);
  };

  const handleCreateStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newEmail.trim()) return;
    setSubmitting(true);
    setErrorMsg('');
    try {
      const result = await addStudent({ email: newEmail.trim(), name: newName.trim(), phone: newPhone.trim() || undefined });
      setSuccessMsg(result.message);
      if (result.tempPassword) setTempPassword(result.tempPassword);
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'Erro ao criar aluno');
    }
    setSubmitting(false);
  };

  const copyPassword = () => {
    navigator.clipboard.writeText(tempPassword);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!currentUser) return null;

  const students = users.filter((u) => u.role === 'student');

  return (
    <div>
      <PageHeader
        title="Alunos"
        subtitle={`${students.length} aluno${students.length !== 1 ? 's' : ''} cadastrado${students.length !== 1 ? 's' : ''}`}
        icon={<Users size={24} />}
        action={
          <Button icon={<Plus size={18} />} onClick={openModal}>
            Adicionar Aluno
          </Button>
        }
      />

      {/* Students grid */}
      {students.length === 0 ? (
        <div className="text-center py-16">
          <Users size={48} className="mx-auto mb-4 text-gray/40" />
          <p className="text-gray text-lg mb-2">Nenhum aluno cadastrado</p>
          <p className="text-gray/60 text-sm">Clique em &quot;Adicionar Aluno&quot; para começar</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {students.map((student, index) => {
            const studentPlans = workoutPlans.filter(
              (p) => p.student_id === student.id && p.is_active
            );
            const studentProgress = progress.filter(
              (p) => p.student_id === student.id
            );
            const latestProgress = studentProgress[studentProgress.length - 1];

            return (
              <Link
                key={student.id}
                href={`/alunos/${student.id}`}
                className="block rounded-2xl bg-dark-light border border-dark-lighter p-5 card-hover animate-fade-in hover:border-primary/30 transition-all"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                {/* Avatar & Name */}
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary/30 to-secondary/30 flex items-center justify-center text-2xl">
                    {student.avatar}
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-lighter">{student.name}</h3>
                    <p className="text-xs text-gray">Desde {new Date(student.created_at).toLocaleDateString('pt-BR')}</p>
                  </div>
                </div>

                {/* Info */}
                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2 text-xs text-gray">
                    <Mail size={14} />
                    <span className="truncate">{student.email}</span>
                  </div>
                  {student.phone && (
                    <div className="flex items-center gap-2 text-xs text-gray">
                      <Phone size={14} />
                      <span>{formatPhone(student.phone!)}</span>
                    </div>
                  )}
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-2 mb-4">
                  <div className="p-2 rounded-lg bg-dark/50 text-center">
                    <p className="text-lg font-bold text-primary">{studentPlans.length}</p>
                    <p className="text-[10px] text-gray">Treinos</p>
                  </div>
                  <div className="p-2 rounded-lg bg-dark/50 text-center">
                    <p className="text-lg font-bold text-secondary">
                      {latestProgress ? `${latestProgress.weight}` : '--'}
                    </p>
                    <p className="text-[10px] text-gray">Peso (kg)</p>
                  </div>
                  <div className="p-2 rounded-lg bg-dark/50 text-center">
                    <p className="text-lg font-bold text-accent">
                      {latestProgress?.body_fat ? `${latestProgress.body_fat}` : '--'}
                    </p>
                    <p className="text-[10px] text-gray">% Gord.</p>
                  </div>
                </div>

                {/* Action */}
                <div className="flex">
                  <span
                    className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-primary/10 text-primary text-xs font-semibold"
                  >
                    <UserIcon size={14} /> Ver Perfil →
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      )}

      {/* ===== Add Student Modal ===== */}
      <Modal
        isOpen={showModal}
        onClose={closeModal}
        title="Adicionar Aluno"
      >
        <div className="space-y-4">
            {/* Success state */}
            {successMsg ? (
              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-success/10 border border-success/20">
                  <div className="flex items-center gap-2 text-success font-semibold text-sm mb-1">
                    <Check size={18} /> Sucesso!
                  </div>
                  <p className="text-gray-lighter text-sm">{successMsg}</p>
                </div>
                {tempPassword && (
                  <div className="p-4 rounded-xl bg-warning/10 border border-warning/20">
                    <p className="text-warning text-xs font-semibold mb-2">Senha temporária do aluno:</p>
                    <div className="flex items-center gap-2">
                      <code className="flex-1 px-3 py-2 rounded-lg bg-dark text-gray-lighter font-mono text-sm tracking-wider">
                        {tempPassword}
                      </code>
                      <button
                        onClick={copyPassword}
                        className="p-2 rounded-lg bg-dark hover:bg-dark-lighter text-gray hover:text-gray-lighter transition-colors"
                        title="Copiar senha"
                      >
                        {copied ? <Check size={16} className="text-success" /> : <Copy size={16} />}
                      </button>
                    </div>
                    <p className="text-gray text-[11px] mt-2">Anote e envie esta senha ao aluno. Ele poderá alterá-la nas configurações.</p>
                  </div>
                )}
                <div className="flex justify-end pt-2">
                  <Button onClick={closeModal}>Fechar</Button>
                </div>
              </div>
            ) : (
              <>
                {/* Tabs */}
                <div className="flex gap-1 mb-1 p-1 rounded-xl bg-dark/50">
                  <button
                    onClick={() => setTab('search')}
                    className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-sm font-medium transition-all ${
                      tab === 'search' ? 'bg-primary text-white' : 'text-gray hover:text-gray-lighter'
                    }`}
                  >
                    <Search size={15} /> Buscar Existente
                  </button>
                  <button
                    onClick={() => setTab('new')}
                    className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-sm font-medium transition-all ${
                      tab === 'new' ? 'bg-primary text-white' : 'text-gray hover:text-gray-lighter'
                    }`}
                  >
                    <UserPlus size={15} /> Novo Aluno
                  </button>
                </div>

                {errorMsg && (
                  <div className="p-3 rounded-xl bg-danger/10 border border-danger/20 flex items-center gap-2 text-danger text-sm">
                    <AlertCircle size={16} /> {errorMsg}
                  </div>
                )}

                {/* Search Tab */}
                {tab === 'search' && (
                  <div>
                    <div className="relative mb-4">
                      <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray" />
                      <input
                        type="text"
                        placeholder="Buscar por nome ou e-mail..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-dark border border-dark-lighter text-gray-lighter text-sm placeholder:text-gray focus:outline-none focus:border-primary"
                        autoFocus
                      />
                      {searching && <Loader2 size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-primary animate-spin" />}
                    </div>

                    {searchQuery.length > 0 && searchQuery.length < 2 && (
                      <p className="text-gray text-xs text-center py-4">Digite pelo menos 2 caracteres</p>
                    )}

                    {searchQuery.length >= 2 && !searching && searchResults.length === 0 && (
                      <div className="text-center py-6">
                        <p className="text-gray text-sm mb-2">Nenhum aluno encontrado</p>
                        <button
                          onClick={() => { setTab('new'); setNewEmail(searchQuery.includes('@') ? searchQuery : ''); }}
                          className="text-primary text-sm font-semibold hover:underline"
                        >
                          Criar novo aluno →
                        </button>
                      </div>
                    )}

                    <div className="space-y-2 max-h-64 overflow-y-auto">
                      {searchResults.map((result) => (
                        <div
                          key={result.id}
                          className="flex items-center gap-3 p-3 rounded-xl bg-dark/50 border border-dark-lighter hover:border-primary/30 transition-colors"
                        >
                          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center text-lg">
                            {result.avatar}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-gray-lighter truncate">{result.name}</p>
                            <p className="text-xs text-gray truncate">{result.email}</p>
                          </div>
                          <button
                            onClick={() => handleLinkStudent(result)}
                            disabled={submitting}
                            className="px-3 py-1.5 rounded-lg bg-primary/10 text-primary text-xs font-semibold hover:bg-primary/20 transition-colors disabled:opacity-50"
                          >
                            {submitting ? <Loader2 size={14} className="animate-spin" /> : 'Vincular'}
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* New Student Tab */}
                {tab === 'new' && (
                  <form onSubmit={handleCreateStudent} className="space-y-4">
                    <div>
                      <label className="block text-xs font-medium text-gray mb-1.5">Nome do aluno *</label>
                      <input
                        type="text"
                        value={newName}
                        onChange={(e) => setNewName(e.target.value)}
                        placeholder="Ex: João Silva"
                        required
                        className="w-full bg-dark border border-dark-lighter rounded-xl px-3 py-2.5 text-sm text-gray-lighter placeholder:text-gray focus:outline-none focus:border-primary"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray mb-1.5">E-mail do aluno *</label>
                      <input
                        type="email"
                        value={newEmail}
                        onChange={(e) => setNewEmail(e.target.value)}
                        placeholder="aluno@email.com"
                        required
                        className="w-full bg-dark border border-dark-lighter rounded-xl px-3 py-2.5 text-sm text-gray-lighter placeholder:text-gray focus:outline-none focus:border-primary"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray mb-1.5">Telefone (opcional)</label>
                      <input
                        type="tel"
                        value={newPhone}
                        onChange={(e) => setNewPhone(formatPhone(e.target.value))}
                        placeholder="(11) 99999-9999"
                        className="w-full bg-dark border border-dark-lighter rounded-xl px-3 py-2.5 text-sm text-gray-lighter placeholder:text-gray focus:outline-none focus:border-primary"
                      />
                    </div>
                    <p className="text-gray text-[11px]">Uma senha temporária será gerada automaticamente. Envie ao aluno para que ele possa acessar a plataforma.</p>
                    <div className="flex justify-end gap-2 pt-2">
                      <Button variant="outline" onClick={closeModal} type="button">
                        Cancelar
                      </Button>
                      <Button
                        type="submit"
                        disabled={submitting || !newName.trim() || !newEmail.trim()}
                      >
                        {submitting ? <Loader2 size={16} className="animate-spin" /> : <UserPlus size={16} />}
                        Criar Aluno
                      </Button>
                    </div>
                  </form>
                )}
              </>
            )}
        </div>
      </Modal>
    </div>
  );
}
