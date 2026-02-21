'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { apiVerifyEmail } from '@/lib/api';
import { Dumbbell, CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import { Suspense } from 'react';

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const [status, setStatus] = useState<'loading' | 'success' | 'already' | 'error'>('loading');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setErrorMsg('Token de verificação não encontrado.');
      return;
    }

    apiVerifyEmail(token)
      .then((res) => {
        if (res.alreadyVerified) {
          setStatus('already');
        } else {
          setStatus('success');
        }
      })
      .catch((err) => {
        setStatus('error');
        setErrorMsg(err instanceof Error ? err.message : 'Erro ao verificar e-mail.');
      });
  }, [token]);

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

        <div className="rounded-2xl glass p-8 text-center">
          {status === 'loading' && (
            <>
              <Loader2 size={48} className="text-primary animate-spin mx-auto mb-4" />
              <h2 className="text-xl font-bold text-gray-lighter mb-2">Verificando e-mail...</h2>
              <p className="text-sm text-gray">Aguarde enquanto confirmamos seu e-mail.</p>
            </>
          )}

          {status === 'success' && (
            <>
              <div className="w-16 h-16 rounded-full bg-secondary/10 flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 size={32} className="text-secondary" />
              </div>
              <h2 className="text-xl font-bold text-gray-lighter mb-2">E-mail verificado!</h2>
              <p className="text-sm text-gray mb-6">Sua conta foi ativada com sucesso. Agora você pode fazer login.</p>
              <a href="/"
                className="inline-flex items-center justify-center w-full py-3 rounded-xl bg-primary text-white font-bold text-sm hover:bg-primary-dark transition-colors">
                Ir para o Login
              </a>
            </>
          )}

          {status === 'already' && (
            <>
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 size={32} className="text-primary" />
              </div>
              <h2 className="text-xl font-bold text-gray-lighter mb-2">E-mail já verificado</h2>
              <p className="text-sm text-gray mb-6">Seu e-mail já foi confirmado anteriormente. Faça login para continuar.</p>
              <a href="/"
                className="inline-flex items-center justify-center w-full py-3 rounded-xl bg-primary text-white font-bold text-sm hover:bg-primary-dark transition-colors">
                Ir para o Login
              </a>
            </>
          )}

          {status === 'error' && (
            <>
              <div className="w-16 h-16 rounded-full bg-danger/10 flex items-center justify-center mx-auto mb-4">
                <XCircle size={32} className="text-danger" />
              </div>
              <h2 className="text-xl font-bold text-gray-lighter mb-2">Erro na verificação</h2>
              <p className="text-sm text-gray mb-6">{errorMsg || 'Token inválido ou expirado.'}</p>
              <a href="/"
                className="inline-flex items-center justify-center w-full py-3 rounded-xl bg-primary text-white font-bold text-sm hover:bg-primary-dark transition-colors">
                Voltar ao Início
              </a>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default function VerificarEmailPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-dark flex items-center justify-center">
        <Loader2 size={32} className="text-primary animate-spin" />
      </div>
    }>
      <VerifyEmailContent />
    </Suspense>
  );
}
