DROP INDEX IF EXISTS public.transactions_source_item_id_key;
-- A partial unique index cannot be used for ON CONFLICT inference, which made
-- the Compras -> Financeiro mirror upsert fail with HTTP 400. A plain unique
-- index still allows many NULLs (NULLs are distinct in Postgres).
CREATE UNIQUE INDEX transactions_source_item_id_key
  ON public.transactions (source_item_id);