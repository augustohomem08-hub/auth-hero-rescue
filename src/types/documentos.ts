/**
 * Documentos module domain types — mirrors the `documents` table created in
 * the `create_milestones_documents_memories` migration. Files themselves live
 * in the private `documents` storage bucket; this table holds their metadata.
 */

export type DocumentCategory =
  | 'contract'
  | 'memorial'
  | 'blueprint'
  | 'bill'
  | 'receipt'
  | 'proof'
  | 'warranty'
  | 'manual'
  | 'certificate'
  | 'personal'
  | 'other';

/** Row in the `documents` table. */
export interface DocumentRecord {
  id: string;
  project_id: string;
  title: string;
  category: DocumentCategory;
  storage_path: string;
  file_name: string;
  file_size: number | null;
  mime_type: string | null;
  /** Document expiry date (e.g. certificates); null = no expiry. */
  expires_at: string | null;
  created_at: string;
  updated_at: string;
}
