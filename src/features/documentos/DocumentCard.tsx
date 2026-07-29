import { useState, useRef, useEffect } from 'react';
import { MoreVertical, Pencil, Trash2, Download, AlertCircle } from 'lucide-react';
import { Badge } from '@/components/ui';
import { cn, formatDate } from '@/lib/utils';
import { categoryIcon, categoryLabel, categoryTone } from './documentConstants';
import { getDocumentSignedUrl } from '@/lib/documents';
import type { DocumentRecord } from '@/types/documentos';

interface DocumentCardProps {
  doc: DocumentRecord;
  onEdit: (doc: DocumentRecord) => void;
  onDelete: (doc: DocumentRecord) => void;
}

/** Document card with inline actions: download, edit, delete. */
export function DocumentCard({ doc, onEdit, onDelete }: DocumentCardProps) {
  const Icon = categoryIcon(doc.category);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!menuOpen) return;
    const onDown = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false);
    };
    document.addEventListener('mousedown', onDown);
    return () => document.removeEventListener('mousedown', onDown);
  }, [menuOpen]);

  const isExpired =
    doc.expires_at != null && doc.expires_at < new Date().toISOString().slice(0, 10);
  const isExpiringSoon =
    doc.expires_at != null &&
    !isExpired &&
    doc.expires_at <= new Date(Date.now() + 30 * 86_400_000).toISOString().slice(0, 10);

  const handleDownload = async () => {
    setMenuOpen(false);
    try {
      const url = await getDocumentSignedUrl(doc.storage_path);
      window.open(url, '_blank');
    } catch {
      // Signed URL failure — silent in UI; the menu just closes.
    }
  };

  return (
    <div className="group relative flex gap-3 rounded-xl border border-surface-200 bg-white p-3.5 transition-all hover:border-surface-300 hover:shadow-soft dark:border-surface-800 dark:bg-surface-900 dark:hover:border-surface-700">
      {/* Icon */}
      <div className="flex w-12 shrink-0 items-start">
        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-surface-100 text-surface-400 dark:bg-surface-800">
          <Icon className="h-5 w-5" />
        </div>
      </div>

      {/* Body */}
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <h4 className="truncate text-sm font-medium text-surface-900 dark:text-surface-100">
            {doc.title}
          </h4>
          <div ref={menuRef} className="relative shrink-0">
            <button
              type="button"
              aria-label="Opções"
              onClick={() => setMenuOpen((v) => !v)}
              className="rounded-lg p-1 text-surface-400 opacity-0 transition-opacity hover:bg-surface-100 hover:text-surface-700 group-hover:opacity-100 dark:hover:bg-surface-800 dark:hover:text-surface-200"
            >
              <MoreVertical className="h-4 w-4" />
            </button>
            {menuOpen && (
              <div className="absolute right-0 top-full z-10 mt-1 w-40 overflow-hidden rounded-xl border border-surface-200 bg-white py-1 shadow-elevated dark:border-surface-700 dark:bg-surface-900">
                <button
                  type="button"
                  onClick={handleDownload}
                  className="flex w-full items-center gap-2 px-3 py-2 text-sm text-surface-700 transition-colors hover:bg-surface-100 dark:text-surface-200 dark:hover:bg-surface-800"
                >
                  <Download className="h-4 w-4" /> Baixar
                </button>
                <button
                  type="button"
                  onClick={() => { setMenuOpen(false); onEdit(doc); }}
                  className="flex w-full items-center gap-2 px-3 py-2 text-sm text-surface-700 transition-colors hover:bg-surface-100 dark:text-surface-200 dark:hover:bg-surface-800"
                >
                  <Pencil className="h-4 w-4" /> Editar
                </button>
                <button
                  type="button"
                  onClick={() => { setMenuOpen(false); onDelete(doc); }}
                  className="flex w-full items-center gap-2 px-3 py-2 text-sm text-danger-600 transition-colors hover:bg-danger-50 dark:text-danger-400 dark:hover:bg-danger-950"
                >
                  <Trash2 className="h-4 w-4" /> Excluir
                </button>
              </div>
            )}
          </div>
        </div>

        <p className="mt-0.5 truncate text-xs text-surface-500 dark:text-surface-400">
          {doc.file_name}
        </p>

        <div className="mt-2 flex flex-wrap items-center gap-1.5">
          <Badge tone={categoryTone(doc.category)}>{categoryLabel(doc.category)}</Badge>
          <span className="text-xs text-surface-400 dark:text-surface-500">
            · {formatDate(doc.created_at)}
          </span>
        </div>

        {doc.expires_at && (
          <div
            className={cn(
              'mt-2 inline-flex items-center gap-1 rounded-lg px-2 py-0.5 text-xs',
              isExpired
                ? 'bg-danger-50 text-danger-700 dark:bg-danger-950 dark:text-danger-300'
                : isExpiringSoon
                ? 'bg-warning-50 text-warning-700 dark:bg-warning-950 dark:text-warning-300'
                : 'bg-surface-100 text-surface-500 dark:bg-surface-800 dark:text-surface-400'
            )}
          >
            <AlertCircle className="h-3 w-3" />
            {isExpired ? 'Vencido' : 'Vence'} {formatDate(doc.expires_at)}
          </div>
        )}
      </div>
    </div>
  );
}
