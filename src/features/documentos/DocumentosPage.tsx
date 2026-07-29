import { useMemo, useRef, useState } from 'react';
import { FolderOpen, Search, X, Upload, FileText } from 'lucide-react';
import { Breadcrumb } from '@/components/Breadcrumb';
import { PageHeader } from '@/components/PageHeader';
import { Card, CardHeader, Button, EmptyState, ErrorState, Spinner, Badge, Select } from '@/components/ui';
import { useDocuments, useUploadDocument, useUpdateDocument, useDeleteDocument } from './useDocuments';
import { DocumentCard } from './DocumentCard';
import { DocumentDialog, type DocumentSubmitValues } from './DocumentDialog';
import { DeleteDocumentDialog } from './DeleteDocumentDialog';
import { DOC_CATEGORIES, categoryLabel } from './documentConstants';
import type { DocumentRecord, DocumentCategory } from '@/types/documentos';

type DialogState =
  | { kind: 'none' }
  | { kind: 'edit'; doc: DocumentRecord }
  | { kind: 'delete'; doc: DocumentRecord };

export function DocumentosPage() {
  const { data: documents, isLoading, isError, refetch } = useDocuments();
  const uploadDocument = useUploadDocument();
  const updateDocument = useUpdateDocument();
  const deleteDocument = useDeleteDocument();

  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<DocumentCategory | 'all'>('all');
  const [dialog, setDialog] = useState<DialogState>({ kind: 'none' });
  const [serverError, setServerError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const close = () => {
    setDialog({ kind: 'none' });
    setServerError(null);
  };

  const filtered = useMemo(() => {
    if (!documents) return [];
    let out = documents;
    const q = search.trim().toLowerCase();
    if (q) out = out.filter((d) => d.title.toLowerCase().includes(q) || d.file_name.toLowerCase().includes(q));
    if (categoryFilter !== 'all') out = out.filter((d) => d.category === categoryFilter);
    return out;
  }, [documents, search, categoryFilter]);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setServerError(null);
    try {
      await uploadDocument.mutateAsync({
        file,
        meta: { title: file.name.replace(/\.[^.]+$/, ''), category: 'other' },
      });
    } catch (err) {
      setServerError(toMessage(err));
    }
    // Reset so selecting the same file again still fires onChange.
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleUpdate = async (values: DocumentSubmitValues) => {
    if (dialog.kind !== 'edit') return;
    setServerError(null);
    try {
      await updateDocument.mutateAsync({ documentId: dialog.doc.id, patch: values });
      close();
    } catch (e) {
      setServerError(toMessage(e));
    }
  };

  const handleDelete = async () => {
    if (dialog.kind !== 'delete') return;
    try {
      await deleteDocument.mutateAsync(dialog.doc);
      close();
    } catch (e) {
      setServerError(toMessage(e));
    }
  };

  const editInitial = useMemo<DocumentSubmitValues | null>(() => {
    if (dialog.kind !== 'edit') return null;
    return {
      title: dialog.doc.title,
      category: dialog.doc.category,
      expires_at: dialog.doc.expires_at,
    };
  }, [dialog]);

  return (
    <div className="animate-fade-in space-y-6">
      <div className="space-y-3">
        <Breadcrumb items={[{ label: 'Início', to: '/' }, { label: 'Documentos' }]} />
        <PageHeader
          emoji="📂"
          title="Documentos"
          description="Guardem e organizem todos os documentos do lar."
          action={
            <Button
              size="sm"
              variant="primary"
              leftIcon={<Upload className="h-4 w-4" />}
              onClick={() => fileInputRef.current?.click()}
              isLoading={uploadDocument.isPending}
            >
              Enviar arquivo
            </Button>
          }
        />
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          onChange={handleFileSelect}
          accept=".pdf,.doc,.docx,image/jpeg,image/png"
        />
      </div>

      <Card padding="lg">
        <CardHeader title="Arquivos" subtitle="Contratos, recibos e certidões" />

        {/* Search + filter */}
        {documents && documents.length > 0 && (
          <div className="mt-4 flex flex-col gap-2.5 sm:flex-row sm:items-center">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-surface-400" />
              <input
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar por título ou nome do arquivo…"
                className="h-10 w-full rounded-xl border border-surface-300 bg-white pl-9 pr-9 text-sm text-surface-900 placeholder:text-surface-400 transition-colors focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-400 dark:border-surface-700 dark:bg-surface-900 dark:text-surface-100"
              />
              {search && (
                <button
                  type="button"
                  onClick={() => setSearch('')}
                  aria-label="Limpar busca"
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded p-0.5 text-surface-400 hover:text-surface-700 dark:hover:text-surface-200"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
            <Select
              aria-label="Categoria"
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value as DocumentCategory | 'all')}
              className="sm:w-48"
            >
              <option value="all">Todas categorias</option>
              {DOC_CATEGORIES.map((c) => (
                <option key={c.key} value={c.key}>{c.label}</option>
              ))}
            </Select>
          </div>
        )}

        {/* Content */}
        <div className="mt-4">
          {isLoading ? (
            <div className="flex items-center justify-center gap-2 py-12 text-sm text-surface-500 dark:text-surface-400">
              <Spinner /> Carregando documentos…
            </div>
          ) : isError ? (
            <ErrorState
              title="Não foi possível carregar os documentos"
              description="Verifique sua conexão e tente novamente."
              onRetry={() => refetch()}
            />
          ) : !documents || documents.length === 0 ? (
            <EmptyState
              icon={<FolderOpen className="h-7 w-7" />}
              title="Nenhum documento ainda"
              description="Envie contratos, recibos e certidões para manter tudo organizado."
              actionLabel="Enviar arquivo"
              onAction={() => fileInputRef.current?.click()}
            />
          ) : filtered.length === 0 ? (
            <EmptyState
              icon={<FileText className="h-7 w-7" />}
              title="Nenhum documento encontrado"
              description="Ajuste a busca ou os filtros para ver mais resultados."
            />
          ) : (
            <div className="grid grid-cols-1 gap-2.5 lg:grid-cols-2">
              {filtered.map((doc) => (
                <DocumentCard
                  key={doc.id}
                  doc={doc}
                  onEdit={(doc) => setDialog({ kind: 'edit', doc })}
                  onDelete={(doc) => setDialog({ kind: 'delete', doc })}
                />
              ))}
            </div>
          )}
        </div>

        {/* Category summary */}
        {documents && documents.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-1.5">
            {DOC_CATEGORIES.filter((c) => documents.some((d) => d.category === c.key)).map((c) => (
              <Badge key={c.key} tone={c.tone}>
                {categoryLabel(c.key)} · {documents.filter((d) => d.category === c.key).length}
              </Badge>
            ))}
          </div>
        )}
      </Card>

      {serverError && dialog.kind === 'none' && (
        <div className="rounded-lg bg-danger-50 px-3 py-2 text-sm text-danger-700 dark:bg-danger-950 dark:text-danger-300">
          {serverError}
          <button onClick={() => setServerError(null)} className="ml-2 underline">Fechar</button>
        </div>
      )}

      <DocumentDialog
        open={dialog.kind === 'edit'}
        onClose={close}
        initial={editInitial}
        title="Editar documento"
        submitLabel="Salvar"
        isSubmitting={updateDocument.isPending}
        serverError={serverError}
        onSubmit={handleUpdate}
      />

      <DeleteDocumentDialog
        open={dialog.kind === 'delete'}
        onClose={close}
        itemName={dialog.kind === 'delete' ? dialog.doc.title : null}
        isDeleting={deleteDocument.isPending}
        onConfirm={handleDelete}
      />
    </div>
  );
}

function toMessage(e: unknown): string {
  const msg = e instanceof Error ? e.message : String(e);
  if (/permission|denied|policy/i.test(msg)) return 'Sem permissão para esta ação no projeto.';
  return 'Não foi possível completar a ação. Tente novamente.';
}
