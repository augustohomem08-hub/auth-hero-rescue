import { Crown, Users } from 'lucide-react';
import { Card, CardHeader, Badge } from '@/components/ui';
import type { ProjectMember } from '@/types/project';
import { formatDate } from '@/lib/utils';
import { displayNameFor } from '@/lib/profiles';
import { useProfiles } from '@/features/profiles/useProfiles';

interface MembersCardProps {
  members: ProjectMember[];
}

/** Initials from a person's name, falling back to a stable id-derived pair. */
function initialsFor(name: string, userId: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  if (parts.length === 1 && parts[0].length > 0) return parts[0].slice(0, 2).toUpperCase();
  const clean = userId.replace(/-/g, '');
  const a = clean.charCodeAt(0) % 26;
  const b = clean.charCodeAt(1) % 26;
  return String.fromCharCode(65 + a, 65 + b);
}

/** Stable color from a string — used for avatar backgrounds. */
function colorFor(userId: string): string {
  const palette = [
    'bg-primary-500',
    'bg-secondary-500',
    'bg-accent-500',
    'bg-success-500',
    'bg-warning-500',
  ];
  const sum = userId.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
  return palette[sum % palette.length];
}

export function MembersCard({ members }: MembersCardProps) {
  const { profiles } = useProfiles(members.map((m) => m.user_id));
  const owner = members.find((m) => m.role === 'owner');
  const others = members.filter((m) => m.role !== 'owner');
  const ordered = owner ? [owner, ...others] : members;

  return (
    <Card padding="lg">
      <CardHeader
        title="Membros do projeto"
        subtitle={`${members.length} ${members.length === 1 ? 'pessoa' : 'pessoas'} no lar`}
        action={
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-surface-100 text-surface-500 dark:bg-surface-800 dark:text-surface-400">
            <Users className="h-5 w-5" />
          </span>
        }
      />

      <ul className="mt-4 space-y-2.5">
        {ordered.map((m) => {
          const isOwner = m.role === 'owner';
          const name = displayNameFor(profiles.get(m.user_id), roleLabel(m.role));
          return (
            <li
              key={m.id}
              className="flex items-center gap-3 rounded-xl bg-surface-50 px-3.5 py-3 dark:bg-surface-800/60"
            >
              <span
                className={
                  'flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-semibold text-white ' +
                  colorFor(m.user_id)
                }
              >
                {initialsFor(name, m.user_id)}
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <p className="truncate text-sm font-medium text-surface-900 dark:text-surface-100">
                    {name}
                  </p>
                  {isOwner && (
                    <Crown className="h-3.5 w-3.5 shrink-0 text-accent-500" aria-hidden />
                  )}
                </div>
                <p className="truncate text-xs text-surface-500 dark:text-surface-400">
                  {isOwner ? 'Dono do projeto' : roleLabel(m.role)} · Entrou em {formatDate(m.joined_at ?? m.invited_at)}
                </p>
              </div>
              <Badge tone={isOwner ? 'accent' : 'neutral'}>
                {m.invitation_status === 'accepted' ? 'Ativo' : 'Pendente'}
              </Badge>
            </li>
          );
        })}
      </ul>
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
