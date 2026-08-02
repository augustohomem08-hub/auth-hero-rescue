import { supabase } from '@/lib/supabase';
import { getSignedUrl } from '@/lib/storage';
import type { Item } from '@/types/purchases';

/**
 * Data-access layer for the Purchases module's `items` table.
 * Mirrors the extended `items` schema (create_rooms_and_items +
 * extend_items_for_purchases migrations). All calls run through the
 * authenticated Supabase client; RLS enforces membership via the owning
 * room's project.
 */

const SELECT =
  'id, room_id, name, description, priority, status, notes, sort_order, ' +
  'category, quantity, unit, estimated_price, paid_price, store, link, image, ' +
  'created_at, updated_at';

/** Row shape accepted by insert/update (snake_case, optional fields). */
export interface ItemInput {
  room_id: string;
  name: string;
  description?: string | null;
  priority?: Item['priority'];
  status?: Item['status'];
  notes?: string | null;
  sort_order?: number;
  category?: string | null;
  quantity?: number;
  unit?: string | null;
  estimated_price?: number | null;
  paid_price?: number | null;
  store?: string | null;
  link?: string | null;
  image?: string | null;
}

/** List all items across a project (joined through rooms), ordered by newest. */
export async function listItemsForProject(projectId: string): Promise<Item[]> {
  // Fetch the project's room ids first, then the items in those rooms. RLS
  // already scopes both queries to the user's membership, but filtering by
  // room_id keeps the query simple and avoids a typed join that doesn't
  // map cleanly to the Item row shape.
  const { data: roomRows, error: roomErr } = await supabase
    .from('rooms')
    .select('id')
    .eq('project_id', projectId);
  if (roomErr) throw roomErr;
  const roomIds = (roomRows ?? []).map((r) => (r as { id: string }).id);
  if (roomIds.length === 0) return [];

  const { data, error } = await supabase
    .from('items')
    .select(SELECT)
    .in('room_id', roomIds)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data as unknown as Item[]) ?? [];
}

/** List items belonging to a single room, ordered by sort_order then name. */
export async function listItemsForRoom(roomId: string): Promise<Item[]> {
  const { data, error } = await supabase
    .from('items')
    .select(SELECT)
    .eq('room_id', roomId)
    .order('sort_order', { ascending: true })
    .order('name', { ascending: true });
  if (error) throw error;
  return (data as unknown as Item[]) ?? [];
}

/** Create an item. */
export async function createItem(input: ItemInput): Promise<Item> {
  const { data, error } = await supabase
    .from('items')
    .insert({
      room_id: input.room_id,
      name: input.name,
      description: input.description ?? null,
      priority: input.priority ?? 'medium',
      status: input.status ?? 'planned',
      notes: input.notes ?? null,
      sort_order: input.sort_order ?? 0,
      category: input.category ?? null,
      quantity: input.quantity ?? 1,
      unit: input.unit ?? null,
      estimated_price: input.estimated_price ?? null,
      paid_price: input.paid_price ?? null,
      store: input.store ?? null,
      link: input.link ?? null,
      image: input.image ?? null,
    })
    .select(SELECT)
    .single();
  if (error) throw error;
  return data as unknown as Item;
}

/** Update editable fields on an item. */
export async function updateItem(
  itemId: string,
  patch: Partial<ItemInput>
): Promise<Item> {
  const { data, error } = await supabase
    .from('items')
    .update(patch)
    .eq('id', itemId)
    .select(SELECT)
    .single();
  if (error) throw error;
  return data as unknown as Item;
}

/** Delete a single item. */
export async function deleteItem(itemId: string): Promise<void> {
  const { error } = await supabase.from('items').delete().eq('id', itemId);
  if (error) throw error;
}

/** Delete many items at once. */
export async function deleteItems(itemIds: string[]): Promise<void> {
  if (itemIds.length === 0) return;
  const { error } = await supabase.from('items').delete().in('id', itemIds);
  if (error) throw error;
}

/**
 * Duplicate an item into the same room with "(cópia)" appended to the name.
 * Returns the newly created item.
 */
export async function duplicateItem(itemId: string): Promise<Item> {
  const { data: src, error } = await supabase
    .from('items')
    .select(SELECT)
    .eq('id', itemId)
    .maybeSingle();
  if (error) throw error;
  if (!src) throw new Error('Item não encontrado.');

  const { id: _id, created_at: _c, updated_at: _u, ...rest } = src as unknown as Item;
  void _id; void _c; void _u;
  const { data, error: insErr } = await supabase
    .from('items')
    .insert({ ...rest, name: `${rest.name} (cópia)`, status: 'planned', paid_price: null })
    .select(SELECT)
    .single();
  if (insErr) throw insErr;
  return data as unknown as Item;
}

/**
 * Move one or more items to a different room. RLS re-validates membership
 * against the destination room's project.
 */
export async function moveItems(itemIds: string[], toRoomId: string): Promise<void> {
  if (itemIds.length === 0) return;
  const { error } = await supabase
    .from('items')
    .update({ room_id: toRoomId })
    .in('id', itemIds);
  if (error) throw error;
}

/**
 * Resolve an item's `image` storage path (private `images` bucket) to a
 * temporary signed URL for rendering. Mirrors the documents/memories helpers.
 */
export async function getItemImageSignedUrl(storagePath: string): Promise<string> {
  return getSignedUrl('images', storagePath);
}
