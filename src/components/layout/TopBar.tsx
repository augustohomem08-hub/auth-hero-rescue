import { useLocation } from 'react-router-dom';
import { NAV_ITEMS } from '@/config/navigation';
import { ThemeToggle } from '@/components/ThemeToggle';
import { Menu } from 'lucide-react';

/** Mobile top bar. Shows the current module's title + theme toggle + a "more" trigger. */
export function TopBar({ onMore }: { onMore: () => void }) {
  const { pathname } = useLocation();
  const current =
    NAV_ITEMS.find((n) => (n.to === '/' ? pathname === '/' : pathname.startsWith(n.to))) ??
    NAV_ITEMS[0];

  return (
    <header className="lg:hidden sticky top-0 z-20 flex h-14 items-center justify-between gap-2 border-b border-surface-200 bg-white/90 px-4 backdrop-blur-lg dark:border-surface-800 dark:bg-surface-900/90 safe-pt">
      <div className="flex items-center gap-2 min-w-0">
        <span className="text-lg" aria-hidden>
          {current.emoji}
        </span>
        <h1 className="truncate text-base font-semibold text-surface-900 dark:text-surface-100">
          {current.label}
        </h1>
      </div>
      <div className="flex items-center gap-1">
        <ThemeToggle />
        <button
          type="button"
          onClick={onMore}
          aria-label="Mais opções"
          className="inline-flex h-10 w-10 items-center justify-center rounded-xl text-surface-600 hover:bg-surface-100 dark:text-surface-300 dark:hover:bg-surface-800 transition-colors"
        >
          <Menu className="h-5 w-5" />
        </button>
      </div>
    </header>
  );
}
