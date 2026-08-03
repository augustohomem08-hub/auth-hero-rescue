import { supabase } from '@/lib/supabase';
import { deleteFile, getSignedUrl, sanitizeFileName } from '@/lib/storage';
import type { Memory } from '@/types/jornada';

/**
 * Data-access layer for the Jornada module's `memories` table. Photos are
 * stored in the private `images` storage bucket; this layer uploads the
 * image, stores the memory row, and resolves signed URLs for display.
 * Mirrors the `create_milestones_documents_memories` migration.
 */

const SELECT =
  'id, project_id, title, description, date, image_path, is_highlight, ' +
  'sort_order, item_id, created_at, updated_at';

export interface MemoryInput {
  title: string;
  description?: string | null;
  date?: string;
  is_highlight?: boolean;
  sort_order?: number;
  /** Links an auto-created celebration memory back to the purchased item. */
  item_id?: string | null;
}

/** List all memories for a project, newest date first. */
export async function listMemoriesForProject(
  projectId: string
): Promise<Memory[]> {
  const { data, error } = await supabase
    .from('memories')
    .select(SELECT)
    .eq('project_id', projectId)
    .order('date', { ascending: false })
    .order('sort_order', { ascending: true });
  if (error) throw error;
  return (data as unknown as Memory[]) ?? [];
}

/** Create a text-only memory (no image). */
export async function createMemory(
  projectId: string,
  input: MemoryInput
): Promise<Memory> {
  const { data, error } = await supabase
    .from('memories')
    .insert({
      project_id: projectId,
      title: input.title,
      description: input.description ?? null,
      date: input.date ?? new Date().toISOString().slice(0, 10),
      image_path: null,
      is_highlight: input.is_highlight ?? false,
      sort_order: input.sort_order ?? 0,
      item_id: input.item_id ?? null,
    })
    .select(SELECT)
    .single();
  if (error) throw error;
  return data as unknown as Memory;
}

/** Upload an image and create a memory with it. */
export async function createMemoryWithImage(
  projectId: string,
  file: File,
  userId: string,
  input: MemoryInput
): Promise<Memory> {
  const path = `${userId}/${Date.now()}-${sanitizeFileName(file.name)}`;
  const { error: uploadErr } = await supabase
    .storage
    .from('images')
    .upload(path, file);
  if (uploadErr) throw uploadErr;

  const { data, error } = await supabase
    .from('memories')
    .insert({
      project_id: projectId,
      title: input.title,
      description: input.description ?? null,
      date: input.date ?? new Date().toISOString().slice(0, 10),
      image_path: path,
      is_highlight: input.is_highlight ?? false,
      sort_order: input.sort_order ?? 0,
      item_id: input.item_id ?? null,
    })
    .select(SELECT)
    .single();
  if (error) {
    await deleteFile('images', path).catch(() => {});
    throw error;
  }
  return data as unknown as Memory;
}

/** Update editable fields of a memory. */
export async function updateMemory(
  memoryId: string,
  patch: Partial<MemoryInput>
): Promise<Memory> {
  const { data, error } = await supabase
    .from('memories')
    .update(patch)
    .eq('id', memoryId)
    .select(SELECT)
    .single();
  if (error) throw error;
  return data as unknown as Memory;
}

/**
 * Delete a memory: remove its row first, then the storage image (if any).
 * When the memory was auto-created for a completed purchase, the item's
 * `celebrated_at` stamp is cleared so Home stops showing the achievement
 * (and the item may celebrate again if re-marked as purchased later).
 */
export async function deleteMemory(memory: Memory): Promise<void> {
  const { error } = await supabase
    .from('memories')
    .delete()
    .eq('id', memory.id);
  if (error) throw error;
  if (memory.item_id) {
    await supabase
      .from('items')
      .update({ celebrated_at: null })
      .eq('id', memory.item_id);
  }
  if (memory.image_path) {
    await deleteFile('images', memory.image_path).catch(() => {});
  }
}

/** Resolve a signed URL for displaying a memory's photo. */
export async function getMemorySignedUrl(
  imagePath: string
): Promise<string> {
  return getSignedUrl('images', imagePath);
}
