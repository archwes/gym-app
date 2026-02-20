'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAppStore } from '@/store/useAppStore';
import TrainerDashboard from '@/components/dashboard/TrainerDashboard';
import StudentDashboard from '@/components/dashboard/StudentDashboard';

export default function DashboardPage() {
  const { currentUser } = useAppStore();
  const router = useRouter();

  useEffect(() => {
    if (!currentUser) {
      router.push('/');
    }
  }, [currentUser, router]);

  if (!currentUser) return null;

  return currentUser.role === 'trainer' ? <TrainerDashboard /> : <StudentDashboard />;
}
