import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useActiveProject } from '@/features/onboarding/useProjectMembership';
import { useAuth } from '@/contexts/auth-context';
import { useRealtimeSync } from '@/lib/realtime';
import {
  deleteDocument,
  listDocumentsForProject,
  updateDocument,
  uploadDocument,
  type DocumentInput,
} from '@/lib/documents';
import type { DocumentRecord } from '@/types/documentos';

export const documentsKeys = {
  all: ['documents'] as const,
  project: (projectId: string) => ['documents', 'project', projectId] as const,
};

/** Live list of documents for the active project with realtime sync. */
export function useDocuments() {
  const { data: active } = useActiveProject();
  const projectId = active?.project.id ?? '';
  const enabled = !!active?.project.id;

  useRealtimeSync('documents', ['documents'], enabled);

  return useQuery<DocumentRecord[]>({
    queryKey: documentsKeys.project(projectId),
    queryFn: () => listDocumentsForProject(projectId),
    enabled,
  });
}

/** Upload a file + create its metadata row. */
export function useUploadDocument() {
  const queryClient = useQueryClient();
  const { data: active } = useActiveProject();
  const { user } = useAuth();
  const projectId = active?.project.id ?? '';

  return useMutation({
    mutationFn: ({ file, meta }: { file: File; meta: DocumentInput }) =>
      uploadDocument(projectId, file, user?.id ?? '', meta),
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: documentsKeys.all });
    },
  });
}

export function useUpdateDocument() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ documentId, patch }: { documentId: string; patch: Partial<DocumentInput> }) =>
      updateDocument(documentId, patch),
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: documentsKeys.all });
    },
  });
}

export function useDeleteDocument() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteDocument,
    onMutate: async (doc) => {
      const key = documentsKeys.project(doc.project_id);
      await queryClient.cancelQueries({ queryKey: key });
      const previous = queryClient.getQueryData<DocumentRecord[]>(key);
      queryClient.setQueryData<DocumentRecord[]>(key, (old) =>
        (old ?? []).filter((d) => d.id !== doc.id)
      );
      return { previous, key };
    },
    onError: (_e, _v, ctx) => {
      if (ctx) queryClient.setQueryData(ctx.key, ctx.previous);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: documentsKeys.all });
    },
  });
}
