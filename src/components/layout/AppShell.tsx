'use client';

import { ReactNode, useEffect } from 'react';
import { useAppStore } from '@/store/useAppStore';
import Sidebar from './Sidebar';
import { Loader2 } from 'lucide-react';

interface AppShellProps {
  children: ReactNode;
}

export default function AppShell({ children }: AppShellProps) {
  const { currentUser, initialized, restoreSession } = useAppStore();

  useEffect(() => {
    if (!initialized) {
      restoreSession();
    }
  }, [initialized, restoreSession]);

  if (!initialized) {
    return (
      <div className="min-h-screen bg-dark flex items-center justify-center">
        <Loader2 size={32} className="text-primary animate-spin" />
      </div>
    );
  }

  if (!currentUser) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-dark">
      <Sidebar />
      <main className="lg:ml-72 min-h-screen">
        <div className="p-4 pt-16 lg:p-8 lg:pt-8 max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
