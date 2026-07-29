import { forwardRef, useId } from 'react';
import type { InputHTMLAttributes, ReactNode, TextareaHTMLAttributes, SelectHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

const BASE_FIELD =
  'w-full rounded-xl border bg-white text-surface-900 placeholder:text-surface-400 ' +
  'border-surface-300 transition-colors duration-150 ' +
  'focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-primary-400 ' +
  'disabled:opacity-50 disabled:cursor-not-allowed ' +
  'dark:bg-surface-900 dark:text-surface-100 dark:placeholder:text-surface-500 dark:border-surface-700';

const FIELD_SIZES = 'h-11 px-3.5 text-sm';
const TEXTAREA_SIZES = 'px-3.5 py-2.5 text-sm';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { label, error, hint, leftIcon, rightIcon, className, id, ...props },
  ref
) {
  const generatedId = useId();
  const fieldId = id ?? generatedId;
  return (
    <div className="w-full">
      {label && (
        <label
          htmlFor={fieldId}
          className="mb-1.5 block text-sm font-medium text-surface-700 dark:text-surface-200"
        >
          {label}
        </label>
      )}
      <div className="relative">
        {leftIcon && (
          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-surface-400">
            {leftIcon}
          </span>
        )}
        <input
          ref={ref}
          id={fieldId}
          aria-invalid={!!error}
          className={cn(
            BASE_FIELD,
            FIELD_SIZES,
            leftIcon && 'pl-10',
            rightIcon && 'pr-10',
            error && 'border-danger-400 focus:ring-danger-400 focus:border-danger-400',
            className
          )}
          {...props}
        />
        {rightIcon && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-surface-400">
            {rightIcon}
          </span>
        )}
      </div>
      {error ? (
        <p className="mt-1.5 text-xs text-danger-600 dark:text-danger-400">{error}</p>
      ) : hint ? (
        <p className="mt-1.5 text-xs text-surface-500 dark:text-surface-400">{hint}</p>
      ) : null}
    </div>
  );
});

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(function Textarea(
  { label, error, hint, className, id, ...props },
  ref
) {
  const generatedId = useId();
  const fieldId = id ?? generatedId;
  return (
    <div className="w-full">
      {label && (
        <label
          htmlFor={fieldId}
          className="mb-1.5 block text-sm font-medium text-surface-700 dark:text-surface-200"
        >
          {label}
        </label>
      )}
      <textarea
        ref={ref}
        id={fieldId}
        aria-invalid={!!error}
        className={cn(BASE_FIELD, TEXTAREA_SIZES, 'min-h-24 resize-y', error && 'border-danger-400 focus:ring-danger-400', className)}
        {...props}
      />
      {error ? (
        <p className="mt-1.5 text-xs text-danger-600 dark:text-danger-400">{error}</p>
      ) : hint ? (
        <p className="mt-1.5 text-xs text-surface-500 dark:text-surface-400">{hint}</p>
      ) : null}
    </div>
  );
});

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(function Select(
  { label, error, hint, className, id, children, ...props },
  ref
) {
  const generatedId = useId();
  const fieldId = id ?? generatedId;
  return (
    <div className="w-full">
      {label && (
        <label
          htmlFor={fieldId}
          className="mb-1.5 block text-sm font-medium text-surface-700 dark:text-surface-200"
        >
          {label}
        </label>
      )}
      <select
        ref={ref}
        id={fieldId}
        aria-invalid={!!error}
        className={cn(BASE_FIELD, FIELD_SIZES, 'appearance-none pr-9', error && 'border-danger-400 focus:ring-danger-400', className)}
        {...props}
      >
        {children}
      </select>
      {error ? (
        <p className="mt-1.5 text-xs text-danger-600 dark:text-danger-400">{error}</p>
      ) : hint ? (
        <p className="mt-1.5 text-xs text-surface-500 dark:text-surface-400">{hint}</p>
      ) : null}
    </div>
  );
});
