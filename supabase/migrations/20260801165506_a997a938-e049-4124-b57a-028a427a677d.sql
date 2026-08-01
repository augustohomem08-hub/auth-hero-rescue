GRANT EXECUTE ON FUNCTION public.is_project_member(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_project_owner(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_room_member(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.gen_invitation_code() TO authenticated;