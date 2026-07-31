import { useEffect, useState } from 'react';
import { Breadcrumb } from '@/components/Breadcrumb';
import { PageHeader } from '@/components/PageHeader';
import { FinanceDashboard } from './dashboard/FinanceDashboard';
import { PatrimonioSection } from './patrimonio/PatrimonioSection';
import { TransactionsPanel } from './transactions/TransactionsPanel';
import { useTransactions } from './transactions/useTransactions';
import { useSyncComprasMirror } from './transactions/useTransactions';
import { useItems } from '@/features/compras/items/useItems';
import { cn } from '@/lib/utils';

type Tab = 'visao' | 'patrimonio';

const TABS: { key: Tab; label: string }[] = [
  { key: 'visao', label: 'Visão geral' },
  { key: 'patrimonio', label: 'Patrimônio' },
];

/**
 * Financeiro module page.
 *
 * Two tabs: "Visão geral" (dashboard + transactions CRUD) and "Patrimônio"
 * (consolidated equity evolution). Both read the same transaction list, so
 * the Compras mirror and financing instalments stay consolidated without
 * duplicated logic.
 */
export function FinanceiroPage() {
  const { data: transactions } = useTransactions();
  const { data: items } = useItems();
  const syncMirror = useSyncComprasMirror(items);
  const [tab, setTab] = useState<Tab>('visao');

  // Re-sync the Compras mirror whenever the items list changes (create,
  // edit, delete, realtime update). The hook is idempotent and dedupes
  // via the unique source_item_id constraint.
  useEffect(() => {
    if (items) {
      syncMirror.mutate();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items]);

  return (
    <div className="animate-fade-in space-y-6">
      <div className="space-y-3">
        <Breadcrumb items={[{ label: 'Início', to: '/' }, { label: 'Financeiro' }]} />
        <PageHeader
          emoji="💰"
          title="Financeiro"
          description="Acompanhem juntos economia, gastos e metas do lar."
        />
      </div>

      <div
        role="tablist"
        aria-label="Seções do financeiro"
        className="inline-flex rounded-xl bg-surface-100 p-1 dark:bg-surface-800"
      >
        {TABS.map((t) => (
          <button
            key={t.key}
            role="tab"
            type="button"
            aria-selected={tab === t.key}
            onClick={() => setTab(t.key)}
            className={cn(
              'rounded-lg px-4 py-2 text-sm font-medium transition-colors',
              tab === t.key
                ? 'bg-white text-surface-900 shadow-sm dark:bg-surface-900 dark:text-surface-100'
                : 'text-surface-500 hover:text-surface-800 dark:text-surface-400 dark:hover:text-surface-200'
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'visao' ? (
        <>
          <FinanceDashboard transactions={transactions} />
          <TransactionsPanel />
        </>
      ) : (
        <PatrimonioSection transactions={transactions} />
      )}
    </div>
  );
}
