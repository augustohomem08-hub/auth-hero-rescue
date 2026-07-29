/**
 * Jornada module domain types — mirrors the `memories` table created in the
 * `create_milestones_documents_memories` migration. Photos live in the
 * private `images` storage bucket; this table holds the memory metadata.
 */

/** Row in the `memories` table. */
export interface Memory {
  id: string;
  project_id: string;
  title: string;
  description: string | null;
  date: string;
  /** Path in the private `images` bucket; null = text-only memory. */
  image_path: string | null;
  is_highlight: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}
