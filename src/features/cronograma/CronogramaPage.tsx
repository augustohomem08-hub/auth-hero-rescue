import { useMemo, useState } from 'react';
import { Plus, CalendarDays, CheckCircle2, Clock, Loader2 } from 'lucide-react';
import { Breadcrumb } from '@/components/Breadcrumb';
import { PageHeader } from '@/components/PageHeader';
import { Card, CardHeader, CardBody, Button, EmptyState, ErrorState, Spinner, Badge } from '@/components/ui';
import { formatCountdown } from '@/lib/dateUtils';
import {
  useMilestones,
  useCreateMilestone,
  useUpdateMilestone,
  useDeleteMilestone,
  useMilestoneStats,
} from './useMilestones';
import { MilestoneDialog, type MilestoneSubmitValues } from './MilestoneDialog';
import { DeleteMilestoneDialog } from './DeleteMilestoneDialog';
import { MilestoneCard } from './MilestoneCard';
import type { Milestone } from '@/types/cronograma';

type DialogState =
  | { kind: 'none' }
  | { kind: 'create' }
  | { kind: 'edit'; milestone: Milestone }
  | { kind: 'delete'; milestone: Milestone };

export function CronogramaPage() {
  const { data: milestones, isLoading, isError, refetch } = useMilestones();
  const stats = useMilestoneStats(milestones);
  const createMilestone = useCreateMilestone();
  const updateMilestone = useUpdateMilestone();
  const deleteMilestone = useDeleteMilestone();

  const [dialog, setDialog] = useState<DialogState>({ kind: 'none' });
  const [serverError, setServerError] = useState<string | null>(null);

  const close = () => {
    setDialog({ kind: 'none' });
    setServerError(null);
  };

  const handleCreate = async (values: MilestoneSubmitValues) => {
    setServerError(null);
    try {
      await createMilestone.mutateAsync(values);
      close();
    } catch (e) {
      setServerError(toMessage(e));
    }
  };

  const handleUpdate = async (values: MilestoneSubmitValues) => {
    if (dialog.kind !== 'edit') return;
    setServerError(null);
    try {
      await updateMilestone.mutateAsync({ milestoneId: dialog.milestone.id, patch: values });
      close();
    } catch (e) {
      setServerError(toMessage(e));
    }
  };

  const handleDelete = async () => {
    if (dialog.kind !== 'delete') return;
    try {
      await deleteMilestone.mutateAsync(dialog.milestone.id);
      close();
    } catch (e) {
      setServerError(toMessage(e));
    }
  };

  const editInitial = useMemo<MilestoneSubmitValues | null>(() => {
    if (dialog.kind !== 'edit') return null;
    const m = dialog.milestone;
    return {
      title: m.title,
      description: m.description,
      date: m.date,
      status: m.status,
    };
  }, [dialog]);

  return (
    <div className="animate-fade-in space-y-6">
      <div className="space-y-3">
        <Breadcrumb items={[{ label: 'Início', to: '/' }, { label: 'Cronograma' }]} />
        <PageHeader
          emoji="📅"
          title="Cronograma"
          description="Etapas e marcos da jornada até o novo lar."
          action={
            <Button
              size="sm"
              variant="primary"
              leftIcon={<Plus className="h-4 w-4" />}
              onClick={() => setDialog({ kind: 'create' })}
            >
              Novo marco
            </Button>
          }
        />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatTile label="Total" value={stats.total} icon={<CalendarDays className="h-5 w-5" />} tone="neutral" />
        <StatTile label="Concluídos" value={stats.done} icon={<CheckCircle2 className="h-5 w-5" />} tone="success" />
        <StatTile label="Em andamento" value={stats.inProgress} icon={<Loader2 className="h-5 w-5" />} tone="accent" />
        <StatTile label="Atrasados" value={stats.delayed} icon={<Clock className="h-5 w-5" />} tone="warning" />
      </div>

      {/* Progress bar */}
      {stats.total > 0 && (
        <Card padding="md">
          <div className="flex items-center justify-between text-sm">
            <span className="text-surface-500 dark:text-surface-400">
              Progresso: <strong className="text-surface-900 dark:text-surface-100">{stats.progressPct}%</strong>
            </span>
            {stats.upcoming && (
              <span className="text-surface-500 dark:text-surface-400">
                Próximo: <strong className="text-surface-900 dark:text-surface-100">{stats.upcoming.title}</strong>
                <Badge tone="neutral" className="ml-2">{formatCountdown(stats.upcoming.date)}</Badge>
              </span>
            )}
          </div>
          <div className="mt-3 h-2.5 overflow-hidden rounded-full bg-surface-100 dark:bg-surface-800">
            <div
              className="h-full rounded-full bg-success-500 transition-all duration-500"
              style={{ width: `${stats.progressPct}%` }}
            />
          </div>
        </Card>
      )}

      {/* Timeline */}
      <Card padding="lg">
        <CardHeader title="Linha do tempo" subtitle="Marcos do projeto" />

        {isLoading ? (
          <div className="flex items-center justify-center gap-2 py-12 text-sm text-surface-500 dark:text-surface-400">
            <Spinner /> Carregando marcos…
          </div>
        ) : isError ? (
          <ErrorState
            title="Não foi possível carregar os marcos"
            description="Verifique sua conexão e tente novamente."
            onRetry={() => refetch()}
          />
        ) : !milestones || milestones.length === 0 ? (
          <div className="mt-4">
            <EmptyState
              icon={<CalendarDays className="h-7 w-7" />}
              title="Nenhum marco ainda"
              description="Adicione o primeiro marco para montar a linha do tempo do projeto."
              actionLabel="Adicionar marco"
              onAction={() => setDialog({ kind: 'create' })}
            />
          </div>
        ) : (
          <CardBody>
            <ol className="mt-2 space-y-0">
              {milestones.map((m, idx) => (
                <MilestoneCard
                  key={m.id}
                  milestone={m}
                  isLast={idx === milestones.length - 1}
                  onEdit={(m) => setDialog({ kind: 'edit', milestone: m })}
                  onDelete={(m) => setDialog({ kind: 'delete', milestone: m })}
                />
              ))}
            </ol>
          </CardBody>
        )}
      </Card>

      <MilestoneDialog
        open={dialog.kind === 'create' || dialog.kind === 'edit'}
        onClose={close}
        initial={dialog.kind === 'edit' ? editInitial : null}
        title={dialog.kind === 'edit' ? 'Editar marco' : 'Novo marco'}
        submitLabel={dialog.kind === 'edit' ? 'Salvar' : 'Adicionar marco'}
        isSubmitting={createMilestone.isPending || updateMilestone.isPending}
        serverError={serverError}
        onSubmit={dialog.kind === 'edit' ? handleUpdate : handleCreate}
      />

      <DeleteMilestoneDialog
        open={dialog.kind === 'delete'}
        onClose={close}
        itemName={dialog.kind === 'delete' ? dialog.milestone.title : null}
        isDeleting={deleteMilestone.isPending}
        onConfirm={handleDelete}
      />
    </div>
  );
}

function StatTile({
  label,
  value,
  icon,
  tone,
}: {
  label: string;
  value: number;
  icon: React.ReactNode;
  tone: 'primary' | 'secondary' | 'accent' | 'success' | 'warning' | 'danger' | 'neutral';
}) {
  const tones: Record<string, string> = {
    primary: 'bg-primary-100 text-primary-600 dark:bg-primary-900/40 dark:text-primary-300',
    secondary: 'bg-secondary-100 text-secondary-600 dark:bg-secondary-900/40 dark:text-secondary-300',
    accent: 'bg-accent-100 text-accent-600 dark:bg-accent-900/40 dark:text-accent-300',
    success: 'bg-success-100 text-success-600 dark:bg-success-900/40 dark:text-success-300',
    warning: 'bg-warning-100 text-warning-600 dark:bg-warning-900/40 dark:text-warning-300',
    danger: 'bg-danger-100 text-danger-600 dark:bg-danger-900/40 dark:text-danger-300',
    neutral: 'bg-surface-100 text-surface-600 dark:bg-surface-800 dark:text-surface-400',
  };
  return (
    <Card padding="md">
      <div className="flex items-center gap-3">
        <span className={`flex h-10 w-10 items-center justify-center rounded-xl ${tones[tone]}`}>
          {icon}
        </span>
        <div>
          <p className="text-2xl font-semibold text-surface-900 dark:text-surface-100">{value}</p>
          <p className="text-xs text-surface-500 dark:text-surface-400">{label}</p>
        </div>
      </div>
    </Card>
  );
}

function toMessage(e: unknown): string {
  const msg = e instanceof Error ? e.message : String(e);
  if (/permission|denied|policy/i.test(msg)) return 'Sem permissão para esta ação no projeto.';
  return 'Não foi possível salvar. Tente novamente.';
}
