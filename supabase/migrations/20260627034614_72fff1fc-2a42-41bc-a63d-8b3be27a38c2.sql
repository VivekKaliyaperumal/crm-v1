
-- =========================================================
-- ENUMS
-- =========================================================
CREATE TYPE public.project_status AS ENUM ('planning','active','on_hold','completed','archived');
CREATE TYPE public.plot_status AS ENUM ('available','blocked','booked','sold');
CREATE TYPE public.plot_facing AS ENUM ('north','south','east','west','north_east','north_west','south_east','south_west');
CREATE TYPE public.opportunity_stage AS ENUM ('qualification','proposal','negotiation','closed_won','closed_lost');
CREATE TYPE public.deal_status AS ENUM ('open','won','lost','on_hold');
CREATE TYPE public.task_status AS ENUM ('open','in_progress','done','cancelled');
CREATE TYPE public.task_priority AS ENUM ('low','medium','high','urgent');
CREATE TYPE public.quotation_status AS ENUM ('draft','sent','accepted','rejected','expired');
CREATE TYPE public.booking_status AS ENUM ('pending','confirmed','cancelled','completed');
CREATE TYPE public.payment_status AS ENUM ('scheduled','due','partial','paid','overdue','cancelled');
CREATE TYPE public.payment_mode AS ENUM ('cash','cheque','bank_transfer','upi','card','other');
CREATE TYPE public.campaign_channel AS ENUM ('facebook','google','instagram','whatsapp','email','sms','referral','event','other');
CREATE TYPE public.campaign_status AS ENUM ('draft','active','paused','completed');
CREATE TYPE public.kyc_status AS ENUM ('pending','verified','rejected');

-- =========================================================
-- PROJECTS
-- =========================================================
CREATE TABLE public.projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  code TEXT,
  location TEXT,
  description TEXT,
  total_area_sqft NUMERIC(14,2),
  total_plots INT DEFAULT 0,
  status public.project_status NOT NULL DEFAULT 'planning',
  cover_image_url TEXT,
  launch_date DATE,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_projects_org ON public.projects(org_id);
CREATE INDEX idx_projects_status ON public.projects(status);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.projects TO authenticated;
GRANT ALL ON public.projects TO service_role;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
CREATE POLICY "projects_org_select" ON public.projects FOR SELECT TO authenticated
  USING (org_id = public.current_org_id());
CREATE POLICY "projects_org_manage" ON public.projects FOR ALL TO authenticated
  USING (org_id = public.current_org_id() AND public.is_org_manager(auth.uid(), org_id))
  WITH CHECK (org_id = public.current_org_id() AND public.is_org_manager(auth.uid(), org_id));
CREATE TRIGGER tg_projects_updated_at BEFORE UPDATE ON public.projects
  FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();

-- =========================================================
-- PLOTS
-- =========================================================
CREATE TABLE public.plots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  plot_number TEXT NOT NULL,
  area_sqft NUMERIC(12,2) NOT NULL,
  price_per_sqft NUMERIC(12,2),
  total_price NUMERIC(14,2) NOT NULL,
  facing public.plot_facing,
  status public.plot_status NOT NULL DEFAULT 'available',
  block TEXT,
  notes TEXT,
  reserved_for UUID REFERENCES public.leads(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (project_id, plot_number)
);
CREATE INDEX idx_plots_org ON public.plots(org_id);
CREATE INDEX idx_plots_project ON public.plots(project_id);
CREATE INDEX idx_plots_status ON public.plots(status);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.plots TO authenticated;
GRANT ALL ON public.plots TO service_role;
ALTER TABLE public.plots ENABLE ROW LEVEL SECURITY;
CREATE POLICY "plots_org_select" ON public.plots FOR SELECT TO authenticated
  USING (org_id = public.current_org_id());
CREATE POLICY "plots_org_manage" ON public.plots FOR ALL TO authenticated
  USING (org_id = public.current_org_id() AND public.is_org_manager(auth.uid(), org_id))
  WITH CHECK (org_id = public.current_org_id() AND public.is_org_manager(auth.uid(), org_id));
CREATE TRIGGER tg_plots_updated_at BEFORE UPDATE ON public.plots
  FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();

-- =========================================================
-- CUSTOMERS
-- =========================================================
CREATE TABLE public.customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  lead_id UUID REFERENCES public.leads(id) ON DELETE SET NULL,
  full_name TEXT NOT NULL,
  email TEXT,
  phone TEXT NOT NULL,
  pan TEXT,
  address TEXT,
  city TEXT,
  state TEXT,
  pincode TEXT,
  kyc_status public.kyc_status NOT NULL DEFAULT 'pending',
  notes TEXT,
  owner_id UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_customers_org ON public.customers(org_id);
CREATE INDEX idx_customers_owner ON public.customers(owner_id);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.customers TO authenticated;
GRANT ALL ON public.customers TO service_role;
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "customers_org_select" ON public.customers FOR SELECT TO authenticated
  USING (org_id = public.current_org_id());
CREATE POLICY "customers_org_insert" ON public.customers FOR INSERT TO authenticated
  WITH CHECK (org_id = public.current_org_id());
CREATE POLICY "customers_org_update" ON public.customers FOR UPDATE TO authenticated
  USING (org_id = public.current_org_id() AND (public.is_org_manager(auth.uid(), org_id) OR owner_id = auth.uid()))
  WITH CHECK (org_id = public.current_org_id());
CREATE POLICY "customers_org_delete" ON public.customers FOR DELETE TO authenticated
  USING (org_id = public.current_org_id() AND public.is_org_manager(auth.uid(), org_id));
CREATE TRIGGER tg_customers_updated_at BEFORE UPDATE ON public.customers
  FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();

-- =========================================================
-- OPPORTUNITIES
-- =========================================================
CREATE TABLE public.opportunities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  lead_id UUID REFERENCES public.leads(id) ON DELETE SET NULL,
  customer_id UUID REFERENCES public.customers(id) ON DELETE SET NULL,
  project_id UUID REFERENCES public.projects(id) ON DELETE SET NULL,
  plot_id UUID REFERENCES public.plots(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  stage public.opportunity_stage NOT NULL DEFAULT 'qualification',
  value NUMERIC(14,2) NOT NULL DEFAULT 0,
  probability INT NOT NULL DEFAULT 20,
  expected_close DATE,
  owner_id UUID REFERENCES auth.users(id),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_opps_org ON public.opportunities(org_id);
CREATE INDEX idx_opps_stage ON public.opportunities(stage);
CREATE INDEX idx_opps_owner ON public.opportunities(owner_id);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.opportunities TO authenticated;
GRANT ALL ON public.opportunities TO service_role;
ALTER TABLE public.opportunities ENABLE ROW LEVEL SECURITY;
CREATE POLICY "opps_org_select" ON public.opportunities FOR SELECT TO authenticated
  USING (org_id = public.current_org_id());
CREATE POLICY "opps_org_insert" ON public.opportunities FOR INSERT TO authenticated
  WITH CHECK (org_id = public.current_org_id());
CREATE POLICY "opps_org_update" ON public.opportunities FOR UPDATE TO authenticated
  USING (org_id = public.current_org_id() AND (public.is_org_manager(auth.uid(), org_id) OR owner_id = auth.uid()))
  WITH CHECK (org_id = public.current_org_id());
CREATE POLICY "opps_org_delete" ON public.opportunities FOR DELETE TO authenticated
  USING (org_id = public.current_org_id() AND public.is_org_manager(auth.uid(), org_id));
CREATE TRIGGER tg_opps_updated_at BEFORE UPDATE ON public.opportunities
  FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();

-- =========================================================
-- DEALS
-- =========================================================
CREATE TABLE public.deals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  opportunity_id UUID REFERENCES public.opportunities(id) ON DELETE SET NULL,
  customer_id UUID REFERENCES public.customers(id) ON DELETE SET NULL,
  plot_id UUID REFERENCES public.plots(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  amount NUMERIC(14,2) NOT NULL DEFAULT 0,
  status public.deal_status NOT NULL DEFAULT 'open',
  owner_id UUID REFERENCES auth.users(id),
  closed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_deals_org ON public.deals(org_id);
CREATE INDEX idx_deals_status ON public.deals(status);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.deals TO authenticated;
GRANT ALL ON public.deals TO service_role;
ALTER TABLE public.deals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "deals_org_select" ON public.deals FOR SELECT TO authenticated
  USING (org_id = public.current_org_id());
CREATE POLICY "deals_org_insert" ON public.deals FOR INSERT TO authenticated
  WITH CHECK (org_id = public.current_org_id());
CREATE POLICY "deals_org_update" ON public.deals FOR UPDATE TO authenticated
  USING (org_id = public.current_org_id() AND (public.is_org_manager(auth.uid(), org_id) OR owner_id = auth.uid()))
  WITH CHECK (org_id = public.current_org_id());
CREATE POLICY "deals_org_delete" ON public.deals FOR DELETE TO authenticated
  USING (org_id = public.current_org_id() AND public.is_org_manager(auth.uid(), org_id));
CREATE TRIGGER tg_deals_updated_at BEFORE UPDATE ON public.deals
  FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();

-- =========================================================
-- TASKS
-- =========================================================
CREATE TABLE public.tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  status public.task_status NOT NULL DEFAULT 'open',
  priority public.task_priority NOT NULL DEFAULT 'medium',
  due_at TIMESTAMPTZ,
  assigned_to UUID REFERENCES auth.users(id),
  related_lead_id UUID REFERENCES public.leads(id) ON DELETE SET NULL,
  related_customer_id UUID REFERENCES public.customers(id) ON DELETE SET NULL,
  related_opportunity_id UUID REFERENCES public.opportunities(id) ON DELETE SET NULL,
  completed_at TIMESTAMPTZ,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_tasks_org ON public.tasks(org_id);
CREATE INDEX idx_tasks_assigned ON public.tasks(assigned_to);
CREATE INDEX idx_tasks_due ON public.tasks(due_at);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.tasks TO authenticated;
GRANT ALL ON public.tasks TO service_role;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "tasks_org_select" ON public.tasks FOR SELECT TO authenticated
  USING (org_id = public.current_org_id());
CREATE POLICY "tasks_org_insert" ON public.tasks FOR INSERT TO authenticated
  WITH CHECK (org_id = public.current_org_id());
CREATE POLICY "tasks_org_update" ON public.tasks FOR UPDATE TO authenticated
  USING (org_id = public.current_org_id() AND (public.is_org_manager(auth.uid(), org_id) OR assigned_to = auth.uid() OR created_by = auth.uid()))
  WITH CHECK (org_id = public.current_org_id());
CREATE POLICY "tasks_org_delete" ON public.tasks FOR DELETE TO authenticated
  USING (org_id = public.current_org_id() AND public.is_org_manager(auth.uid(), org_id));
CREATE TRIGGER tg_tasks_updated_at BEFORE UPDATE ON public.tasks
  FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();

-- =========================================================
-- QUOTATIONS
-- =========================================================
CREATE TABLE public.quotations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  quotation_number TEXT NOT NULL,
  customer_id UUID REFERENCES public.customers(id) ON DELETE SET NULL,
  lead_id UUID REFERENCES public.leads(id) ON DELETE SET NULL,
  plot_id UUID REFERENCES public.plots(id) ON DELETE SET NULL,
  project_id UUID REFERENCES public.projects(id) ON DELETE SET NULL,
  amount NUMERIC(14,2) NOT NULL DEFAULT 0,
  tax NUMERIC(14,2) NOT NULL DEFAULT 0,
  discount NUMERIC(14,2) NOT NULL DEFAULT 0,
  total NUMERIC(14,2) NOT NULL DEFAULT 0,
  status public.quotation_status NOT NULL DEFAULT 'draft',
  valid_until DATE,
  notes TEXT,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (org_id, quotation_number)
);
CREATE INDEX idx_quot_org ON public.quotations(org_id);
CREATE INDEX idx_quot_status ON public.quotations(status);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.quotations TO authenticated;
GRANT ALL ON public.quotations TO service_role;
ALTER TABLE public.quotations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "quot_org_select" ON public.quotations FOR SELECT TO authenticated
  USING (org_id = public.current_org_id());
CREATE POLICY "quot_org_manage" ON public.quotations FOR ALL TO authenticated
  USING (org_id = public.current_org_id())
  WITH CHECK (org_id = public.current_org_id());
CREATE TRIGGER tg_quot_updated_at BEFORE UPDATE ON public.quotations
  FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();

-- =========================================================
-- BOOKINGS
-- =========================================================
CREATE TABLE public.bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  booking_number TEXT NOT NULL,
  quotation_id UUID REFERENCES public.quotations(id) ON DELETE SET NULL,
  customer_id UUID NOT NULL REFERENCES public.customers(id) ON DELETE RESTRICT,
  plot_id UUID NOT NULL REFERENCES public.plots(id) ON DELETE RESTRICT,
  project_id UUID REFERENCES public.projects(id) ON DELETE SET NULL,
  booking_amount NUMERIC(14,2) NOT NULL DEFAULT 0,
  total_amount NUMERIC(14,2) NOT NULL DEFAULT 0,
  agreement_date DATE,
  status public.booking_status NOT NULL DEFAULT 'pending',
  notes TEXT,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (org_id, booking_number)
);
CREATE INDEX idx_book_org ON public.bookings(org_id);
CREATE INDEX idx_book_status ON public.bookings(status);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.bookings TO authenticated;
GRANT ALL ON public.bookings TO service_role;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "book_org_select" ON public.bookings FOR SELECT TO authenticated
  USING (org_id = public.current_org_id());
CREATE POLICY "book_org_manage" ON public.bookings FOR ALL TO authenticated
  USING (org_id = public.current_org_id())
  WITH CHECK (org_id = public.current_org_id());
CREATE TRIGGER tg_book_updated_at BEFORE UPDATE ON public.bookings
  FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();

-- =========================================================
-- PAYMENTS
-- =========================================================
CREATE TABLE public.payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  booking_id UUID REFERENCES public.bookings(id) ON DELETE CASCADE,
  customer_id UUID REFERENCES public.customers(id) ON DELETE SET NULL,
  amount NUMERIC(14,2) NOT NULL,
  mode public.payment_mode NOT NULL DEFAULT 'bank_transfer',
  status public.payment_status NOT NULL DEFAULT 'scheduled',
  due_date DATE,
  paid_at TIMESTAMPTZ,
  reference TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_pay_org ON public.payments(org_id);
CREATE INDEX idx_pay_status ON public.payments(status);
CREATE INDEX idx_pay_booking ON public.payments(booking_id);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.payments TO authenticated;
GRANT ALL ON public.payments TO service_role;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "pay_org_select" ON public.payments FOR SELECT TO authenticated
  USING (org_id = public.current_org_id());
CREATE POLICY "pay_org_manage" ON public.payments FOR ALL TO authenticated
  USING (org_id = public.current_org_id())
  WITH CHECK (org_id = public.current_org_id());
CREATE TRIGGER tg_pay_updated_at BEFORE UPDATE ON public.payments
  FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();

-- =========================================================
-- RECEIPTS
-- =========================================================
CREATE TABLE public.receipts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  receipt_number TEXT NOT NULL,
  payment_id UUID REFERENCES public.payments(id) ON DELETE SET NULL,
  customer_id UUID REFERENCES public.customers(id) ON DELETE SET NULL,
  amount NUMERIC(14,2) NOT NULL,
  issued_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  notes TEXT,
  issued_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (org_id, receipt_number)
);
CREATE INDEX idx_rec_org ON public.receipts(org_id);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.receipts TO authenticated;
GRANT ALL ON public.receipts TO service_role;
ALTER TABLE public.receipts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "rec_org_select" ON public.receipts FOR SELECT TO authenticated
  USING (org_id = public.current_org_id());
CREATE POLICY "rec_org_manage" ON public.receipts FOR ALL TO authenticated
  USING (org_id = public.current_org_id())
  WITH CHECK (org_id = public.current_org_id());
CREATE TRIGGER tg_rec_updated_at BEFORE UPDATE ON public.receipts
  FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();

-- =========================================================
-- CAMPAIGNS
-- =========================================================
CREATE TABLE public.campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  channel public.campaign_channel NOT NULL DEFAULT 'other',
  status public.campaign_status NOT NULL DEFAULT 'draft',
  budget NUMERIC(14,2) NOT NULL DEFAULT 0,
  spent NUMERIC(14,2) NOT NULL DEFAULT 0,
  leads_count INT NOT NULL DEFAULT 0,
  start_date DATE,
  end_date DATE,
  notes TEXT,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_camp_org ON public.campaigns(org_id);
CREATE INDEX idx_camp_status ON public.campaigns(status);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.campaigns TO authenticated;
GRANT ALL ON public.campaigns TO service_role;
ALTER TABLE public.campaigns ENABLE ROW LEVEL SECURITY;
CREATE POLICY "camp_org_select" ON public.campaigns FOR SELECT TO authenticated
  USING (org_id = public.current_org_id());
CREATE POLICY "camp_org_manage" ON public.campaigns FOR ALL TO authenticated
  USING (org_id = public.current_org_id() AND public.is_org_manager(auth.uid(), org_id))
  WITH CHECK (org_id = public.current_org_id() AND public.is_org_manager(auth.uid(), org_id));
CREATE TRIGGER tg_camp_updated_at BEFORE UPDATE ON public.campaigns
  FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();

-- =========================================================
-- DOCUMENTS
-- =========================================================
CREATE TABLE public.documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  entity_type TEXT NOT NULL,
  entity_id UUID NOT NULL,
  name TEXT NOT NULL,
  storage_path TEXT NOT NULL,
  mime_type TEXT,
  size_bytes BIGINT,
  uploaded_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_docs_org ON public.documents(org_id);
CREATE INDEX idx_docs_entity ON public.documents(entity_type, entity_id);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.documents TO authenticated;
GRANT ALL ON public.documents TO service_role;
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;
CREATE POLICY "docs_org_select" ON public.documents FOR SELECT TO authenticated
  USING (org_id = public.current_org_id());
CREATE POLICY "docs_org_manage" ON public.documents FOR ALL TO authenticated
  USING (org_id = public.current_org_id())
  WITH CHECK (org_id = public.current_org_id());
CREATE TRIGGER tg_docs_updated_at BEFORE UPDATE ON public.documents
  FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();
