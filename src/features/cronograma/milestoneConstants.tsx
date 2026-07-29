import {
  Circle,
  Loader2,
  CheckCircle2,
  Clock,
  XCircle,
  CalendarDays,
  type LucideIcon,
} from 'lucide-react';
import type { BadgeTone } from '@/components/ui';
import type { MilestoneStatus } from '@/types/cronograma';

/**
 * Cronograma milestone presets. Labels in Portuguese to match the app.
 * Keys map to the database `milestone_status` enum.
 */

export interface StatusPreset {
  key: MilestoneStatus;
  label: string;
  Icon: LucideIcon;
  tone: BadgeTone;
}

export const MILESTONE_STATUSES: StatusPreset[] = [
  { key: 'planned', label: 'Planejado', Icon: Circle, tone: 'neutral' },
  { key: 'in_progress', label: 'Em andamento', Icon: Loader2, tone: 'accent' },
  { key: 'done', label: 'Concluído', Icon: CheckCircle2, tone: 'success' },
  { key: 'delayed', label: 'Atrasado', Icon: Clock, tone: 'warning' },
  { key: 'cancelled', label: 'Cancelado', Icon: XCircle, tone: 'danger' },
];

const STATUS_MAP = new Map(MILESTONE_STATUSES.map((s) => [s.key, s]));

export function statusLabel(key: MilestoneStatus): string {
  return STATUS_MAP.get(key)?.label ?? key;
}
export function statusTone(key: MilestoneStatus): BadgeTone {
  return STATUS_MAP.get(key)?.tone ?? 'neutral';
}
export function statusIcon(key: MilestoneStatus): LucideIcon {
  return STATUS_MAP.get(key)?.Icon ?? CalendarDays;
}
