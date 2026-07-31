import type { Transaction } from '@/types/finance';
import type { Item, Room } from '@/types/purchases';
import type { Milestone } from '@/types/cronograma';
import type { DocumentRecord } from '@/types/documentos';

/**
 * Client-side data export helpers.
 *
 * Everything is generated from data the user already has in cache (fetched
 * under their own RLS-scoped session) — no admin key, no server round-trip.
 */

// ──────────────────────────────────────────────────────────────────────
// Low-level helpers
// ──────────────────────────────────────────────────────────────────────

function escapeCsv(value: unknown): string {
  if (value === null || value === undefined) return '';
  const s = String(value);
  return /[";\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

/** Build a CSV string (semicolon-separated — friendlier to pt-BR Excel). */
export function toCsv(headers: string[], rows: unknown[][]): string {
  const lines = [headers.join(';'), ...rows.map((r) => r.map(escapeCsv).join(';'))];
  // BOM so Excel detects UTF-8 accents correctly.
  return `\uFEFF${lines.join('\r\n')}`;
}

/** Trigger a browser download for a text/binary blob. */
export function downloadBlob(content: BlobPart, filename: string, mime: string): void {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

export function stamp(): string {
  return new Date().toISOString().slice(0, 10);
}

// ──────────────────────────────────────────────────────────────────────
// CSV exports
// ──────────────────────────────────────────────────────────────────────

export function exportTransactionsCsv(transactions: Transaction[]): void {
  const csv = toCsv(
    ['Data', 'Título', 'Tipo', 'Categoria', 'Valor', 'Descrição', 'Notas', 'Origem'],
    transactions.map((t) => [
      t.date,
      t.title,
      t.type === 'income' ? 'Receita' : 'Despesa',
      t.category,
      Number(t.amount ?? 0).toFixed(2).replace('.', ','),
      t.description ?? '',
      t.notes ?? '',
      t.source_item_id ? 'Compras' : 'Manual',
    ])
  );
  downloadBlob(csv, `financeiro-${stamp()}.csv`, 'text/csv;charset=utf-8');
}

export function exportItemsCsv(items: Item[], rooms: Room[]): void {
  const roomName = new Map(rooms.map((r) => [r.id, r.name]));
  const csv = toCsv(
    [
      'Cômodo',
      'Item',
      'Status',
      'Prioridade',
      'Categoria',
      'Quantidade',
      'Unidade',
      'Preço estimado',
      'Preço pago',
      'Loja',
      'Link',
    ],
    items.map((i) => [
      roomName.get(i.room_id) ?? '',
      i.name,
      i.status,
      i.priority,
      i.category ?? '',
      i.quantity,
      i.unit ?? '',
      i.estimated_price != null ? Number(i.estimated_price).toFixed(2).replace('.', ',') : '',
      i.paid_price != null ? Number(i.paid_price).toFixed(2).replace('.', ',') : '',
      i.store ?? '',
      i.link ?? '',
    ])
  );
  downloadBlob(csv, `compras-${stamp()}.csv`, 'text/csv;charset=utf-8');
}

// ──────────────────────────────────────────────────────────────────────
// Full backup (JSON)
// ──────────────────────────────────────────────────────────────────────

export interface BackupPayload {
  projectName: string;
  transactions: Transaction[];
  rooms: Room[];
  items: Item[];
  milestones: Milestone[];
  documents: DocumentRecord[];
}

export function exportBackupJson(payload: BackupPayload): void {
  const json = JSON.stringify(
    { exportedAt: new Date().toISOString(), version: 1, ...payload },
    null,
    2
  );
  downloadBlob(json, `backup-${stamp()}.json`, 'application/json');
}
