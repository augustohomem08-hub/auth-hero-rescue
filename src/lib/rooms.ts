import { supabase } from '@/lib/supabase';
import type { Room } from '@/types/purchases';

/**
 * Data-access layer for the Purchases module's `rooms` table.
 * Mirrors the rooms table created in the `create_rooms_and_items` migration.
 * All calls run through the authenticated Supabase client; RLS enforces
 * membership in the owning project.
 */

const SELECT = 'id, project_id, name, icon, color, sort_order, created_at, updated_at';

/** List all rooms for a project, ordered by sort_order then name. */
export async function listRooms(projectId: string): Promise<Room[]> {
  const { data, error } = await supabase
    .from('rooms')
    .select(SELECT)
    .eq('project_id', projectId)
    .order('sort_order', { ascending: true })
    .order('name', { ascending: true });
  if (error) throw error;
  return (data as Room[]) ?? [];
}

/** Create a room. sort_order defaults to 0; caller may pass a value. */
export async function createRoom(input: {
  projectId: string;
  name: string;
  icon?: string;
  color?: string;
  sortOrder?: number;
}): Promise<Room> {
  const { data, error } = await supabase
    .from('rooms')
    .insert({
      project_id: input.projectId,
      name: input.name,
      icon: input.icon ?? 'home',
      color: input.color ?? 'primary',
      sort_order: input.sortOrder ?? 0,
    })
    .select(SELECT)
    .single();
  if (error) throw error;
  return data as Room;
}

/** Update editable fields on a room. */
export async function updateRoom(
  roomId: string,
  patch: Partial<Pick<Room, 'name' | 'icon' | 'color' | 'sort_order'>>
): Promise<Room> {
  const { data, error } = await supabase
    .from('rooms')
    .update(patch)
    .eq('id', roomId)
    .select(SELECT)
    .single();
  if (error) throw error;
  return data as Room;
}

/** Delete a room. Cascades to its items (FK ON DELETE CASCADE). */
export async function deleteRoom(roomId: string): Promise<void> {
  const { error } = await supabase.from('rooms').delete().eq('id', roomId);
  if (error) throw error;
}
