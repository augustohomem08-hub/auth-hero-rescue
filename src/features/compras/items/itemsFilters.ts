import type { ItemSortKey } from './itemConstants';
import type { ItemPriority, ItemStatus } from '@/types/purchases';

/** Filter + search + sort state shared between toolbar and list. */
export interface ItemsFilters {
  search: string;
  status: ItemStatus | 'all';
  priority: ItemPriority | 'all';
  category: string | 'all';
  sort: ItemSortKey;
}

export const DEFAULT_FILTERS: ItemsFilters = {
  search: '',
  status: 'all',
  priority: 'all',
  category: 'all',
  sort: 'recent',
};
