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
