import { Package, ShoppingCart, Clock, TrendingUp } from 'lucide-react';
import { Card, CardHeader } from '@/components/ui';
import { formatCurrency } from '@/lib/utils';
import { StatCard } from './StatCard';
import { DonutChart, type DonutSlice } from './DonutChart';
import { BarChart } from './BarChart';
import { useItemsStats } from '../items/useItems';
import type { Item, Room } from '@/types/purchases';

interface PurchasesDashboardProps {
  items: Item[] | undefined;
  rooms: Room[];
  /** True only when both the items and rooms queries have loaded. */
  isReady?: boolean;
}

/**
 * Real indicators for the Purchases module, all derived from the cached item
 * list (no extra network round-trip). Budget numbers intentionally live only
 * in the summary bar at the bottom to avoid duplicating them in the tiles.
 */
export function PurchasesDashboard({ items, rooms, isReady = true }: PurchasesDashboardProps) {
  const stats = useItemsStats(items, rooms);

  const donutSlices: DonutSlice[] = [
    { label: 'Comprado', value: stats.purchased, color: 'text-success-500' },
    { label: 'Pendente', value: stats.pending, color: 'text-surface-300' },
  ];

  const roomBars = stats.byRoom
    .slice()
    .sort((a, b) => b.count - a.count)
    .slice(0, 6)
    .map((r) => ({ label: r.roomName, value: r.count }));

  return (
    <div className="space-y-4">
      {/* Stat tiles */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard
          label="Total de itens"
          value={stats.total}
          icon={<Package className="h-5 w-5" />}
          tone="primary"
        />
        <StatCard
          label="Comprados"
          value={stats.purchased}
          icon={<ShoppingCart className="h-5 w-5" />}
          tone="success"
        />
        <StatCard
          label="Pendentes"
          value={stats.pending}
          icon={<Clock className="h-5 w-5" />}
          tone="warning"
        />
        <StatCard
          label="Concluído"
          value={`${stats.progressPct}%`}
          icon={<TrendingUp className="h-5 w-5" />}
          tone="accent"
          hint={stats.total === 0 ? 'Sem itens ainda' : `${stats.purchased} de ${stats.total}`}
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card padding="md">
          <CardHeader title="Progresso" subtitle="Itens comprados vs. pendentes" />
          <div className="mt-4 flex justify-center">
            <DonutChart
              slices={donutSlices}
              centerLabel={`${stats.progressPct}%`}
              centerSub="concluído"
            />
          </div>
        </Card>

        <Card padding="md">
          <CardHeader title="Por ambiente" subtitle="Quantidade de itens" />
          <div className="mt-4">
            {isReady ? (
              <BarChart data={roomBars} color="text-primary-500" />
            ) : (
              <p className="py-6 text-center text-sm text-surface-500 dark:text-surface-400">
                Carregando ambientes…
              </p>
            )}
          </div>
        </Card>
      </div>

      {/* Budget summary line */}
      {stats.budgetEstimated > 0 && (
        <Card padding="md">
          <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
            <span className="text-surface-500 dark:text-surface-400">
              Previsto: <strong className="text-surface-900 dark:text-surface-100">{formatCurrency(stats.budgetEstimated)}</strong>
            </span>
            <span className="text-surface-500 dark:text-surface-400">
              Realizado: <strong className="text-surface-900 dark:text-surface-100">{formatCurrency(stats.budgetPaid)}</strong>
            </span>
            <span className={stats.savings >= 0 ? 'text-success-600 dark:text-success-400' : 'text-danger-600 dark:text-danger-400'}>
              {stats.savings >= 0 ? 'Economia' : 'Excedente'}: {formatCurrency(Math.abs(stats.savings))}
            </span>
          </div>
          <div className="mt-3 h-2.5 overflow-hidden rounded-full bg-surface-100 dark:bg-surface-800">
            <div
              className="h-full rounded-full bg-primary-500 transition-all duration-500"
              style={{
                width: `${Math.min(100, Math.round((stats.budgetPaid / stats.budgetEstimated) * 100))}%`,
              }}
            />
          </div>
        </Card>
      )}
    </div>
  );
}
