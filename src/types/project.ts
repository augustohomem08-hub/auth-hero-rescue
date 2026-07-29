/**
 * Shared-project domain types — mirrors the `projects` and `project_members`
 * tables created in the `create_projects_and_members` migration.
 *
 * A project is the couple's lar / apartment purchase. A project can have
 * multiple members; a user can belong to multiple projects. Roles include
 * future collaborators (engineer, architect, interior designer) so adding
 * them later requires no database change — only an INSERT into
 * project_members.
 */

/** Role within a project. Owner manages members; others are collaborators. */
export type ProjectRole =
  | 'owner'
  | 'member'
  | 'engineer'
  | 'architect'
  | 'interior_designer';

export type InvitationStatus = 'pending' | 'accepted' | 'declined';

/** Row in the `projects` table. */
export interface Project {
  id: string;
  name: string;
  apartment_name: string | null;
  builder_name: string | null;
  expected_delivery_date: string | null;
  /** Path in the `images` storage bucket; resolve to a signed URL client-side. */
  cover_image: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
  /** Unique invitation code (e.g. "K7Q4-9P2D") others can use to join. */
  invitation_code: string;
  invitation_code_updated_at: string;
}

/** Row in the `project_members` table. */
export interface ProjectMember {
  id: string;
  project_id: string;
  user_id: string;
  role: ProjectRole;
  invitation_status: InvitationStatus;
  invited_at: string;
  joined_at: string | null;
  created_at: string;
}

/** Tables scoped to a project carry this column (for future migrations). */
export interface ProjectScoped {
  project_id: string;
}

/**
 * Active project for the current user: the project, the user's membership,
 * and the list of members of that project.
 */
export interface ActiveProject {
  project: Project;
  membership: ProjectMember;
  members: ProjectMember[];
}
