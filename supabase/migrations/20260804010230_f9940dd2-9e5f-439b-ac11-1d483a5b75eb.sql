CREATE OR REPLACE FUNCTION public.can_access_storage_path(p_bucket text, p_name text)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT
    EXISTS (
      SELECT 1 FROM public.documents d
      WHERE p_bucket = 'documents' AND d.storage_path = p_name
        AND public.is_project_member(d.project_id)
    )
    OR EXISTS (
      SELECT 1 FROM public.memories m
      WHERE p_bucket = 'images' AND m.image_path = p_name
        AND public.is_project_member(m.project_id)
    )
    OR EXISTS (
      SELECT 1 FROM public.items i
      JOIN public.rooms r ON r.id = i.room_id
      WHERE p_bucket = 'images' AND i.image = p_name
        AND public.is_project_member(r.project_id)
    )
    OR EXISTS (
      SELECT 1 FROM public.projects pr
      WHERE p_bucket = 'images' AND pr.cover_image = p_name
        AND public.is_project_member(pr.id)
    );
$$;

GRANT EXECUTE ON FUNCTION public.can_access_storage_path(text, text) TO authenticated;

DROP POLICY IF EXISTS "auth_read_project_files" ON storage.objects;
CREATE POLICY "auth_read_project_files" ON storage.objects FOR SELECT TO authenticated
  USING (
    bucket_id IN ('images','documents')
    AND (
      (storage.foldername(name))[1] = auth.uid()::text
      OR public.can_access_storage_path(bucket_id, name)
    )
  );

DROP POLICY IF EXISTS "auth_update_own_files" ON storage.objects;
CREATE POLICY "auth_update_own_files" ON storage.objects FOR UPDATE TO authenticated
  USING (
    bucket_id IN ('images','documents')
    AND (
      (storage.foldername(name))[1] = auth.uid()::text
      OR public.can_access_storage_path(bucket_id, name)
    )
  )
  WITH CHECK (
    bucket_id IN ('images','documents')
    AND (
      (storage.foldername(name))[1] = auth.uid()::text
      OR public.can_access_storage_path(bucket_id, name)
    )
  );

DROP POLICY IF EXISTS "auth_delete_own_files" ON storage.objects;
CREATE POLICY "auth_delete_own_files" ON storage.objects FOR DELETE TO authenticated
  USING (
    bucket_id IN ('images','documents')
    AND (
      (storage.foldername(name))[1] = auth.uid()::text
      OR public.can_access_storage_path(bucket_id, name)
    )
  );