import { useEffect } from 'react';
import type { ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

export type ModalSize = 'sm' | 'md' | 'lg' | 'xl';

export interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: ReactNode;
  description?: ReactNode;
  size?: ModalSize;
  children?: ReactNode;
  footer?: ReactNode;
  closeOnBackdrop?: boolean;
  showClose?: boolean;
}

const SIZES: Record<ModalSize, string> = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-2xl',
};

export function Modal({
  open,
  onClose,
  title,
  description,
  size = 'md',
  children,
  footer,
  closeOnBackdrop = true,
  showClose = true,
}: ModalProps) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [open, onClose]);

  if (!open) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div
        className="absolute inset-0 bg-surface-950/40 backdrop-blur-sm animate-fade-in"
        onClick={closeOnBackdrop ? onClose : undefined}
      />
      <div
        role="dialog"
        aria-modal="true"
        className={cn(
          'relative flex w-full max-h-[92dvh] flex-col rounded-t-2xl sm:rounded-2xl bg-white shadow-elevated',
          'dark:bg-surface-900 border border-surface-200 dark:border-surface-800',
          'animate-slide-up sm:animate-scale-in safe-pb',
          SIZES[size]
        )}
      >
        {(title || showClose) && (
          <div className="flex items-start justify-between gap-4 p-5 pb-0">
            <div className="min-w-0">
              {title && (
                <h2 className="text-lg font-semibold text-surface-900 dark:text-surface-100">
                  {title}
                </h2>
              )}
              {description && (
                <p className="mt-1 text-sm text-surface-500 dark:text-surface-400">
                  {description}
                </p>
              )}
            </div>
            {showClose && (
              <button
                onClick={onClose}
                aria-label="Fechar"
                className="shrink-0 rounded-lg p-1.5 text-surface-500 hover:bg-surface-100 hover:text-surface-800 dark:hover:bg-surface-800 dark:hover:text-surface-100 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            )}
          </div>
        )}
        {children && <div className="p-5">{children}</div>}
        {footer && (
          <div className="flex items-center justify-end gap-2 border-t border-surface-200 dark:border-surface-800 p-5">
            {footer}
          </div>
        )}
      </div>
    </div>,
    document.body
  );
}
