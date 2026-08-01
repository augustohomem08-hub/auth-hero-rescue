REVOKE EXECUTE ON FUNCTION public.is_project_member(uuid) FROM authenticated, anon, public;
REVOKE EXECUTE ON FUNCTION public.is_project_owner(uuid) FROM authenticated, anon, public;
REVOKE EXECUTE ON FUNCTION public.is_room_member(uuid) FROM authenticated, anon, public;
REVOKE EXECUTE ON FUNCTION public.gen_invitation_code() FROM authenticated, anon, public;
REVOKE EXECUTE ON FUNCTION public.set_updated_at() FROM authenticated, anon, public;