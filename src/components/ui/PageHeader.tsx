'use client';

import { ReactNode } from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  icon?: ReactNode;
  action?: ReactNode;
  backTo?: { href: string; label: string };
}

export default function PageHeader({ title, subtitle, icon, action, backTo }: PageHeaderProps) {
  return (
    <div className="mb-8 animate-fade-in">
      {backTo && (
        <Link
          href={backTo.href}
          className="inline-flex items-center gap-1.5 text-sm text-gray hover:text-primary mb-4 transition-colors"
        >
          <ArrowLeft size={16} />
          {backTo.label}
        </Link>
      )}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          {icon && (
            <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center text-primary">
              {icon}
            </div>
          )}
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-lighter">{title}</h1>
            {subtitle && <p className="text-sm text-gray mt-1">{subtitle}</p>}
          </div>
        </div>
        {action && <div>{action}</div>}
      </div>
    </div>
  );
}
