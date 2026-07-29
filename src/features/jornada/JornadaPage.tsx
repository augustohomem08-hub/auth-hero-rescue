import { useMemo, useState } from 'react';
import { Plus, Heart } from 'lucide-react';
import { Breadcrumb } from '@/components/Breadcrumb';
import { PageHeader } from '@/components/PageHeader';
import { Card, CardHeader, Button, EmptyState, ErrorState, Spinner } from '@/components/ui';
import {
  useMemories,
  useCreateMemory,
  useUpdateMemory,
  useDeleteMemory,
} from './useMemories';
import { MemoryCard } from './MemoryCard';
import { MemoryDialog, type MemorySubmitValues } from './MemoryDialog';
import { DeleteMemoryDialog } from './DeleteMemoryDialog';
import type { Memory } from '@/types/jornada';

type DialogState =
  | { kind: 'none' }
  | { kind: 'create' }
  | { kind: 'edit'; memory: Memory }
  | { kind: 'delete'; memory: Memory };

export function JornadaPage() {
  const { data: memories, isLoading, isError, refetch } = useMemories();
  const createMemory = useCreateMemory();
  const updateMemory = useUpdateMemory();
  const deleteMemory = useDeleteMemory();

  const [dialog, setDialog] = useState<DialogState>({ kind: 'none' });
  const [serverError, setServerError] = useState<string | null>(null);

  const close = () => {
    setDialog({ kind: 'none' });
    setServerError(null);
  };

  const handleCreate = async (values: MemorySubmitValues) => {
    setServerError(null);
    try {
      await createMemory.mutateAsync({
        input: {
          title: values.title,
          description: values.description,
          date: values.date,
          is_highlight: values.is_highlight,
        },
        file: values.file,
      });
      close();
    } catch (e) {
      setServerError(toMessage(e));
    }
  };

  const handleUpdate = async (values: MemorySubmitValues) => {
    if (dialog.kind !== 'edit') return;
    setServerError(null);
    try {
      await updateMemory.mutateAsync({
        memoryId: dialog.memory.id,
        patch: {
          title: values.title,
          description: values.description,
          date: values.date,
          is_highlight: values.is_highlight,
        },
      });
      close();
    } catch (e) {
      setServerError(toMessage(e));
    }
  };

  const handleDelete = async () => {
    if (dialog.kind !== 'delete') return;
    try {
      await deleteMemory.mutateAsync(dialog.memory);
      close();
    } catch (e) {
      setServerError(toMessage(e));
    }
  };

  const editInitial = useMemo<Omit<MemorySubmitValues, 'file'> | null>(() => {
    if (dialog.kind !== 'edit') return null;
    const m = dialog.memory;
    return {
      title: m.title,
      description: m.description,
      date: m.date,
      is_highlight: m.is_highlight,
    };
  }, [dialog]);

  const highlights = memories?.filter((m) => m.is_highlight) ?? [];
  const regular = memories?.filter((m) => !m.is_highlight) ?? [];

  return (
    <div className="animate-fade-in space-y-6">
      <div className="space-y-3">
        <Breadcrumb items={[{ label: 'Início', to: '/' }, { label: 'Nossa Jornada' }]} />
        <PageHeader
          emoji="❤️"
          title="Nossa Jornada"
          description="Memórias e momentos especiais do caminho juntos."
          action={
            <Button
              size="sm"
              variant="primary"
              leftIcon={<Plus className="h-4 w-4" />}
              onClick={() => setDialog({ kind: 'create' })}
            >
              Nova memória
            </Button>
          }
        />
      </div>

      {isLoading ? (
        <Card padding="lg">
          <div className="flex items-center justify-center gap-2 py-12 text-sm text-surface-500 dark:text-surface-400">
            <Spinner /> Carregando memórias…
          </div>
        </Card>
      ) : isError ? (
        <Card padding="lg">
          <ErrorState
            title="Não foi possível carregar as memórias"
            description="Verifique sua conexão e tente novamente."
            onRetry={() => refetch()}
          />
        </Card>
      ) : !memories || memories.length === 0 ? (
        <Card padding="lg">
          <EmptyState
            icon={<Heart className="h-7 w-7" />}
            title="Nenhuma memória ainda"
            description="Registem o primeiro momento especial da jornada de vocês."
            actionLabel="Adicionar memória"
            onAction={() => setDialog({ kind: 'create' })}
          />
        </Card>
      ) : (
        <>
          {/* Highlights */}
          {highlights.length > 0 && (
            <div className="space-y-3">
              <h2 className="text-sm font-semibold uppercase tracking-wide text-surface-500 dark:text-surface-400">
                Momentos especiais
              </h2>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {highlights.map((m) => (
                  <MemoryCard
                    key={m.id}
                    memory={m}
                    onEdit={(m) => setDialog({ kind: 'edit', memory: m })}
                    onDelete={(m) => setDialog({ kind: 'delete', memory: m })}
                  />
                ))}
              </div>
            </div>
          )}

          {/* All memories */}
          <Card padding="lg">
            <CardHeader title="Todas as memórias" subtitle="A linha do tempo de vocês" />
            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {regular.map((m) => (
                <MemoryCard
                  key={m.id}
                  memory={m}
                  onEdit={(m) => setDialog({ kind: 'edit', memory: m })}
                  onDelete={(m) => setDialog({ kind: 'delete', memory: m })}
                />
              ))}
            </div>
          </Card>
        </>
      )}

      <MemoryDialog
        open={dialog.kind === 'create' || dialog.kind === 'edit'}
        onClose={close}
        initial={dialog.kind === 'edit' ? editInitial : null}
        title={dialog.kind === 'edit' ? 'Editar memória' : 'Nova memória'}
        submitLabel={dialog.kind === 'edit' ? 'Salvar' : 'Adicionar memória'}
        isSubmitting={createMemory.isPending || updateMemory.isPending}
        serverError={serverError}
        onSubmit={dialog.kind === 'edit' ? handleUpdate : handleCreate}
      />

      <DeleteMemoryDialog
        open={dialog.kind === 'delete'}
        onClose={close}
        itemName={dialog.kind === 'delete' ? dialog.memory.title : null}
        isDeleting={deleteMemory.isPending}
        onConfirm={handleDelete}
      />
    </div>
  );
}

function toMessage(e: unknown): string {
  const msg = e instanceof Error ? e.message : String(e);
  if (/permission|denied|policy/i.test(msg)) return 'Sem permissão para esta ação no projeto.';
  return 'Não foi possível salvar. Tente novamente.';
}
