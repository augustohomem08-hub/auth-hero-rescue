import {
  HardHat,
  Hammer,
  Sofa,
  Refrigerator,
  Frame,
  ScrollText,
  Landmark,
  Building2,
  Receipt,
  Package,
  type LucideIcon,
} from 'lucide-react';
import type { BadgeTone } from '@/components/ui';
import type { TransactionType } from '@/types/finance';

/**
 * Financeiro transaction presets. All UI labels are in Portuguese to match
 * the rest of the app. Keys map to the database `category` / `type` columns,
 * so changing a label never requires a migration.
 */

// ──────────────────────────────────────────────────────────────────────
// Type
// ──────────────────────────────────────────────────────────────────────

export interface TypePreset {
  key: TransactionType;
  label: string;
  tone: BadgeTone;
}

export const TRANSACTION_TYPES: TypePreset[] = [
  { key: 'income', label: 'Receita', tone: 'success' },
  { key: 'expense', label: 'Despesa', tone: 'danger' },
];

const TYPE_MAP = new Map(TRANSACTION_TYPES.map((t) => [t.key, t]));

export function typeLabel(key: TransactionType): string {
  return TYPE_MAP.get(key)?.label ?? key;
}
export function typeTone(key: TransactionType): BadgeTone {
  return TYPE_MAP.get(key)?.tone ?? 'neutral';
}

// ──────────────────────────────────────────────────────────────────────
// Category
// ──────────────────────────────────────────────────────────────────────

export interface FinanceCategoryPreset {
  key: string;
  label: string;
  Icon: LucideIcon;
}

export const FINANCE_CATEGORIES: FinanceCategoryPreset[] = [
  { key: 'construcao', label: 'Construção', Icon: HardHat },
  { key: 'reforma', label: 'Reforma', Icon: Hammer },
  { key: 'moveis', label: 'Móveis', Icon: Sofa },
  { key: 'eletrodomesticos', label: 'Eletrodomésticos', Icon: Refrigerator },
  { key: 'decoracao', label: 'Decoração', Icon: Frame },
  { key: 'cartorio', label: 'Cartório', Icon: ScrollText },
  { key: 'financiamento', label: 'Financiamento', Icon: Landmark },
  { key: 'condominio', label: 'Condomínio', Icon: Building2 },
  { key: 'taxas', label: 'Taxas', Icon: Receipt },
  { key: 'outros', label: 'Outros', Icon: Package },
];

const CATEGORY_MAP = new Map(FINANCE_CATEGORIES.map((c) => [c.key, c]));

export function categoryLabel(key: string | null): string {
  if (!key) return 'Outros';
  return CATEGORY_MAP.get(key)?.label ?? key;
}
export function categoryIcon(key: string | null): LucideIcon {
  return CATEGORY_MAP.get(key ?? '')?.Icon ?? Package;
}

// ──────────────────────────────────────────────────────────────────────
// Sort options
// ──────────────────────────────────────────────────────────────────────

export type TransactionSortKey =
  | 'recent'
  | 'date_desc'
  | 'date_asc'
  | 'amount_desc'
  | 'amount_asc'
  | 'title';

export interface TransactionSortPreset {
  key: TransactionSortKey;
  label: string;
}

export const TRANSACTION_SORTS: TransactionSortPreset[] = [
  { key: 'recent', label: 'Mais recentes' },
  { key: 'date_desc', label: 'Data (mais nova)' },
  { key: 'date_asc', label: 'Data (mais antiga)' },
  { key: 'amount_desc', label: 'Maior valor' },
  { key: 'amount_asc', label: 'Menor valor' },
  { key: 'title', label: 'Título (A–Z)' },
];
