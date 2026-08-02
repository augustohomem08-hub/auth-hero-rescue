/**
 * Purchases module domain types — mirrors the `rooms` and `items` tables
 * created in the `create_rooms_and_items` and `extend_items_for_purchases`
 * migrations.
 *
 * A project has many rooms; a room has many items. Items carry no direct
 * project_id: their project is always their room's project (enforced by the
 * rooms -> projects foreign key and the member-scoped RLS policies).
 */

/** Lifecycle stage of a purchase item. Mirrors the `item_status` enum. */
export type ItemStatus =
  | 'planned'
  | 'researching'
  | 'budgeted'
  | 'purchased'
  | 'delivered'
  | 'installed';

/** How soon/important an item is. Mirrors the `item_priority` enum. */
export type ItemPriority = 'low' | 'medium' | 'high';

/** Ordered lifecycle stages for UI progression (planned -> installed). */
export const ITEM_STATUS_FLOW: ItemStatus[] = [
  'planned',
  'researching',
  'budgeted',
  'purchased',
  'delivered',
  'installed',
];

/** Row in the `rooms` table. */
export interface Room {
  id: string;
  project_id: string;
  name: string;
  /** lucide icon name key (e.g. 'sofa', 'utensils'). */
  icon: string;
  /** Palette key from the app color ramps (primary/secondary/accent/...). */
  color: string;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

/** Row in the `items` table (extended Purchases schema). */
export interface Item {
  id: string;
  room_id: string;
  name: string;
  description: string | null;
  priority: ItemPriority;
  status: ItemStatus;
  notes: string | null;
  sort_order: number;
  /** Category key (e.g. 'furniture'). Nullable for legacy/uncategorized rows. */
  category: string | null;
  /** How many units. Stored numeric; client treats as number. */
  quantity: number;
  /** Unit key (e.g. 'un','pc','kg'). Nullable. */
  unit: string | null;
  /** Preço previsto / budget. BRL cents → number on client. */
  estimated_price: number | null;
  /** Preço pago / actual. */
  paid_price: number | null;
  /** Loja onde foi/será comprado. */
  store: string | null;
  /** URL to the product page. */
  link: string | null;
  /** Path in the `images` storage bucket; resolve to a signed URL client-side. */
  image: string | null;
  /** When the "purchase completed" celebration was recorded (fires once). */
  celebrated_at: string | null;
  created_at: string;
  updated_at: string;
}

/** A room with its items nested — convenient for the future purchases UI. */
export interface RoomWithItems extends Room {
  items: Item[];
}
