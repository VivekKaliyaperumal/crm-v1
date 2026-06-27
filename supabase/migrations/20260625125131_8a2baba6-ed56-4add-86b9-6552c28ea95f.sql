
-- =========================
-- ENUMS
-- =========================
CREATE TYPE public.app_role AS ENUM ('admin', 'sales_manager', 'sales_executive', 'telecaller');

CREATE TYPE public.lead_status AS ENUM (
  'new', 'contacted', 'interested',
  'site_visit_scheduled', 'site_visit_completed',
  'negotiation', 'booking', 'closed_won',
  'closed_lost', 'not_interested', 'future_follow_up'
);

CREATE TYPE public.lead_source AS ENUM ('manual', 'web_form', 'import', 'referral', 'walk_in', 'other');

CREATE TYPE public.activity_type AS ENUM ('note', 'call', 'email', 'status_change', 'assignment', 'follow_up', 'site_visit');

CREATE TYPE public.followup_priority AS ENUM ('low', 'medium', 'high');
CREATE TYPE public.followup_status AS ENUM ('pending', 'completed', 'cancelled');
CREATE TYPE public.visit_status AS ENUM ('scheduled', 'completed', 'cancelled', 'no_show');

-- =========================
-- updated_at helper
-- =========================
CREATE OR REPLACE FUNCTION public.tg_set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- =========================
-- ORGANIZATIONS
-- =========================
CREATE TABLE public.organizations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  branding jsonb NOT NULL DEFAULT '{}'::jsonb,
  settings jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.organizations TO authenticated;
GRANT ALL ON public.organizations TO service_role;
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER trg_org_updated BEFORE UPDATE ON public.organizations
  FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();

-- =========================
-- PROFILES
-- =========================
CREATE TABLE public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  org_id uuid REFERENCES public.organizations(id) ON DELETE SET NULL,
  full_name text,
  email text,
  phone text,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_profiles_org ON public.profiles(org_id);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER trg_profile_updated BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (NEW.id, NEW.email, COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email));
  RETURN NEW;
END;
$$;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =========================
-- USER ROLES
-- =========================
CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  org_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, org_id, role)
);
CREATE INDEX idx_user_roles_lookup ON public.user_roles(user_id, org_id);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- =========================
-- SECURITY DEFINER HELPERS
-- =========================
CREATE OR REPLACE FUNCTION public.current_org_id()
RETURNS uuid LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT org_id FROM public.profiles WHERE id = auth.uid();
$$;

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _org_id uuid, _role public.app_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND org_id = _org_id AND role = _role
  );
$$;

CREATE OR REPLACE FUNCTION public.has_any_role(_user_id uuid, _org_id uuid, _roles public.app_role[])
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND org_id = _org_id AND role = ANY(_roles)
  );
$$;

CREATE OR REPLACE FUNCTION public.is_org_manager(_user_id uuid, _org_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT public.has_any_role(_user_id, _org_id, ARRAY['admin','sales_manager']::public.app_role[]);
$$;

-- =========================
-- ORGANIZATIONS RLS
-- =========================
CREATE POLICY "Members can view their org"
  ON public.organizations FOR SELECT TO authenticated
  USING (id = public.current_org_id());

CREATE POLICY "Anyone authenticated can create an org"
  ON public.organizations FOR INSERT TO authenticated
  WITH CHECK (true);

CREATE POLICY "Admins can update their org"
  ON public.organizations FOR UPDATE TO authenticated
  USING (id = public.current_org_id() AND public.has_role(auth.uid(), id, 'admin'))
  WITH CHECK (id = public.current_org_id() AND public.has_role(auth.uid(), id, 'admin'));

-- =========================
-- PROFILES RLS
-- =========================
CREATE POLICY "Users can view profiles in their org"
  ON public.profiles FOR SELECT TO authenticated
  USING (id = auth.uid() OR org_id = public.current_org_id());

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE TO authenticated
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

CREATE POLICY "Managers can update profiles in their org"
  ON public.profiles FOR UPDATE TO authenticated
  USING (org_id = public.current_org_id() AND public.is_org_manager(auth.uid(), org_id))
  WITH CHECK (org_id = public.current_org_id() AND public.is_org_manager(auth.uid(), org_id));

-- =========================
-- USER ROLES RLS
-- =========================
CREATE POLICY "Members can view roles in their org"
  ON public.user_roles FOR SELECT TO authenticated
  USING (org_id = public.current_org_id());

-- Inserts/updates/deletes of roles are done server-side via service role.

-- =========================
-- LEADS
-- =========================
CREATE TABLE public.leads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  full_name text NOT NULL,
  phone text,
  email text,
  property_interest text,
  budget_min numeric,
  budget_max numeric,
  timeline text,
  source public.lead_source NOT NULL DEFAULT 'manual',
  status public.lead_status NOT NULL DEFAULT 'new',
  assigned_to uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  notes text,
  last_activity_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_leads_org_status ON public.leads(org_id, status);
CREATE INDEX idx_leads_org_assigned ON public.leads(org_id, assigned_to);
CREATE INDEX idx_leads_org_created ON public.leads(org_id, created_at DESC);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.leads TO authenticated;
GRANT ALL ON public.leads TO service_role;
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER trg_lead_updated BEFORE UPDATE ON public.leads
  FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();

CREATE POLICY "View leads scoped by role"
  ON public.leads FOR SELECT TO authenticated
  USING (
    org_id = public.current_org_id() AND (
      public.is_org_manager(auth.uid(), org_id)
      OR assigned_to = auth.uid()
      OR created_by = auth.uid()
    )
  );

CREATE POLICY "Members can create leads in their org"
  ON public.leads FOR INSERT TO authenticated
  WITH CHECK (org_id = public.current_org_id() AND created_by = auth.uid());

CREATE POLICY "Update leads scoped by role"
  ON public.leads FOR UPDATE TO authenticated
  USING (
    org_id = public.current_org_id() AND (
      public.is_org_manager(auth.uid(), org_id)
      OR assigned_to = auth.uid()
      OR created_by = auth.uid()
    )
  )
  WITH CHECK (org_id = public.current_org_id());

CREATE POLICY "Managers can delete leads"
  ON public.leads FOR DELETE TO authenticated
  USING (org_id = public.current_org_id() AND public.is_org_manager(auth.uid(), org_id));

-- =========================
-- LEAD ACTIVITIES
-- =========================
CREATE TABLE public.lead_activities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  lead_id uuid NOT NULL REFERENCES public.leads(id) ON DELETE CASCADE,
  type public.activity_type NOT NULL,
  payload jsonb NOT NULL DEFAULT '{}'::jsonb,
  actor_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  occurred_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_activities_lead ON public.lead_activities(lead_id, occurred_at DESC);
CREATE INDEX idx_activities_org ON public.lead_activities(org_id, occurred_at DESC);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.lead_activities TO authenticated;
GRANT ALL ON public.lead_activities TO service_role;
ALTER TABLE public.lead_activities ENABLE ROW LEVEL SECURITY;

CREATE POLICY "View activities for visible leads"
  ON public.lead_activities FOR SELECT TO authenticated
  USING (
    org_id = public.current_org_id() AND EXISTS (
      SELECT 1 FROM public.leads l
      WHERE l.id = lead_activities.lead_id
        AND (
          public.is_org_manager(auth.uid(), l.org_id)
          OR l.assigned_to = auth.uid()
          OR l.created_by = auth.uid()
        )
    )
  );

CREATE POLICY "Insert activities for visible leads"
  ON public.lead_activities FOR INSERT TO authenticated
  WITH CHECK (
    org_id = public.current_org_id() AND actor_id = auth.uid() AND EXISTS (
      SELECT 1 FROM public.leads l
      WHERE l.id = lead_activities.lead_id
        AND l.org_id = public.current_org_id() AND (
          public.is_org_manager(auth.uid(), l.org_id)
          OR l.assigned_to = auth.uid()
          OR l.created_by = auth.uid()
        )
    )
  );

-- =========================
-- FOLLOW UPS
-- =========================
CREATE TABLE public.follow_ups (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  lead_id uuid NOT NULL REFERENCES public.leads(id) ON DELETE CASCADE,
  assigned_to uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  due_at timestamptz NOT NULL,
  priority public.followup_priority NOT NULL DEFAULT 'medium',
  status public.followup_status NOT NULL DEFAULT 'pending',
  notes text,
  outcome text,
  completed_at timestamptz,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_followups_org_due ON public.follow_ups(org_id, due_at);
CREATE INDEX idx_followups_assigned ON public.follow_ups(assigned_to, due_at);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.follow_ups TO authenticated;
GRANT ALL ON public.follow_ups TO service_role;
ALTER TABLE public.follow_ups ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER trg_followup_updated BEFORE UPDATE ON public.follow_ups
  FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();

CREATE POLICY "View follow-ups scoped by role"
  ON public.follow_ups FOR SELECT TO authenticated
  USING (
    org_id = public.current_org_id() AND (
      public.is_org_manager(auth.uid(), org_id)
      OR assigned_to = auth.uid()
      OR created_by = auth.uid()
    )
  );

CREATE POLICY "Insert follow-ups in own org"
  ON public.follow_ups FOR INSERT TO authenticated
  WITH CHECK (org_id = public.current_org_id() AND created_by = auth.uid());

CREATE POLICY "Update follow-ups scoped by role"
  ON public.follow_ups FOR UPDATE TO authenticated
  USING (
    org_id = public.current_org_id() AND (
      public.is_org_manager(auth.uid(), org_id)
      OR assigned_to = auth.uid()
      OR created_by = auth.uid()
    )
  )
  WITH CHECK (org_id = public.current_org_id());

CREATE POLICY "Managers can delete follow-ups"
  ON public.follow_ups FOR DELETE TO authenticated
  USING (org_id = public.current_org_id() AND public.is_org_manager(auth.uid(), org_id));

-- =========================
-- SITE VISITS
-- =========================
CREATE TABLE public.site_visits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  lead_id uuid NOT NULL REFERENCES public.leads(id) ON DELETE CASCADE,
  assigned_to uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  scheduled_at timestamptz NOT NULL,
  location text NOT NULL,
  status public.visit_status NOT NULL DEFAULT 'scheduled',
  pre_checklist jsonb NOT NULL DEFAULT '[]'::jsonb,
  post_report jsonb NOT NULL DEFAULT '{}'::jsonb,
  notes text,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_visits_org_scheduled ON public.site_visits(org_id, scheduled_at);
CREATE INDEX idx_visits_assigned ON public.site_visits(assigned_to, scheduled_at);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.site_visits TO authenticated;
GRANT ALL ON public.site_visits TO service_role;
ALTER TABLE public.site_visits ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER trg_visit_updated BEFORE UPDATE ON public.site_visits
  FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();

CREATE POLICY "View visits scoped by role"
  ON public.site_visits FOR SELECT TO authenticated
  USING (
    org_id = public.current_org_id() AND (
      public.is_org_manager(auth.uid(), org_id)
      OR assigned_to = auth.uid()
      OR created_by = auth.uid()
    )
  );

CREATE POLICY "Insert visits in own org"
  ON public.site_visits FOR INSERT TO authenticated
  WITH CHECK (org_id = public.current_org_id() AND created_by = auth.uid());

CREATE POLICY "Update visits scoped by role"
  ON public.site_visits FOR UPDATE TO authenticated
  USING (
    org_id = public.current_org_id() AND (
      public.is_org_manager(auth.uid(), org_id)
      OR assigned_to = auth.uid()
      OR created_by = auth.uid()
    )
  )
  WITH CHECK (org_id = public.current_org_id());

CREATE POLICY "Managers can delete visits"
  ON public.site_visits FOR DELETE TO authenticated
  USING (org_id = public.current_org_id() AND public.is_org_manager(auth.uid(), org_id));

-- =========================
-- ASSIGNMENT POINTER (round-robin)
-- =========================
CREATE TABLE public.assignment_pointer (
  org_id uuid PRIMARY KEY REFERENCES public.organizations(id) ON DELETE CASCADE,
  last_assigned_user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.assignment_pointer TO authenticated;
GRANT ALL ON public.assignment_pointer TO service_role;
ALTER TABLE public.assignment_pointer ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Members view pointer" ON public.assignment_pointer FOR SELECT TO authenticated
  USING (org_id = public.current_org_id());

-- =========================
-- AUDIT LOGS
-- =========================
CREATE TABLE public.audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  actor_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  entity text NOT NULL,
  entity_id uuid,
  action text NOT NULL,
  diff jsonb NOT NULL DEFAULT '{}'::jsonb,
  at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_audit_org_at ON public.audit_logs(org_id, at DESC);
GRANT SELECT, INSERT ON public.audit_logs TO authenticated;
GRANT ALL ON public.audit_logs TO service_role;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Managers view audit" ON public.audit_logs FOR SELECT TO authenticated
  USING (org_id = public.current_org_id() AND public.is_org_manager(auth.uid(), org_id));
CREATE POLICY "Members write audit" ON public.audit_logs FOR INSERT TO authenticated
  WITH CHECK (org_id = public.current_org_id() AND actor_id = auth.uid());
