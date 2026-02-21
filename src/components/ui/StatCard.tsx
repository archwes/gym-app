'use client';

import { ReactNode } from 'react';
import Link from 'next/link';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: ReactNode;
  trend?: string;
  trendUp?: boolean;
  color?: string;
  href?: string;
}

export default function StatCard({ title, value, icon, trend, trendUp, color = 'primary', href }: StatCardProps) {
  const colorMap: Record<string, string> = {
    primary: 'from-primary/20 to-primary/5 border-primary/20 text-primary',
    secondary: 'from-secondary/20 to-secondary/5 border-secondary/20 text-secondary',
    accent: 'from-accent/20 to-accent/5 border-accent/20 text-accent',
    danger: 'from-danger/20 to-danger/5 border-danger/20 text-danger',
  };

  const iconColorMap: Record<string, string> = {
    primary: 'bg-primary/20 text-primary',
    secondary: 'bg-secondary/20 text-secondary',
    accent: 'bg-accent/20 text-accent',
    danger: 'bg-danger/20 text-danger',
  };

  const content = (
    <div className="flex items-start justify-between gap-2">
      <div className="min-w-0">
        <p className="text-xs sm:text-sm text-gray font-medium truncate">{title}</p>
        <p className="text-2xl sm:text-3xl font-bold text-gray-lighter mt-1">{value}</p>
        {trend && (
          <p className={`text-xs mt-2 font-medium ${trendUp ? 'text-secondary' : 'text-danger'}`}>
            {trendUp ? '↑' : '↓'} {trend}
          </p>
        )}
      </div>
      <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl ${iconColorMap[color]} flex items-center justify-center shrink-0`}>
        {icon}
      </div>
    </div>
  );

  const classes = `block rounded-2xl bg-gradient-to-br ${colorMap[color]} border p-3 sm:p-5 card-hover transition-all`;

  if (href) {
    return (
      <Link href={href} className={`${classes} hover:scale-[1.03] hover:shadow-lg`}>
        {content}
      </Link>
    );
  }

  return <div className={classes}>{content}</div>;
}
