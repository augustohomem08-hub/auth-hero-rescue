import { useEffect, useState } from 'react';
import { ArrowRightLeft } from 'lucide-react';
import { Modal, Button, Select } from '@/components/ui';
import type { Room } from '@/types/purchases';

interface MoveItemsDialogProps {
  open: boolean;
  onClose: () => void;
  rooms: Room[];
  /** Rooms excluded from the destination list (e.g. the source room). */
  excludeRoomIds?: string[];
  count: number;
  isMoving?: boolean;
  onConfirm: (toRoomId: string) => void;
}

/** Pick a destination room to move selected items into. */
export function MoveItemsDialog({
  open,
  onClose,
  rooms,
  excludeRoomIds = [],
  count,
  isMoving = false,
  onConfirm,
}: MoveItemsDialogProps) {
  const destinations = rooms.filter((r) => !excludeRoomIds.includes(r.id));
  const [destId, setDestId] = useState(destinations[0]?.id ?? '');

  useEffect(() => {
    if (open) setDestId(destinations[0]?.id ?? '');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Mover itens"
      description={`${count} item${count > 1 ? 's' : ''} para outro ambiente`}
      size="sm"
      footer={
        <>
          <Button variant="ghost" size="md" onClick={onClose} disabled={isMoving}>
            Cancelar
          </Button>
          <Button
            size="md"
            isLoading={isMoving}
            disabled={!destId}
            leftIcon={<ArrowRightLeft className="h-4 w-4" />}
            onClick={() => destId && onConfirm(destId)}
          >
            Mover
          </Button>
        </>
      }
    >
      <Select label="Ambiente de destino" value={destId} onChange={(e) => setDestId(e.target.value)}>
        {destinations.length === 0 && <option value="">Nenhum ambiente disponível</option>}
        {destinations.map((r) => (
          <option key={r.id} value={r.id}>
            {r.name}
          </option>
        ))}
      </Select>
    </Modal>
  );
}
