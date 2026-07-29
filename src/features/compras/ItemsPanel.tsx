import { useMemo, useState } from 'react';
import { Plus, Package } from 'lucide-react';
import { Card, CardHeader, Button } from '@/components/ui';
import { useRooms } from './rooms/useRooms';
import {
  useCreateItem,
  useDeleteItem,
  useDeleteItems,
  useDuplicateItem,
  useItems,
  useMoveItems,
  useUpdateItem,
} from './items/useItems';
import { ItemsList } from './items/ItemsList';
import { ItemsToolbar } from './items/ItemsToolbar';
import { DEFAULT_FILTERS, type ItemsFilters } from './items/itemsFilters';
import { ItemDialog, type ItemSubmitValues } from './items/ItemDialog';
import { DeleteItemDialog } from './items/DeleteItemDialog';
import { MoveItemsDialog } from './items/MoveItemsDialog';
import { EmptyPurchasesState } from './EmptyPurchasesState';
import type { Item, Room } from '@/types/purchases';

interface ItemsPanelProps {
  /** Currently selected room; null when none is selected (shows all items). */
  selectedRoom: Room | null;
}

type DialogState =
  | { kind: 'none' }
  | { kind: 'create' }
  | { kind: 'edit'; item: Item }
  | { kind: 'delete'; item: Item }
  | { kind: 'deleteBatch'; ids: string[] }
  | { kind: 'move'; ids: string[]; sourceRoomId?: string };

/**
 * Items section of the Purchases module. Hosts the toolbar (search, filters,
 * sort, bulk actions), the filtered + paginated item list with multi-select,
 * and the create / edit / delete / duplicate / move dialogs. All mutations
 * run through React Query with optimistic updates + realtime sync.
 */
export function ItemsPanel({ selectedRoom }: ItemsPanelProps) {
  const { data: rooms, isLoading: roomsLoading } = useRooms();
  const { data: items, isLoading, isError, refetch } = useItems();
  const createItem = useCreateItem();
  const updateItem = useUpdateItem();
  const deleteItem = useDeleteItem();
  const deleteItems = useDeleteItems();
  const duplicateItem = useDuplicateItem();
  const moveItems = useMoveItems();

  const [filters, setFilters] = useState<ItemsFilters>(DEFAULT_FILTERS);
  const [selection, setSelection] = useState<Set<string>>(new Set());
  const [page, setPage] = useState(1);
  const [dialog, setDialog] = useState<DialogState>({ kind: 'none' });
  const [serverError, setServerError] = useState<string | null>(null);

  const close = () => {
    setDialog({ kind: 'none' });
    setServerError(null);
  };

  const toggleSelect = (item: Item) => {
    setSelection((prev) => {
      const next = new Set(prev);
      if (next.has(item.id)) next.delete(item.id);
      else next.add(item.id);
      return next;
    });
  };
  const clearSelection = () => setSelection(new Set());

  const selectedRoomId = selectedRoom?.id ?? null;
  const createDefaultRoom = selectedRoomId ?? rooms?.[0]?.id ?? '';

  const handleCreate = async (values: ItemSubmitValues) => {
    setServerError(null);
    try {
      await createItem.mutateAsync({
        room_id: values.room_id,
        name: values.name,
        description: values.description,
        category: values.category,
        quantity: values.quantity,
        unit: values.unit,
        estimated_price: values.estimated_price,
        paid_price: values.paid_price,
        store: values.store,
        link: values.link,
        status: values.status,
        priority: values.priority,
        notes: values.notes,
        image: values.image,
      });
      close();
    } catch (e) {
      setServerError(toMessage(e));
    }
  };

  const handleUpdate = async (values: ItemSubmitValues) => {
    if (dialog.kind !== 'edit') return;
    setServerError(null);
    try {
      await updateItem.mutateAsync({
        itemId: dialog.item.id,
        patch: {
          room_id: values.room_id,
          name: values.name,
          description: values.description,
          category: values.category,
          quantity: values.quantity,
          unit: values.unit,
          estimated_price: values.estimated_price,
          paid_price: values.paid_price,
          store: values.store,
          link: values.link,
          status: values.status,
          priority: values.priority,
          notes: values.notes,
          image: values.image,
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
        await deleteItem.mutateAsync(dialog.item.id);
        close();
      } catch (e) {
        setServerError(toMessage(e));
      }
    } else if (dialog.kind === 'deleteBatch') {
      try {
        await deleteItems.mutateAsync(dialog.ids);
        clearSelection();
        close();
      } catch (e) {
        setServerError(toMessage(e));
      }
    }
  };

  const handleDuplicate = async (item: Item) => {
    try {
      await duplicateItem.mutateAsync(item.id);
    } catch {
      setServerError('Não foi possível duplicar o item.');
    }
  };

  const handleMoveConfirm = async (toRoomId: string) => {
    if (dialog.kind !== 'move') return;
    try {
      await moveItems.mutateAsync({ itemIds: dialog.ids, toRoomId });
      clearSelection();
      close();
    } catch (e) {
      setServerError(toMessage(e));
    }
  };

  const openMove = (ids: string[], sourceRoomId?: string) =>
    setDialog({ kind: 'move', ids, sourceRoomId });

  // Edit dialog initial values mapped from the item.
  const editInitial = useMemo<ItemSubmitValues | null>(() => {
    if (dialog.kind !== 'edit') return null;
    const it = dialog.item;
    return {
      room_id: it.room_id,
      name: it.name,
      description: it.description,
      category: it.category,
      quantity: it.quantity,
      unit: it.unit,
      estimated_price: it.estimated_price,
      paid_price: it.paid_price,
      store: it.store,
      link: it.link,
      status: it.status,
      priority: it.priority,
      notes: it.notes,
      image: it.image,
    };
  }, [dialog]);

  const createInitial = useMemo<ItemSubmitValues | null>(() => {
    if (dialog.kind !== 'create') return null;
    return {
      room_id: createDefaultRoom,
      name: '', description: null, category: null, quantity: 1, unit: null,
      estimated_price: null, paid_price: null, store: null, link: null,
      status: 'planned', priority: 'medium', notes: null, image: null,
    };
  }, [dialog, createDefaultRoom]);

  const selectedCount = selection.size;
  const selectedIds = useMemo(() => Array.from(selection), [selection]);

  return (
    <Card padding="lg" className="h-full">
      <CardHeader
        title="Itens"
        subtitle={selectedRoom ? selectedRoom.name : 'Todos os itens do projeto'}
        action={
          <Button
            size="sm"
            variant="primary"
            leftIcon={<Plus className="h-4 w-4" />}
            onClick={() => setDialog({ kind: 'create' })}
            disabled={roomsLoading || (rooms?.length ?? 0) === 0}
          >
            Novo item
          </Button>
        }
      />

      <div className="mt-4 space-y-4">
        {/* Empty project (no rooms) — guide the user to create a room first. */}
        {!roomsLoading && (rooms?.length ?? 0) === 0 ? (
          <EmptyPurchasesState
            icon={<Package className="h-7 w-7" />}
            title="Crie um ambiente primeiro"
            description="Antes de adicionar itens, você precisa criar pelo menos um ambiente na coluna à esquerda."
          />
        ) : items && items.length === 0 ? (
          <EmptyPurchasesState
            icon={<Package className="h-7 w-7" />}
            title="Nenhum item ainda"
            description="Adicione o primeiro item para acompanhar suas compras."
            actionLabel="Adicionar item"
            onAction={() => setDialog({ kind: 'create' })}
          />
        ) : (
          <>
            <ItemsToolbar
              filters={filters}
              onFiltersChange={setFilters}
              selectedCount={selectedCount}
              onClearSelection={clearSelection}
              onBulkMove={() => openMove(selectedIds)}
              onBulkDelete={() => setDialog({ kind: 'deleteBatch', ids: selectedIds })}
              onBulkDuplicate={() => {
                selectedIds.forEach((id) => handleDuplicate({ id } as Item));
                clearSelection();
              }}
            />
            <ItemsList
              items={items}
              rooms={rooms ?? []}
              selectedRoomId={selectedRoomId}
              filters={filters}
              isLoading={isLoading}
              isError={isError}
              onRetry={() => refetch()}
              selection={selection}
              onToggleSelect={toggleSelect}
              onClearSelection={clearSelection}
              onEdit={(it) => setDialog({ kind: 'edit', item: it })}
              onDelete={(it) => setDialog({ kind: 'delete', item: it })}
              onDuplicate={handleDuplicate}
              onMove={(it) => openMove([it.id], it.room_id)}
              page={page}
              onPageChange={setPage}
            />
          </>
        )}
      </div>

      {/* Create / edit dialog */}
      <ItemDialog
        open={dialog.kind === 'create' || dialog.kind === 'edit'}
        onClose={close}
        rooms={rooms ?? []}
        initial={dialog.kind === 'edit' ? editInitial : createInitial}
        title={dialog.kind === 'edit' ? 'Editar item' : 'Novo item'}
        submitLabel={dialog.kind === 'edit' ? 'Salvar' : 'Adicionar item'}
        isSubmitting={createItem.isPending || updateItem.isPending}
        serverError={serverError}
        onSubmit={dialog.kind === 'edit' ? handleUpdate : handleCreate}
      />

      {/* Delete dialog (single or batch) */}
      <DeleteItemDialog
        open={dialog.kind === 'delete' || dialog.kind === 'deleteBatch'}
        onClose={close}
        count={dialog.kind === 'delete' ? 1 : dialog.kind === 'deleteBatch' ? dialog.ids.length : 0}
        itemName={dialog.kind === 'delete' ? dialog.item.name : null}
        isDeleting={deleteItem.isPending || deleteItems.isPending}
        onConfirm={handleDelete}
      />

      {/* Move dialog */}
      <MoveItemsDialog
        open={dialog.kind === 'move'}
        onClose={close}
        rooms={rooms ?? []}
        excludeRoomIds={dialog.kind === 'move' && dialog.sourceRoomId ? [dialog.sourceRoomId] : []}
        count={dialog.kind === 'move' ? dialog.ids.length : 0}
        isMoving={moveItems.isPending}
        onConfirm={handleMoveConfirm}
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
