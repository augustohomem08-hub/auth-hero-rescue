import { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { PageHeader } from '@/components/PageHeader';
import { Card, CardHeader } from '@/components/ui';
import { useTheme } from '@/contexts/theme-context';
import { useAuth } from '@/contexts/auth-context';
import { Moon, Sun, Heart, Bell, User, Shield, LogOut } from 'lucide-react';
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
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [signingOut, setSigningOut] = useState(false);

  const handleSignOut = async () => {
    setSigningOut(true);
    try {
      await signOut();
      await navigate({ to: '/entrar', replace: true });
    } finally {
      setSigningOut(false);
    }
  };


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

        <div className="mt-4 border-t border-surface-200/60 pt-4 dark:border-surface-800">
          {user?.email && (
            <p className="mb-3 truncate text-xs text-surface-500 dark:text-surface-400">
              Conectado como <span className="font-medium">{user.email}</span>
            </p>
          )}
          <button
            type="button"
            onClick={handleSignOut}
            disabled={signingOut}
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-danger-200 bg-danger-50 px-4 py-2.5 text-sm font-medium text-danger-700 transition-colors hover:bg-danger-100 disabled:opacity-60 dark:border-danger-900 dark:bg-danger-950 dark:text-danger-300"
          >
            <LogOut className="h-4 w-4" />
            {signingOut ? 'Saindo…' : 'Sair da conta'}
          </button>
        </div>
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
