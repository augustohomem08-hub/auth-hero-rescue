import { NavLink } from 'react-router-dom';
import { MoreHorizontal } from 'lucide-react';
import { PRIMARY_NAV } from '@/config/navigation';
import { cn } from '@/lib/utils';

/** Mobile-only bottom navigation. Hidden on lg+ where the sidebar takes over. */
export function BottomNav({ onMore }: { onMore: () => void }) {
  return (
    <nav
      className="lg:hidden fixed inset-x-0 bottom-0 z-30 border-t border-surface-200 bg-white/90 backdrop-blur-lg dark:border-surface-800 dark:bg-surface-900/90 safe-pb"
      aria-label="Navegação principal"
    >
      <ul className="mx-auto flex max-w-md items-stretch justify-between px-2">
        {PRIMARY_NAV.map((item) => {
          const Icon = item.icon;
          return (
            <li key={item.to} className="flex-1">
              <NavLink
                to={item.to}
                end={item.to === '/'}
                className={({ isActive }) =>
                  cn(
                    'flex flex-col items-center gap-1 py-2.5 text-[11px] font-medium transition-colors',
                    isActive
                      ? 'text-primary-600 dark:text-primary-400'
                      : 'text-surface-500 dark:text-surface-400'
                  )
                }
              >
                {({ isActive }) => (
                  <>
                    <span
                      className={cn(
                        'flex h-7 w-12 items-center justify-center rounded-full transition-colors',
                        isActive && 'bg-primary-100 dark:bg-primary-900/40'
                      )}
                    >
                      <Icon className="h-5 w-5" />
                    </span>
                    <span className="truncate">{item.label}</span>
                  </>
                )}
              </NavLink>
            </li>
          );
        })}
        <li className="flex-1">
          <button
            type="button"
            onClick={onMore}
            className="flex w-full flex-col items-center gap-1 py-2.5 text-[11px] font-medium text-surface-500 dark:text-surface-400"
          >
            <span className="flex h-7 w-12 items-center justify-center rounded-full">
              <MoreHorizontal className="h-5 w-5" />
            </span>
            <span>Mais</span>
          </button>
        </li>
      </ul>
    </nav>
  );
}
