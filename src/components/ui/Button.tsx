'use client';

import { ButtonHTMLAttributes, ReactNode } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  icon?: ReactNode;
  children: ReactNode;
}

export default function Button({
  variant = 'primary',
  size = 'md',
  icon,
  children,
  className = '',
  ...props
}: ButtonProps) {
  const variantClasses = {
    primary: 'bg-primary hover:bg-primary-dark text-white shadow-lg shadow-primary/25',
    secondary: 'bg-secondary hover:bg-secondary-light text-white shadow-lg shadow-secondary/25',
    outline: 'border border-dark-lighter text-gray-light hover:bg-dark-lighter hover:text-white',
    ghost: 'text-gray hover:text-gray-lighter hover:bg-dark-lighter',
    danger: 'bg-danger hover:bg-red-600 text-white shadow-lg shadow-danger/25',
  };

  const sizeClasses = {
    sm: 'px-3 py-1.5 text-xs rounded-lg',
    md: 'px-4 py-2.5 text-sm rounded-xl',
    lg: 'px-6 py-3 text-base rounded-xl',
  };

  return (
    <button
      className={`inline-flex items-center justify-center gap-2 font-semibold transition-all duration-200 active:scale-95
        ${variantClasses[variant]} ${sizeClasses[size]} ${className}
        disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100`}
      {...props}
    >
      {icon}
      {children}
    </button>
  );
}
