import { useEffect, useRef } from 'react';
import { Link } from '@tanstack/react-router';
import { PartyPopper } from 'lucide-react';
import { toast } from 'sonner';
import { Card, CardHeader } from '@/components/ui';
import { formatCurrency, formatDate } from '@/lib/utils';
import { markItemCelebrated } from '@/lib/items';
import { createMemory } from '@/lib/memories';
import { useItems, itemsKeys } from '@/features/compras/items/useItems';
import { useActiveProject } from '@/features/onboarding/useProjectMembership';
import { useQueryClient } from '@tanstack/react-query';
import type { Item } from '@/types/purchases';

/** Statuses that mean the purchase actually happened. */
function isDone(item: Item): boolean {
  return (
    (item.status === 'purchased' || item.status === 'delivered' || item.status === 'installed') &&
    item.paid_price != null
  );
}

/** How long a completed purchase stays on the Home celebration card. */
const CELEBRATION_WINDOW_DAYS = 14;

/**
 * Celebrates finished purchases on the Home screen.
 *
 * When an item reaches a "done" status with a recorded paid price for the
 * first time, we create a Jornada memory for it and stamp `celebrated_at`
 * so it never fires twice. Recently celebrated purchases are then listed
 * here (mirroring the UpcomingDeadlines card, but looking backwards).
 */
export function RecentlyCompleted() {
  const { data: active } = useActiveProject();
  const { data: items } = useItems();
  const queryClient = useQueryClient();
  const running = useRef<Set<string>>(new Set());
  const projectId = active?.project.id;

  useEffect(() => {
    if (!projectId || !items) return;
    const pending = items.filter((i) => isDone(i) && !i.celebrated_at && !running.current.has(i.id));
    if (pending.length === 0) return;

    let cancelled = false;
    (async () => {
      for (const item of pending) {
        running.current.add(item.id);
        try {
          await createMemory(projectId, {
            title: `${item.name} comprado!`,
            description:
              item.paid_price != null
                ? `Compra concluída por ${formatCurrency(Number(item.paid_price))}.`
                : 'Compra concluída.',
            date: new Date().toISOString().slice(0, 10),
            is_highlight: true,
          });
          await markItemCelebrated(item.id);
          if (!cancelled) toast.success(`🎉 Vocês compraram ${item.name}!`);
        } catch {
          running.current.delete(item.id);
        }
      }
      if (!cancelled) {
        queryClient.invalidateQueries({ queryKey: itemsKeys.all });
        queryClient.invalidateQueries({ queryKey: ['memories'] });
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [items, projectId, queryClient]);

  const cutoff = Date.now() - CELEBRATION_WINDOW_DAYS * 86400000;
  const recent = (items ?? [])
    .filter((i) => i.celebrated_at && new Date(i.celebrated_at).getTime() >= cutoff)
    .sort((a, b) => (b.celebrated_at ?? '').localeCompare(a.celebrated_at ?? ''))
    .slice(0, 5);

  if (recent.length === 0) return null;

  return (
    <Card>
      <CardHeader
        title="Conquistas recentes"
        subtitle="Compras concluídas por vocês nas últimas semanas"
      />
      <ul className="mt-4 space-y-3">
        {recent.map((item) => (
          <li key={item.id} className="flex items-center gap-3">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-success-100 text-success-600 dark:bg-success-900/40 dark:text-success-300">
              <PartyPopper className="h-4 w-4" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-surface-900 dark:text-surface-100">
                🎉 Vocês compraram {item.name}!
              </p>
              <p className="truncate text-xs text-surface-500 dark:text-surface-400">
                {item.celebrated_at ? formatDate(item.celebrated_at.slice(0, 10)) : ''}
                {item.paid_price != null ? ` · ${formatCurrency(Number(item.paid_price))}` : ''}
              </p>
            </div>
          </li>
        ))}
      </ul>
      <Link
        to="/jornada"
        className="mt-4 inline-block text-sm font-medium text-primary-600 hover:underline dark:text-primary-400"
      >
        Ver a jornada completa →
      </Link>
    </Card>
  );
}
