REVOKE EXECUTE ON FUNCTION public.gen_invitation_code() FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.is_project_member(uuid) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.is_project_owner(uuid) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.is_room_member(uuid) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.regenerate_invitation_code(uuid) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.lookup_project_by_code(text) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.insert_invited_member(uuid, uuid) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.set_updated_at() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.is_project_member(uuid), public.is_project_owner(uuid),
  public.is_room_member(uuid), public.regenerate_invitation_code(uuid),
  public.lookup_project_by_code(text), public.insert_invited_member(uuid, uuid) TO authenticated;