import { useState, useRef, useEffect } from 'react';
import { MoreVertical, Pencil, Trash2, Copy, ArrowRightLeft, ExternalLink, ImageIcon } from 'lucide-react';
import { Badge } from '@/components/ui';
import { cn } from '@/lib/utils';
import { formatCurrency } from '@/lib/utils';
import { categoryIcon, priorityLabel, priorityTone, statusLabel, statusTone } from './itemConstants';
import type { Item } from '@/types/purchases';

interface ItemCardProps {
  item: Item;
  selected: boolean;
  roomName?: string;
  onToggleSelect: (item: Item) => void;
  onEdit: (item: Item) => void;
  onDelete: (item: Item) => void;
  onDuplicate: (item: Item) => void;
  onMove: (item: Item) => void;
}

/** Selectable purchase-item card with inline actions menu. */
export function ItemCard({
  item,
  selected,
  roomName,
  onToggleSelect,
  onEdit,
  onDelete,
  onDuplicate,
  onMove,
}: ItemCardProps) {
  const Icon = categoryIcon(item.category);
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

  const hasPrices = item.estimated_price != null || item.paid_price != null;

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
        onClick={() => onToggleSelect(item)}
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

      {/* Thumbnail / icon */}
      <div className="flex w-12 shrink-0 items-start">
        {item.image && imageUrl ? (
          <img
            src={imageUrl}
            alt={item.name}
            loading="lazy"
            onError={() => setImageUrl(null)}
            className="h-12 w-12 rounded-lg object-cover"
          />
        ) : (
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-surface-100 text-surface-400 dark:bg-surface-800">
            {item.image ? <ImageIcon className="h-5 w-5" /> : <Icon className="h-5 w-5" />}
          </div>
        )}
      </div>

      {/* Body */}
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <h4 className="truncate text-sm font-medium text-surface-900 dark:text-surface-100">
            {item.name}
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
                <MenuButton icon={<Pencil className="h-4 w-4" />} label="Editar" onClick={() => { setMenuOpen(false); onEdit(item); }} />
                <MenuButton icon={<Copy className="h-4 w-4" />} label="Duplicar" onClick={() => { setMenuOpen(false); onDuplicate(item); }} />
                <MenuButton icon={<ArrowRightLeft className="h-4 w-4" />} label="Mover" onClick={() => { setMenuOpen(false); onMove(item); }} />
                <MenuButton icon={<Trash2 className="h-4 w-4" />} label="Excluir" danger onClick={() => { setMenuOpen(false); onDelete(item); }} />
              </div>
            )}
          </div>
        </div>

        {item.description && (
          <p className="mt-0.5 line-clamp-2 text-xs text-surface-500 dark:text-surface-400">
            {item.description}
          </p>
        )}

        <div className="mt-2 flex flex-wrap items-center gap-1.5">
          <Badge tone={statusTone(item.status)}>{statusLabel(item.status)}</Badge>
          <Badge tone={priorityTone(item.priority)}>{priorityLabel(item.priority)}</Badge>
          {roomName && (
            <span className="inline-flex items-center gap-1 text-xs text-surface-400 dark:text-surface-500">
              · {roomName}
            </span>
          )}
        </div>

        {(hasPrices || item.store || item.link) && (
          <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-surface-500 dark:text-surface-400">
            {item.quantity > 1 && (
              <span>{item.quantity}{item.unit ? ` ${item.unit}` : ' un'}</span>
            )}
            {item.estimated_price != null && (
              <span className={item.paid_price != null && item.paid_price > (item.estimated_price ?? 0) ? 'text-danger-600 dark:text-danger-400' : ''}>
                Prev: {formatCurrency(item.estimated_price)}
              </span>
            )}
            {item.paid_price != null && (
              <span className="font-medium text-surface-700 dark:text-surface-200">
                Pago: {formatCurrency(item.paid_price)}
              </span>
            )}
            {item.store && <span className="truncate">· {item.store}</span>}
            {item.link && (
              <a
                href={item.link}
                target="_blank"
                rel="noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="inline-flex items-center gap-0.5 text-primary-600 hover:underline dark:text-primary-300"
              >
                Link <ExternalLink className="h-3 w-3" />
              </a>
            )}
          </div>
        )}
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
