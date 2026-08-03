import { supabase } from '@/lib/supabase';
import type {
  ActiveProject,
  InvitationStatus,
  Project,
  ProjectMember,
  ProjectRole,
} from '@/types/project';

/**
 * Data-access layer for the shared project (the couple's lar) and its members.
 * Mirrors the `projects` and `project_members` tables.
 */

/** Fetch the project + membership + full member list for a signed-in user. */
export async function getActiveProject(userId: string): Promise<ActiveProject | null> {
  const { data: membership, error } = await supabase
    .from('project_members')
    .select(
      'id, project_id, user_id, role, invitation_status, invited_at, joined_at, created_at'
    )
    .eq('user_id', userId)
    .maybeSingle();

  if (error || !membership) return null;

  const { data: project } = await supabase
    .from('projects')
    .select(
      'id, name, apartment_name, builder_name, expected_delivery_date, cover_image, created_by, created_at, updated_at, invitation_code, invitation_code_updated_at'
    )
    .eq('id', membership.project_id)
    .maybeSingle();

  if (!project) return null;

  const { data: members, error: membersErr } = await supabase
    .from('project_members')
    .select(
      'id, project_id, user_id, role, invitation_status, invited_at, joined_at, created_at'
    )
    .eq('project_id', membership.project_id)
    .order('joined_at', { ascending: true });

  if (membersErr) throw membersErr;

  return {
    project: project as Project,
    membership: membership as ProjectMember,
    members: (members as ProjectMember[]) ?? [],
  };
}

/** List all projects a user belongs to. */
export async function listProjectsForUser(userId: string): Promise<Project[]> {
  const { data, error } = await supabase
    .from('project_members')
    .select(
      `project_id,
       projects (
         id, name, apartment_name, builder_name, expected_delivery_date,
         cover_image, created_by, created_at, updated_at,
         invitation_code, invitation_code_updated_at
       )`
    )
    .eq('user_id', userId);

  if (error || !data) return [];

  return data
    .map((row) => (row as { projects?: Project | Project[] }).projects)
    .filter((p): p is Project => p !== null && !Array.isArray(p));
}

/**
 * Create a project and the creator's owner membership in one call.
 * RLS allows this because: (1) the project INSERT requires created_by =
 * auth.uid(); (2) the owner membership INSERT is permitted when the inserter
 * created the project. Both inserts must use the same authenticated session.
 */
export async function createProject(opts: {
  name: string;
  apartmentName?: string | null;
  builderName?: string | null;
  expectedDeliveryDate?: string | null;
  coverImage?: string | null;
  ownerUserId: string;
}): Promise<{ project?: Project; error: string | null }> {
  const { name, apartmentName, builderName, expectedDeliveryDate, coverImage, ownerUserId } = opts;

  const { data: project, error } = await supabase
    .from('projects')
    .insert({
      name,
      apartment_name: apartmentName ?? null,
      builder_name: builderName ?? null,
      expected_delivery_date: expectedDeliveryDate ?? null,
      cover_image: coverImage ?? null,
      created_by: ownerUserId,
    })
    .select(
      'id, name, apartment_name, builder_name, expected_delivery_date, cover_image, created_by, created_at, updated_at, invitation_code, invitation_code_updated_at'
    )
    .maybeSingle();

  if (error || !project) {
    return { error: error?.message ?? 'Falha ao criar o projeto.' };
  }

  const { error: memberErr } = await supabase.from('project_members').insert({
    project_id: project.id,
    user_id: ownerUserId,
    role: 'owner' as ProjectRole,
    invitation_status: 'accepted' as InvitationStatus,
    joined_at: new Date().toISOString(),
  });

  if (memberErr) {
    // Rollback: remove the orphaned project so the creator isn't locked out.
    await supabase.from('projects').delete().eq('id', project.id);
    return { error: memberErr.message };
  }

  return { project: project as Project, error: null };
}

/** Update the editable identity fields of a project (owner or member). */
export async function updateProject(
  projectId: string,
  patch: {
    name?: string;
    apartmentName?: string | null;
    builderName?: string | null;
    expectedDeliveryDate?: string | null;
  }
): Promise<{ project?: Project; error: string | null }> {
  const payload: {
    name?: string;
    apartment_name?: string | null;
    builder_name?: string | null;
    expected_delivery_date?: string | null;
  } = {};
  if (patch.name !== undefined) payload.name = patch.name;
  if (patch.apartmentName !== undefined) payload.apartment_name = patch.apartmentName;
  if (patch.builderName !== undefined) payload.builder_name = patch.builderName;
  if (patch.expectedDeliveryDate !== undefined) {
    payload.expected_delivery_date = patch.expectedDeliveryDate;
  }

  const { data, error } = await supabase
    .from('projects')
    .update(payload)
    .eq('id', projectId)
    .select(
      'id, name, apartment_name, builder_name, expected_delivery_date, cover_image, created_by, created_at, updated_at, invitation_code, invitation_code_updated_at'
    )
    .maybeSingle();

  if (error || !data) {
    return { error: error?.message ?? 'Falha ao salvar o projeto.' };
  }
  return { project: data as Project, error: null };
}

/** Change a member's role (owner-only, enforced by RLS). */
export async function updateMemberRole(
  memberId: string,
  role: ProjectRole
): Promise<{ error: string | null }> {
  const { error } = await supabase
    .from('project_members')
    .update({ role })
    .eq('id', memberId);
  return { error: error ? error.message : null };
}

/** Invite a member to a project. Caller must be an owner of that project. */
export async function inviteMember(opts: {
  projectId: string;
  userId: string;
  role?: ProjectRole;
  displayName?: string;
}): Promise<{ member?: ProjectMember; error: string | null }> {
  const { error, data } = await supabase
    .from('project_members')
    .insert({
      project_id: opts.projectId,
      user_id: opts.userId,
      role: opts.role ?? 'member',
      invitation_status: 'pending' as InvitationStatus,
    })
    .select(
      'id, project_id, user_id, role, invitation_status, invited_at, joined_at, created_at'
    )
    .maybeSingle();

  if (error || !data) {
    return { error: error?.message ?? 'Falha ao convidar o membro.' };
  }
  return { member: data as ProjectMember, error: null };
}

/** Accept or decline an invitation as the invited user. */
export async function respondToInvitation(opts: {
  memberId: string;
  status: 'accepted' | 'declined';
}): Promise<{ error: string | null }> {
  const patch: { invitation_status: InvitationStatus; joined_at?: string } = {
    invitation_status: opts.status,
  };
  if (opts.status === 'accepted') {
    patch.joined_at = new Date().toISOString();
  }
  const { error } = await supabase
    .from('project_members')
    .update(patch)
    .eq('id', opts.memberId);
  return { error: error ? error.message : null };
}

/** Remove a member from a project (owner) or leave (self). */
export async function removeMember(memberId: string): Promise<{ error: string | null }> {
  const { error } = await supabase.from('project_members').delete().eq('id', memberId);
  return { error: error ? error.message : null };
}

/**
 * Join a project using its invitation code. Adds the authenticated user as a
 * `member`. Validates the code by selecting the project first (the SELECT is
 * permitted by RLS only for existing members, so we look up by code via an
 * RPC-like approach: use a Postgres function exposed for public lookup).
 *
 * Returns the joined project on success, or a friendly error string.
 */
export async function joinProjectByCode(opts: {
  code: string;
  userId: string;
}): Promise<{ project?: Project; error: string | null }> {
  const normalized = opts.code.trim().toUpperCase();

  // Look up the project by invitation code. This is a public-by-necessity
  // lookup, so we use an RPC function (lookup_project_by_code) that returns
  // just the project id — no member data leaks.
  const { data: lookup, error: lookupErr } = await supabase.rpc(
    'lookup_project_by_code',
    { p_code: normalized }
  );

  // The RPC returns a set of rows, so PostgREST hands back an array.
  const projectId = Array.isArray(lookup)
    ? (lookup[0] as { id: string } | undefined)?.id
    : (lookup as { id: string } | null)?.id;

  if (lookupErr || !projectId) {
    return { error: 'Código de convite inválido. Verifique e tente novamente.' };
  }


  // Insert the membership. RLS allows this only via an existing owner; a
  // brand-new user joining is handled by the RPC insert_invited_member below
  // (SECURITY DEFINER) which bypasses RLS safely after validation.
  const { data: member, error: memberErr } = await supabase.rpc(
    'insert_invited_member',
    { p_project_id: projectId, p_user_id: opts.userId }
  );

  if (memberErr || !member) {
    const msg = memberErr?.message ?? '';
    if (msg.includes('already a member') || msg.includes('duplicate')) {
      return { error: 'Você já faz parte deste projeto.' };
    }
    return { error: 'Não foi possível entrar no projeto com este código.' };
  }

  // Now that the user is a member, they can SELECT the project directly.
  const { data: project } = await supabase
    .from('projects')
    .select(
      'id, name, apartment_name, builder_name, expected_delivery_date, cover_image, created_by, created_at, updated_at, invitation_code, invitation_code_updated_at'
    )
    .eq('id', projectId)
    .maybeSingle();

  if (!project) {
    return { error: 'Projeto encontrado, mas não foi possível carregar os dados.' };
  }

  return { project: project as Project, error: null };
}

/** Regenerate a project's invitation code. Caller must be the project owner. */
export async function regenerateInvitationCode(
  projectId: string
): Promise<{ code: string | null; error: string | null }> {
  const { data, error } = await supabase.rpc('regenerate_invitation_code', {
    p_project: projectId,
  });
  if (error) {
    return { code: null, error: translateProjectError(error.message) };
  }
  return { code: (data as string) ?? null, error: null };
}

function translateProjectError(message: string): string {
  const m = message.toLowerCase();
  if (m.includes('somente o dono')) return 'Somente o dono pode regenerar o código.';
  return 'Não foi possível regenerar o código. Tente novamente.';
}
