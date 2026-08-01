import { Link } from '@tanstack/react-router';
import { ArrowLeft, AlarmClock, CalendarClock } from 'lucide-react';
import { PageHeader } from '@/components/PageHeader';
import { Card, CardHeader } from '@/components/ui';
import { DUE_SOON_DAYS } from '@/lib/dateUtils';
import { useNotificationPrefs } from './notificationPrefs';
import { cn } from '@/lib/utils';

interface ToggleRowProps {
  icon: typeof AlarmClock;
  title: string;
  desc: string;
  checked: boolean;
  disabled?: boolean;
  onChange: (v: boolean) => void;
}

function ToggleRow({ icon: Icon, title, desc, checked, disabled, onChange }: ToggleRowProps) {
  return (
    <li className="flex items-center gap-3 py-3.5 first:pt-0 last:pb-0">
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-surface-100 text-surface-500 dark:bg-surface-800 dark:text-surface-400">
        <Icon className="h-5 w-5" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-surface-900 dark:text-surface-100">{title}</p>
        <p className="text-xs text-surface-500 dark:text-surface-400">{desc}</p>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={title}
        disabled={disabled}
        onClick={() => onChange(!checked)}
        className={cn(
          'relative h-6 w-11 shrink-0 rounded-full transition-colors disabled:opacity-40',
          checked ? 'bg-primary-500' : 'bg-surface-300 dark:bg-surface-700'
        )}
      >
        <span
          className={cn(
            'absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform',
            checked ? 'translate-x-5' : 'translate-x-0.5'
          )}
        />
      </button>
    </li>
  );
}

/**
 * Notification preferences. In-app only for now: the toggles control the
 * deadline alert card rendered on the Home screen (`UpcomingDeadlines`).
 */
export function NotificacoesPage() {
  const { prefs, update } = useNotificationPrefs();

  return (
    <div className="space-y-6 animate-fade-in">
      <Link
        to="/configuracoes"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-primary-600 hover:underline dark:text-primary-400"
      >
        <ArrowLeft className="h-4 w-4" /> Voltar para Configurações
      </Link>

      <PageHeader
        emoji="🔔"
        title="Notificações"
        description="Lembretes e avisos da jornada — por enquanto, apenas dentro do app."
      />

      <Card>
        <CardHeader
          title="Alertas no app"
          subtitle="Ainda não enviamos e-mail ou push; estes avisos aparecem na tela inicial."
        />
        <ul className="mt-4 divide-y divide-surface-200/60 dark:divide-surface-800">
          <ToggleRow
            icon={AlarmClock}
            title="Alertas de prazos"
            desc="Mostrar o card “Datas importantes” na tela inicial."
            checked={prefs.deadlineAlerts}
            onChange={(v) => update({ deadlineAlerts: v })}
          />
          <ToggleRow
            icon={CalendarClock}
            title="Incluir prazos que estão chegando"
            desc={`Além dos vencidos, avisar sobre marcos dos próximos ${DUE_SOON_DAYS} dias.`}
            checked={prefs.includeDueSoon}
            disabled={!prefs.deadlineAlerts}
            onChange={(v) => update({ includeDueSoon: v })}
          />
        </ul>
        <p className="mt-4 text-xs text-surface-500 dark:text-surface-400">
          As preferências valem para este dispositivo.
        </p>
      </Card>
    </div>
  );
}
