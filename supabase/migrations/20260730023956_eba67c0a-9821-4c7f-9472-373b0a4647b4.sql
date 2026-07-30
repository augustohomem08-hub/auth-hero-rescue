-- 1. Mirror transactions from Compras rely on upsert(onConflict: source_item_id).
--    Without a unique index Postgres raises 42P10 and the sync always fails.
CREATE UNIQUE INDEX IF NOT EXISTS transactions_source_item_id_key
  ON public.transactions (source_item_id)
  WHERE source_item_id IS NOT NULL;

-- 2. updated_at was never maintained (no triggers existed), so the UI could
--    not detect changed rows. Attach the existing set_updated_at() function.
DO $$
DECLARE t text;
BEGIN
  FOREACH t IN ARRAY ARRAY['projects','rooms','items','transactions','milestones','documents','memories']
  LOOP
    EXECUTE format('DROP TRIGGER IF EXISTS set_updated_at ON public.%I', t);
    EXECUTE format('CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.%I FOR EACH ROW EXECUTE FUNCTION public.set_updated_at()', t);
  END LOOP;
END $$;