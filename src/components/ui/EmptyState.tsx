'use client';

import { ReactNode } from 'react';

interface EmptyStateProps {
  icon: ReactNode;
  title: string;
  description: string;
  action?: ReactNode;
}

export default function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center animate-fade-in">
      <div className="w-20 h-20 rounded-2xl bg-dark-lighter flex items-center justify-center text-gray mb-4">
        {icon}
      </div>
      <h3 className="text-lg font-semibold text-gray-lighter mb-2">{title}</h3>
      <p className="text-sm text-gray max-w-sm mb-6">{description}</p>
      {action}
    </div>
  );
}
