import { useState } from 'react';
import { Plus, Sofa, RefreshCw } from 'lucide-react';
import { Button, Card, CardHeader, Spinner, ErrorState } from '@/components/ui';
import { useActiveProject } from '@/features/onboarding/useProjectMembership';
import {
  useCreateRoom,
  useDeleteRoom,
  useRooms,
  useUpdateRoom,
} from './useRooms';
import { useItems, useItemsStats } from '../items/useItems';
import { cn } from '@/lib/utils';
import { RoomCard } from './RoomCard';
import { RoomDialog } from './RoomDialog';
import { DeleteRoomDialog } from './DeleteRoomDialog';
import { EmptyPurchasesState } from '../EmptyPurchasesState';
import type { Room } from '@/types/purchases';

interface RoomsPanelProps {
  selectedRoomId: string | null;
  onSelectRoom: (room: Room) => void;
  /** Clear the room filter and show every item in the project. */
  onClearSelection: () => void;
}

type DialogState =
  | { kind: 'none' }
  | { kind: 'create' }
  | { kind: 'edit'; room: Room }
  | { kind: 'delete'; room: Room };

/**
 * Rooms section of the Purchases module. Loads the live room list via
 * React Query (with realtime + optimistic updates), renders a selectable
 * grid, and hosts the create / edit / delete dialogs.
 */
export function RoomsPanel({ selectedRoomId, onSelectRoom, onClearSelection }: RoomsPanelProps) {
  const { data: active } = useActiveProject();
  const projectId = active?.project.id ?? '';
  const { data: rooms, isLoading, isError, refetch } = useRooms();
  const { data: items } = useItems();
  const { byRoom } = useItemsStats(items, rooms ?? []);
  const countByRoom = new Map(byRoom.map((r) => [r.roomId, r.count]));
  const createRoom = useCreateRoom();
  const updateRoom = useUpdateRoom();
  const deleteRoom = useDeleteRoom();

  const [dialog, setDialog] = useState<DialogState>({ kind: 'none' });
  const [serverError, setServerError] = useState<string | null>(null);

  const close = () => {
    setDialog({ kind: 'none' });
    setServerError(null);
  };

  const handleCreate = async (values: { name: string; icon: string; color: string }) => {
    setServerError(null);
    try {
      await createRoom.mutateAsync({
        projectId,
        name: values.name,
        icon: values.icon,
        color: values.color,
      });
      close();
    } catch (e) {
      setServerError(toMessage(e));
    }
  };

  const handleUpdate = async (values: { name: string; icon: string; color: string }) => {
    if (dialog.kind !== 'edit') return;
    setServerError(null);
    try {
      await updateRoom.mutateAsync({
        roomId: dialog.room.id,
        patch: { name: values.name, icon: values.icon, color: values.color },
      });
      close();
    } catch (e) {
      setServerError(toMessage(e));
    }
  };

  const handleDelete = async () => {
    if (dialog.kind !== 'delete') return;
    setServerError(null);
    try {
      await deleteRoom.mutateAsync(dialog.room.id);
      close();
    } catch (e) {
      setServerError(toMessage(e));
    }
  };

  const headerAction = (
    <Button
      size="sm"
      variant="primary"
      leftIcon={<Plus className="h-4 w-4" />}
      onClick={() => setDialog({ kind: 'create' })}
    >
      Novo ambiente
    </Button>
  );

  return (
    <Card padding="lg" className="h-full">
      <CardHeader
        title="Ambientes"
        subtitle="Organize seus itens por cômodo"
        action={headerAction}
      />

      <div className="mt-4">
        {isLoading ? (
          <div className="flex items-center justify-center gap-2 py-12 text-sm text-surface-500 dark:text-surface-400">
            <Spinner /> Carregando…
          </div>
        ) : isError ? (
          <ErrorState
            title="Não foi possível carregar"
            description="Verifique sua conexão e tente novamente."
            onRetry={() => refetch()}
          />
        ) : rooms && rooms.length > 0 ? (
          <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
            {rooms.map((room) => (
              <RoomCard
                key={room.id}
                room={room}
                selected={selectedRoomId === room.id}
                onSelect={onSelectRoom}
                onEdit={(r) => setDialog({ kind: 'edit', room: r })}
                onDelete={(r) => setDialog({ kind: 'delete', room: r })}
              />
            ))}
          </div>
        ) : (
          <EmptyPurchasesState
            icon={<Sofa className="h-7 w-7" />}
            title="Nenhum ambiente criado"
            description="Crie seu primeiro ambiente para começar a organizar as compras do lar."
            actionLabel="Criar ambiente"
            onAction={() => setDialog({ kind: 'create' })}
          />
        )}
      </div>

      {/* Create / edit dialog (shared form) */}
      <RoomDialog
        open={dialog.kind === 'create' || dialog.kind === 'edit'}
        onClose={close}
        room={dialog.kind === 'edit' ? { name: dialog.room.name, icon: dialog.room.icon, color: dialog.room.color } : null}
        title={dialog.kind === 'edit' ? 'Editar ambiente' : 'Novo ambiente'}
        submitLabel={dialog.kind === 'edit' ? 'Salvar' : 'Criar ambiente'}
        isSubmitting={createRoom.isPending || updateRoom.isPending}
        serverError={serverError}
        onSubmit={dialog.kind === 'edit' ? handleUpdate : handleCreate}
      />

      {/* Delete confirmation */}
      <DeleteRoomDialog
        open={dialog.kind === 'delete'}
        onClose={close}
        room={dialog.kind === 'delete' ? dialog.room : null}
        isDeleting={deleteRoom.isPending}
        onConfirm={handleDelete}
      />

      {isError && (
        <button
          onClick={() => refetch()}
          className="mt-3 inline-flex items-center gap-1.5 text-xs text-primary-600 dark:text-primary-300"
        >
          <RefreshCw className="h-3.5 w-3.5" /> Tentar novamente
        </button>
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
