import { useMemo, useState } from 'react';
import { Plus, Receipt } from 'lucide-react';
import { Card, CardHeader, Button, EmptyState } from '@/components/ui';
import {
  useCreateTransaction,
  useDeleteTransaction,
  useDeleteTransactions,
  useTransactions,
  useUpdateTransaction,
} from './useTransactions';
import { TransactionsList } from './TransactionsList';
import { TransactionsToolbar } from './TransactionsToolbar';
import { DEFAULT_FILTERS, type TransactionsFilters } from './transactionsFilters';
import { TransactionDialog, type TransactionSubmitValues } from './TransactionDialog';
import { DeleteTransactionDialog } from './DeleteTransactionDialog';
import type { Transaction } from '@/types/finance';

type DialogState =
  | { kind: 'none' }
  | { kind: 'create' }
  | { kind: 'edit'; transaction: Transaction }
  | { kind: 'delete'; transaction: Transaction }
  | { kind: 'deleteBatch'; ids: string[] };

/**
 * Transactions section of the Financeiro module. Hosts the toolbar (search,
 * filters, sort, bulk actions), the filtered + paginated transaction list
 * with multi-select, and the create / edit / delete dialogs. All mutations
 * run through React Query with optimistic updates + realtime sync.
 */
export function TransactionsPanel() {
  const { data: transactions, isLoading, isError, refetch } = useTransactions();
  const createTransaction = useCreateTransaction();
  const updateTransaction = useUpdateTransaction();
  const deleteTransaction = useDeleteTransaction();
  const deleteTransactions = useDeleteTransactions();

  const [filters, setFilters] = useState<TransactionsFilters>(DEFAULT_FILTERS);
  const [selection, setSelection] = useState<Set<string>>(new Set());
  const [page, setPage] = useState(1);
  const [dialog, setDialog] = useState<DialogState>({ kind: 'none' });
  const [serverError, setServerError] = useState<string | null>(null);

  const close = () => {
    setDialog({ kind: 'none' });
    setServerError(null);
  };

  const toggleSelect = (t: Transaction) => {
    setSelection((prev) => {
      const next = new Set(prev);
      if (next.has(t.id)) next.delete(t.id);
      else next.add(t.id);
      return next;
    });
  };
  const clearSelection = () => setSelection(new Set());

  const handleCreate = async (values: TransactionSubmitValues) => {
    setServerError(null);
    try {
      await createTransaction.mutateAsync({
        title: values.title,
        description: values.description,
        category: values.category,
        type: values.type,
        amount: values.amount,
        date: values.date,
        notes: values.notes,
      });
      close();
    } catch (e) {
      setServerError(toMessage(e));
    }
  };

  const handleUpdate = async (values: TransactionSubmitValues) => {
    if (dialog.kind !== 'edit') return;
    setServerError(null);
    try {
      await updateTransaction.mutateAsync({
        transactionId: dialog.transaction.id,
        patch: {
          title: values.title,
          description: values.description,
          category: values.category,
          type: values.type,
          amount: values.amount,
          date: values.date,
          notes: values.notes,
        },
      });
      close();
    } catch (e) {
      setServerError(toMessage(e));
    }
  };

  const handleDelete = async () => {
    if (dialog.kind === 'delete') {
      try {
        await deleteTransaction.mutateAsync(dialog.transaction.id);
        close();
      } catch (e) {
        setServerError(toMessage(e));
      }
    } else if (dialog.kind === 'deleteBatch') {
      try {
        await deleteTransactions.mutateAsync(dialog.ids);
        clearSelection();
        close();
      } catch (e) {
        setServerError(toMessage(e));
      }
    }
  };

  // Edit dialog initial values mapped from the transaction.
  const editInitial = useMemo<TransactionSubmitValues | null>(() => {
    if (dialog.kind !== 'edit') return null;
    const t = dialog.transaction;
    return {
      title: t.title,
      description: t.description,
      category: t.category,
      type: t.type,
      amount: Number(t.amount),
      date: t.date,
      notes: t.notes,
    };
  }, [dialog]);

  const selectedCount = selection.size;
  const selectedIds = useMemo(() => Array.from(selection), [selection]);

  return (
    <Card padding="lg" className="h-full">
      <CardHeader
        title="Lançamentos"
        subtitle="Receitas e despesas do projeto"
        action={
          <Button
            size="sm"
            variant="primary"
            leftIcon={<Plus className="h-4 w-4" />}
            onClick={() => setDialog({ kind: 'create' })}
          >
            Novo lançamento
          </Button>
        }
      />

      <div className="mt-4 space-y-4">
        {transactions && transactions.length === 0 ? (
          <EmptyState
            icon={<Receipt className="h-7 w-7" />}
            title="Nenhum lançamento ainda"
            description="Adicione o primeiro lançamento para acompanhar suas finanças."
            actionLabel="Adicionar lançamento"
            onAction={() => setDialog({ kind: 'create' })}
          />
        ) : (
          <>
            <TransactionsToolbar
              filters={filters}
              onFiltersChange={setFilters}
              selectedCount={selectedCount}
              onClearSelection={clearSelection}
              onBulkDelete={() => setDialog({ kind: 'deleteBatch', ids: selectedIds })}
            />
            <TransactionsList
              transactions={transactions}
              filters={filters}
              isLoading={isLoading}
              isError={isError}
              onRetry={() => refetch()}
              selection={selection}
              onToggleSelect={toggleSelect}
              onEdit={(t) => setDialog({ kind: 'edit', transaction: t })}
              onDelete={(t) => setDialog({ kind: 'delete', transaction: t })}
              page={page}
              onPageChange={setPage}
            />
          </>
        )}
      </div>

      {/* Create / edit dialog */}
      <TransactionDialog
        open={dialog.kind === 'create' || dialog.kind === 'edit'}
        onClose={close}
        initial={dialog.kind === 'edit' ? editInitial : null}
        title={dialog.kind === 'edit' ? 'Editar lançamento' : 'Novo lançamento'}
        submitLabel={dialog.kind === 'edit' ? 'Salvar' : 'Adicionar lançamento'}
        isSubmitting={createTransaction.isPending || updateTransaction.isPending}
        serverError={serverError}
        onSubmit={dialog.kind === 'edit' ? handleUpdate : handleCreate}
      />

      {/* Delete dialog (single or batch) */}
      <DeleteTransactionDialog
        open={dialog.kind === 'delete' || dialog.kind === 'deleteBatch'}
        onClose={close}
        count={dialog.kind === 'delete' ? 1 : dialog.kind === 'deleteBatch' ? dialog.ids.length : 0}
        itemName={dialog.kind === 'delete' ? dialog.transaction.title : null}
        isDeleting={deleteTransaction.isPending || deleteTransactions.isPending}
        onConfirm={handleDelete}
      />

      {/* Inline error toast for operations without a dialog */}
      {serverError && dialog.kind === 'none' && (
        <div className="mt-3 rounded-lg bg-danger-50 px-3 py-2 text-sm text-danger-700 dark:bg-danger-950 dark:text-danger-300">
          {serverError}
          <button onClick={() => setServerError(null)} className="ml-2 underline">
            Fechar
          </button>
        </div>
      )}
    </Card>
  );
}

/** Map a thrown error to a user-friendly Portuguese message. */
function toMessage(e: unknown): string {
  const msg = e instanceof Error ? e.message : String(e);
  if (/permission|denied|policy/i.test(msg)) {
    return 'Sem permissão para esta ação no projeto.';
  }
  return 'Não foi possível salvar. Tente novamente.';
}
