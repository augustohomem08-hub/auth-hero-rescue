import type { HTMLAttributes, ReactNode } from 'react';
import { cn } from '@/lib/utils';

export type CardPadding = 'none' | 'sm' | 'md' | 'lg';

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  padding?: CardPadding;
  interactive?: boolean;
}

const PADDING: Record<CardPadding, string> = {
  none: 'p-0',
  sm: 'p-3',
  md: 'p-5',
  lg: 'p-6',
};

export function Card({
  padding = 'md',
  interactive = false,
  className,
  children,
  ...props
}: CardProps) {
  return (
    <div
      className={cn(
        'rounded-2xl bg-white shadow-card dark:bg-surface-900',
        'border border-surface-200/60 dark:border-surface-800',
        interactive &&
          'transition-all duration-200 hover:shadow-elevated hover:-translate-y-0.5 cursor-pointer',
        PADDING[padding],
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({
  title,
  subtitle,
  action,
  className,
}: {
  title: ReactNode;
  subtitle?: ReactNode;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn('flex items-start justify-between gap-3', className)}>
      <div className="min-w-0">
        <h3 className="text-base font-semibold text-surface-900 dark:text-surface-100 truncate">
          {title}
        </h3>
        {subtitle && (
          <p className="mt-0.5 text-sm text-surface-500 dark:text-surface-400 truncate">
            {subtitle}
          </p>
        )}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}

export function CardBody({ className, children }: { className?: string; children: ReactNode }) {
  return <div className={cn('mt-4', className)}>{children}</div>;
}

export function CardFooter({ className, children }: { className?: string; children: ReactNode }) {
  return (
    <div
      className={cn(
        'mt-4 flex items-center justify-end gap-2 border-t border-surface-200/60 pt-4 dark:border-surface-800',
        className
      )}
    >
      {children}
    </div>
  );
}
