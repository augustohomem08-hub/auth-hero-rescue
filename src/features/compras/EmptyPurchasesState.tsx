import type { ReactNode } from 'react';
import { EmptyState } from '@/components/ui';

interface EmptyPurchasesStateProps {
  icon: ReactNode;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
}

/**
 * Empty-state placeholder for the Purchases module. Wraps the shared
 * EmptyState in a dashed "placeholder zone" so sections read as
 * intentionally-empty rather than broken.
 */
export function EmptyPurchasesState({
  icon,
  title,
  description,
  actionLabel,
  onAction,
}: EmptyPurchasesStateProps) {
  return (
    <div className="rounded-xl border border-dashed border-surface-200 dark:border-surface-700">
      <EmptyState
        icon={icon}
        title={title}
        description={description}
        actionLabel={actionLabel}
        onAction={onAction}
      />
    </div>
  );
}
