import { AlertTriangle } from 'lucide-react';
import { Modal, Button } from '@/components/ui';

interface DeleteDocumentDialogProps {
  open: boolean;
  onClose: () => void;
  itemName?: string | null;
  isDeleting?: boolean;
  onConfirm: () => void;
}

export function DeleteDocumentDialog({
  open,
  onClose,
  itemName = null,
  isDeleting = false,
  onConfirm,
}: DeleteDocumentDialogProps) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Excluir documento"
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
        {itemName && (
          <p className="mt-4 max-w-full truncate text-sm font-medium text-surface-900 dark:text-surface-100">
            {itemName}
          </p>
        )}
        <p className="mt-4 text-sm text-surface-500 dark:text-surface-400">
          O arquivo será removido permanentemente. Esta ação não dá para desfazer.
        </p>
      </div>
    </Modal>
  );
}
