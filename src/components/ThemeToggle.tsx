import { Moon, Sun } from 'lucide-react';
import { useTheme } from '@/contexts/theme-context';
import { cn } from '@/lib/utils';

export function ThemeToggle({ className }: { className?: string }) {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';
  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={isDark ? 'Ativar tema claro' : 'Ativar tema escuro'}
      className={cn(
        'inline-flex h-10 w-10 items-center justify-center rounded-xl',
        'text-surface-600 hover:bg-surface-100 hover:text-surface-900',
        'dark:text-surface-300 dark:hover:bg-surface-800 dark:hover:text-surface-100',
        'transition-colors',
        className
      )}
    >
      {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
    </button>
  );
}
