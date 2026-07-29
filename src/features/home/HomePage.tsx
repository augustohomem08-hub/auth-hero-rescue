import { useAuth } from '@/contexts/auth-context';
import { useActiveProject } from '@/features/onboarding/useProjectMembership';
import { FullPageLoading, ErrorState } from '@/components/ui';
import { ProjectHero } from './ProjectHero';
import { ModuleCards } from './ModuleCards';
import { MembersCard } from './MembersCard';
import { InvitationCard } from './InvitationCard';
import { RecentActivity } from './RecentActivity';

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
  const greeting = buildGreeting(user?.email);
  const isOwner = membership.role === 'owner';

  return (
    <div className="space-y-6 animate-fade-in">
      <ProjectHero project={project} greeting={greeting} />

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

/** Greeting using the local part of the authenticated user's email. */
function buildGreeting(email?: string): string {
  const hour = new Date().getHours();
  const part = hour < 12 ? 'Bom dia' : hour < 18 ? 'Boa tarde' : 'Boa noite';
  if (!email) return part;
  const name = email.split('@')[0];
  const clean = name
    .replace(/[._-]+/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());
  return `${part}, ${clean}`;
}
