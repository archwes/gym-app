'use client';

import { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { apiResetPassword } from '@/lib/api';
import { getPasswordStrength } from '@/lib/format';
import { Dumbbell, Lock, Eye, EyeOff, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { Suspense } from 'react';

function ResetPasswordContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [status, setStatus] = useState<'form' | 'loading' | 'success' | 'error'>('form');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password.length < 6) {
      setError('A senha deve ter pelo menos 6 caracteres');
      return;
    }

    if (password !== confirmPassword) {
      setError('As senhas não coincidem');
      return;
    }

    if (!token) {
      setError('Token de redefinição não encontrado.');
      return;
    }

    setStatus('loading');
    try {
      await apiResetPassword(token, password);
      setStatus('success');
    } catch (err) {
      setStatus('form');
      setError(err instanceof Error ? err.message : 'Erro ao redefinir senha.');
    }
  };

  return (
    <div className="min-h-screen bg-dark flex items-center justify-center p-4 flex-1">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-secondary/10" />
      <div className="relative max-w-md w-full">
        <div className="text-center mb-8">
          <a href="/" className="inline-flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
              <Dumbbell size={22} className="text-white" />
            </div>
            <span className="text-xl font-bold gradient-text">FitPro</span>
          </a>
        </div>

        <div className="rounded-2xl glass p-8">
          {status === 'success' ? (
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-secondary/10 flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 size={32} className="text-secondary" />
              </div>
              <h2 className="text-xl font-bold text-gray-lighter mb-2">Senha redefinida!</h2>
              <p className="text-sm text-gray mb-6">Sua senha foi alterada com sucesso. Faça login com a nova senha.</p>
              <a href="/"
                className="inline-flex items-center justify-center w-full py-3 rounded-xl bg-primary text-white font-bold text-sm hover:bg-primary-dark transition-colors">
                Voltar ao Login
              </a>
            </div>
          ) : !token ? (
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-danger/10 flex items-center justify-center mx-auto mb-4">
                <AlertCircle size={32} className="text-danger" />
              </div>
              <h2 className="text-xl font-bold text-gray-lighter mb-2">Link inválido</h2>
              <p className="text-sm text-gray mb-6">Este link de redefinição de senha é inválido ou expirou.</p>
              <a href="/"
                className="inline-flex items-center justify-center w-full py-3 rounded-xl bg-primary text-white font-bold text-sm hover:bg-primary-dark transition-colors">
                Voltar ao Início
              </a>
            </div>
          ) : (
            <>
              <h2 className="text-2xl font-bold text-gray-lighter mb-2">Redefinir senha</h2>
              <p className="text-sm text-gray mb-6">Escolha uma nova senha para sua conta</p>
              {error && (
                <div className="flex items-start gap-2 text-danger text-sm mb-4 p-3 rounded-xl bg-danger/10">
                  <AlertCircle size={16} className="shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-gray mb-1.5">Nova senha</label>
                  <div className="relative">
                    <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray" />
                    <input type={showPassword ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Mínimo 6 caracteres" required minLength={6}
                      className="w-full bg-dark border border-dark-lighter rounded-xl pl-10 pr-10 py-2.5 text-sm text-gray-lighter placeholder:text-gray focus:outline-none focus:border-primary" />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray hover:text-gray-lighter transition-colors">
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                  {password && (() => {
                    const { score, label, color } = getPasswordStrength(password);
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
                <div>
                  <label className="block text-xs font-medium text-gray mb-1.5">Confirmar nova senha</label>
                  <div className="relative">
                    <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray" />
                    <input type={showConfirmPassword ? 'text' : 'password'} value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Repita a senha" required minLength={6}
                      className="w-full bg-dark border border-dark-lighter rounded-xl pl-10 pr-10 py-2.5 text-sm text-gray-lighter placeholder:text-gray focus:outline-none focus:border-primary" />
                    <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray hover:text-gray-lighter transition-colors">
                      {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                  {confirmPassword && password !== confirmPassword && (
                    <p className="text-danger text-xs mt-1">As senhas não coincidem</p>
                  )}
                </div>
                <button type="submit" disabled={status === 'loading' || (!!confirmPassword && password !== confirmPassword)}
                  className="w-full py-3 rounded-xl bg-primary text-white font-bold text-sm hover:bg-primary-dark transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
                  {status === 'loading' ? <Loader2 size={18} className="animate-spin" /> : null}
                  Redefinir Senha
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default function RedefinirSenhaPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-dark flex items-center justify-center">
        <Loader2 size={32} className="text-primary animate-spin" />
      </div>
    }>
      <ResetPasswordContent />
    </Suspense>
  );
}
