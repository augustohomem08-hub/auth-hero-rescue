import { NavLink } from '@/components/NavLink';
import { Heart } from 'lucide-react';
import { X } from 'lucide-react';
import { NAV_ITEMS } from '@/config/navigation';
import { cn } from '@/lib/utils';

/** Slide-up sheet on mobile listing the secondary modules + branding. */
export function MoreSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  if (!open) return null;
  return (
    <div className="lg:hidden fixed inset-0 z-40">
      <div className="absolute inset-0 bg-surface-950/40 backdrop-blur-sm animate-fade-in" onClick={onClose} />
      <div className="absolute inset-x-0 bottom-0 rounded-t-2xl bg-white p-5 shadow-elevated dark:bg-surface-900 safe-pb animate-slide-up">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary-500 text-white">
              <Heart className="h-5 w-5" />
            </span>
            <div>
              <p className="text-sm font-semibold text-surface-900 dark:text-surface-100">
                Nosso Lar
              </p>
              <p className="text-xs text-surface-500 dark:text-surface-400">Todos os módulos</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar"
            className="rounded-lg p-1.5 text-surface-500 hover:bg-surface-100 dark:hover:bg-surface-800"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="mt-4 grid grid-cols-2 gap-2" aria-label="Mais módulos">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/'}
                onClick={onClose}
                className={({ isActive }) =>
                  cn(
                    'flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-primary-100 text-primary-700 dark:bg-primary-900/40 dark:text-primary-300'
                      : 'text-surface-600 hover:bg-surface-100 dark:text-surface-300 dark:hover:bg-surface-800'
                  )
                }
              >
                <Icon className="h-5 w-5 shrink-0" />
                <span className="truncate">{item.label}</span>
              </NavLink>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
