import { useState, useRef, useEffect } from 'react';
import { MoreVertical, Pencil, Trash2 } from 'lucide-react';
import { Badge } from '@/components/ui';
import { cn, formatDate } from '@/lib/utils';
import { statusIcon, statusLabel, statusTone } from './milestoneConstants';
import type { Milestone } from '@/types/cronograma';

interface MilestoneCardProps {
  milestone: Milestone;
  isLast: boolean;
  onEdit: (m: Milestone) => void;
  onDelete: (m: Milestone) => void;
}

/** Timeline-style milestone card with inline actions menu. */
export function MilestoneCard({ milestone, isLast, onEdit, onDelete }: MilestoneCardProps) {
  const StatusIcon = statusIcon(milestone.status);
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

  return (
    <li className="flex gap-3">
      {/* Timeline rail */}
      <div className="flex flex-col items-center">
        <span
          className={cn(
            'flex h-9 w-9 shrink-0 items-center justify-center rounded-full',
            milestone.status === 'done'
              ? 'bg-success-100 text-success-600 dark:bg-success-900/40 dark:text-success-300'
              : milestone.status === 'in_progress'
              ? 'bg-accent-100 text-accent-600 dark:bg-accent-900/40 dark:text-accent-300'
              : milestone.status === 'delayed'
              ? 'bg-warning-100 text-warning-600 dark:bg-warning-900/40 dark:text-warning-300'
              : milestone.status === 'cancelled'
              ? 'bg-danger-100 text-danger-600 dark:bg-danger-900/40 dark:text-danger-300'
              : 'bg-surface-100 text-surface-500 dark:bg-surface-800 dark:text-surface-400'
          )}
        >
          <StatusIcon className="h-4 w-4" />
        </span>
        {!isLast && <span className="mt-1 w-px flex-1 bg-surface-200 dark:bg-surface-700" aria-hidden />}
      </div>

      {/* Body */}
      <div className={cn('group min-w-0 flex-1 pb-6', isLast && 'pb-0')}>
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <h4 className="truncate text-sm font-medium text-surface-900 dark:text-surface-100">
              {milestone.title}
            </h4>
            {milestone.date && (
              <p className="mt-0.5 text-xs text-surface-400 dark:text-surface-500">
                {formatDate(milestone.date)}
              </p>
            )}
          </div>
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
                  onClick={() => { setMenuOpen(false); onEdit(milestone); }}
                  className="flex w-full items-center gap-2 px-3 py-2 text-sm text-surface-700 transition-colors hover:bg-surface-100 dark:text-surface-200 dark:hover:bg-surface-800"
                >
                  <Pencil className="h-4 w-4" /> Editar
                </button>
                <button
                  type="button"
                  onClick={() => { setMenuOpen(false); onDelete(milestone); }}
                  className="flex w-full items-center gap-2 px-3 py-2 text-sm text-danger-600 transition-colors hover:bg-danger-50 dark:text-danger-400 dark:hover:bg-danger-950"
                >
                  <Trash2 className="h-4 w-4" /> Excluir
                </button>
              </div>
            )}
          </div>
        </div>

        {milestone.description && (
          <p className="mt-1 line-clamp-2 text-xs text-surface-500 dark:text-surface-400">
            {milestone.description}
          </p>
        )}

        <div className="mt-2">
          <Badge tone={statusTone(milestone.status)}>{statusLabel(milestone.status)}</Badge>
        </div>
      </div>
    </li>
  );
}
