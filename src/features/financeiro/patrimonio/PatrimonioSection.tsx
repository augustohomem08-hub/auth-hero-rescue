import { useMemo } from 'react';
import {
  Landmark,
  Home,
  TrendingUp,
  CalendarClock,
  Sofa,
  AlertTriangle,
} from 'lucide-react';
import { Card, CardHeader, Badge } from '@/components/ui';
import { formatCurrency, formatDate } from '@/lib/utils';
import { getDueState, dueLabel } from '@/lib/dateUtils';
import { StatCard } from '@/features/compras/dashboard/StatCard';
import { BarChart } from '@/features/compras/dashboard/BarChart';
import { DonutChart, type DonutSlice } from '@/features/compras/dashboard/DonutChart';
import type { Transaction } from '@/types/finance';

/** Expense categories that represent the property itself (imóvel). */
const PROPERTY_CATEGORIES = new Set(['financiamento', 'construcao', 'cartorio', 'taxas']);

interface PatrimonioSectionProps {
  transactions: Transaction[] | undefined;
}

interface MonthPoint {
  key: string;
  label: string;
  invested: number;
  cumulative: number;
}

const MONTH_LABELS = [
  'jan', 'fev', 'mar', 'abr', 'mai', 'jun',
  'jul', 'ago', 'set', 'out', 'nov', 'dez',
];

function monthLabel(key: string): string {
  const [y, m] = key.split('-');
  return `${MONTH_LABELS[Number(m) - 1]}/${y.slice(2)}`;
}

/**
 * Consolidated equity view (patrimônio).
 *
 * Derives everything from the existing `transactions` list — the same source
 * already fed by the Compras mirror (`source_item_id`) — so financing
 * instalments, construction costs and furniture purchases are consolidated in
 * a single timeline without duplicating logic or schema.
 */
export function PatrimonioSection({ transactions }: PatrimonioSectionProps) {
  const model = useMemo(() => {
    const list = transactions ?? [];
    const expenses = list.filter((t) => t.type === 'expense');
    const today = new Date().toISOString().slice(0, 10);

    let property = 0;
    let household = 0;
    let financing = 0;
    let paidFuture = 0;

    const byMonth = new Map<string, number>();

    expenses.forEach((t) => {
      const amount = Number(t.amount) || 0;
      if (PROPERTY_CATEGORIES.has(t.category)) property += amount;
      else household += amount;
      if (t.category === 'financiamento') financing += amount;
      if (t.date > today) paidFuture += amount;

      const key = (t.date ?? '').slice(0, 7);
      if (key) byMonth.set(key, (byMonth.get(key) ?? 0) + amount);
    });

    const months: MonthPoint[] = Array.from(byMonth.entries())
      .sort((a, b) => a[0].localeCompare(b[0]))
      .reduce<MonthPoint[]>((acc, [key, invested]) => {
        const prev = acc.length > 0 ? acc[acc.length - 1].cumulative : 0;
        acc.push({ key, label: monthLabel(key), invested, cumulative: prev + invested });
        return acc;
      }, []);

    const total = property + household;
    const monthlyAvg = months.length === 0 ? 0 : total / months.length;

    // Upcoming/overdue financing instalments (expenses dated in the future or
    // recently past, in the financiamento category).
    const instalments = expenses
      .filter((t) => t.category === 'financiamento' && t.date)
      .sort((a, b) => b.date.localeCompare(a.date));

    const upcoming = instalments
      .filter((t) => {
        const state = getDueState(t.date);
        return state === 'soon' || state === 'today' || (state === 'overdue' && t.date >= addDays(today, -30));
      })
      .slice(0, 5);

    return {
      total,
      property,
      household,
      financing,
      paidFuture,
      months,
      monthlyAvg,
      upcoming,
      count: expenses.length,
    };
  }, [transactions]);

  const donut: DonutSlice[] = [
    { label: 'Imóvel', value: model.property, color: 'text-primary-500' },
    { label: 'Casa e mobília', value: model.household, color: 'text-secondary-500' },
  ];

  const evolution = model.months.slice(-12).map((m) => ({ label: m.label, value: m.cumulative }));

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard
          label="Patrimônio investido"
          value={formatCurrency(model.total)}
          icon={<TrendingUp className="h-5 w-5" />}
          tone="primary"
          hint={`${model.count} lançamentos`}
        />
        <StatCard
          label="Imóvel"
          value={formatCurrency(model.property)}
          icon={<Home className="h-5 w-5" />}
          tone="secondary"
          hint="Financiamento, obra, cartório e taxas"
        />
        <StatCard
          label="Financiamento"
          value={formatCurrency(model.financing)}
          icon={<Landmark className="h-5 w-5" />}
          tone="accent"
          hint="Parcelas registradas"
        />
        <StatCard
          label="Casa e mobília"
          value={formatCurrency(model.household)}
          icon={<Sofa className="h-5 w-5" />}
          tone="success"
          hint="Inclui compras espelhadas"
        />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader
            title="Evolução do investimento"
            subtitle="Total acumulado por mês (últimos 12 meses)"
          />
          <div className="mt-4">
            <BarChart data={evolution} color="text-primary-500" formatValue={formatCurrency} />
          </div>
          {model.months.length > 0 && (
            <p className="mt-3 text-xs text-surface-500 dark:text-surface-400">
              Média de {formatCurrency(model.monthlyAvg)} por mês.
            </p>
          )}
        </Card>

        <Card>
          <CardHeader title="Composição do patrimônio" subtitle="Imóvel x casa e mobília" />
          <div className="mt-4 flex justify-center">
            <DonutChart slices={donut} />
          </div>
        </Card>
      </div>

      <Card>
        <CardHeader
          title="Parcelas do financiamento"
          subtitle="Vencidas recentemente ou vencendo nos próximos dias"
        />
        {model.upcoming.length === 0 ? (
          <p className="mt-4 text-sm text-surface-500 dark:text-surface-400">
            Nenhuma parcela vencida ou próxima do vencimento. Cadastre as parcelas como despesas
            na categoria “Financiamento” para acompanhá-las aqui.
          </p>
        ) : (
          <ul className="mt-4 space-y-3">
            {model.upcoming.map((t) => {
              const state = getDueState(t.date);
              return (
                <li key={t.id} className="flex items-center gap-3">
                  <span
                    className={
                      state === 'overdue'
                        ? 'flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-danger-100 text-danger-600 dark:bg-danger-900/40 dark:text-danger-300'
                        : 'flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-warning-100 text-warning-600 dark:bg-warning-900/40 dark:text-warning-300'
                    }
                  >
                    {state === 'overdue' ? (
                      <AlertTriangle className="h-4 w-4" />
                    ) : (
                      <CalendarClock className="h-4 w-4" />
                    )}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-surface-900 dark:text-surface-100">
                      {t.title}
                    </p>
                    <p className="text-xs text-surface-500 dark:text-surface-400">
                      {formatDate(t.date)} · {formatCurrency(Number(t.amount) || 0)}
                    </p>
                  </div>
                  <Badge tone={state === 'overdue' ? 'danger' : 'warning'}>{dueLabel(t.date)}</Badge>
                </li>
              );
            })}
          </ul>
        )}
      </Card>
    </div>
  );
}

function addDays(iso: string, days: number): string {
  const d = new Date(`${iso}T00:00:00`);
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}
