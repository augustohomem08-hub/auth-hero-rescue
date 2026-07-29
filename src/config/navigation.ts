import {
  Home,
  ShoppingCart,
  Wallet,
  CalendarDays,
  FolderOpen,
  Heart,
  Settings,
  type LucideIcon,
} from 'lucide-react';

export interface NavItem {
  /** Route path (matches React Router routes) */
  to: string;
  /** Short label shown under the icon */
  label: string;
  icon: LucideIcon;
  /** Emojis used as decorative accents in marketing/headings */
  emoji: string;
}

export const NAV_ITEMS: NavItem[] = [
  { to: '/', label: 'Início', icon: Home, emoji: '🏠' },
  { to: '/compras', label: 'Compras', icon: ShoppingCart, emoji: '🛒' },
  { to: '/financeiro', label: 'Financeiro', icon: Wallet, emoji: '💰' },
  { to: '/cronograma', label: 'Cronograma', icon: CalendarDays, emoji: '📅' },
  { to: '/documentos', label: 'Documentos', icon: FolderOpen, emoji: '📂' },
  { to: '/jornada', label: 'Nossa Jornada', icon: Heart, emoji: '❤️' },
  { to: '/configuracoes', label: 'Ajustes', icon: Settings, emoji: '⚙️' },
];

/** Primary 5 items shown in the mobile bottom bar (Home + the 4 core modules). */
export const PRIMARY_NAV = NAV_ITEMS.slice(0, 5);

/** Items reachable only via the "more" sheet on mobile (and always in the desktop sidebar). */
export const SECONDARY_NAV = NAV_ITEMS.slice(5);
