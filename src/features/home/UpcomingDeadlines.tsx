import { Link } from '@tanstack/react-router';
import { AlarmClock, CalendarClock } from 'lucide-react';
import { Card, CardHeader, Badge } from '@/components/ui';
import { formatDate } from '@/lib/utils';
import { dueLabel, getDueState, DUE_SOON_DAYS } from '@/lib/dateUtils';
import { useMilestones } from '@/features/cronograma/useMilestones';
import { statusLabel } from '@/features/cronograma/milestoneConstants';

/**
 * In-app reminder card: milestones that are overdue or due within the next
 * {@link DUE_SOON_DAYS} days. Hidden when there is nothing to warn about.
 */
export function UpcomingDeadlines() {
  const { data: milestones } = useMilestones();
  const { prefs } = useNotificationPrefs();

  const alerts = (milestones ?? [])
    .filter((m) => m.status !== 'done' && m.status !== 'cancelled')
    .map((m) => ({ milestone: m, state: getDueState(m.date, DUE_SOON_DAYS) }))
    .filter((a) =>
      a.state === 'overdue' ||
      a.state === 'today' ||
      (a.state === 'soon' && prefs.includeDueSoon)
    )
    .sort((a, b) => (a.milestone.date ?? '').localeCompare(b.milestone.date ?? ''));

  if (!prefs.deadlineAlerts) return null;
  if (alerts.length === 0) return null;

  return (
    <Card>
      <CardHeader
        title="Datas importantes"
        subtitle={`Marcos vencidos ou vencendo nos próximos ${DUE_SOON_DAYS} dias`}
      />
      <ul className="mt-4 space-y-3">
        {alerts.map(({ milestone, state }) => (
          <li key={milestone.id} className="flex items-center gap-3">
            <span
              className={
                state === 'overdue'
                  ? 'flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-danger-100 text-danger-600 dark:bg-danger-900/40 dark:text-danger-300'
                  : 'flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-warning-100 text-warning-600 dark:bg-warning-900/40 dark:text-warning-300'
              }
            >
              {state === 'overdue' ? (
                <AlarmClock className="h-4 w-4" />
              ) : (
                <CalendarClock className="h-4 w-4" />
              )}
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-surface-900 dark:text-surface-100">
                {milestone.title}
              </p>
              <p className="truncate text-xs text-surface-500 dark:text-surface-400">
                {milestone.date ? formatDate(milestone.date) : 'Sem data'} ·{' '}
                {statusLabel(milestone.status)}
              </p>
            </div>
            <Badge tone={state === 'overdue' ? 'danger' : 'warning'}>
              {dueLabel(milestone.date)}
            </Badge>
          </li>
        ))}
      </ul>
      <Link
        to="/cronograma"
        className="mt-4 inline-block text-sm font-medium text-primary-600 hover:underline dark:text-primary-400"
      >
        Ver cronograma completo →
      </Link>
    </Card>
  );
}
