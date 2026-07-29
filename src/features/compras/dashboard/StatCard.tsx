import type { ReactNode } from 'react';
import { Card } from '@/components/ui';
import { cn } from '@/lib/utils';

interface StatCardProps {
  label: string;
  value: ReactNode;
  icon?: ReactNode;
  /** Subtle hint under the value (e.g. "% concluído"). */
  hint?: string;
  tone?: 'primary' | 'secondary' | 'accent' | 'success' | 'warning' | 'danger' | 'neutral';
}

const ICON_TONES: Record<NonNullable<StatCardProps['tone']>, string> = {
  primary: 'bg-primary-100 text-primary-600 dark:bg-primary-900/40 dark:text-primary-300',
  secondary: 'bg-secondary-100 text-secondary-600 dark:bg-secondary-900/40 dark:text-secondary-300',
  accent: 'bg-accent-100 text-accent-600 dark:bg-accent-900/40 dark:text-accent-300',
  success: 'bg-success-100 text-success-600 dark:bg-success-900/40 dark:text-success-300',
  warning: 'bg-warning-100 text-warning-600 dark:bg-warning-900/40 dark:text-warning-300',
  danger: 'bg-danger-100 text-danger-600 dark:bg-danger-900/40 dark:text-danger-300',
  neutral: 'bg-surface-100 text-surface-500 dark:bg-surface-800 dark:text-surface-400',
};

/** Compact metric tile for the dashboard. */
export function StatCard({ label, value, icon, hint, tone = 'neutral' }: StatCardProps) {
  return (
    <Card padding="md" className="flex items-center gap-3.5">
      {icon && (
        <span className={cn('flex h-10 w-10 shrink-0 items-center justify-center rounded-xl', ICON_TONES[tone])}>
          {icon}
        </span>
      )}
      <div className="min-w-0">
        <p className="truncate text-xs font-medium text-surface-500 dark:text-surface-400">
          {label}
        </p>
        <p className="truncate text-lg font-semibold text-surface-900 dark:text-surface-100">
          {value}
        </p>
        {hint && (
          <p className="truncate text-xs text-surface-400 dark:text-surface-500">{hint}</p>
        )}
      </div>
    </Card>
  );
}
