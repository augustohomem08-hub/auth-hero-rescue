import type { ReactNode } from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export type SpinnerSize = 'sm' | 'md' | 'lg';

const SIZES: Record<SpinnerSize, string> = {
  sm: 'h-4 w-4',
  md: 'h-6 w-6',
  lg: 'h-10 w-10',
};

export function Spinner({ size = 'md', className }: { size?: SpinnerSize; className?: string }) {
  return <Loader2 className={cn('animate-spin text-primary-500', SIZES[size], className)} />;
}

export function LoadingOverlay({ label = 'Carregando…' }: { label?: string }) {
  return (
    <div
      role="status"
      className="flex flex-col items-center justify-center gap-3 py-12 text-center"
    >
      <Spinner size="lg" />
      <p className="text-sm text-surface-500 dark:text-surface-400">{label}</p>
    </div>
  );
}

export function FullPageLoading({ label = 'Carregando…' }: { label?: string }) {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3">
      <Spinner size="lg" />
      <p className="text-sm text-surface-500 dark:text-surface-400">{label}</p>
    </div>
  );
}

export function PageSkeleton() {
  return (
    <div className="space-y-4 p-4 sm:p-6">
      <div className="skeleton h-8 w-48" />
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="skeleton h-32 w-full" />
        <div className="skeleton h-32 w-full" />
      </div>
      <div className="space-y-2">
        <div className="skeleton h-16 w-full" />
        <div className="skeleton h-16 w-full" />
        <div className="skeleton h-16 w-full" />
      </div>
    </div>
  );
}

export function ButtonSpinner({ children }: { children?: ReactNode }) {
  return <>{children}</>;
}
