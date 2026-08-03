import { useAuth } from '@/contexts/auth-context';
import { nameFromEmail } from '@/lib/profiles';
import { useActiveProject } from '@/features/onboarding/useProjectMembership';
import { FullPageLoading, ErrorState } from '@/components/ui';
import { ProjectHero } from './ProjectHero';
import { ModuleCards } from './ModuleCards';
import { MembersCard } from './MembersCard';
import { InvitationCard } from './InvitationCard';
import { RecentActivity } from './RecentActivity';
import { UpcomingDeadlines } from './UpcomingDeadlines';
import { RecentlyCompleted } from './RecentlyCompleted';

export function HomePage() {
  const { user } = useAuth();
  const { data: active, isLoading, isError, refetch } = useActiveProject();

  if (isLoading) return <FullPageLoading label="Carregando seu lar…" />;
  if (isError || !active) {
    return (
      <ErrorState
        title="Não foi possível carregar o projeto"
        description="Verifique sua conexão e tente novamente."
        onRetry={() => refetch()}
      />
    );
  }

  const { project, membership, members } = active;
  const displayName =
    (user?.user_metadata?.['display_name'] as string | undefined)?.trim() ||
    (user?.user_metadata?.['full_name'] as string | undefined)?.trim() ||
    nameFromEmail(user?.email);
  const greeting = buildGreeting(displayName);
  const isOwner = membership.role === 'owner';

  return (
    <div className="space-y-6 animate-fade-in">
      <ProjectHero project={project} greeting={greeting} />

      <UpcomingDeadlines />

      <RecentlyCompleted />

      <ModuleCards />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <MembersCard members={members} />
        <InvitationCard
          projectId={project.id}
          code={project.invitation_code}
          canRegenerate={isOwner}
        />
      </div>

      <RecentActivity project={project} members={members} />
    </div>
  );
}

/** Greeting using the user's display name (email-derived name as fallback). */
function buildGreeting(name?: string): string {
  const hour = new Date().getHours();
  const part = hour < 12 ? 'Bom dia' : hour < 18 ? 'Boa tarde' : 'Boa noite';
  if (!name) return part;
  return `${part}, ${name}`;
}
