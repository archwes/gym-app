'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAppStore } from '@/store/useAppStore';
import { Dumbbell, Users, TrendingUp, Calendar, Shield, Zap, ArrowRight, Loader2, Mail, Lock, User, Phone } from 'lucide-react';
import { formatPhone } from '@/lib/format';

export default function HomePage() {
  const { currentUser, login, register, loading, initialized, restoreSession } = useAppStore();
  const router = useRouter();
  const [mode, setMode] = useState<'landing' | 'login' | 'register'>('landing');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState<'trainer' | 'student'>('student');
  const [error, setError] = useState('');

  useEffect(() => {
    if (!initialized) {
      restoreSession();
    }
  }, [initialized, restoreSession]);

  useEffect(() => {
    if (currentUser) {
      router.push('/dashboard');
    }
  }, [currentUser, router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      await login(email, password);
      router.push('/dashboard');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Erro ao fazer login');
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      await register({ name, email, password, role, phone: phone || undefined });
      router.push('/dashboard');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Erro ao criar conta');
    }
  };

  const handleDemoLogin = async (demoEmail: string) => {
    setError('');
    try {
      await login(demoEmail, '123456');
      router.push('/dashboard');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Erro ao fazer login');
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
    <div className="min-h-screen bg-dark overflow-hidden">
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-secondary/10" />
        <div className="absolute top-20 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-1/4 w-96 h-96 bg-secondary/5 rounded-full blur-3xl" />

        <div className="relative max-w-6xl mx-auto px-4 py-8">
          <nav className="flex items-center justify-between mb-16 sm:mb-24">
            <button onClick={() => setMode('landing')} className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                <Dumbbell size={22} className="text-white" />
              </div>
              <span className="text-xl font-bold gradient-text">FitPro</span>
            </button>
            {mode === 'landing' && (
              <div className="flex gap-2">
                <button onClick={() => setMode('login')} className="px-4 py-2 rounded-xl text-sm font-semibold text-primary hover:bg-primary/10 transition-colors">
                  Login
                </button>
                <button onClick={() => setMode('register')} className="px-4 py-2 rounded-xl text-sm font-semibold bg-primary text-white hover:bg-primary-dark transition-colors">
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
                    onClick={() => setMode('login')}
                    className="px-8 py-3 rounded-xl text-sm font-bold bg-primary text-white hover:bg-primary-dark transition-colors shadow-lg shadow-primary/25"
                  >
                    Fazer Login
                  </button>
                  <button
                    onClick={() => setMode('register')}
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
            <div className="max-w-md mx-auto animate-fade-in">
              <div className="rounded-2xl glass p-8">
                <h2 className="text-2xl font-bold text-gray-lighter mb-2">Bem-vindo de volta</h2>
                <p className="text-sm text-gray mb-6">Entre com suas credenciais</p>
                {error && <p className="text-danger text-sm mb-4 p-3 rounded-xl bg-danger/10">{error}</p>}
                <form onSubmit={handleLogin} className="space-y-4">
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
                      <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••" required
                        className="w-full bg-dark border border-dark-lighter rounded-xl pl-10 pr-3 py-2.5 text-sm text-gray-lighter placeholder:text-gray focus:outline-none focus:border-primary" />
                    </div>
                  </div>
                  <button type="submit" disabled={loading}
                    className="w-full py-3 rounded-xl bg-primary text-white font-bold text-sm hover:bg-primary-dark transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
                    {loading ? <Loader2 size={18} className="animate-spin" /> : null}
                    Entrar
                  </button>
                </form>
                <p className="text-sm text-gray text-center mt-6">
                  Não tem conta?{' '}
                  <button onClick={() => { setMode('register'); setError(''); }} className="text-primary font-semibold hover:text-primary-light">
                    Criar conta
                  </button>
                </p>
              </div>
            </div>
          ) : (
            <div className="max-w-md mx-auto animate-fade-in">
              <div className="rounded-2xl glass p-8">
                <h2 className="text-2xl font-bold text-gray-lighter mb-2">Criar conta</h2>
                <p className="text-sm text-gray mb-6">Preencha seus dados para começar</p>
                {error && <p className="text-danger text-sm mb-4 p-3 rounded-xl bg-danger/10">{error}</p>}
                <form onSubmit={handleRegister} className="space-y-4">
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
                      <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••" required minLength={6}
                        className="w-full bg-dark border border-dark-lighter rounded-xl pl-10 pr-3 py-2.5 text-sm text-gray-lighter placeholder:text-gray focus:outline-none focus:border-primary" />
                    </div>
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
                  <button type="submit" disabled={loading}
                    className="w-full py-3 rounded-xl bg-primary text-white font-bold text-sm hover:bg-primary-dark transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
                    {loading ? <Loader2 size={18} className="animate-spin" /> : null}
                    Criar Conta
                  </button>
                </form>
                <p className="text-sm text-gray text-center mt-6">
                  Já tem conta?{' '}
                  <button onClick={() => { setMode('login'); setError(''); }} className="text-primary font-semibold hover:text-primary-light">
                    Fazer login
                  </button>
                </p>
              </div>
            </div>
          )}

          <footer className="text-center py-8 border-t border-dark-lighter mt-16">
            <p className="text-sm text-gray">
              © 2026 FitPro. Feito com 💜 para profissionais de fitness.
            </p>
          </footer>
        </div>
      </div>
    </div>
  );
}
