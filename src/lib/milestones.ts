import { supabase } from '@/lib/supabase';
import type { Milestone, MilestoneStatus } from '@/types/cronograma';

/**
 * Data-access layer for the Cronograma module's `milestones` table.
 * Mirrors the `create_milestones_documents_memories` migration. RLS enforces
 * membership via the owning project.
 */

const SELECT =
  'id, project_id, title, description, date, status, owner_id, sort_order, ' +
  'created_at, updated_at';

export interface MilestoneInput {
  title: string;
  description?: string | null;
  date?: string | null;
  status?: MilestoneStatus;
  owner_id?: string | null;
  sort_order?: number;
}

/** List all milestones for a project, ordered by date then sort_order. */
export async function listMilestonesForProject(
  projectId: string
): Promise<Milestone[]> {
  const { data, error } = await supabase
    .from('milestones')
    .select(SELECT)
    .eq('project_id', projectId)
    .order('date', { ascending: true, nullsFirst: false })
    .order('sort_order', { ascending: true });
  if (error) throw error;
  return (data as unknown as Milestone[]) ?? [];
}

export async function createMilestone(
  projectId: string,
  input: MilestoneInput
): Promise<Milestone> {
  const { data, error } = await supabase
    .from('milestones')
    .insert({
      project_id: projectId,
      title: input.title,
      description: input.description ?? null,
      date: input.date ?? null,
      status: input.status ?? 'planned',
      owner_id: input.owner_id ?? null,
      sort_order: input.sort_order ?? 0,
    })
    .select(SELECT)
    .single();
  if (error) throw error;
  return data as unknown as Milestone;
}

export async function updateMilestone(
  milestoneId: string,
  patch: Partial<MilestoneInput>
): Promise<Milestone> {
  const { data, error } = await supabase
    .from('milestones')
    .update(patch)
    .eq('id', milestoneId)
    .select(SELECT)
    .single();
  if (error) throw error;
  return data as unknown as Milestone;
}

export async function deleteMilestone(milestoneId: string): Promise<void> {
  const { error } = await supabase
    .from('milestones')
    .delete()
    .eq('id', milestoneId);
  if (error) throw error;
}
