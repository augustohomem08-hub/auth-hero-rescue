import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

export interface PageHeaderProps {
  /** Emoji accent shown in a rounded tile. */
  emoji: string;
  title: string;
  description?: string;
  /** Right-aligned slot for primary actions (button, etc). */
  action?: ReactNode;
  className?: string;
}

export function PageHeader({ emoji, title, description, action, className }: PageHeaderProps) {
  return (
    <div className={cn('flex items-start justify-between gap-3', className)}>
      <div className="flex items-center gap-3 min-w-0">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-primary-100 text-2xl dark:bg-primary-900/40">
          {emoji}
        </span>
        <div className="min-w-0">
          <h1 className="text-xl font-semibold text-surface-900 dark:text-surface-100 sm:text-2xl">
            {title}
          </h1>
          {description && (
            <p className="mt-0.5 text-sm text-surface-500 dark:text-surface-400">
              {description}
            </p>
          )}
        </div>
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}
