import { useState, useRef, useEffect } from 'react';
import { MoreVertical, Pencil, Trash2, Link2 } from 'lucide-react';
import { Badge } from '@/components/ui';
import { cn, formatCurrency, formatDate } from '@/lib/utils';
import { categoryIcon, typeLabel, typeTone } from './transactionConstants';
import type { Transaction } from '@/types/finance';

interface TransactionCardProps {
  transaction: Transaction;
  selected: boolean;
  onToggleSelect: (t: Transaction) => void;
  onEdit: (t: Transaction) => void;
  onDelete: (t: Transaction) => void;
}

/** Selectable transaction card with inline actions menu. */
export function TransactionCard({
  transaction,
  selected,
  onToggleSelect,
  onEdit,
  onDelete,
}: TransactionCardProps) {
  const Icon = categoryIcon(transaction.category);
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

  const isIncome = transaction.type === 'income';
  const isMirror = !!transaction.source_item_id;

  return (
    <div
      className={cn(
        'group relative flex gap-3 rounded-xl border bg-white p-3.5 transition-all dark:bg-surface-900',
        selected
          ? 'border-primary-400 ring-2 ring-primary-100 dark:ring-primary-900/40'
          : 'border-surface-200 hover:border-surface-300 hover:shadow-soft dark:border-surface-800 dark:hover:border-surface-700'
      )}
    >
      {/* Checkbox */}
      <button
        type="button"
        onClick={() => onToggleSelect(transaction)}
        aria-label={selected ? 'Desmarcar' : 'Selecionar'}
        className={cn(
          'mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md border transition-colors',
          selected
            ? 'border-primary-500 bg-primary-500 text-white'
            : 'border-surface-300 hover:border-primary-400 dark:border-surface-600'
        )}
      >
        {selected && (
          <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" aria-hidden>
            <path d="M5 13l4 4L19 7" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </button>

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
            {transaction.title}
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
                <MenuButton icon={<Pencil className="h-4 w-4" />} label="Editar" onClick={() => { setMenuOpen(false); onEdit(transaction); }} />
                <MenuButton icon={<Trash2 className="h-4 w-4" />} label="Excluir" danger onClick={() => { setMenuOpen(false); onDelete(transaction); }} />
              </div>
            )}
          </div>
        </div>

        {transaction.description && (
          <p className="mt-0.5 line-clamp-2 text-xs text-surface-500 dark:text-surface-400">
            {transaction.description}
          </p>
        )}

        <div className="mt-2 flex flex-wrap items-center gap-1.5">
          <Badge tone={typeTone(transaction.type)}>{typeLabel(transaction.type)}</Badge>
          {isMirror && (
            <span className="inline-flex items-center gap-0.5 text-xs text-surface-400 dark:text-surface-500">
              <Link2 className="h-3 w-3" /> Compras
            </span>
          )}
          <span className="text-xs text-surface-400 dark:text-surface-500">
            · {formatDate(transaction.date)}
          </span>
        </div>

        <div className="mt-2 flex items-center gap-x-3 text-xs">
          <span
            className={cn(
              'font-semibold',
              isIncome ? 'text-success-600 dark:text-success-400' : 'text-surface-700 dark:text-surface-200'
            )}
          >
            {isIncome ? '+' : '−'} {formatCurrency(Number(transaction.amount))}
          </span>
        </div>
      </div>
    </div>
  );
}

function MenuButton({
  icon,
  label,
  onClick,
  danger = false,
}: {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  danger?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'flex w-full items-center gap-2 px-3 py-2 text-sm transition-colors',
        danger
          ? 'text-danger-600 hover:bg-danger-50 dark:text-danger-400 dark:hover:bg-danger-950'
          : 'text-surface-700 hover:bg-surface-100 dark:text-surface-200 dark:hover:bg-surface-800'
      )}
    >
      {icon} {label}
    </button>
  );
}
