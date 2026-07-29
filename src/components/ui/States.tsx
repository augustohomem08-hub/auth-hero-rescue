import type { ReactNode } from 'react';
import { RefreshCw, AlertTriangle } from 'lucide-react';
import { Button } from './Button';

export interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function EmptyState({
  icon,
  title,
  description,
  actionLabel,
  onAction,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 px-6 py-12 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-surface-100 text-surface-400 dark:bg-surface-800 dark:text-surface-500">
        {icon}
      </div>
      <div className="space-y-1">
        <h3 className="text-base font-semibold text-surface-800 dark:text-surface-100">
          {title}
        </h3>
        {description && (
          <p className="mx-auto max-w-sm text-sm text-surface-500 dark:text-surface-400">
            {description}
          </p>
        )}
      </div>
      {actionLabel && onAction && (
        <Button variant="outline" size="sm" onClick={onAction} className="mt-2">
          {actionLabel}
        </Button>
      )}
    </div>
  );
}

export interface ErrorStateProps {
  title?: string;
  description?: string;
  onRetry?: () => void;
}

export function ErrorState({
  title = 'Algo deu errado',
  description = 'Tente novamente em instantes.',
  onRetry,
}: ErrorStateProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 px-6 py-12 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-danger-50 text-danger-500 dark:bg-danger-950 dark:text-danger-400">
        <AlertTriangle className="h-8 w-8" />
      </div>
      <div className="space-y-1">
        <h3 className="text-base font-semibold text-surface-800 dark:text-surface-100">
          {title}
        </h3>
        <p className="mx-auto max-w-sm text-sm text-surface-500 dark:text-surface-400">
          {description}
        </p>
      </div>
      {onRetry && (
        <Button variant="outline" size="sm" onClick={onRetry} leftIcon={<RefreshCw className="h-4 w-4" />} className="mt-2">
          Tentar novamente
        </Button>
      )}
    </div>
  );
}
