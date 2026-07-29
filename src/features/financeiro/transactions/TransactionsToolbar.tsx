import { Search, X, SlidersHorizontal, Trash2 } from 'lucide-react';
import { Button, Select } from '@/components/ui';
import { cn } from '@/lib/utils';
import {
  FINANCE_CATEGORIES,
  TRANSACTION_SORTS,
  TRANSACTION_TYPES,
  type TransactionSortKey,
} from './transactionConstants';
import type { TransactionsFilters } from './transactionsFilters';

interface TransactionsToolbarProps {
  filters: TransactionsFilters;
  onFiltersChange: (next: TransactionsFilters) => void;
  selectedCount: number;
  onClearSelection: () => void;
  onBulkDelete: () => void;
}

/** Toolbar above the transactions list: search, filters, sort, bulk actions. */
export function TransactionsToolbar({
  filters,
  onFiltersChange,
  selectedCount,
  onClearSelection,
  onBulkDelete,
}: TransactionsToolbarProps) {
  const set = <K extends keyof TransactionsFilters>(key: K, value: TransactionsFilters[K]) =>
    onFiltersChange({ ...filters, [key]: value });

  const hasActiveFilters =
    filters.search !== '' ||
    filters.type !== 'all' ||
    filters.category !== 'all';

  const clearAll = () =>
    onFiltersChange({ ...filters, search: '', type: 'all', category: 'all' });

  return (
    <div className="space-y-3">
      {/* Search + sort row */}
      <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-surface-400" />
          <input
            type="search"
            value={filters.search}
            onChange={(e) => set('search', e.target.value)}
            placeholder="Buscar por título, descrição, observação…"
            className="h-10 w-full rounded-xl border border-surface-300 bg-white pl-9 pr-9 text-sm text-surface-900 placeholder:text-surface-400 transition-colors focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-400 dark:border-surface-700 dark:bg-surface-900 dark:text-surface-100"
          />
          {filters.search && (
            <button
              type="button"
              onClick={() => set('search', '')}
              aria-label="Limpar busca"
              className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded p-0.5 text-surface-400 hover:text-surface-700 dark:hover:text-surface-200"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
        <Select
          aria-label="Ordenar"
          value={filters.sort}
          onChange={(e) => set('sort', e.target.value as TransactionSortKey)}
          className="sm:w-52"
        >
          {TRANSACTION_SORTS.map((s) => (
            <option key={s.key} value={s.key}>
              {s.label}
            </option>
          ))}
        </Select>
      </div>

      {/* Filters row */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="inline-flex items-center gap-1 text-xs font-medium text-surface-500 dark:text-surface-400">
          <SlidersHorizontal className="h-3.5 w-3.5" /> Filtrar:
        </span>
        <FilterSelect value={filters.type} onChange={(v) => set('type', v as TransactionsFilters['type'])}>
          <option value="all">Todos os tipos</option>
          {TRANSACTION_TYPES.map((t) => (
            <option key={t.key} value={t.key}>{t.label}</option>
          ))}
        </FilterSelect>
        <FilterSelect value={filters.category} onChange={(v) => set('category', v)}>
          <option value="all">Todas categorias</option>
          {FINANCE_CATEGORIES.map((c) => (
            <option key={c.key} value={c.key}>{c.label}</option>
          ))}
        </FilterSelect>
        {hasActiveFilters && (
          <button
            type="button"
            onClick={clearAll}
            className="inline-flex items-center gap-1 text-xs text-primary-600 hover:underline dark:text-primary-300"
          >
            <X className="h-3 w-3" /> Limpar filtros
          </button>
        )}
      </div>

      {/* Bulk actions bar */}
      {selectedCount > 0 && (
        <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-primary-50 px-3.5 py-2.5 dark:bg-primary-900/30">
          <span className="text-sm font-medium text-primary-700 dark:text-primary-200">
            {selectedCount} selecionado{selectedCount > 1 ? 's' : ''}
          </span>
          <div className="flex items-center gap-2">
            <Button size="sm" variant="danger" leftIcon={<Trash2 className="h-4 w-4" />} onClick={onBulkDelete}>
              Excluir
            </Button>
            <button
              type="button"
              onClick={onClearSelection}
              className="rounded-lg p-1.5 text-primary-600 hover:bg-primary-100 dark:text-primary-300 dark:hover:bg-primary-900/50"
              aria-label="Limpar seleção"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function FilterSelect({
  value,
  onChange,
  children,
}: {
  value: string;
  onChange: (value: string) => void;
  children: React.ReactNode;
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={cn(
        'h-9 rounded-lg border border-surface-300 bg-white px-2.5 text-xs text-surface-700 transition-colors',
        'focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-400',
        'dark:border-surface-700 dark:bg-surface-900 dark:text-surface-200'
      )}
    >
      {children}
    </select>
  );
}
