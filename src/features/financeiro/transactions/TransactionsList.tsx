import { useMemo } from 'react';
import { Receipt, ChevronLeft, ChevronRight } from 'lucide-react';
import { Spinner, ErrorState } from '@/components/ui';
import { TransactionCard } from './TransactionCard';
import { EmptyState } from '@/components/ui';
import type { TransactionsFilters } from './transactionsFilters';
import type { Transaction } from '@/types/finance';

const PAGE_SIZE = 10;

interface TransactionsListProps {
  transactions: Transaction[] | undefined;
  filters: TransactionsFilters;
  isLoading: boolean;
  isError: boolean;
  onRetry: () => void;
  selection: Set<string>;
  onToggleSelect: (t: Transaction) => void;
  onEdit: (t: Transaction) => void;
  onDelete: (t: Transaction) => void;
  page: number;
  onPageChange: (page: number) => void;
}

/**
 * Filtered, sorted, paginated list of transactions with multi-select.
 * All filtering/sorting is client-side (the parent passes the full project
 * transaction list from one React Query cache entry).
 */
export function TransactionsList({
  transactions,
  filters,
  isLoading,
  isError,
  onRetry,
  selection,
  onToggleSelect,
  onEdit,
  onDelete,
  page,
  onPageChange,
}: TransactionsListProps) {
  const filtered = useMemo(() => {
    if (!transactions) return [];
    let out = transactions;

    const q = filters.search.trim().toLowerCase();
    if (q) {
      out = out.filter((t) =>
        [t.title, t.description, t.notes].some((f) => f?.toLowerCase().includes(q))
      );
    }
    if (filters.type !== 'all') out = out.filter((t) => t.type === filters.type);
    if (filters.category !== 'all') out = out.filter((t) => t.category === filters.category);

    const sorted = [...out];
    switch (filters.sort) {
      case 'date_desc':
        sorted.sort((a, b) => b.date.localeCompare(a.date));
        break;
      case 'date_asc':
        sorted.sort((a, b) => a.date.localeCompare(b.date));
        break;
      case 'amount_desc':
        sorted.sort((a, b) => Number(b.amount) - Number(a.amount));
        break;
      case 'amount_asc':
        sorted.sort((a, b) => Number(a.amount) - Number(b.amount));
        break;
      case 'title':
        sorted.sort((a, b) => a.title.localeCompare(b.title));
        break;
      default:
        sorted.sort((a, b) => b.created_at.localeCompare(a.created_at));
    }
    return sorted;
  }, [transactions, filters]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const paged = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center gap-2 py-12 text-sm text-surface-500 dark:text-surface-400">
        <Spinner /> Carregando lançamentos…
      </div>
    );
  }

  if (isError) {
    return (
      <ErrorState
        title="Não foi possível carregar os lançamentos"
        description="Verifique sua conexão e tente novamente."
        onRetry={onRetry}
      />
    );
  }

  if (filtered.length === 0) {
    const isFiltered =
      filters.search !== '' ||
      filters.type !== 'all' ||
      filters.category !== 'all';
    return (
      <EmptyState
        icon={<Receipt className="h-7 w-7" />}
        title={isFiltered ? 'Nenhum lançamento encontrado' : 'Nenhum lançamento ainda'}
        description={
          isFiltered
            ? 'Ajuste a busca ou os filtros para ver mais resultados.'
            : 'Adicione o primeiro lançamento para acompanhar suas finanças.'
        }
      />
    );
  }

  return (
    <div className="space-y-2.5">
      <div className="grid grid-cols-1 gap-2.5 xl:grid-cols-2">
        {paged.map((t) => (
          <TransactionCard
            key={t.id}
            transaction={t}
            selected={selection.has(t.id)}
            onToggleSelect={onToggleSelect}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        ))}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-2">
          <p className="text-xs text-surface-500 dark:text-surface-400">
            {filtered.length} lançamento{filtered.length === 1 ? '' : 's'}
          </p>
          <div className="flex items-center gap-1">
            <button
              disabled={safePage <= 1}
              onClick={() => onPageChange(safePage - 1)}
              aria-label="Página anterior"
              className="inline-flex h-9 w-9 items-center justify-center rounded-xl text-surface-600 transition-colors hover:bg-surface-100 disabled:opacity-40 dark:text-surface-300 dark:hover:bg-surface-800"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span className="px-2 text-xs text-surface-500 dark:text-surface-400">
              {safePage} / {totalPages}
            </span>
            <button
              disabled={safePage >= totalPages}
              onClick={() => onPageChange(safePage + 1)}
              aria-label="Próxima página"
              className="inline-flex h-9 w-9 items-center justify-center rounded-xl text-surface-600 transition-colors hover:bg-surface-100 disabled:opacity-40 dark:text-surface-300 dark:hover:bg-surface-800"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
