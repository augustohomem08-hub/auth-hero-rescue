import {
  Home,
  Sofa,
  Utensils,
  BedDouble,
  Bath,
  TreePine,
  Car,
  Tv,
  WashingMachine,
  Briefcase,
  type LucideIcon,
} from 'lucide-react';

/**
 * Room visual presets — a small, curated set of icons and soft colors the
 * user picks from when creating/editing a room. Keys map to the `icon` /
 * `color` columns stored in the `rooms` table.
 */

export interface RoomIconPreset {
  key: string;
  label: string;
  Icon: LucideIcon;
}

/** Everyday rooms, shown by default in the picker. */
export const ROOM_ICONS: RoomIconPreset[] = [
  { key: 'home', label: 'Casa', Icon: Home },
  { key: 'sofa', label: 'Sala', Icon: Sofa },
  { key: 'utensils', label: 'Cozinha', Icon: Utensils },
  { key: 'bed', label: 'Quarto', Icon: BedDouble },
  { key: 'bath', label: 'Banheiro', Icon: Bath },
  { key: 'garden', label: 'Área externa', Icon: TreePine },
];

/** Less common rooms, revealed behind a "mais ícones" expander. */
export const ROOM_ICONS_EXTRA: RoomIconPreset[] = [
  { key: 'car', label: 'Garagem', Icon: Car },
  { key: 'tv', label: 'Home theater', Icon: Tv },
  { key: 'laundry', label: 'Lavanderia', Icon: WashingMachine },
  { key: 'office', label: 'Escritório', Icon: Briefcase },
];

export const ALL_ROOM_ICONS: RoomIconPreset[] = [...ROOM_ICONS, ...ROOM_ICONS_EXTRA];

export interface RoomColorPreset {
  key: string;
  label: string;
  /** Swatch + active-ring color classes. */
  swatch: string;
  /** Applied to a room card's icon chip. */
  chip: string;
}

/** Soft, earthy tones only — alarm colors stay reserved for status badges. */
export const ROOM_COLORS: RoomColorPreset[] = [
  { key: 'primary', label: 'Terracota', swatch: 'bg-primary-400', chip: 'bg-primary-100 text-primary-600 dark:bg-primary-900/40 dark:text-primary-300' },
  { key: 'secondary', label: 'Sálvia', swatch: 'bg-secondary-400', chip: 'bg-secondary-100 text-secondary-600 dark:bg-secondary-900/40 dark:text-secondary-300' },
  { key: 'info', label: 'Azul suave', swatch: 'bg-info-400', chip: 'bg-info-100 text-info-600 dark:bg-info-900/40 dark:text-info-300' },
  { key: 'accent', label: 'Areia', swatch: 'bg-accent-300', chip: 'bg-accent-100 text-accent-700 dark:bg-accent-900/40 dark:text-accent-300' },
];

const ICON_MAP = new Map(ALL_ROOM_ICONS.map((p) => [p.key, p.Icon]));
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
