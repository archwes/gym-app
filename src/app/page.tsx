'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAppStore } from '@/store/useAppStore';
import { apiForgotPassword, apiResendVerification } from '@/lib/api';
import {
  Dumbbell, Users, TrendingUp, Calendar, Shield, Zap,
  ArrowRight, Loader2, Mail, Lock, User, Phone, Eye, EyeOff,
  CheckCircle2, AlertCircle, Award,
} from 'lucide-react';
import { formatPhone, formatCREF, getPasswordStrength } from '@/lib/format';

type Mode = 'landing' | 'login' | 'register' | 'forgot' | 'verify-pending';

export default function HomePage() {
  const { currentUser, login, register, loading, initialized, restoreSession } = useAppStore();
  const router = useRouter();
  const [mode, setMode] = useState<Mode>('landing');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [cref, setCref] = useState('');
  const [role, setRole] = useState<'trainer' | 'student'>('student');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [pendingEmail, setPendingEmail] = useState('');
  const [resending, setResending] = useState(false);
  const [forgotSent, setForgotSent] = useState(false);
  const [forgotLoading, setForgotLoading] = useState(false);

  useEffect(() => {
    if (!initialized) {
      restoreSession();
    }
  }, [initialized, restoreSession]);

  useEffect(() => {
    if (currentUser) {
      router.push(currentUser.role === 'admin' ? '/admin' : '/dashboard');
    }
  }, [currentUser, router]);

  const resetForm = () => {
    setEmail(''); setPassword(''); setConfirmPassword('');
    setName(''); setPhone(''); setCref('');
    setRole('student'); setError(''); setSuccess('');
    setShowPassword(false); setShowConfirmPassword(false);
    setForgotSent(false);
  };

  const switchMode = (newMode: Mode) => { resetForm(); setMode(newMode); };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      await login(email, password);
      // redirect is handled by the useEffect watching currentUser
    } catch (err: unknown) {
      const typedErr = err as Error & { requiresVerification?: boolean; email?: string };
      if (typedErr.requiresVerification) {
        setPendingEmail(typedErr.email || email);
        setMode('verify-pending');
        return;
      }
      setError(typedErr.message || 'Erro ao fazer login');
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (password.length < 6) { setError('A senha deve ter pelo menos 6 caracteres'); return; }
    if (password !== confirmPassword) { setError('As senhas não coincidem'); return; }
    try {
      await register({
        name, email, password, role,
        phone: phone || undefined,
        cref: role === 'trainer' && cref ? cref : undefined,
      });
      setPendingEmail(email);
      setMode('verify-pending');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Erro ao criar conta');
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(''); setForgotLoading(true);
    try {
      const res = await apiForgotPassword(email);
      setForgotSent(true); setSuccess(res.message);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Erro ao enviar e-mail');
    } finally { setForgotLoading(false); }
  };

  const handleResendVerification = async () => {
    setResending(true); setError('');
    try {
      await apiResendVerification(pendingEmail);
      setSuccess('E-mail de verificação reenviado!');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Erro ao reenviar e-mail');
    } finally { setResending(false); }
  };

  const handleDemoLogin = async (demoEmail: string) => {
    setError('');
    try {
      await login(demoEmail, '123456');
      // redirect is handled by the useEffect watching currentUser
    } catch (err: unknown) {
      const typedErr = err as Error & { requiresVerification?: boolean; email?: string };
      if (typedErr.requiresVerification) {
        setPendingEmail(typedErr.email || demoEmail);
        setMode('verify-pending');
        return;
      }
      setError(typedErr.message || 'Erro ao fazer login');
    }
  };

  const features = [
    { icon: <Dumbbell size={28} />, title: 'Planos de Treino', desc: 'Crie e gerencie treinos personalizados para cada aluno' },
    { icon: <Users size={28} />, title: 'Gestão de Alunos', desc: 'Acompanhe todos os seus alunos em um só lugar' },
    { icon: <TrendingUp size={28} />, title: 'Progresso', desc: 'Monitore a evolução com gráficos e métricas detalhadas' },
    { icon: <Calendar size={28} />, title: 'Agenda', desc: 'Organize sessões e aulas com calendário integrado' },
    { icon: <Shield size={28} />, title: 'Seguro', desc: 'Seus dados protegidos com as melhores práticas de segurança' },
    { icon: <Zap size={28} />, title: 'Rápido', desc: 'Interface otimizada para uma experiência fluida' },
  ];

  if (!initialized) {
    return (
      <div className="min-h-screen bg-dark flex items-center justify-center">
        <Loader2 size={32} className="text-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dark overflow-x-hidden flex flex-col">
      <div className="relative flex-1 flex flex-col">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-secondary/10 pointer-events-none" />
        <div className="absolute top-20 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-20 right-1/4 w-96 h-96 bg-secondary/5 rounded-full blur-3xl pointer-events-none" />

        <div className="relative max-w-6xl mx-auto px-4 py-8 flex-1 flex flex-col w-full">
          <nav className={`flex items-center justify-between ${mode === 'landing' ? 'mb-16 sm:mb-24' : 'mb-8 sm:mb-12'}`}>
            <button onClick={() => switchMode('landing')} className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                <Dumbbell size={22} className="text-white" />
              </div>
              <span className="text-xl font-bold gradient-text">FitPro</span>
            </button>
            {mode === 'landing' && (
              <div className="flex gap-2">
                <button onClick={() => switchMode('login')} className="px-4 py-2 rounded-xl text-sm font-semibold text-primary hover:bg-primary/10 transition-colors">
                  Login
                </button>
                <button onClick={() => switchMode('register')} className="px-4 py-2 rounded-xl text-sm font-semibold bg-primary text-white hover:bg-primary-dark transition-colors">
                  Cadastrar
                </button>
              </div>
            )}
          </nav>

          {mode === 'landing' ? (
            <>
              <div className="text-center max-w-3xl mx-auto mb-16 sm:mb-24">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass text-xs font-medium text-primary-light mb-6 animate-fade-in">
                  <Zap size={14} /> Plataforma #1 para Academias
                </div>
                <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold text-gray-lighter leading-tight mb-6 animate-fade-in">
                  Transforme sua
                  <span className="block gradient-text">academia digital</span>
                </h1>
                <p className="text-lg sm:text-xl text-gray max-w-2xl mx-auto mb-10 animate-fade-in">
                  Gerencie treinos, alunos e agendamentos com uma plataforma moderna e intuitiva.
                  Tudo o que você precisa para levar seu trabalho ao próximo nível.
                </p>

                <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8 animate-fade-in">
                  <button
                    onClick={() => switchMode('login')}
                    className="px-8 py-3 rounded-xl text-sm font-bold bg-primary text-white hover:bg-primary-dark transition-colors shadow-lg shadow-primary/25"
                  >
                    Fazer Login
                  </button>
                  <button
                    onClick={() => switchMode('register')}
                    className="px-8 py-3 rounded-xl text-sm font-bold border border-dark-lighter text-gray-lighter hover:bg-dark-lighter transition-colors"
                  >
                    Criar Conta Grátis
                  </button>
                </div>

                <div className="grid sm:grid-cols-2 gap-4 max-w-xl mx-auto animate-fade-in">
                  <button
                    onClick={() => handleDemoLogin('carlos@fitpro.com')}
                    disabled={loading}
                    className="group p-6 rounded-2xl glass card-hover text-left"
                  >
                    <div className="w-14 h-14 rounded-xl bg-primary/20 flex items-center justify-center text-primary mb-4 group-hover:scale-110 transition-transform">
                      <Shield size={28} />
                    </div>
                    <h3 className="text-lg font-bold text-gray-lighter mb-1">Demo Trainer</h3>
                    <p className="text-sm text-gray mb-3">Acesse como Carlos Silva</p>
                    <div className="flex items-center gap-1 text-primary text-sm font-semibold">
                      {loading ? <Loader2 size={16} className="animate-spin" /> : <>Entrar <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" /></>}
                    </div>
                  </button>

                  <button
                    onClick={() => handleDemoLogin('ana@email.com')}
                    disabled={loading}
                    className="group p-6 rounded-2xl glass card-hover text-left"
                  >
                    <div className="w-14 h-14 rounded-xl bg-secondary/20 flex items-center justify-center text-secondary mb-4 group-hover:scale-110 transition-transform">
                      <Users size={28} />
                    </div>
                    <h3 className="text-lg font-bold text-gray-lighter mb-1">Demo Aluno</h3>
                    <p className="text-sm text-gray mb-3">Acesse como Ana Oliveira</p>
                    <div className="flex items-center gap-1 text-secondary text-sm font-semibold">
                      {loading ? <Loader2 size={16} className="animate-spin" /> : <>Entrar <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" /></>}
                    </div>
                  </button>
                </div>
                {error && <p className="text-danger text-sm mt-4">{error}</p>}
              </div>

              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-16">
                {features.map((f, i) => (
                  <div key={i} className="p-5 rounded-2xl glass card-hover animate-fade-in" style={{ animationDelay: `${i * 100}ms` }}>
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary mb-3">{f.icon}</div>
                    <h3 className="font-bold text-gray-lighter mb-1">{f.title}</h3>
                    <p className="text-sm text-gray">{f.desc}</p>
                  </div>
                ))}
              </div>
            </>
          ) : mode === 'login' ? (
            <div className="max-w-md sm:max-w-lg lg:max-w-xl mx-auto animate-fade-in mb-12">
              <div className="rounded-2xl glass p-6 sm:p-8 lg:p-10">
                <h2 className="text-2xl sm:text-3xl font-bold text-gray-lighter mb-2">Bem-vindo de volta</h2>
                <p className="text-sm sm:text-base text-gray mb-6">Entre com suas credenciais</p>
                {error && (
                  <div className="flex items-start gap-2 text-danger text-sm mb-4 p-3 rounded-xl bg-danger/10">
                    <AlertCircle size={16} className="shrink-0 mt-0.5" />
                    <span>{error}</span>
                  </div>
                )}
                <form onSubmit={handleLogin} className="space-y-4 sm:space-y-5">
                  <div>
                    <label className="block text-xs font-medium text-gray mb-1.5">Email</label>
                    <div className="relative">
                      <Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray" />
                      <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="seu@email.com" required
                        className="w-full bg-dark border border-dark-lighter rounded-xl pl-10 pr-3 py-2.5 text-sm text-gray-lighter placeholder:text-gray focus:outline-none focus:border-primary" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray mb-1.5">Senha</label>
                    <div className="relative">
                      <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray" />
                      <input type={showPassword ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••" required
                        className="w-full bg-dark border border-dark-lighter rounded-xl pl-10 pr-10 py-2.5 text-sm text-gray-lighter placeholder:text-gray focus:outline-none focus:border-primary" />
                      <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray hover:text-gray-lighter transition-colors">
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                  </div>
                  <div className="flex justify-end">
                    <button type="button" onClick={() => switchMode('forgot')} className="text-xs text-primary font-medium hover:text-primary-light transition-colors">
                      Esqueci minha senha
                    </button>
                  </div>
                  <button type="submit" disabled={loading}
                    className="w-full py-3 rounded-xl bg-primary text-white font-bold text-sm hover:bg-primary-dark transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
                    {loading ? <Loader2 size={18} className="animate-spin" /> : null}
                    Entrar
                  </button>
                </form>
                <p className="text-sm text-gray text-center mt-6">
                  Não tem conta?{' '}
                  <button onClick={() => switchMode('register')} className="text-primary font-semibold hover:text-primary-light">
                    Criar conta
                  </button>
                </p>
              </div>
            </div>
          ) : mode === 'register' ? (
            <div className="max-w-md sm:max-w-lg lg:max-w-xl mx-auto animate-fade-in mb-12">
              <div className="rounded-2xl glass p-6 sm:p-8 lg:p-10">
                <h2 className="text-2xl sm:text-3xl font-bold text-gray-lighter mb-2">Criar conta</h2>
                <p className="text-sm sm:text-base text-gray mb-6">Preencha seus dados para começar</p>
                {error && (
                  <div className="flex items-start gap-2 text-danger text-sm mb-4 p-3 rounded-xl bg-danger/10">
                    <AlertCircle size={16} className="shrink-0 mt-0.5" />
                    <span>{error}</span>
                  </div>
                )}
                <form onSubmit={handleRegister} className="space-y-4 sm:space-y-5">
                  <div>
                    <label className="block text-xs font-medium text-gray mb-1.5">Nome completo</label>
                    <div className="relative">
                      <User size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray" />
                      <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Seu nome" required
                        className="w-full bg-dark border border-dark-lighter rounded-xl pl-10 pr-3 py-2.5 text-sm text-gray-lighter placeholder:text-gray focus:outline-none focus:border-primary" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray mb-1.5">Email</label>
                    <div className="relative">
                      <Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray" />
                      <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="seu@email.com" required
                        className="w-full bg-dark border border-dark-lighter rounded-xl pl-10 pr-3 py-2.5 text-sm text-gray-lighter placeholder:text-gray focus:outline-none focus:border-primary" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray mb-1.5">Telefone (opcional)</label>
                    <div className="relative">
                      <Phone size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray" />
                      <input type="tel" value={phone} onChange={(e) => setPhone(formatPhone(e.target.value))} placeholder="(11) 99999-0000"
                        className="w-full bg-dark border border-dark-lighter rounded-xl pl-10 pr-3 py-2.5 text-sm text-gray-lighter placeholder:text-gray focus:outline-none focus:border-primary" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray mb-1.5">Senha</label>
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
                    <label className="block text-xs font-medium text-gray mb-1.5">Confirmar senha</label>
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
                  <div>
                    <label className="block text-xs font-medium text-gray mb-1.5">Tipo de conta</label>
                    <div className="grid grid-cols-2 gap-2">
                      <button type="button" onClick={() => setRole('student')}
                        className={`p-3 rounded-xl text-sm font-medium transition-colors ${role === 'student' ? 'bg-primary text-white' : 'bg-dark border border-dark-lighter text-gray hover:text-gray-lighter'}`}>
                        Aluno
                      </button>
                      <button type="button" onClick={() => setRole('trainer')}
                        className={`p-3 rounded-xl text-sm font-medium transition-colors ${role === 'trainer' ? 'bg-primary text-white' : 'bg-dark border border-dark-lighter text-gray hover:text-gray-lighter'}`}>
                        Personal Trainer
                      </button>
                    </div>
                  </div>
                  {role === 'trainer' && (
                    <div className="animate-fade-in">
                      <label className="block text-xs font-medium text-gray mb-1.5">CREF (opcional)</label>
                      <div className="relative">
                        <Award size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray" />
                        <input type="text" value={cref} onChange={(e) => setCref(formatCREF(e.target.value))} placeholder="000000-G/SP"
                          className="w-full bg-dark border border-dark-lighter rounded-xl pl-10 pr-3 py-2.5 text-sm text-gray-lighter placeholder:text-gray focus:outline-none focus:border-primary" />
                      </div>
                    </div>
                  )}
                  <button type="submit" disabled={loading || (!!confirmPassword && password !== confirmPassword)}
                    className="w-full py-3 rounded-xl bg-primary text-white font-bold text-sm hover:bg-primary-dark transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
                    {loading ? <Loader2 size={18} className="animate-spin" /> : null}
                    Criar Conta
                  </button>
                </form>
                <p className="text-sm text-gray text-center mt-6">
                  Já tem conta?{' '}
                  <button onClick={() => switchMode('login')} className="text-primary font-semibold hover:text-primary-light">
                    Fazer login
                  </button>
                </p>
              </div>
            </div>
          ) : mode === 'forgot' ? (
            <div className="max-w-md sm:max-w-lg lg:max-w-xl mx-auto animate-fade-in mb-12">
              <div className="rounded-2xl glass p-6 sm:p-8 lg:p-10">
                {!forgotSent ? (
                  <>
                    <h2 className="text-2xl font-bold text-gray-lighter mb-2">Esqueci minha senha</h2>
                    <p className="text-sm text-gray mb-6">Informe seu e-mail para receber o link de redefinição</p>
                    {error && (
                      <div className="flex items-start gap-2 text-danger text-sm mb-4 p-3 rounded-xl bg-danger/10">
                        <AlertCircle size={16} className="shrink-0 mt-0.5" />
                        <span>{error}</span>
                      </div>
                    )}
                    <form onSubmit={handleForgotPassword} className="space-y-4 sm:space-y-5">
                      <div>
                        <label className="block text-xs font-medium text-gray mb-1.5">Email</label>
                        <div className="relative">
                          <Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray" />
                          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="seu@email.com" required
                            className="w-full bg-dark border border-dark-lighter rounded-xl pl-10 pr-3 py-2.5 text-sm text-gray-lighter placeholder:text-gray focus:outline-none focus:border-primary" />
                        </div>
                      </div>
                      <button type="submit" disabled={forgotLoading}
                        className="w-full py-3 rounded-xl bg-primary text-white font-bold text-sm hover:bg-primary-dark transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
                        {forgotLoading ? <Loader2 size={18} className="animate-spin" /> : <Mail size={18} />}
                        Enviar Link de Redefinição
                      </button>
                    </form>
                  </>
                ) : (
                  <div className="text-center py-4">
                    <div className="w-16 h-16 rounded-full bg-secondary/10 flex items-center justify-center mx-auto mb-4">
                      <Mail size={32} className="text-secondary" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-lighter mb-2">Verifique seu e-mail</h3>
                    <p className="text-sm text-gray mb-1">{success}</p>
                    <p className="text-xs text-gray/70 mt-2">Verifique também a pasta de spam.</p>
                  </div>
                )}
                <p className="text-sm text-gray text-center mt-6">
                  <button onClick={() => switchMode('login')} className="text-primary font-semibold hover:text-primary-light">
                    Voltar ao login
                  </button>
                </p>
              </div>
            </div>
          ) : mode === 'verify-pending' ? (
            <div className="max-w-md sm:max-w-lg lg:max-w-xl mx-auto animate-fade-in mb-12">
              <div className="rounded-2xl glass p-6 sm:p-8 lg:p-10 text-center">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <Mail size={32} className="text-primary" />
                </div>
                <h2 className="text-2xl font-bold text-gray-lighter mb-2">Confirme seu e-mail</h2>
                <p className="text-sm text-gray mb-2">Enviamos um link de verificação para:</p>
                <p className="text-sm font-semibold text-primary mb-6">{pendingEmail}</p>
                <p className="text-xs text-gray/70 mb-6">Clique no link enviado para ativar sua conta. Verifique também a pasta de spam.</p>
                {error && (
                  <div className="flex items-start gap-2 text-danger text-sm mb-4 p-3 rounded-xl bg-danger/10">
                    <AlertCircle size={16} className="shrink-0 mt-0.5" />
                    <span>{error}</span>
                  </div>
                )}
                {success && (
                  <div className="flex items-center gap-2 text-secondary text-sm mb-4 p-3 rounded-xl bg-secondary/10">
                    <CheckCircle2 size={16} className="shrink-0" />
                    <span>{success}</span>
                  </div>
                )}
                <button onClick={handleResendVerification} disabled={resending}
                  className="w-full py-3 rounded-xl border border-dark-lighter text-gray-lighter font-bold text-sm hover:bg-dark-lighter transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
                  {resending ? <Loader2 size={18} className="animate-spin" /> : <Mail size={18} />}
                  Reenviar e-mail de verificação
                </button>
                <p className="text-sm text-gray text-center mt-6">
                  <button onClick={() => switchMode('login')} className="text-primary font-semibold hover:text-primary-light">
                    Voltar ao login
                  </button>
                </p>
              </div>
            </div>
          ) : null}

          <footer className="text-center py-8 border-t border-dark-lighter mt-auto pt-8">
            <p className="text-sm text-gray">
              © 2026 FitPro. Feito com 💜 para profissionais de fitness.
            </p>
          </footer>
        </div>
      </div>
    </div>
  );
}
