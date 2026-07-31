import { formatDate } from './utils';

/**
 * Countdown helpers for the project expected delivery date.
 * All values derive from the real `expected_delivery_date` — no fake data.
 */

export interface Countdown {
  days: number;
  weeks: number;
  months: number;
  isPast: boolean;
  isValid: boolean;
}

/** Compute a countdown from an ISO date string to now. */
export function getCountdown(iso: string | null | undefined): Countdown {
  if (!iso) return { days: 0, weeks: 0, months: 0, isPast: false, isValid: false };
  const target = new Date(iso);
  if (Number.isNaN(target.getTime())) {
    return { days: 0, weeks: 0, months: 0, isPast: false, isValid: false };
  }
  const now = new Date();
  const diffMs = target.getTime() - now.getTime();
  const days = Math.floor(diffMs / 86_400_000);
  return {
    days,
    weeks: Math.floor(days / 7),
    months: Math.floor(days / 30),
    isPast: days < 0,
    isValid: true,
  };
}

/** Human-readable countdown label, e.g. "Faltam 84 dias" or "Entregue há 12 dias". */
export function formatCountdown(iso: string | null | undefined): string {
  const c = getCountdown(iso);
  if (!c.isValid) return 'Data a definir';
  if (c.isPast) {
    const d = Math.abs(c.days);
    if (d === 0) return 'Entregue hoje';
    return `Entregue há ${d} ${d === 1 ? 'dia' : 'dias'}`;
  }
  if (c.days === 0) return 'Entrega hoje';
  if (c.days === 1) return 'Falta 1 dia';
  return `Faltam ${c.days} dias`;
}

/** Delivery date formatted as dd/mm/yyyy, or a placeholder when unset. */
export function formatDeliveryDate(iso: string | null | undefined): string {
  if (!iso) return 'A definir';
  return formatDate(iso);
}

// ──────────────────────────────────────────────────────────────────────
// Due-date proximity (lembretes visuais)
// ──────────────────────────────────────────────────────────────────────

/** Default window (in days) used for "vencendo em breve" indicators. */
export const DUE_SOON_DAYS = 7;

export type DueState = 'none' | 'overdue' | 'today' | 'soon' | 'later';

/** Classify a date relative to today for reminder badges. */
export function getDueState(
  iso: string | null | undefined,
  windowDays: number = DUE_SOON_DAYS
): DueState {
  if (!iso) return 'none';
  const target = new Date(`${iso.slice(0, 10)}T00:00:00`);
  if (Number.isNaN(target.getTime())) return 'none';
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const days = Math.round((target.getTime() - today.getTime()) / 86_400_000);
  if (days < 0) return 'overdue';
  if (days === 0) return 'today';
  if (days <= windowDays) return 'soon';
  return 'later';
}

/** Days remaining until an ISO date (negative when already past). */
export function daysUntil(iso: string | null | undefined): number | null {
  if (!iso) return null;
  const target = new Date(`${iso.slice(0, 10)}T00:00:00`);
  if (Number.isNaN(target.getTime())) return null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return Math.round((target.getTime() - today.getTime()) / 86_400_000);
}

/** Short label for a due state, e.g. "Vence em 3 dias". */
export function dueLabel(iso: string | null | undefined, windowDays = DUE_SOON_DAYS): string | null {
  const state = getDueState(iso, windowDays);
  const days = daysUntil(iso);
  if (state === 'none' || state === 'later' || days === null) return null;
  if (state === 'overdue') {
    const d = Math.abs(days);
    return `Venceu há ${d} ${d === 1 ? 'dia' : 'dias'}`;
  }
  if (state === 'today') return 'Vence hoje';
  return `Vence em ${days} ${days === 1 ? 'dia' : 'dias'}`;
}
