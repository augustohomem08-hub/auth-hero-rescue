import { useState, useRef, useEffect } from 'react';
import { MoreVertical, Pencil, Trash2, Star, ImageIcon } from 'lucide-react';
import { cn, formatDate } from '@/lib/utils';
import { getMemorySignedUrl } from '@/lib/memories';
import type { Memory } from '@/types/jornada';

interface MemoryCardProps {
  memory: Memory;
  onEdit: (m: Memory) => void;
  onDelete: (m: Memory) => void;
}

/** Memory card with optional photo, highlight badge, and inline actions. */
export function MemoryCard({ memory, onEdit, onDelete }: MemoryCardProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [imgUrl, setImgUrl] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!menuOpen) return;
    const onDown = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false);
    };
    document.addEventListener('mousedown', onDown);
    return () => document.removeEventListener('mousedown', onDown);
  }, [menuOpen]);

  useEffect(() => {
    let cancelled = false;
    if (!memory.image_path) {
      setImgUrl(null);
      return;
    }
    getMemorySignedUrl(memory.image_path)
      .then((url) => {
        if (!cancelled) setImgUrl(url);
      })
      .catch(() => {
        if (!cancelled) setImgUrl(null);
      });
    return () => {
      cancelled = true;
    };
  }, [memory.image_path]);

  return (
    <div className="group relative overflow-hidden rounded-2xl border border-surface-200 bg-white transition-all hover:shadow-elevated dark:border-surface-800 dark:bg-surface-900">
      {/* Photo */}
      {imgUrl ? (
        <div className="relative aspect-[4/3] overflow-hidden bg-surface-100 dark:bg-surface-800">
          <img
            src={imgUrl}
            alt={memory.title}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
          {memory.is_highlight && (
            <span className="absolute left-2.5 top-2.5 inline-flex items-center gap-1 rounded-full bg-accent-500/90 px-2 py-0.5 text-xs font-medium text-white backdrop-blur-sm">
              <Star className="h-3 w-3" /> Destaque
            </span>
          )}
          <div ref={menuRef} className="absolute right-2.5 top-2.5">
            <button
              type="button"
              aria-label="Opções"
              onClick={() => setMenuOpen((v) => !v)}
              className="rounded-lg bg-white/90 p-1.5 text-surface-600 shadow-soft backdrop-blur-sm transition-opacity hover:bg-white dark:bg-surface-900/90 dark:text-surface-300"
            >
              <MoreVertical className="h-4 w-4" />
            </button>
            {menuOpen && (
              <div className="absolute right-0 top-full z-10 mt-1 w-40 overflow-hidden rounded-xl border border-surface-200 bg-white py-1 shadow-elevated dark:border-surface-700 dark:bg-surface-900">
                <button
                  type="button"
                  onClick={() => { setMenuOpen(false); onEdit(memory); }}
                  className="flex w-full items-center gap-2 px-3 py-2 text-sm text-surface-700 transition-colors hover:bg-surface-100 dark:text-surface-200 dark:hover:bg-surface-800"
                >
                  <Pencil className="h-4 w-4" /> Editar
                </button>
                <button
                  type="button"
                  onClick={() => { setMenuOpen(false); onDelete(memory); }}
                  className="flex w-full items-center gap-2 px-3 py-2 text-sm text-danger-600 transition-colors hover:bg-danger-50 dark:text-danger-400 dark:hover:bg-danger-950"
                >
                  <Trash2 className="h-4 w-4" /> Excluir
                </button>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="relative flex aspect-[4/3] items-center justify-center bg-surface-50 dark:bg-surface-800/50">
          <div className="flex flex-col items-center gap-2 text-surface-300 dark:text-surface-600">
            <ImageIcon className="h-10 w-10" />
            <span className="text-xs">Sem foto</span>
          </div>
          {memory.is_highlight && (
            <span className="absolute left-2.5 top-2.5 inline-flex items-center gap-1 rounded-full bg-accent-500/90 px-2 py-0.5 text-xs font-medium text-white backdrop-blur-sm">
              <Star className="h-3 w-3" /> Destaque
            </span>
          )}
          <div ref={menuRef} className="absolute right-2.5 top-2.5">
            <button
              type="button"
              aria-label="Opções"
              onClick={() => setMenuOpen((v) => !v)}
              className="rounded-lg bg-white/90 p-1.5 text-surface-600 shadow-soft backdrop-blur-sm transition-opacity hover:bg-white dark:bg-surface-900/90 dark:text-surface-300"
            >
              <MoreVertical className="h-4 w-4" />
            </button>
            {menuOpen && (
              <div className="absolute right-0 top-full z-10 mt-1 w-40 overflow-hidden rounded-xl border border-surface-200 bg-white py-1 shadow-elevated dark:border-surface-700 dark:bg-surface-900">
                <button
                  type="button"
                  onClick={() => { setMenuOpen(false); onEdit(memory); }}
                  className="flex w-full items-center gap-2 px-3 py-2 text-sm text-surface-700 transition-colors hover:bg-surface-100 dark:text-surface-200 dark:hover:bg-surface-800"
                >
                  <Pencil className="h-4 w-4" /> Editar
                </button>
                <button
                  type="button"
                  onClick={() => { setMenuOpen(false); onDelete(memory); }}
                  className="flex w-full items-center gap-2 px-3 py-2 text-sm text-danger-600 transition-colors hover:bg-danger-50 dark:text-danger-400 dark:hover:bg-danger-950"
                >
                  <Trash2 className="h-4 w-4" /> Excluir
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Body */}
      <div className="p-4">
        <div className="flex items-center gap-2">
          {memory.is_highlight && (
            <Star className="h-4 w-4 shrink-0 text-accent-500" />
          )}
          <h4 className={cn('truncate text-sm font-semibold text-surface-900 dark:text-surface-100')}>
            {memory.title}
          </h4>
        </div>
        <p className="mt-0.5 text-xs text-surface-400 dark:text-surface-500">
          {formatDate(memory.date)}
        </p>
        {memory.description && (
          <p className="mt-2 line-clamp-3 text-sm text-surface-600 dark:text-surface-300">
            {memory.description}
          </p>
        )}
      </div>
    </div>
  );
}
