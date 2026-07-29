import { supabase } from '@/lib/supabase';
import { uploadFile, deleteFile, getSignedUrl, sanitizeFileName } from '@/lib/storage';
import type { DocumentRecord, DocumentCategory } from '@/types/documentos';

/**
 * Data-access layer for the Documentos module's `documents` table. Files are
 * stored in the private `documents` storage bucket; this layer uploads the
 * file, stores its metadata row, and resolves signed URLs for download.
 * Mirrors the `create_milestones_documents_memories` migration.
 */

const SELECT =
  'id, project_id, title, category, storage_path, file_name, file_size, ' +
  'mime_type, expires_at, created_at, updated_at';

export interface DocumentInput {
  title: string;
  category?: DocumentCategory;
  expires_at?: string | null;
}

export interface DocumentUploadResult {
  document: DocumentRecord;
  signedUrl: string;
}

/** List all documents for a project, newest first. */
export async function listDocumentsForProject(
  projectId: string
): Promise<DocumentRecord[]> {
  const { data, error } = await supabase
    .from('documents')
    .select(SELECT)
    .eq('project_id', projectId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data as unknown as DocumentRecord[]) ?? [];
}

/** Upload a file and create its metadata row. Returns the row + a signed URL. */
export async function uploadDocument(
  projectId: string,
  file: File,
  userId: string,
  meta: DocumentInput
): Promise<DocumentUploadResult> {
  const path = `${userId}/${Date.now()}-${sanitizeFileName(file.name)}`;
  const { signedUrl } = await uploadFile('documents', file, { path });

  const { data, error } = await supabase
    .from('documents')
    .insert({
      project_id: projectId,
      title: meta.title,
      category: meta.category ?? 'other',
      storage_path: path,
      file_name: file.name,
      file_size: file.size,
      mime_type: file.type || null,
      expires_at: meta.expires_at ?? null,
    })
    .select(SELECT)
    .single();
  if (error) {
    // Best-effort cleanup of the orphaned storage object.
    await deleteFile('documents', path).catch(() => {});
    throw error;
  }
  return { document: data as unknown as DocumentRecord, signedUrl };
}

/** Update editable metadata (title, category, expiry) of a document. */
export async function updateDocument(
  documentId: string,
  patch: Partial<DocumentInput>
): Promise<DocumentRecord> {
  const { data, error } = await supabase
    .from('documents')
    .update(patch)
    .eq('id', documentId)
    .select(SELECT)
    .single();
  if (error) throw error;
  return data as unknown as DocumentRecord;
}

/** Delete a document: remove its metadata row first, then the storage object. */
export async function deleteDocument(doc: DocumentRecord): Promise<void> {
  const { error } = await supabase
    .from('documents')
    .delete()
    .eq('id', doc.id);
  if (error) throw error;
  if (doc.storage_path) {
    await deleteFile('documents', doc.storage_path).catch(() => {});
  }
}

/** Resolve a time-limited signed URL for downloading a document. */
export async function getDocumentSignedUrl(
  storagePath: string
): Promise<string> {
  return getSignedUrl('documents', storagePath);
}
