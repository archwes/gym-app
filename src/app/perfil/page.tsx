'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAppStore } from '@/store/useAppStore';
import { apiChangePassword } from '@/lib/api';
import PageHeader from '@/components/ui/PageHeader';
import Button from '@/components/ui/Button';
import { User, Save, Lock, Check, AlertCircle, Loader2, Eye, EyeOff } from 'lucide-react';
import { formatPhone } from '@/lib/format';

export default function PerfilPage() {
  const { currentUser, updateProfile } = useAppStore();
  const router = useRouter();

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [avatar, setAvatar] = useState('');

  const [saving, setSaving] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState('');
  const [profileError, setProfileError] = useState('');

  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const [passwordError, setPasswordError] = useState('');

  useEffect(() => {
    if (!currentUser) {
      router.push('/');
      return;
    }
    setName(currentUser.name);
    setPhone(currentUser.phone ? formatPhone(currentUser.phone) : '');
    setAvatar(currentUser.avatar || '');
  }, [currentUser, router]);

  if (!currentUser) return null;

  const handleProfileSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setProfileError('');
    setProfileSuccess('');
    try {
      await updateProfile({
        name: name.trim() || undefined,
        phone: phone.trim() || undefined,
        avatar: avatar.trim() || undefined,
      });
      setProfileSuccess('Perfil atualizado com sucesso!');
      setTimeout(() => setProfileSuccess(''), 3000);
    } catch (err: unknown) {
      setProfileError(err instanceof Error ? err.message : 'Erro ao salvar');
    }
    setSaving(false);
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordSuccess('');

    if (newPassword.length < 6) {
      setPasswordError('A nova senha deve ter pelo menos 6 caracteres');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError('As senhas não coincidem');
      return;
    }

    setChangingPassword(true);
    try {
      await apiChangePassword(oldPassword, newPassword);
      setPasswordSuccess('Senha alterada com sucesso!');
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => setPasswordSuccess(''), 3000);
    } catch (err: unknown) {
      setPasswordError(err instanceof Error ? err.message : 'Erro ao alterar senha');
    }
    setChangingPassword(false);
  };

  const avatarOptions = ['🏋️', '💪', '🧑', '👩', '🏃', '⚡', '🔥', '🥇', '🎯', '💪🏽', '🧑‍💻', '👤'];

  return (
    <div>
      <PageHeader
        title="Meu Perfil"
        subtitle="Gerencie suas informações pessoais"
        icon={<User size={24} />}
      />

      <div className="max-w-2xl mx-auto space-y-6">
        {/* Profile Info */}
        <form onSubmit={handleProfileSave} className="rounded-2xl bg-dark-light border border-dark-lighter p-6">
          <h3 className="text-base font-bold text-gray-lighter mb-4 flex items-center gap-2">
            <User size={18} className="text-primary" /> Informações Pessoais
          </h3>

          {profileSuccess && (
            <div className="mb-4 p-3 rounded-xl bg-success/10 border border-success/20 flex items-center gap-2 text-success text-sm">
              <Check size={16} /> {profileSuccess}
            </div>
          )}
          {profileError && (
            <div className="mb-4 p-3 rounded-xl bg-danger/10 border border-danger/20 flex items-center gap-2 text-danger text-sm">
              <AlertCircle size={16} /> {profileError}
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-gray mb-1.5">Nome</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-dark border border-dark-lighter rounded-xl px-3 py-2.5 text-sm text-gray-lighter focus:outline-none focus:border-primary"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray mb-1.5">E-mail</label>
              <input
                type="email"
                value={currentUser.email}
                disabled
                className="w-full bg-dark/50 border border-dark-lighter rounded-xl px-3 py-2.5 text-sm text-gray/60 cursor-not-allowed"
              />
              <p className="text-gray/50 text-[11px] mt-1">O e-mail não pode ser alterado</p>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray mb-1.5">Telefone</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(formatPhone(e.target.value))}
                placeholder="(11) 99999-9999"
                className="w-full bg-dark border border-dark-lighter rounded-xl px-3 py-2.5 text-sm text-gray-lighter placeholder:text-gray focus:outline-none focus:border-primary"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray mb-2">Avatar</label>
              <div className="flex flex-wrap gap-2">
                {avatarOptions.map((emoji) => (
                  <button
                    key={emoji}
                    type="button"
                    onClick={() => setAvatar(emoji)}
                    className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg transition-all ${
                      avatar === emoji
                        ? 'bg-primary/20 border-2 border-primary scale-110'
                        : 'bg-dark border border-dark-lighter hover:border-primary/30'
                    }`}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <Button type="submit" disabled={saving} icon={saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}>
              Salvar Alterações
            </Button>
          </div>
        </form>

        {/* Password Change */}
        <form onSubmit={handlePasswordChange} className="rounded-2xl bg-dark-light border border-dark-lighter p-6">
          <h3 className="text-base font-bold text-gray-lighter mb-4 flex items-center gap-2">
            <Lock size={18} className="text-secondary" /> Alterar Senha
          </h3>

          {passwordSuccess && (
            <div className="mb-4 p-3 rounded-xl bg-success/10 border border-success/20 flex items-center gap-2 text-success text-sm">
              <Check size={16} /> {passwordSuccess}
            </div>
          )}
          {passwordError && (
            <div className="mb-4 p-3 rounded-xl bg-danger/10 border border-danger/20 flex items-center gap-2 text-danger text-sm">
              <AlertCircle size={16} /> {passwordError}
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-gray mb-1.5">Senha atual</label>
              <div className="relative">
                <input
                  type={showOld ? 'text' : 'password'}
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                  required
                  className="w-full bg-dark border border-dark-lighter rounded-xl px-3 py-2.5 pr-10 text-sm text-gray-lighter focus:outline-none focus:border-primary"
                />
                <button type="button" onClick={() => setShowOld(!showOld)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray hover:text-gray-lighter">
                  {showOld ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray mb-1.5">Nova senha</label>
              <div className="relative">
                <input
                  type={showNew ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Mínimo 6 caracteres"
                  required
                  className="w-full bg-dark border border-dark-lighter rounded-xl px-3 py-2.5 pr-10 text-sm text-gray-lighter placeholder:text-gray focus:outline-none focus:border-primary"
                />
                <button type="button" onClick={() => setShowNew(!showNew)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray hover:text-gray-lighter">
                  {showNew ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray mb-1.5">Confirmar nova senha</label>
              <div className="relative">
                <input
                  type={showConfirm ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  className="w-full bg-dark border border-dark-lighter rounded-xl px-3 py-2.5 pr-10 text-sm text-gray-lighter focus:outline-none focus:border-primary"
                />
                <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray hover:text-gray-lighter">
                  {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <Button type="submit" disabled={changingPassword || !oldPassword || !newPassword || !confirmPassword} icon={changingPassword ? <Loader2 size={16} className="animate-spin" /> : <Lock size={16} />}>
              Alterar Senha
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
