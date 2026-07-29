export type ClassValue = string | number | boolean | undefined | null | ClassValue[];

/**
 * Concatenates class values, dropping falsy values.
 * Lightweight utility — the project intentionally avoids `clsx`/`tailwind-merge`.
 */
export function cn(...inputs: ClassValue[]): string {
  const out: string[] = [];
  const walk = (val: ClassValue) => {
    if (!val) return;
    if (typeof val === 'string' || typeof val === 'number') {
      out.push(String(val));
    } else if (Array.isArray(val)) {
      val.forEach(walk);
    }
  };
  inputs.forEach(walk);
  return out.join(' ');
}

/** Formats a number as BRL currency. */
export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
}

/** Formats an ISO date as dd/mm/yyyy. */
export function formatDate(iso: string): string {
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(new Date(iso));
}
