import { forwardRef } from 'react';
import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { cn } from '@/lib/utils';

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'success';
export type ButtonSize = 'sm' | 'md' | 'lg' | 'icon';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  fullWidth?: boolean;
}

const VARIANTS: Record<ButtonVariant, string> = {
  primary:
    'bg-primary-500 text-white hover:bg-primary-600 active:bg-primary-700 shadow-soft',
  secondary:
    'bg-secondary-500 text-white hover:bg-secondary-600 active:bg-secondary-700 shadow-soft',
  outline:
    'border border-surface-300 bg-transparent text-surface-800 hover:bg-surface-100 dark:text-surface-100 dark:border-surface-700 dark:hover:bg-surface-800',
  ghost:
    'bg-transparent text-surface-700 hover:bg-surface-100 dark:text-surface-200 dark:hover:bg-surface-800',
  danger:
    'bg-danger-500 text-white hover:bg-danger-600 active:bg-danger-700 shadow-soft',
  success:
    'bg-success-500 text-white hover:bg-success-600 active:bg-success-700 shadow-soft',
};

const SIZES: Record<ButtonSize, string> = {
  sm: 'h-9 px-3 text-sm gap-1.5',
  md: 'h-11 px-4 text-sm gap-2',
  lg: 'h-12 px-6 text-base gap-2',
  icon: 'h-10 w-10 justify-center',
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  {
    variant = 'primary',
    size = 'md',
    isLoading = false,
    leftIcon,
    rightIcon,
    fullWidth = false,
    disabled,
    className,
    children,
    ...props
  },
  ref
) {
  return (
    <button
      ref={ref}
      disabled={disabled || isLoading}
      className={cn(
        'inline-flex items-center rounded-xl font-medium transition-colors duration-150',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-400 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-surface-950',
        'disabled:opacity-50 disabled:pointer-events-none',
        VARIANTS[variant],
        SIZES[size],
        fullWidth && 'w-full',
        className
      )}
      {...props}
    >
      {isLoading ? <Spinner size={size === 'lg' ? 'md' : 'sm'} /> : leftIcon}
      {children}
      {rightIcon}
    </button>
  );
});

function Spinner({ size = 'md' }: { size?: 'sm' | 'md' }) {
  return (
    <svg
      className={cn('animate-spin', size === 'sm' ? 'h-4 w-4' : 'h-5 w-5')}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden
    >
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
    </svg>
  );
}
