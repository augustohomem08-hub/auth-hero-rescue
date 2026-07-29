import {
  Home,
  Sofa,
  Utensils,
  BedDouble,
  Bath,
  Car,
  Tv,
  WashingMachine,
  Briefcase,
  TreePine,
  type LucideIcon,
} from 'lucide-react';

/**
 * Room visual presets — a fixed palette of icons and colors the user picks
 * from when creating/editing a room. Keys map to the `icon` / `color`
 * columns stored in the `rooms` table. Kept in one place so the create/edit
 * dialogs and the room cards render consistently.
 */

export interface RoomIconPreset {
  key: string;
  label: string;
  Icon: LucideIcon;
}

export const ROOM_ICONS: RoomIconPreset[] = [
  { key: 'home', label: 'Casa', Icon: Home },
  { key: 'sofa', label: 'Sala', Icon: Sofa },
  { key: 'utensils', label: 'Cozinha', Icon: Utensils },
  { key: 'bed', label: 'Quarto', Icon: BedDouble },
  { key: 'bath', label: 'Banheiro', Icon: Bath },
  { key: 'car', label: 'Garagem', Icon: Car },
  { key: 'tv', label: 'Home theater', Icon: Tv },
  { key: 'laundry', label: 'Lavanderia', Icon: WashingMachine },
  { key: 'office', label: 'Escritório', Icon: Briefcase },
  { key: 'garden', label: 'Área externa', Icon: TreePine },
];

export interface RoomColorPreset {
  key: string;
  label: string;
  /** Swatch + active-ring color classes. */
  swatch: string;
  /** Applied to a room card's icon chip. */
  chip: string;
}

export const ROOM_COLORS: RoomColorPreset[] = [
  { key: 'primary', label: 'Terracota', swatch: 'bg-primary-500', chip: 'bg-primary-100 text-primary-600 dark:bg-primary-900/40 dark:text-primary-300' },
  { key: 'secondary', label: 'Areia', swatch: 'bg-secondary-500', chip: 'bg-secondary-100 text-secondary-600 dark:bg-secondary-900/40 dark:text-secondary-300' },
  { key: 'accent', label: 'Âmbar', swatch: 'bg-accent-500', chip: 'bg-accent-100 text-accent-600 dark:bg-accent-900/40 dark:text-accent-300' },
  { key: 'success', label: 'Verde', swatch: 'bg-success-500', chip: 'bg-success-100 text-success-600 dark:bg-success-900/40 dark:text-success-300' },
  { key: 'warning', label: 'Mostarda', swatch: 'bg-warning-500', chip: 'bg-warning-100 text-warning-600 dark:bg-warning-900/40 dark:text-warning-300' },
  { key: 'danger', label: 'Vermelho', swatch: 'bg-danger-500', chip: 'bg-danger-100 text-danger-600 dark:bg-danger-900/40 dark:text-danger-300' },
];

const ICON_MAP = new Map(ROOM_ICONS.map((p) => [p.key, p.Icon]));
const COLOR_MAP = new Map(ROOM_COLORS.map((p) => [p.key, p]));

/** Resolve an icon key to its component (falls back to Home). */
export function roomIcon(key: string): LucideIcon {
  return ICON_MAP.get(key) ?? Home;
}

/** Resolve a color key to its chip classes (falls back to primary). */
export function roomChip(key: string): string {
  return COLOR_MAP.get(key)?.chip ?? ROOM_COLORS[0].chip;
}

/** Resolve a color key to its swatch (falls back to primary). */
export function roomSwatch(key: string): string {
  return COLOR_MAP.get(key)?.swatch ?? ROOM_COLORS[0].swatch;
}
