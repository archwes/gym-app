'use client';

import { ReactNode, useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { useAppStore } from '@/store/useAppStore';
import Sidebar from './Sidebar';
import { Loader2 } from 'lucide-react';

interface AppShellProps {
  children: ReactNode;
}

export default function AppShell({ children }: AppShellProps) {
  const { currentUser, initialized, restoreSession } = useAppStore();
  const pathname = usePathname();
  const [pageTransition, setPageTransition] = useState(false);

  useEffect(() => {
    if (!initialized) {
      restoreSession();
    }
  }, [initialized, restoreSession]);

  // Page transition on route change
  useEffect(() => {
    setPageTransition(false);
    const frame = requestAnimationFrame(() => setPageTransition(true));
    return () => cancelAnimationFrame(frame);
  }, [pathname]);

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
    <div className="min-h-screen bg-dark flex flex-col">
      <Sidebar />
      <main className="lg:ml-72 min-h-screen flex-1 flex flex-col">
        <div
          className={`p-4 pt-16 lg:p-8 lg:pt-8 max-w-7xl mx-auto w-full flex-1 page-transition ${pageTransition ? 'page-visible' : ''}`}
        >
          {children}
        </div>
      </main>
    </div>
  );
}
