import { AlertTriangle } from 'lucide-react';
import { Modal, Button } from '@/components/ui';

interface DeleteTransactionDialogProps {
  open: boolean;
  onClose: () => void;
  count: number;
  itemName?: string | null;
  isDeleting?: boolean;
  onConfirm: () => void;
}

/** Confirmation dialog for deleting one or many transactions. */
export function DeleteTransactionDialog({
  open,
  onClose,
  count,
  itemName = null,
  isDeleting = false,
  onConfirm,
}: DeleteTransactionDialogProps) {
  const isBatch = count > 1;
  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isBatch ? 'Excluir lançamentos' : 'Excluir lançamento'}
      size="sm"
      footer={
        <>
          <Button variant="ghost" size="md" onClick={onClose} disabled={isDeleting}>
            Cancelar
          </Button>
          <Button variant="danger" size="md" isLoading={isDeleting} onClick={onConfirm}>
            Excluir {isBatch ? `${count}` : ''}
          </Button>
        </>
      }
    >
      <div className="flex flex-col items-center text-center">
        <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-danger-50 text-danger-500 dark:bg-danger-950 dark:text-danger-400">
          <AlertTriangle className="h-6 w-6" />
        </span>

        {itemName && !isBatch && (
          <p className="mt-4 max-w-full truncate text-sm font-medium text-surface-900 dark:text-surface-100">
            {itemName}
          </p>
        )}

        <p className="mt-4 text-sm text-surface-500 dark:text-surface-400">
          {isBatch
            ? `Tem certeza? Esta ação remove ${count} lançamentos. Não dá para desfazer.`
            : 'Tem certeza? Esta ação não dá para desfazer.'}
        </p>
      </div>
    </Modal>
  );
}
