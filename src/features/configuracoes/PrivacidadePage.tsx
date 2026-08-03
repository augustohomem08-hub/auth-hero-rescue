import { useState } from 'react';
import { Link } from '@tanstack/react-router';
import { useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, Crown, ShieldCheck, Trash2 } from 'lucide-react';
import { PageHeader } from '@/components/PageHeader';
import { Badge, Button, Card, CardHeader, ErrorState, FullPageLoading, Modal } from '@/components/ui';
import { useAuth } from '@/contexts/auth-context';
import { useActiveProject, projectKeys } from '@/features/onboarding/useProjectMembership';
import { removeMember, updateMemberRole } from '@/lib/project';
import { displayNameFor } from '@/lib/profiles';
import { useProfiles } from '@/features/profiles/useProfiles';
import { formatDate } from '@/lib/utils';
import type { ProjectMember } from '@/types/project';

const ROLE_LABEL: Record<string, string> = {
  owner: 'Dono do projeto',
  member: 'Membro',
  engineer: 'Engenheiro',
  architect: 'Arquiteto',
  interior_designer: 'Designer de interiores',
};

/**
 * Privacy page: who currently has access to the household data, with an
 * owner-only action to revoke a member's access.
 */
export function PrivacidadePage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { data: active, isLoading, isError, refetch } = useActiveProject();
  const [target, setTarget] = useState<ProjectMember | null>(null);
  const [promoting, setPromoting] = useState<ProjectMember | null>(null);
  const [busy, setBusy] = useState(false);
  const [removing, setRemoving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { profiles } = useProfiles((active?.members ?? []).map((m) => m.user_id));

  if (isLoading) return <FullPageLoading label="Carregando membros…" />;
  if (isError || !active) {
    return (
      <ErrorState
        title="Não foi possível carregar os membros"
        description="Verifique sua conexão e tente novamente."
        onRetry={() => refetch()}
      />
    );
  }

  const { members, membership } = active;
  const isOwner = membership.role === 'owner';

  const confirmPromote = async () => {
    if (!promoting) return;
    setBusy(true);
    setError(null);
    const { error: err } = await updateMemberRole(promoting.id, 'owner');
    setBusy(false);
    if (err) {
      setError(err);
      return;
    }
    setPromoting(null);
    await queryClient.invalidateQueries({ queryKey: projectKeys.all });
  };

  const confirmRemove = async () => {
    if (!target) return;
    setRemoving(true);
    setError(null);
    const { error: err } = await removeMember(target.id);
    setRemoving(false);
    if (err) {
      setError(err);
      return;
    }
    setTarget(null);
    await queryClient.invalidateQueries({ queryKey: projectKeys.all });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <Link
        to="/configuracoes"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-primary-600 hover:underline dark:text-primary-400"
      >
        <ArrowLeft className="h-4 w-4" /> Voltar para Configurações
      </Link>

      <PageHeader
        emoji="🔒"
        title="Privacidade"
        description="Controle de acesso aos dados do lar."
      />

      <Card>
        <CardHeader
          title="Quem tem acesso"
          subtitle={
            isOwner
              ? 'Como dono, você pode remover o acesso de qualquer membro.'
              : 'Somente o dono do projeto pode remover membros.'
          }
        />
        <ul className="mt-4 divide-y divide-surface-200/60 dark:divide-surface-800">
          {members.map((m) => {
            const owner = m.role === 'owner';
            const self = m.user_id === user?.id;
            const name = displayNameFor(profiles.get(m.user_id), ROLE_LABEL[m.role] ?? m.role);
            return (
              <li key={m.id} className="flex items-center gap-3 py-3.5 first:pt-0 last:pb-0">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-surface-100 text-surface-500 dark:bg-surface-800 dark:text-surface-400">
                  {owner ? <Crown className="h-5 w-5" /> : <ShieldCheck className="h-5 w-5" />}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-surface-900 dark:text-surface-100">
                    {name}
                    {self && ' (você)'}
                  </p>
                  <p className="truncate text-xs text-surface-500 dark:text-surface-400">
                    {ROLE_LABEL[m.role] ?? m.role} · Entrou em{' '}
                    {formatDate(m.joined_at ?? m.invited_at)}
                  </p>
                </div>
                <Badge tone={m.invitation_status === 'accepted' ? 'success' : 'warning'}>
                  {m.invitation_status === 'accepted' ? 'Ativo' : 'Convite pendente'}
                </Badge>
                {isOwner && !owner && (
                  <button
                    type="button"
                    onClick={() => setPromoting(m)}
                    aria-label="Tornar dono"
                    className="shrink-0 rounded-lg p-2 text-accent-600 transition-colors hover:bg-accent-50 dark:text-accent-400 dark:hover:bg-accent-950"
                  >
                    <Crown className="h-4 w-4" />
                  </button>
                )}
                {isOwner && !owner && (
                  <button
                    type="button"
                    onClick={() => setTarget(m)}
                    aria-label="Remover membro"
                    className="shrink-0 rounded-lg p-2 text-danger-600 transition-colors hover:bg-danger-50 dark:text-danger-400 dark:hover:bg-danger-950"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
              </li>
            );
          })}
        </ul>
      </Card>

      <Card>
        <CardHeader
          title="Como seus dados são protegidos"
          subtitle="Acesso restrito por projeto"
        />
        <p className="mt-3 text-sm text-surface-600 dark:text-surface-300">
          Todos os registros — itens, lançamentos financeiros, documentos e memórias — só podem
          ser lidos por quem faz parte deste projeto. Documentos e imagens ficam em áreas
          privadas de armazenamento e são acessados por links temporários.
        </p>
      </Card>

      <Modal
        open={!!promoting}
        onClose={() => setPromoting(null)}
        title="Tornar dono do projeto"
        description="A pessoa passará a ter controle total sobre o projeto."
        footer={
          <>
            <Button variant="ghost" size="md" onClick={() => setPromoting(null)} disabled={busy}>
              Cancelar
            </Button>
            <Button variant="primary" size="md" isLoading={busy} onClick={confirmPromote}>
              Tornar dono
            </Button>
          </>
        }
      >
        <p className="text-sm text-surface-600 dark:text-surface-300">
          Donos podem editar o projeto, gerar novos códigos de convite e remover membros.
          Vocês dois continuarão como donos.
        </p>
        {error && (
          <p className="mt-3 rounded-lg border border-danger-300 bg-danger-100 px-3 py-2 text-sm font-medium text-danger-900 dark:border-danger-700 dark:bg-danger-900/40 dark:text-danger-100">
            {error}
          </p>
        )}
      </Modal>

      <Modal
        open={!!target}
        onClose={() => setTarget(null)}
        title="Remover membro"
        description="A pessoa perderá o acesso a todos os dados do projeto."
        footer={
          <>
            <Button variant="ghost" size="md" onClick={() => setTarget(null)} disabled={removing}>
              Cancelar
            </Button>
            <Button variant="danger" size="md" isLoading={removing} onClick={confirmRemove}>
              Remover acesso
            </Button>
          </>
        }
      >
        <p className="text-sm text-surface-600 dark:text-surface-300">
          Tem certeza que deseja remover este membro do projeto? Ele poderá voltar a entrar
          somente com um novo código de convite.
        </p>
        {error && (
          <p className="mt-3 rounded-lg border border-danger-300 bg-danger-100 px-3 py-2 text-sm font-medium text-danger-900 dark:border-danger-700 dark:bg-danger-900/40 dark:text-danger-100">
            {error}
          </p>
        )}
      </Modal>
    </div>
  );
}
