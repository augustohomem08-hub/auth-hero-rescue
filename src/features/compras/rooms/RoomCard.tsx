import { MoreVertical, Pencil, Trash2 } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils';
import { roomChip, roomIcon } from './roomConstants';
import type { Room } from '@/types/purchases';

interface RoomCardProps {
  room: Room;
  /** How many items belong to this room (from the shared items cache). */
  itemCount: number;
  selected: boolean;
  onSelect: (room: Room) => void;
  onEdit: (room: Room) => void;
  onDelete: (room: Room) => void;
}

/** A selectable room tile with an inline actions menu (edit / delete). */
export function RoomCard({ room, itemCount, selected, onSelect, onEdit, onDelete }: RoomCardProps) {
  const Icon = roomIcon(room.icon);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close the actions menu on outside click.
  useEffect(() => {
    if (!menuOpen) return;
    const onDown = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', onDown);
    return () => document.removeEventListener('mousedown', onDown);
  }, [menuOpen]);

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => onSelect(room)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onSelect(room);
        }
      }}
      className={cn(
        'group relative flex items-center gap-3 rounded-xl border bg-white px-3.5 py-3 text-left transition-all dark:bg-surface-900',
        selected
          ? 'border-primary-400 ring-2 ring-primary-100 dark:ring-primary-900/40'
          : 'border-surface-200 hover:border-surface-300 hover:shadow-soft dark:border-surface-800 dark:hover:border-surface-700'
      )}
    >
      <span className={cn('flex h-9 w-9 shrink-0 items-center justify-center rounded-lg', roomChip(room.color))}>
        <Icon className="h-5 w-5" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-sm font-medium text-surface-900 dark:text-surface-100">
          {room.name}
        </span>
        <span className="block text-xs text-surface-400 dark:text-surface-500">
          Itens em breve
        </span>
      </span>

      {/* Actions menu */}
      <div ref={menuRef} className="relative shrink-0" onClick={(e) => e.stopPropagation()}>
        <button
          type="button"
          aria-label="Opções"
          onClick={() => setMenuOpen((v) => !v)}
          className="rounded-lg p-1.5 text-surface-400 opacity-100 transition-opacity hover:bg-surface-100 hover:text-surface-700 lg:opacity-0 lg:group-hover:opacity-100 dark:hover:bg-surface-800 dark:hover:text-surface-200"
        >
          <MoreVertical className="h-4 w-4" />
        </button>
        {menuOpen && (
          <div className="absolute right-0 top-full z-10 mt-1 w-36 overflow-hidden rounded-xl border border-surface-200 bg-white py-1 shadow-elevated dark:border-surface-700 dark:bg-surface-900">
            <button
              type="button"
              onClick={() => {
                setMenuOpen(false);
                onEdit(room);
              }}
              className="flex w-full items-center gap-2 px-3 py-2 text-sm text-surface-700 hover:bg-surface-100 dark:text-surface-200 dark:hover:bg-surface-800"
            >
              <Pencil className="h-4 w-4" /> Editar
            </button>
            <button
              type="button"
              onClick={() => {
                setMenuOpen(false);
                onDelete(room);
              }}
              className="flex w-full items-center gap-2 px-3 py-2 text-sm text-danger-600 hover:bg-danger-50 dark:text-danger-400 dark:hover:bg-danger-950"
            >
              <Trash2 className="h-4 w-4" /> Excluir
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
