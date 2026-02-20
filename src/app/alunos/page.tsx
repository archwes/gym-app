'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAppStore } from '@/store/useAppStore';
import PageHeader from '@/components/ui/PageHeader';
import { Users, Mail, Phone, Calendar, Dumbbell } from 'lucide-react';
import Link from 'next/link';

export default function AlunosPage() {
  const { currentUser, users, workoutPlans, progress, fetchUsers, fetchWorkouts, fetchProgress } = useAppStore();
  const router = useRouter();

  useEffect(() => {
    if (!currentUser || currentUser.role !== 'trainer') {
      router.push('/');
      return;
    }
    fetchUsers();
    fetchWorkouts();
    fetchProgress();
  }, [currentUser, router, fetchUsers, fetchWorkouts, fetchProgress]);

  if (!currentUser) return null;

  const students = users.filter((u) => u.role === 'student');

  return (
    <div>
      <PageHeader
        title="Alunos"
        subtitle={`${students.length} alunos cadastrados`}
        icon={<Users size={24} />}
      />

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
            <div
              key={student.id}
              className="rounded-2xl bg-dark-light border border-dark-lighter p-5 card-hover animate-fade-in"
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
                    <span>{student.phone}</span>
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

              {/* Actions */}
              <div className="flex gap-2">
                <Link
                  href="/treinos"
                  className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-primary/10 text-primary text-xs font-semibold hover:bg-primary/20 transition-colors"
                >
                  <Dumbbell size={14} /> Treinos
                </Link>
                <Link
                  href="/agenda"
                  className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-secondary/10 text-secondary text-xs font-semibold hover:bg-secondary/20 transition-colors"
                >
                  <Calendar size={14} /> Agenda
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
