DROP POLICY IF EXISTS "auth_read_project_files" ON storage.objects;
CREATE POLICY "auth_read_project_files" ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id IN ('images','documents'));

DROP POLICY IF EXISTS "auth_insert_own_files" ON storage.objects;
CREATE POLICY "auth_insert_own_files" ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id IN ('images','documents') AND (storage.foldername(name))[1] = auth.uid()::text);

DROP POLICY IF EXISTS "auth_update_own_files" ON storage.objects;
CREATE POLICY "auth_update_own_files" ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id IN ('images','documents') AND (storage.foldername(name))[1] = auth.uid()::text)
  WITH CHECK (bucket_id IN ('images','documents') AND (storage.foldername(name))[1] = auth.uid()::text);

DROP POLICY IF EXISTS "auth_delete_own_files" ON storage.objects;
CREATE POLICY "auth_delete_own_files" ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id IN ('images','documents') AND (storage.foldername(name))[1] = auth.uid()::text);