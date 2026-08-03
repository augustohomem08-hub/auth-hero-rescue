import {
  Wallet,
  TrendingDown,
  Scale,
  PiggyBank,
  ArrowDownCircle,
  ArrowUpCircle,
} from 'lucide-react';
import { Card, CardHeader } from '@/components/ui';
import { formatCurrency } from '@/lib/utils';
import { StatCard } from '@/features/compras/dashboard/StatCard';
import { DonutChart, type DonutSlice } from '@/features/compras/dashboard/DonutChart';
import { BarChart } from '@/features/compras/dashboard/BarChart';
import { categoryLabel } from '../transactions/transactionConstants';
import { useTransactionsStats } from '../transactions/useTransactions';
import type { Transaction } from '@/types/finance';

interface FinanceDashboardProps {
  transactions: Transaction[] | undefined;
}

const statCur = formatCurrency;

/**
 * Real indicators for the Financeiro module, all derived from the cached
 * transaction list (no extra network round-trip). Shows receita/despesa
 * donut, budget progress, and per-category expense breakdown.
 */
export function FinanceDashboard({ transactions }: FinanceDashboardProps) {
  const stats = useTransactionsStats(transactions);

  const donutSlices: DonutSlice[] = [
    { label: 'Receitas', value: stats.byType.income, color: 'text-success-500' },
    { label: 'Despesas', value: stats.byType.expense, color: 'text-danger-500' },
  ];

  const categoryBars = stats.byCategory
    .slice(0, 6)
    .map((c) => ({ label: categoryLabel(c.category), value: c.total }));

  return (
    <div className="space-y-4">
      {/* Stat tiles — first row */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard
          label="Orçamento previsto"
          value={statCur(stats.budget)}
          icon={<Wallet className="h-5 w-5" />}
          tone="secondary"
          hint="Total de receitas"
        />
        <StatCard
          label="Valor gasto"
          value={statCur(stats.spent)}
          icon={<TrendingDown className="h-5 w-5" />}
          tone="danger"
          hint="Total de despesas"
        />
        <StatCard
          label="Saldo restante"
          value={statCur(stats.balance)}
          icon={<Scale className="h-5 w-5" />}
          tone={stats.balance >= 0 ? 'success' : 'warning'}
          hint={stats.balance >= 0 ? 'Receitas − despesas' : 'Negativo'}
        />
        <StatCard
          label="Economia"
          value={statCur(stats.savings)}
          icon={<PiggyBank className="h-5 w-5" />}
          tone={stats.savings >= 0 ? 'success' : 'danger'}
          hint={stats.savings >= 0 ? 'Abaixo do orçado' : 'Acima do orçado'}
        />
      </div>

      {/* Stat tiles — second row */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard
          label="Despesas"
          value={stats.expenseCount}
          icon={<ArrowDownCircle className="h-5 w-5" />}
          tone="danger"
        />
        <StatCard
          label="Receitas"
          value={stats.incomeCount}
          icon={<ArrowUpCircle className="h-5 w-5" />}
          tone="success"
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card padding="md">
          <CardHeader title="Receitas vs. Despesas" subtitle="Distribuição dos valores" />
          <div className="mt-4 flex justify-center">
            <DonutChart
              slices={donutSlices}
              centerLabel={statCur(stats.budget + stats.spent)}
              centerSub="movimentado"
            />
          </div>
        </Card>

        <Card padding="md">
          <CardHeader title="Despesas por categoria" subtitle="Onde o dinheiro foi gasto" />
          <div className="mt-4">
            <BarChart data={categoryBars} color="text-danger-500" />
          </div>
        </Card>
      </div>

      {/* Budget progress line */}
      {stats.budget > 0 && (
        <Card padding="md">
          <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
            <span className="text-surface-500 dark:text-surface-400">
              Orçado: <strong className="text-surface-900 dark:text-surface-100">{formatCurrency(stats.budget)}</strong>
            </span>
            <span className="text-surface-500 dark:text-surface-400">
              Gasto: <strong className="text-surface-900 dark:text-surface-100">{formatCurrency(stats.spent)}</strong>
            </span>
            <span className={stats.balance >= 0 ? 'text-success-600 dark:text-success-400' : 'text-danger-600 dark:text-danger-400'}>
              Saldo: {formatCurrency(stats.balance)}
            </span>
          </div>
          <div className="mt-3 h-2.5 overflow-hidden rounded-full bg-surface-100 dark:bg-surface-800">
            <div
              className={
                stats.usedPct > 100
                  ? 'h-full rounded-full bg-danger-500 transition-all duration-500'
                  : 'h-full rounded-full bg-primary-500 transition-all duration-500'
              }
              style={{
                width: `${Math.min(100, stats.usedPct)}%`,
              }}
            />
          </div>
        </Card>
      )}
    </div>
  );
}
