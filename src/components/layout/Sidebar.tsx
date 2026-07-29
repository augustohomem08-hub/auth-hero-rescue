import { NavLink } from 'react-router-dom';
import { Heart } from 'lucide-react';
import { NAV_ITEMS } from '@/config/navigation';
import { ThemeToggle } from '@/components/ThemeToggle';
import { cn } from '@/lib/utils';

/** Desktop-only sidebar (lg+). */
export function Sidebar() {
  return (
    <aside className="hidden lg:flex lg:fixed lg:inset-y-0 lg:left-0 lg:w-64 lg:flex-col lg:border-r lg:border-surface-200 lg:bg-white dark:lg:border-surface-800 dark:lg:bg-surface-900">
      <div className="flex h-16 items-center gap-2.5 px-5">
        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary-500 text-white shadow-soft">
          <Heart className="h-5 w-5" />
        </span>
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-surface-900 dark:text-surface-100">
            Nosso Primeiro Lar
          </p>
          <p className="truncate text-xs text-surface-500 dark:text-surface-400">
            🏡 Construindo juntos ❤️
          </p>
        </div>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-2" aria-label="Navegação principal">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-primary-100 text-primary-700 dark:bg-primary-900/40 dark:text-primary-300'
                    : 'text-surface-600 hover:bg-surface-100 hover:text-surface-900 dark:text-surface-300 dark:hover:bg-surface-800 dark:hover:text-surface-100'
                )
              }
            >
              <Icon className="h-5 w-5 shrink-0" />
              <span className="truncate">{item.label}</span>
            </NavLink>
          );
        })}
      </nav>

      <div className="border-t border-surface-200 p-3 dark:border-surface-800">
        <div className="flex items-center justify-between">
          <span className="text-xs text-surface-500 dark:text-surface-400">Tema</span>
          <ThemeToggle />
        </div>
      </div>
    </aside>
  );
}
