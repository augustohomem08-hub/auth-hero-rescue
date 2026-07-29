import { useMemo } from 'react';
import { Package, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button, Spinner, ErrorState } from '@/components/ui';
import { ItemCard } from './ItemCard';
import { EmptyPurchasesState } from '../EmptyPurchasesState';
import type { ItemsFilters } from './itemsFilters';
import type { Item, Room } from '@/types/purchases';

const PRIORITY_RANK: Record<string, number> = { high: 0, medium: 1, low: 2 };
const STATUS_RANK: Record<string, number> = {
  planned: 0, researching: 1, budgeted: 2, purchased: 3, delivered: 4, installed: 5,
};
const PAGE_SIZE = 10;

interface ItemsListProps {
  items: Item[] | undefined;
  rooms: Room[];
  selectedRoomId: string | null;
  filters: ItemsFilters;
  isLoading: boolean;
  isError: boolean;
  onRetry: () => void;
  /** Currently selected item ids. */
  selection: Set<string>;
  onToggleSelect: (item: Item) => void;
  onClearSelection: () => void;
  onEdit: (item: Item) => void;
  onDelete: (item: Item) => void;
  onDuplicate: (item: Item) => void;
  onMove: (item: Item) => void;
  /** Current page (1-based); controlled by parent. */
  page: number;
  onPageChange: (page: number) => void;
}

/**
 * Filtered, sorted, paginated list of purchase items with multi-select.
 * All filtering/sorting is client-side (the parent passes the full project
 * item list from one React Query cache entry).
 */
export function ItemsList({
  items,
  rooms,
  selectedRoomId,
  filters,
  isLoading,
  isError,
  onRetry,
  selection,
  onToggleSelect,
  onEdit,
  onDelete,
  onDuplicate,
  onMove,
  page,
  onPageChange,
}: ItemsListProps) {
  const roomNameMap = useMemo(
    () => new Map(rooms.map((r) => [r.id, r.name] as const)),
    [rooms]
  );

  // Apply room -> search -> filters -> sort.
  const filtered = useMemo(() => {
    if (!items) return [];
    let out = items;
    if (selectedRoomId) out = out.filter((i) => i.room_id === selectedRoomId);

    const q = filters.search.trim().toLowerCase();
    if (q) {
      out = out.filter((i) =>
        [i.name, i.store, i.notes, i.description].some((f) => f?.toLowerCase().includes(q))
      );
    }
    if (filters.status !== 'all') out = out.filter((i) => i.status === filters.status);
    if (filters.priority !== 'all') out = out.filter((i) => i.priority === filters.priority);
    if (filters.category !== 'all') out = out.filter((i) => i.category === filters.category);

    const sorted = [...out];
    switch (filters.sort) {
      case 'name':
        sorted.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'status':
        sorted.sort((a, b) => STATUS_RANK[a.status] - STATUS_RANK[b.status]);
        break;
      case 'priority':
        sorted.sort((a, b) => PRIORITY_RANK[a.priority] - PRIORITY_RANK[b.priority]);
        break;
      case 'price_desc':
        sorted.sort((a, b) => (b.estimated_price ?? 0) - (a.estimated_price ?? 0));
        break;
      case 'price_asc':
        sorted.sort((a, b) => (a.estimated_price ?? 0) - (b.estimated_price ?? 0));
        break;
      default:
        sorted.sort((a, b) => b.created_at.localeCompare(a.created_at));
    }
    return sorted;
  }, [items, selectedRoomId, filters]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const paged = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center gap-2 py-12 text-sm text-surface-500 dark:text-surface-400">
        <Spinner /> Carregando itens…
      </div>
    );
  }

  if (isError) {
    return (
      <ErrorState
        title="Não foi possível carregar os itens"
        description="Verifique sua conexão e tente novamente."
        onRetry={onRetry}
      />
    );
  }

  if (filtered.length === 0) {
    const isFiltered =
      filters.search !== '' ||
      filters.status !== 'all' ||
      filters.priority !== 'all' ||
      filters.category !== 'all';
    return (
      <EmptyPurchasesState
        icon={<Package className="h-7 w-7" />}
        title={isFiltered ? 'Nenhum item encontrado' : selectedRoomId ? 'Nenhum item neste ambiente' : 'Nenhum item ainda'}
        description={
          isFiltered
            ? 'Ajuste a busca ou os filtros para ver mais resultados.'
            : selectedRoomId
              ? 'Adicione o primeiro item a este ambiente.'
              : 'Selecione um ambiente e adicione itens para acompanhar suas compras.'
        }
      />
    );
  }

  return (
    <div className="space-y-2.5">
      <div className="grid grid-cols-1 gap-2.5 xl:grid-cols-2">
        {paged.map((item) => (
          <ItemCard
            key={item.id}
            item={item}
            selected={selection.has(item.id)}
            roomName={selectedRoomId ? undefined : roomNameMap.get(item.room_id)}
            onToggleSelect={onToggleSelect}
            onEdit={onEdit}
            onDelete={onDelete}
            onDuplicate={onDuplicate}
            onMove={onMove}
          />
        ))}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-2">
          <p className="text-xs text-surface-500 dark:text-surface-400">
            {filtered.length} ite{filtered.length === 1 ? 'm' : 'ns'}
          </p>
          <div className="flex items-center gap-1">
            <Button
              size="icon"
              variant="ghost"
              disabled={safePage <= 1}
              onClick={() => onPageChange(safePage - 1)}
              aria-label="Página anterior"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="px-2 text-xs text-surface-500 dark:text-surface-400">
              {safePage} / {totalPages}
            </span>
            <Button
              size="icon"
              variant="ghost"
              disabled={safePage >= totalPages}
              onClick={() => onPageChange(safePage + 1)}
              aria-label="Próxima página"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
