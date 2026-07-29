import { Link } from 'react-router-dom';
import {
  ShoppingCart,
  Wallet,
  CalendarDays,
  FolderOpen,
  ArrowRight,
  type LucideIcon,
} from 'lucide-react';
import { Card } from '@/components/ui';

interface ModuleCardDef {
  to: string;
  label: string;
  description: string;
  icon: LucideIcon;
  emoji: string;
  tone: 'primary' | 'secondary' | 'accent' | 'warning';
}

const MODULES: ModuleCardDef[] = [
  {
    to: '/compras',
    label: 'Compras',
    description: 'Lista de itens e orçamentos do lar.',
    icon: ShoppingCart,
    emoji: '🛒',
    tone: 'primary',
  },
  {
    to: '/financeiro',
    label: 'Financeiro',
    description: 'Planejamento e acompanhamento de gastos.',
    icon: Wallet,
    emoji: '💰',
    tone: 'secondary',
  },
  {
    to: '/cronograma',
    label: 'Cronograma',
    description: 'Etapas e prazos da obra e entrega.',
    icon: CalendarDays,
    emoji: '📅',
    tone: 'accent',
  },
  {
    to: '/documentos',
    label: 'Documentos',
    description: 'Contratos, recibos e certidões.',
    icon: FolderOpen,
    emoji: '📂',
    tone: 'warning',
  },
];

const TONE_BG: Record<ModuleCardDef['tone'], string> = {
  primary: 'bg-primary-100 text-primary-600 dark:bg-primary-900/40 dark:text-primary-300',
  secondary: 'bg-secondary-100 text-secondary-600 dark:bg-secondary-900/40 dark:text-secondary-300',
  accent: 'bg-accent-100 text-accent-600 dark:bg-accent-900/40 dark:text-accent-300',
  warning: 'bg-warning-100 text-warning-600 dark:bg-warning-900/40 dark:text-warning-300',
};

export function ModuleCards() {
  return (
    <section>
      <div className="mb-3 flex items-baseline justify-between">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-surface-500 dark:text-surface-400">
          Módulos
        </h2>
        <span className="text-xs text-surface-400 dark:text-surface-500">Explorar</span>
      </div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {MODULES.map((m) => {
          const Icon = m.icon;
          return (
            <Link key={m.to} to={m.to} className="block">
              <Card
                interactive
                padding="md"
                className="flex h-full flex-col gap-0"
              >
                <div className="flex items-center justify-between">
                  <span
                    className={
                      'flex h-10 w-10 items-center justify-center rounded-xl ' + TONE_BG[m.tone]
                    }
                  >
                    <Icon className="h-5 w-5" />
                  </span>
                  <ArrowRight className="h-4 w-4 text-surface-300 dark:text-surface-600" />
                </div>
                <p className="mt-3 text-sm font-semibold text-surface-900 dark:text-surface-100">
                  {m.label}
                </p>
                <p className="mt-0.5 text-xs text-surface-500 dark:text-surface-400">
                  {m.description}
                </p>
                <span className="mt-3 inline-flex w-fit items-center rounded-full bg-surface-100 px-2 py-0.5 text-[11px] font-medium text-surface-500 dark:bg-surface-800 dark:text-surface-400">
                  {m.emoji} Acessar
                </span>
              </Card>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
