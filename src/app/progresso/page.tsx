'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAppStore } from '@/store/useAppStore';
import PageHeader from '@/components/ui/PageHeader';
import ProgressBar from '@/components/ui/ProgressBar';
import { TrendingUp, Scale, Ruler, ArrowDown, ArrowUp, Minus } from 'lucide-react';

export default function ProgressoPage() {
  const { currentUser, progress, fetchProgress } = useAppStore();
  const router = useRouter();

  useEffect(() => {
    if (!currentUser || currentUser.role !== 'student') {
      router.push('/');
      return;
    }
    fetchProgress(currentUser.id);
  }, [currentUser, router, fetchProgress]);

  if (!currentUser) return null;

  const myProgress = progress
    .filter((p) => p.student_id === currentUser.id)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  const latest = myProgress[myProgress.length - 1];
  const previous = myProgress[myProgress.length - 2];
  const first = myProgress[0];

  const getTrend = (current?: number, prev?: number) => {
    if (!current || !prev) return { icon: Minus, color: 'text-gray', value: '--' };
    const diff = current - prev;
    if (diff > 0) return { icon: ArrowUp, color: 'text-danger', value: `+${diff.toFixed(1)}` };
    if (diff < 0) return { icon: ArrowDown, color: 'text-secondary', value: diff.toFixed(1) };
    return { icon: Minus, color: 'text-gray', value: '0' };
  };

  return (
    <div>
      <PageHeader
        title="Meu Progresso"
        subtitle="Acompanhe sua evolução ao longo do tempo"
        icon={<TrendingUp size={24} />}
        backTo={{ href: '/dashboard', label: 'Voltar para Dashboard' }}
      />

      {myProgress.length === 0 ? (
        <div className="text-center py-16 animate-fade-in">
          <div className="w-20 h-20 rounded-2xl bg-dark-lighter flex items-center justify-center text-gray mx-auto mb-4">
            <TrendingUp size={36} />
          </div>
          <h3 className="text-lg font-semibold text-gray-lighter mb-2">Nenhum registro ainda</h3>
          <p className="text-sm text-gray">Seu personal irá registrar suas medidas e evolução.</p>
        </div>
      ) : (
        <>
          {/* Current Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8 animate-fade-in">
            {[
              { label: 'Peso Atual', value: latest?.weight ? `${latest.weight}kg` : '--', sub: getTrend(latest?.weight, previous?.weight) },
              { label: '% Gordura', value: latest?.body_fat ? `${latest.body_fat}%` : '--', sub: getTrend(latest?.body_fat, previous?.body_fat) },
              { label: 'Peso Inicial', value: first?.weight ? `${first.weight}kg` : '--' },
              { label: 'Total Perdido', value: first && latest ? `${(first.weight - latest.weight).toFixed(1)}kg` : '--' },
            ].map((stat, idx) => (
              <div key={idx} className="p-4 rounded-2xl bg-dark-light border border-dark-lighter">
                <p className="text-xs text-gray font-medium mb-1">{stat.label}</p>
                <p className="text-2xl font-bold text-gray-lighter">{stat.value}</p>
                {stat.sub && (
                  <div className={`flex items-center gap-1 mt-1 text-xs font-medium ${stat.sub.color}`}>
                    <stat.sub.icon size={12} />
                    <span>{stat.sub.value} vs anterior</span>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Weight Chart */}
          <div className="rounded-2xl bg-dark-light border border-dark-lighter p-5 mb-6 animate-fade-in">
            <h2 className="text-lg font-bold text-gray-lighter mb-4 flex items-center gap-2">
              <Scale size={20} className="text-primary" />
              Evolução do Peso
            </h2>
            <div className="flex items-end gap-2 h-40">
              {myProgress.map((p, idx) => {
                const max = Math.max(...myProgress.map((pr) => pr.weight));
                const min = Math.min(...myProgress.map((pr) => pr.weight));
                const range = max - min || 1;
                const height = ((p.weight - min) / range) * 100;

                return (
                  <div key={idx} className="flex-1 flex flex-col items-center gap-1 group">
                    <div className="text-[10px] text-gray opacity-0 group-hover:opacity-100 transition-opacity font-medium">
                      {p.weight}kg
                    </div>
                    <div
                      className="w-full bg-gradient-to-t from-primary to-primary-light rounded-t-md transition-all hover:from-primary-light hover:to-primary relative"
                      style={{ height: `${Math.max(height, 15)}%` }}
                    />
                    <div className="text-[9px] text-gray mt-1 hidden sm:block">
                      {new Date(p.date).toLocaleDateString('pt-BR', { month: 'short' })}
                    </div>
                  </div>
                );
              })}
            </div>
            {latest?.body_fat && first?.body_fat && (
              <div className="mt-4 pt-4 border-t border-dark-lighter">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs text-gray">Gordura corporal</span>
                  <span className="text-xs font-bold text-secondary">
                    {first.body_fat}% → {latest.body_fat}% ({(first.body_fat - latest.body_fat).toFixed(1)}%)
                  </span>
                </div>
                <ProgressBar
                  value={100 - latest.body_fat}
                  max={100}
                  label="Massa magra"
                  color="secondary"
                />
              </div>
            )}
          </div>

          {/* Measurements */}
          {(latest?.chest || latest?.waist || latest?.hips || latest?.arms || latest?.thighs) && (
            <div className="rounded-2xl bg-dark-light border border-dark-lighter p-5 mb-6 animate-fade-in">
              <h2 className="text-lg font-bold text-gray-lighter mb-4 flex items-center gap-2">
                <Ruler size={20} className="text-secondary" />
                Medidas Corporais (cm)
              </h2>
              <div className="grid sm:grid-cols-2 gap-4">
                {[
                  { label: 'Peito', value: latest.chest, prev: previous?.chest },
                  { label: 'Cintura', value: latest.waist, prev: previous?.waist },
                  { label: 'Quadril', value: latest.hips, prev: previous?.hips },
                  { label: 'Braços', value: latest.arms, prev: previous?.arms },
                  { label: 'Coxas', value: latest.thighs, prev: previous?.thighs },
                ].map((m) => {
                  if (!m.value) return null;
                  const trend = getTrend(m.value, m.prev);
                  return (
                    <div key={m.label} className="p-3 rounded-xl bg-dark/50 border border-dark-lighter/50">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-lighter">{m.label}</span>
                        <div className="flex items-center gap-1">
                          <span className="text-lg font-bold text-gray-lighter">{m.value}</span>
                          <span className="text-xs text-gray">cm</span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <ProgressBar value={m.value} max={120} showPercent={false} size="sm" color="primary" />
                        {m.prev && (
                          <span className={`text-[10px] font-medium ml-2 ${trend.color}`}>
                            {trend.value}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* History Table */}
          <div className="rounded-2xl bg-dark-light border border-dark-lighter p-5 animate-fade-in">
            <h2 className="text-lg font-bold text-gray-lighter mb-4">Histórico</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-dark-lighter">
                    <th className="text-left py-2 px-3 text-xs text-gray font-medium">Data</th>
                    <th className="text-center py-2 px-3 text-xs text-gray font-medium">Peso</th>
                    <th className="text-center py-2 px-3 text-xs text-gray font-medium">% Gord.</th>
                    <th className="text-center py-2 px-3 text-xs text-gray font-medium hidden sm:table-cell">Peito</th>
                    <th className="text-center py-2 px-3 text-xs text-gray font-medium hidden sm:table-cell">Cintura</th>
                    <th className="text-center py-2 px-3 text-xs text-gray font-medium hidden sm:table-cell">Braços</th>
                  </tr>
                </thead>
                <tbody>
                  {[...myProgress].reverse().map((p) => (
                    <tr key={p.id} className="border-b border-dark-lighter/50 hover:bg-dark/30">
                      <td className="py-2.5 px-3 text-gray-lighter">
                        {new Date(p.date).toLocaleDateString('pt-BR')}
                      </td>
                      <td className="py-2.5 px-3 text-center font-semibold text-gray-lighter">
                        {p.weight}kg
                      </td>
                      <td className="py-2.5 px-3 text-center text-gray-lighter">
                        {p.body_fat ? `${p.body_fat}%` : '--'}
                      </td>
                      <td className="py-2.5 px-3 text-center text-gray hidden sm:table-cell">
                        {p.chest || '--'}
                      </td>
                      <td className="py-2.5 px-3 text-center text-gray hidden sm:table-cell">
                        {p.waist || '--'}
                      </td>
                      <td className="py-2.5 px-3 text-center text-gray hidden sm:table-cell">
                        {p.arms || '--'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
