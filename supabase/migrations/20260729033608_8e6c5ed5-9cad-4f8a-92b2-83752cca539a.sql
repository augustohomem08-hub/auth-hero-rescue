-- ===== enums =====
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname='item_status') THEN
    CREATE TYPE item_status AS ENUM ('planned','researching','budgeted','purchased','delivered','installed');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname='item_priority') THEN
    CREATE TYPE item_priority AS ENUM ('low','medium','high');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname='transaction_type') THEN
    CREATE TYPE transaction_type AS ENUM ('income','expense');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname='milestone_status') THEN
    CREATE TYPE milestone_status AS ENUM ('planned','in_progress','done','delayed','cancelled');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname='document_category') THEN
    CREATE TYPE document_category AS ENUM ('contract','receipt','certificate','personal','other');
  END IF;
END $$;

-- ===== helpers =====
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

-- ===== tables =====
CREATE TABLE IF NOT EXISTS public.projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  apartment_name text,
  builder_name text,
  expected_delivery_date date,
  cover_image text,
  created_by uuid DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE SET NULL,
  invitation_code text NOT NULL,
  invitation_code_updated_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.project_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role text NOT NULL CHECK (role IN ('owner','member','engineer','architect','interior_designer')),
  invitation_status text NOT NULL DEFAULT 'pending' CHECK (invitation_status IN ('pending','accepted','declined')),
  invited_at timestamptz NOT NULL DEFAULT now(),
  joined_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.rooms (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  name text NOT NULL,
  icon text NOT NULL DEFAULT 'home',
  color text NOT NULL DEFAULT 'primary',
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id uuid NOT NULL REFERENCES public.rooms(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  priority item_priority NOT NULL DEFAULT 'medium',
  status item_status NOT NULL DEFAULT 'planned',
  notes text,
  category text,
  quantity numeric(10,2) NOT NULL DEFAULT 1,
  unit text,
  estimated_price numeric(12,2),
  paid_price numeric(12,2),
  store text,
  link text,
  image text,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  category text NOT NULL DEFAULT 'outros',
  type transaction_type NOT NULL DEFAULT 'expense',
  amount numeric(14,2) NOT NULL CHECK (amount >= 0),
  date date NOT NULL DEFAULT now(),
  notes text,
  source_item_id uuid REFERENCES public.items(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.milestones (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  date date,
  status milestone_status NOT NULL DEFAULT 'planned',
  owner_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  title text NOT NULL,
  category document_category NOT NULL DEFAULT 'other',
  storage_path text NOT NULL,
  file_name text NOT NULL,
  file_size bigint,
  mime_type text,
  expires_at date,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.memories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  date date NOT NULL DEFAULT now(),
  image_path text,
  is_highlight boolean NOT NULL DEFAULT false,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- ===== indexes =====
CREATE INDEX IF NOT EXISTS projects_created_by_idx ON public.projects(created_by);
CREATE UNIQUE INDEX IF NOT EXISTS projects_invitation_code_key ON public.projects(invitation_code);
CREATE INDEX IF NOT EXISTS project_members_project_id_idx ON public.project_members(project_id);
CREATE INDEX IF NOT EXISTS project_members_user_id_idx ON public.project_members(user_id);
CREATE UNIQUE INDEX IF NOT EXISTS project_members_project_user_unique ON public.project_members(project_id, user_id);
CREATE INDEX IF NOT EXISTS rooms_project_id_idx ON public.rooms(project_id);
CREATE INDEX IF NOT EXISTS items_room_id_idx ON public.items(room_id);
CREATE INDEX IF NOT EXISTS transactions_project_id_idx ON public.transactions(project_id);
CREATE INDEX IF NOT EXISTS milestones_project_id_idx ON public.milestones(project_id);
CREATE INDEX IF NOT EXISTS documents_project_id_idx ON public.documents(project_id);
CREATE INDEX IF NOT EXISTS memories_project_id_idx ON public.memories(project_id);

-- ===== invitation code =====
CREATE OR REPLACE FUNCTION public.gen_invitation_code()
RETURNS text LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  chars text := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  code text := ''; part text; i int; attempt int := 0;
BEGIN
  LOOP
    part := '';
    FOR i IN 1..4 LOOP part := part || substr(chars, (random()*length(chars))::int + 1, 1); END LOOP;
    code := part || '-';
    part := '';
    FOR i IN 1..4 LOOP part := part || substr(chars, (random()*length(chars))::int + 1, 1); END LOOP;
    code := code || part;
    attempt := attempt + 1;
    EXIT WHEN NOT EXISTS (SELECT 1 FROM public.projects WHERE invitation_code = code) OR attempt >= 10;
  END LOOP;
  RETURN code;
END; $$;

ALTER TABLE public.projects ALTER COLUMN invitation_code SET DEFAULT public.gen_invitation_code();

-- ===== membership helpers (SECURITY DEFINER: avoids recursive RLS) =====
CREATE OR REPLACE FUNCTION public.is_project_member(p_project uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.project_members pm WHERE pm.project_id = p_project AND pm.user_id = auth.uid());
$$;

CREATE OR REPLACE FUNCTION public.is_project_owner(p_project uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.project_members pm WHERE pm.project_id = p_project AND pm.user_id = auth.uid() AND pm.role = 'owner');
$$;

CREATE OR REPLACE FUNCTION public.is_room_member(p_room uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.rooms r
    JOIN public.project_members pm ON pm.project_id = r.project_id
    WHERE r.id = p_room AND pm.user_id = auth.uid()
  );
$$;

CREATE OR REPLACE FUNCTION public.regenerate_invitation_code(p_project uuid)
RETURNS text LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE new_code text;
BEGIN
  IF NOT public.is_project_owner(p_project) THEN
    RAISE EXCEPTION 'Somente o dono pode regenerar o código de convite.';
  END IF;
  new_code := public.gen_invitation_code();
  UPDATE public.projects SET invitation_code = new_code, invitation_code_updated_at = now() WHERE id = p_project;
  RETURN new_code;
END; $$;

CREATE OR REPLACE FUNCTION public.lookup_project_by_code(p_code text)
RETURNS TABLE (id uuid) LANGUAGE sql SECURITY DEFINER SET search_path = public AS $$
  SELECT p.id FROM public.projects p WHERE p.invitation_code = upper(trim(p_code));
$$;

CREATE OR REPLACE FUNCTION public.insert_invited_member(p_project_id uuid, p_user_id uuid)
RETURNS TABLE (member_id uuid) LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE new_id uuid;
BEGIN
  IF p_user_id IS DISTINCT FROM auth.uid() THEN
    RAISE EXCEPTION 'Você só pode adicionar a si mesmo.';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.projects WHERE id = p_project_id) THEN
    RAISE EXCEPTION 'Projeto não encontrado.';
  END IF;
  SELECT pm.id INTO new_id FROM public.project_members pm
    WHERE pm.project_id = p_project_id AND pm.user_id = p_user_id;
  IF new_id IS NOT NULL THEN
    RETURN QUERY SELECT new_id;
    RETURN;
  END IF;
  INSERT INTO public.project_members (project_id, user_id, role, invitation_status, joined_at)
  VALUES (p_project_id, p_user_id, 'member', 'accepted', now())
  RETURNING id INTO new_id;
  RETURN QUERY SELECT new_id;
END; $$;

-- ===== triggers =====
DROP TRIGGER IF EXISTS projects_set_updated_at ON public.projects;
CREATE TRIGGER projects_set_updated_at BEFORE UPDATE ON public.projects FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
DROP TRIGGER IF EXISTS rooms_set_updated_at ON public.rooms;
CREATE TRIGGER rooms_set_updated_at BEFORE UPDATE ON public.rooms FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
DROP TRIGGER IF EXISTS items_set_updated_at ON public.items;
CREATE TRIGGER items_set_updated_at BEFORE UPDATE ON public.items FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
DROP TRIGGER IF EXISTS transactions_set_updated_at ON public.transactions;
CREATE TRIGGER transactions_set_updated_at BEFORE UPDATE ON public.transactions FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
DROP TRIGGER IF EXISTS milestones_set_updated_at ON public.milestones;
CREATE TRIGGER milestones_set_updated_at BEFORE UPDATE ON public.milestones FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
DROP TRIGGER IF EXISTS documents_set_updated_at ON public.documents;
CREATE TRIGGER documents_set_updated_at BEFORE UPDATE ON public.documents FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
DROP TRIGGER IF EXISTS memories_set_updated_at ON public.memories;
CREATE TRIGGER memories_set_updated_at BEFORE UPDATE ON public.memories FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ===== grants =====
GRANT SELECT, INSERT, UPDATE, DELETE ON public.projects TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.project_members TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.rooms TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.items TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.transactions TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.milestones TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.documents TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.memories TO authenticated;
GRANT ALL ON public.projects, public.project_members, public.rooms, public.items,
  public.transactions, public.milestones, public.documents, public.memories TO service_role;
GRANT EXECUTE ON FUNCTION public.gen_invitation_code(), public.is_project_member(uuid),
  public.is_project_owner(uuid), public.is_room_member(uuid),
  public.regenerate_invitation_code(uuid), public.lookup_project_by_code(text),
  public.insert_invited_member(uuid, uuid) TO authenticated;

-- ===== RLS =====
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.milestones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.memories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "select_member_projects" ON public.projects FOR SELECT TO authenticated
  USING (public.is_project_member(id) OR created_by = auth.uid());
CREATE POLICY "insert_own_project" ON public.projects FOR INSERT TO authenticated
  WITH CHECK (created_by = auth.uid());
CREATE POLICY "update_member_projects" ON public.projects FOR UPDATE TO authenticated
  USING (public.is_project_member(id)) WITH CHECK (public.is_project_member(id));
CREATE POLICY "delete_owner_project" ON public.projects FOR DELETE TO authenticated
  USING (public.is_project_owner(id));

CREATE POLICY "select_project_members" ON public.project_members FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR public.is_project_member(project_id));
CREATE POLICY "insert_members" ON public.project_members FOR INSERT TO authenticated
  WITH CHECK (
    (user_id = auth.uid() AND role = 'owner'
      AND EXISTS (SELECT 1 FROM public.projects p WHERE p.id = project_id AND p.created_by = auth.uid()))
    OR public.is_project_owner(project_id)
  );
CREATE POLICY "update_members" ON public.project_members FOR UPDATE TO authenticated
  USING (public.is_project_owner(project_id) OR user_id = auth.uid())
  WITH CHECK (public.is_project_owner(project_id) OR (user_id = auth.uid() AND role <> 'owner'));
CREATE POLICY "delete_members" ON public.project_members FOR DELETE TO authenticated
  USING (public.is_project_owner(project_id) OR user_id = auth.uid());

CREATE POLICY "rooms_member_all" ON public.rooms FOR ALL TO authenticated
  USING (public.is_project_member(project_id)) WITH CHECK (public.is_project_member(project_id));
CREATE POLICY "items_member_all" ON public.items FOR ALL TO authenticated
  USING (public.is_room_member(room_id)) WITH CHECK (public.is_room_member(room_id));
CREATE POLICY "transactions_member_all" ON public.transactions FOR ALL TO authenticated
  USING (public.is_project_member(project_id)) WITH CHECK (public.is_project_member(project_id));
CREATE POLICY "milestones_member_all" ON public.milestones FOR ALL TO authenticated
  USING (public.is_project_member(project_id)) WITH CHECK (public.is_project_member(project_id));
CREATE POLICY "documents_member_all" ON public.documents FOR ALL TO authenticated
  USING (public.is_project_member(project_id)) WITH CHECK (public.is_project_member(project_id));
CREATE POLICY "memories_member_all" ON public.memories FOR ALL TO authenticated
  USING (public.is_project_member(project_id)) WITH CHECK (public.is_project_member(project_id));

-- ===== realtime =====
DO $$
DECLARE t text;
BEGIN
  FOREACH t IN ARRAY ARRAY['projects','project_members','rooms','items','transactions','milestones','documents','memories'] LOOP
    IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname='supabase_realtime' AND schemaname='public' AND tablename=t) THEN
      EXECUTE format('ALTER PUBLICATION supabase_realtime ADD TABLE public.%I', t);
    END IF;
  END LOOP;
END $$;
