import { PageHeader } from '@/components/PageHeader';
import { Card, CardHeader } from '@/components/ui';
import { useTheme } from '@/contexts/theme-context';
import { Moon, Sun, Heart, Bell, User, Shield } from 'lucide-react';
import { cn } from '@/lib/utils';

const APPEARANCE_OPTIONS = [
  { value: 'light' as const, label: 'Claro', icon: Sun },
  { value: 'dark' as const, label: 'Escuro', icon: Moon },
];

const PLACEHOLDER_SECTIONS = [
  { icon: User, title: 'Perfil e conta', desc: 'Nome, e-mail e dados do casal.' },
  { icon: Bell, title: 'Notificações', desc: 'Lembretes e avisos da jornada.' },
  { icon: Shield, title: 'Privacidade', desc: 'Controle de acesso aos dados do lar.' },
];

export function ConfiguracoesPage() {
  const { theme, setTheme } = useTheme();

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        emoji="⚙️"
        title="Configurações"
        description="Personalize o app e gerencie a conta do casal."
      />

      <Card>
        <CardHeader title="Aparência" subtitle="Escolha o tema do aplicativo" />
        <div className="mt-4 grid grid-cols-2 gap-3">
          {APPEARANCE_OPTIONS.map((opt) => {
            const Icon = opt.icon;
            const active = theme === opt.value;
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => setTheme(opt.value)}
                aria-pressed={active}
                className={cn(
                  'flex items-center gap-3 rounded-xl border p-4 text-left transition-colors',
                  active
                    ? 'border-primary-400 bg-primary-50 dark:border-primary-500 dark:bg-primary-900/30'
                    : 'border-surface-200 bg-white hover:bg-surface-50 dark:border-surface-800 dark:bg-surface-900 dark:hover:bg-surface-800'
                )}
              >
                <span
                  className={cn(
                    'flex h-10 w-10 items-center justify-center rounded-xl',
                    active
                      ? 'bg-primary-500 text-white'
                      : 'bg-surface-100 text-surface-500 dark:bg-surface-800 dark:text-surface-400'
                  )}
                >
                  <Icon className="h-5 w-5" />
                </span>
                <span
                  className={cn(
                    'text-sm font-medium',
                    active
                      ? 'text-primary-700 dark:text-primary-300'
                      : 'text-surface-700 dark:text-surface-200'
                  )}
                >
                  {opt.label}
                </span>
              </button>
            );
          })}
        </div>
      </Card>

      <Card>
        <CardHeader title="Conta" subtitle="Configurações da conta e preferências" />
        <ul className="mt-4 divide-y divide-surface-200/60 dark:divide-surface-800">
          {PLACEHOLDER_SECTIONS.map((section) => {
            const Icon = section.icon;
            return (
              <li
                key={section.title}
                className="flex items-center gap-3 py-3.5 first:pt-0 last:pb-0"
              >
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-surface-100 text-surface-500 dark:bg-surface-800 dark:text-surface-400">
                  <Icon className="h-5 w-5" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-surface-900 dark:text-surface-100">
                    {section.title}
                  </p>
                  <p className="truncate text-xs text-surface-500 dark:text-surface-400">
                    {section.desc}
                  </p>
                </div>
              </li>
            );
          })}
        </ul>
      </Card>

      <Card className="border-0 bg-gradient-to-br from-primary-500 to-primary-700 text-white">
        <div className="flex items-center gap-3 p-5">
          <Heart className="h-8 w-8 shrink-0" />
          <div>
            <p className="text-sm font-semibold">Nosso Primeiro Lar</p>
            <p className="text-xs text-primary-100/90">Versão 0.1.0 — fundação do projeto</p>
          </div>
        </div>
      </Card>
    </div>
  );
}
