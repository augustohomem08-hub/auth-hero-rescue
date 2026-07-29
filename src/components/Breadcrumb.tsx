import { Link } from '@/components/NavLink';
import { ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface BreadcrumbItem {
  label: string;
  to?: string;
}

/**
 * Reusable breadcrumb trail. The last item is rendered as plain text
 * (current page); earlier items with a `to` are links.
 */
export function Breadcrumb({ items }: { items: BreadcrumbItem[] }) {
  return (
    <nav aria-label="Breadcrumb">
      <ol className="flex flex-wrap items-center gap-1 text-xs text-surface-500 dark:text-surface-400">
        {items.map((item, idx) => {
          const isLast = idx === items.length - 1;
          return (
            <li key={idx} className="flex items-center gap-1">
              {item.to && !isLast ? (
                <Link
                  to={item.to}
                  className="transition-colors hover:text-surface-700 dark:hover:text-surface-200"
                >
                  {item.label}
                </Link>
              ) : (
                <span
                  className={cn(
                    isLast && 'font-medium text-surface-700 dark:text-surface-200'
                  )}
                  aria-current={isLast ? 'page' : undefined}
                >
                  {item.label}
                </span>
              )}
              {!isLast && (
                <ChevronRight className="h-3 w-3 text-surface-300 dark:text-surface-600" aria-hidden />
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
