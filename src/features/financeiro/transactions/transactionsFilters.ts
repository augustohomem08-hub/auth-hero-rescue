import type { TransactionSortKey } from './transactionConstants';
import type { TransactionType } from '@/types/finance';

/** Filter + search + sort state shared between toolbar and list. */
export interface TransactionsFilters {
  search: string;
  type: TransactionType | 'all';
  category: string | 'all';
  sort: TransactionSortKey;
}

export const DEFAULT_FILTERS: TransactionsFilters = {
  search: '',
  type: 'all',
  category: 'all',
  sort: 'recent',
};
