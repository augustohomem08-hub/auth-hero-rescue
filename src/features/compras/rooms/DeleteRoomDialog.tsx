import { AlertTriangle } from 'lucide-react';
import { Modal, Button } from '@/components/ui';
import { roomIcon, roomChip } from './roomConstants';
import type { Room } from '@/types/purchases';

interface DeleteRoomDialogProps {
  open: boolean;
  onClose: () => void;
  room: Room | null;
  isDeleting?: boolean;
  onConfirm: () => void;
}

/** Confirmation dialog before deleting a room (cascades to its items). */
export function DeleteRoomDialog({
  open,
  onClose,
  room,
  isDeleting = false,
  onConfirm,
}: DeleteRoomDialogProps) {
  const Icon = room ? roomIcon(room.icon) : null;
  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Excluir ambiente"
      size="sm"
      footer={
        <>
          <Button variant="ghost" size="md" onClick={onClose} disabled={isDeleting}>
            Cancelar
          </Button>
          <Button variant="danger" size="md" isLoading={isDeleting} onClick={onConfirm}>
            Excluir
          </Button>
        </>
      }
    >
      <div className="flex flex-col items-center text-center">
        <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-danger-50 text-danger-500 dark:bg-danger-950 dark:text-danger-400">
          <AlertTriangle className="h-6 w-6" />
        </span>

        {room && (
          <div className="mt-4 flex items-center gap-2.5 rounded-xl bg-surface-50 px-3.5 py-2.5 dark:bg-surface-800/60">
            {Icon && (
              <span className={'flex h-8 w-8 items-center justify-center rounded-lg ' + roomChip(room.color)}>
                <Icon className="h-4 w-4" />
              </span>
            )}
            <span className="text-sm font-medium text-surface-900 dark:text-surface-100">
              {room.name}
            </span>
          </div>
        )}

        <p className="mt-4 text-sm text-surface-500 dark:text-surface-400">
          Tem certeza? Esta ação remove o ambiente e <strong>todos os itens</strong> dentro dele.
          Não dá para desfazer.
        </p>
      </div>
    </Modal>
  );
}
