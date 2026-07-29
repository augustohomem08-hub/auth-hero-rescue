/**
 * Cronograma module domain types — mirrors the `milestones` table created in
 * the `create_milestones_documents_memories` migration.
 */

export type MilestoneStatus =
  | 'planned'
  | 'in_progress'
  | 'done'
  | 'delayed'
  | 'cancelled';

/** Row in the `milestones` table. */
export interface Milestone {
  id: string;
  project_id: string;
  title: string;
  description: string | null;
  date: string | null;
  status: MilestoneStatus;
  /** Responsible member's user id; null = shared/unassigned. */
  owner_id: string | null;
  sort_order: number;
  created_at: string;
  updated_at: string;
}
