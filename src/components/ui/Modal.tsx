'use client';

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg';
}

export default function Modal({ isOpen, onClose, title, children, size = 'md' }: ModalProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!isOpen || !mounted) return null;

  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
  };

  const modal = (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="flex min-h-full items-center justify-center p-4">
        <div
          className={`relative w-full ${sizeClasses[size]} bg-dark-light border border-dark-lighter rounded-2xl shadow-2xl animate-fade-in`}
        >
          <div className="flex items-center justify-between p-5 border-b border-dark-lighter">
            <h2 className="text-lg font-bold text-gray-lighter">{title}</h2>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-gray hover:text-gray-lighter hover:bg-dark-lighter transition-colors"
            >
              <X size={20} />
            </button>
          </div>
          <div className="p-5 max-h-[75vh] overflow-y-auto overflow-x-hidden">{children}</div>
        </div>
      </div>
    </div>
  );

  return createPortal(modal, document.body);
}
