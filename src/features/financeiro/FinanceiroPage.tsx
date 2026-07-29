import { useEffect } from 'react';
import { Breadcrumb } from '@/components/Breadcrumb';
import { PageHeader } from '@/components/PageHeader';
import { FinanceDashboard } from './dashboard/FinanceDashboard';
import { TransactionsPanel } from './transactions/TransactionsPanel';
import { useTransactions } from './transactions/useTransactions';
import { useSyncComprasMirror } from './transactions/useTransactions';
import { useItems } from '@/features/compras/items/useItems';

/**
 * Financeiro module page.
 *
 * Layout: header, a dashboard with real indicators derived from the
 * transaction list, then the transactions panel (toolbar + list + dialogs).
 * Transactions have realtime CRUD with optimistic updates.
 *
 * Compras integration: every item with a paid_price is mirrored into a
 * despesa transaction (tagged with source_item_id so it is never duplicated).
 * The sync runs whenever the items list changes and stays in sync in real
 * time. Mirrored entries appear in the dashboard indicators and charts.
 */
export function FinanceiroPage() {
  const { data: transactions } = useTransactions();
  const { data: items } = useItems();
  const syncMirror = useSyncComprasMirror(items);

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

      <FinanceDashboard transactions={transactions} />

      <TransactionsPanel />
    </div>
  );
}
