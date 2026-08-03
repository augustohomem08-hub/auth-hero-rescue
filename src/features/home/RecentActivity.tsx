import { CalendarCheck, UserPlus, type LucideIcon } from 'lucide-react';
import { Card, CardHeader } from '@/components/ui';
import { formatDate } from '@/lib/utils';
import { displayNameFor } from '@/lib/profiles';
import { useProfiles } from '@/features/profiles/useProfiles';
import type { Project, ProjectMember } from '@/types/project';

interface RecentActivityProps {
  project: Project;
  members: ProjectMember[];
}

/**
 * Recent activity feed. Built with a typed item shape so future activities
 * (purchases, document uploads, timeline updates, etc.) can be appended
 * without restructuring the component. Currently derives only two events
 * from real timestamps: project creation and member joins.
 */
interface ActivityItem {
  id: string;
  icon: LucideIcon;
  tone: 'primary' | 'secondary';
  title: string;
  detail: string;
  timestamp: string;
}

export function RecentActivity({ project, members }: RecentActivityProps) {
  const { profiles } = useProfiles(members.map((m) => m.user_id));
  const items: ActivityItem[] = [];

  items.push({
    id: `project-${project.id}`,
    icon: CalendarCheck,
    tone: 'primary',
    title: 'Projeto criado',
    detail: project.name,
    timestamp: project.created_at,
  });

  members
    .filter((m) => m.joined_at)
    .forEach((m) => {
      const isOwner = m.role === 'owner';
      const person = displayNameFor(profiles.get(m.user_id), roleLabel(m.role));
      items.push({
        id: `member-${m.id}`,
        icon: UserPlus,
        tone: 'secondary',
        title: `${person} entrou no projeto`,
        detail: isOwner ? 'Dono do projeto' : roleLabel(m.role),
        timestamp: m.joined_at as string,
      });
    });

  // Most recent first
  items.sort((a, b) => b.timestamp.localeCompare(a.timestamp));

  return (
    <Card padding="lg">
      <CardHeader title="Atividade recente" subtitle="O que aconteceu no seu lar" />

      {items.length === 0 ? (
        <p className="mt-4 text-sm text-surface-500 dark:text-surface-400">
          Nenhuma atividade ainda.
        </p>
      ) : (
        <ol className="mt-4 space-y-1">
          {items.map((item, idx) => {
            const Icon = item.icon;
            const isLast = idx === items.length - 1;
            return (
              <li key={item.id} className="flex gap-3">
                {/* Timeline rail */}
                <div className="flex flex-col items-center">
                  <span
                    className={
                      'flex h-8 w-8 shrink-0 items-center justify-center rounded-full ' +
                      (item.tone === 'primary'
                        ? 'bg-primary-100 text-primary-600 dark:bg-primary-900/40 dark:text-primary-300'
                        : 'bg-secondary-100 text-secondary-600 dark:bg-secondary-900/40 dark:text-secondary-300')
                    }
                  >
                    <Icon className="h-4 w-4" />
                  </span>
                  {!isLast && (
                    <span className="mt-1 w-px flex-1 bg-surface-200 dark:bg-surface-700" aria-hidden />
                  )}
                </div>
                <div className={'min-w-0 pb-4 ' + (isLast ? '' : '')}>
                  <p className="text-sm font-medium text-surface-900 dark:text-surface-100">
                    {item.title}
                  </p>
                  <p className="truncate text-xs text-surface-500 dark:text-surface-400">
                    {item.detail}
                  </p>
                  <p className="mt-0.5 text-xs text-surface-400 dark:text-surface-500">
                    {formatDate(item.timestamp)}
                  </p>
                </div>
              </li>
            );
          })}
        </ol>
      )}
    </Card>
  );
}

function roleLabel(role: ProjectMember['role']): string {
  switch (role) {
    case 'owner':
      return 'Dono do projeto';
    case 'member':
      return 'Membro';
    case 'engineer':
      return 'Engenheiro';
    case 'architect':
      return 'Arquiteto';
    case 'interior_designer':
      return 'Design de interiores';
    default:
      return 'Membro';
  }
}
