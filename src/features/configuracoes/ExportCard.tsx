import { useState } from 'react';
import { Download, FileSpreadsheet, ShoppingCart, DatabaseBackup } from 'lucide-react';
import { Card, CardHeader, Button } from '@/components/ui';
import { useTransactions } from '@/features/financeiro/transactions/useTransactions';
import { useItems } from '@/features/compras/items/useItems';
import { useRooms } from '@/features/compras/rooms/useRooms';
import { useMilestones } from '@/features/cronograma/useMilestones';
import { useDocuments } from '@/features/documentos/useDocuments';
import { useActiveProject } from '@/features/onboarding/useProjectMembership';
import {
  exportBackupJson,
  exportItemsCsv,
  exportItemsXlsx,
  exportTransactionsCsv,
  exportTransactionsXlsx,
} from '@/lib/exporters';

/**
 * Data export panel: CSV per module plus a complete JSON backup.
 * Everything is produced from the user's own RLS-scoped data in cache.
 */
export function ExportCard() {
  const { data: active } = useActiveProject();
  const { data: transactions } = useTransactions();
  const { data: items } = useItems();
  const { data: rooms } = useRooms();
  const { data: milestones } = useMilestones();
  const { data: documents } = useDocuments();
  const [busy, setBusy] = useState<string | null>(null);

  const run = async (key: string, fn: () => void | Promise<void>) => {
    setBusy(key);
    try {
      await fn();
    } finally {
      setBusy(null);
    }
  };

  return (
    <Card>
      <CardHeader
        title="Exportar dados"
        subtitle="Baixe seus registros em Excel ou CSV, ou faça um backup completo."
      />
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <Button
          variant="secondary"
          leftIcon={<FileSpreadsheet className="h-4 w-4" />}
          disabled={!transactions?.length || busy !== null}
          onClick={() => run('fin-xlsx', () => exportTransactionsXlsx(transactions ?? []))}
        >
          Financeiro (Excel)
        </Button>
        <Button
          variant="secondary"
          leftIcon={<ShoppingCart className="h-4 w-4" />}
          disabled={!items?.length || busy !== null}
          onClick={() => run('compras-xlsx', () => exportItemsXlsx(items ?? [], rooms ?? []))}
        >
          Compras (Excel)
        </Button>
        <Button
          variant="ghost"
          leftIcon={<FileSpreadsheet className="h-4 w-4" />}
          disabled={!transactions?.length || busy !== null}
          onClick={() => run('fin-csv', () => exportTransactionsCsv(transactions ?? []))}
        >
          Financeiro (CSV)
        </Button>
        <Button
          variant="ghost"
          leftIcon={<ShoppingCart className="h-4 w-4" />}
          disabled={!items?.length || busy !== null}
          onClick={() => run('compras-csv', () => exportItemsCsv(items ?? [], rooms ?? []))}
        >
          Compras (CSV)
        </Button>
        <Button
          variant="ghost"
          className="sm:col-span-2"
          leftIcon={<DatabaseBackup className="h-4 w-4" />}
          disabled={!active || busy !== null}
          onClick={() =>
            run('backup', () =>
              exportBackupJson({
                projectName: active?.project.name ?? 'projeto',
                transactions: transactions ?? [],
                rooms: rooms ?? [],
                items: items ?? [],
                milestones: milestones ?? [],
                documents: documents ?? [],
              })
            )
          }
        >
          <span className="inline-flex items-center gap-2">
            <Download className="h-4 w-4" /> Backup completo (JSON)
          </span>
        </Button>
      </div>
      <p className="mt-3 text-xs text-surface-500 dark:text-surface-400">
        Os arquivos são gerados no seu navegador — nada é enviado para terceiros.
      </p>
    </Card>
  );
}
