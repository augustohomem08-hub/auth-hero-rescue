import {
  Package,
  Sofa,
  Refrigerator,
  Utensils,
  Lightbulb,
  Bath,
  BedSingle,
  Tv,
  WashingMachine,
  Frame,
  Sprout,
  Car,
  Wrench,
  type LucideIcon,
} from 'lucide-react';
import type { BadgeTone } from '@/components/ui';
import type { ItemPriority, ItemStatus } from '@/types/purchases';

/**
 * Purchases item visual + domain presets. All UI labels are in Portuguese
 * to match the rest of the app. Keys map to the database columns/enum
 * values, so changing a label never requires a migration.
 */

// ──────────────────────────────────────────────────────────────────────
// Status
// ──────────────────────────────────────────────────────────────────────

export interface StatusPreset {
  key: ItemStatus;
  label: string;
  tone: BadgeTone;
}

export const ITEM_STATUSES: StatusPreset[] = [
  { key: 'planned', label: 'Planejado', tone: 'neutral' },
  { key: 'researching', label: 'Pesquisando', tone: 'accent' },
  { key: 'budgeted', label: 'Orçado', tone: 'primary' },
  { key: 'purchased', label: 'Comprado', tone: 'primary' },
  { key: 'delivered', label: 'Entregue', tone: 'secondary' },
  { key: 'installed', label: 'Instalado', tone: 'success' },
];

const STATUS_MAP = new Map(ITEM_STATUSES.map((s) => [s.key, s]));

export function statusLabel(key: ItemStatus): string {
  return STATUS_MAP.get(key)?.label ?? key;
}
export function statusTone(key: ItemStatus): BadgeTone {
  return STATUS_MAP.get(key)?.tone ?? 'neutral';
}

// ──────────────────────────────────────────────────────────────────────
// Priority
// ──────────────────────────────────────────────────────────────────────

export interface PriorityPreset {
  key: ItemPriority;
  label: string;
  tone: BadgeTone;
}

export const ITEM_PRIORITIES: PriorityPreset[] = [
  { key: 'low', label: 'Baixa', tone: 'neutral' },
  { key: 'medium', label: 'Média', tone: 'warning' },
  { key: 'high', label: 'Alta', tone: 'danger' },
];

const PRIORITY_MAP = new Map(ITEM_PRIORITIES.map((p) => [p.key, p]));

export function priorityLabel(key: ItemPriority): string {
  return PRIORITY_MAP.get(key)?.label ?? key;
}
export function priorityTone(key: ItemPriority): BadgeTone {
  return PRIORITY_MAP.get(key)?.tone ?? 'neutral';
}

// ──────────────────────────────────────────────────────────────────────
// Category
// ──────────────────────────────────────────────────────────────────────

export interface CategoryPreset {
  key: string;
  label: string;
  Icon: LucideIcon;
}

export const ITEM_CATEGORIES: CategoryPreset[] = [
  { key: 'general', label: 'Geral', Icon: Package },
  { key: 'furniture', label: 'Móveis', Icon: Sofa },
  { key: 'appliance', label: 'Eletrodomésticos', Icon: Refrigerator },
  { key: 'kitchenware', label: 'Utensílios', Icon: Utensils },
  { key: 'lighting', label: 'Iluminação', Icon: Lightbulb },
  { key: 'bath', label: 'Banheiro', Icon: Bath },
  { key: 'bedroom', label: 'Quarto', Icon: BedSingle },
  { key: 'electronics', label: 'Eletrônicos', Icon: Tv },
  { key: 'laundry', label: 'Lavanderia', Icon: WashingMachine },
  { key: 'decor', label: 'Decoração', Icon: Frame },
  { key: 'outdoor', label: 'Área externa', Icon: Sprout },
  { key: 'auto', label: 'Garagem', Icon: Car },
  { key: 'tools', label: 'Ferramentas', Icon: Wrench },
];

const CATEGORY_MAP = new Map(ITEM_CATEGORIES.map((c) => [c.key, c]));

export function categoryLabel(key: string | null): string {
  if (!key) return 'Sem categoria';
  return CATEGORY_MAP.get(key)?.label ?? key;
}
export function categoryIcon(key: string | null): LucideIcon {
  return CATEGORY_MAP.get(key ?? '')?.Icon ?? Package;
}

// ──────────────────────────────────────────────────────────────────────
// Unit
// ──────────────────────────────────────────────────────────────────────

export interface UnitPreset {
  key: string;
  label: string;
}

export const ITEM_UNITS: UnitPreset[] = [
  { key: 'un', label: 'un' },
  { key: 'pc', label: 'pc' },
  { key: 'kg', label: 'kg' },
  { key: 'g', label: 'g' },
  { key: 'l', label: 'L' },
  { key: 'm', label: 'm' },
  { key: 'm2', label: 'm²' },
  { key: 'set', label: 'jogo' },
  { key: 'cx', label: 'cx' },
];

const UNIT_MAP = new Map(ITEM_UNITS.map((u) => [u.key, u]));

export function unitLabel(key: string | null): string {
  if (!key) return 'un';
  return UNIT_MAP.get(key)?.label ?? key;
}

// ──────────────────────────────────────────────────────────────────────
// Sort options
// ──────────────────────────────────────────────────────────────────────

export type ItemSortKey = 'recent' | 'name' | 'status' | 'priority' | 'price_desc' | 'price_asc';

export interface SortPreset {
  key: ItemSortKey;
  label: string;
}

export const ITEM_SORTS: SortPreset[] = [
  { key: 'recent', label: 'Mais recentes' },
  { key: 'name', label: 'Nome (A–Z)' },
  { key: 'status', label: 'Status' },
  { key: 'priority', label: 'Prioridade' },
  { key: 'price_desc', label: 'Maior preço previsto' },
  { key: 'price_asc', label: 'Menor preço previsto' },
];
