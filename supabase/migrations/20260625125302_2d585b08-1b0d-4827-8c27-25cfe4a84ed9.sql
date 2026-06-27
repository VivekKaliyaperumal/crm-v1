
CREATE EXTENSION IF NOT EXISTS pgcrypto;

DO $$
DECLARE
  v_org_id uuid := '00000000-0000-0000-0000-000000000a01';
  v_admin uuid := '00000000-0000-0000-0000-000000000b01';
  v_manager uuid := '00000000-0000-0000-0000-000000000b02';
  v_exec uuid := '00000000-0000-0000-0000-000000000b03';
  v_tele uuid := '00000000-0000-0000-0000-000000000b04';
  v_pw text := crypt('Demo!2345', gen_salt('bf'));
  v_lead_id uuid;
  v_now timestamptz := now();
  v_users record;
  v_assignees uuid[];
  v_owners uuid[] := ARRAY[v_exec, v_tele];
BEGIN
  -- Seed auth.users (will fire handle_new_user trigger -> creates profiles)
  FOR v_users IN
    SELECT * FROM (VALUES
      (v_admin, 'admin@demo.test', 'Aarav Sharma'),
      (v_manager, 'manager@demo.test', 'Meera Iyer'),
      (v_exec, 'exec@demo.test', 'Rohan Verma'),
      (v_tele, 'tele@demo.test', 'Priya Nair')
    ) AS t(id, email, full_name)
  LOOP
    INSERT INTO auth.users (
      instance_id, id, aud, role, email, encrypted_password,
      email_confirmed_at, raw_app_meta_data, raw_user_meta_data,
      created_at, updated_at, confirmation_token, email_change, email_change_token_new, recovery_token
    ) VALUES (
      '00000000-0000-0000-0000-000000000000',
      v_users.id,
      'authenticated',
      'authenticated',
      v_users.email,
      v_pw,
      now(),
      '{"provider":"email","providers":["email"]}'::jsonb,
      jsonb_build_object('full_name', v_users.full_name),
      now(), now(), '', '', '', ''
    );
    INSERT INTO auth.identities (id, user_id, provider_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
    VALUES (gen_random_uuid(), v_users.id, v_users.id::text, jsonb_build_object('sub', v_users.id::text, 'email', v_users.email), 'email', now(), now(), now());
  END LOOP;

  -- Organization
  INSERT INTO public.organizations (id, name, slug, settings)
  VALUES (v_org_id, 'Greenfield Farms Realty', 'greenfield', '{"timezone":"Asia/Kolkata"}'::jsonb);

  -- Attach profiles to org
  UPDATE public.profiles SET org_id = v_org_id, phone = '+91-90000-0000' WHERE id IN (v_admin, v_manager, v_exec, v_tele);

  -- Roles
  INSERT INTO public.user_roles (user_id, org_id, role) VALUES
    (v_admin, v_org_id, 'admin'),
    (v_manager, v_org_id, 'sales_manager'),
    (v_exec, v_org_id, 'sales_executive'),
    (v_tele, v_org_id, 'telecaller');

  INSERT INTO public.assignment_pointer (org_id, last_assigned_user_id) VALUES (v_org_id, v_exec);

  -- Leads
  v_assignees := ARRAY[v_exec, v_tele, v_manager];

  FOR i IN 1..30 LOOP
    v_lead_id := gen_random_uuid();
    INSERT INTO public.leads (
      id, org_id, full_name, phone, email, property_interest,
      budget_min, budget_max, timeline, source, status,
      assigned_to, created_by, notes, last_activity_at, created_at
    ) VALUES (
      v_lead_id,
      v_org_id,
      (ARRAY['Anil Kumar','Sneha Reddy','Vikram Singh','Divya Pillai','Karan Mehta','Neha Joshi','Rahul Das','Pooja Shah','Aditya Rao','Isha Gupta','Suresh Babu','Lakshmi Menon','Manish Patel','Ritu Aggarwal','Sanjay Kapoor','Tara Bose','Uday Reddy','Vandana Sinha','Yash Malhotra','Zara Khan','Arjun Nair','Bhavna Iyer','Chetan Murthy','Deepa Rao','Esha Shetty','Farhan Ali','Gaurav Jain','Hema Pillai','Ishaan Kohli','Jaya Krishnan'])[i],
      '+91-9' || lpad((100000000 + i * 137)::text, 9, '0'),
      'lead' || i || '@example.com',
      (ARRAY['10-acre farm plot','5-acre orchard land','Riverfront agricultural plot','Mango plantation','Coconut farm','Vineyard land','Organic farm plot','Tea estate parcel','Coffee plantation','Paddy field'])[1 + (i % 10)],
      ((10 + (i*7) % 30) * 100000)::numeric,
      ((40 + (i*11) % 60) * 100000)::numeric,
      (ARRAY['Immediate','1-3 months','3-6 months','6-12 months','Just exploring'])[1 + (i % 5)],
      (ARRAY['manual','web_form','referral','walk_in','import'])[1 + (i % 5)]::public.lead_source,
      (ARRAY['new','new','contacted','contacted','interested','interested','site_visit_scheduled','site_visit_completed','negotiation','booking','closed_won','closed_lost','not_interested','future_follow_up'])[1 + (i % 14)]::public.lead_status,
      v_assignees[1 + (i % 3)],
      v_owners[1 + (i % 2)],
      'Demo lead seeded for testing.',
      v_now - ((i % 14) || ' days')::interval,
      v_now - ((i || ' days'))::interval
    );

    -- Initial creation activity
    INSERT INTO public.lead_activities (org_id, lead_id, type, payload, actor_id, occurred_at)
    VALUES (v_org_id, v_lead_id, 'note',
      jsonb_build_object('text','Lead captured via ' || (CASE WHEN i % 2 = 0 THEN 'web form' ELSE 'phone call' END)),
      v_owners[1 + (i % 2)],
      v_now - ((i || ' days'))::interval);

    -- A call/note follow-up
    IF i % 3 = 0 THEN
      INSERT INTO public.lead_activities (org_id, lead_id, type, payload, actor_id, occurred_at)
      VALUES (v_org_id, v_lead_id, 'call',
        jsonb_build_object('summary','Discussed budget and location preferences.','duration_min', 5 + (i % 10)),
        v_assignees[1 + (i % 3)],
        v_now - (((i % 10) || ' days'))::interval);
    END IF;

    IF i % 4 = 0 THEN
      INSERT INTO public.lead_activities (org_id, lead_id, type, payload, actor_id, occurred_at)
      VALUES (v_org_id, v_lead_id, 'status_change',
        jsonb_build_object('to', 'contacted', 'from', 'new'),
        v_assignees[1 + (i % 3)],
        v_now - (((i % 7) || ' days'))::interval);
    END IF;

    -- Follow-ups: ~15 distributed
    IF i % 2 = 0 THEN
      INSERT INTO public.follow_ups (org_id, lead_id, assigned_to, due_at, priority, status, notes, created_by)
      VALUES (
        v_org_id, v_lead_id, v_assignees[1 + (i % 3)],
        CASE
          WHEN i % 5 = 0 THEN v_now + interval '2 hours'           -- due today
          WHEN i % 5 = 1 THEN v_now + interval '2 days'            -- this week
          WHEN i % 5 = 2 THEN v_now - interval '1 day'             -- overdue
          WHEN i % 5 = 3 THEN v_now + interval '5 days'
          ELSE v_now + interval '10 days'
        END,
        (ARRAY['low','medium','high'])[1 + (i % 3)]::public.followup_priority,
        CASE WHEN i % 7 = 0 THEN 'completed' ELSE 'pending' END::public.followup_status,
        'Call back regarding shortlisted plots.',
        v_owners[1 + (i % 2)]
      );
    END IF;

    -- Site visits: ~8
    IF i % 4 = 1 THEN
      INSERT INTO public.site_visits (org_id, lead_id, assigned_to, scheduled_at, location, status, pre_checklist, post_report, created_by)
      VALUES (
        v_org_id, v_lead_id, v_assignees[1 + (i % 3)],
        CASE WHEN i % 2 = 0 THEN v_now + ((i % 5 + 1) || ' days')::interval
             ELSE v_now - ((i % 6 + 1) || ' days')::interval END,
        (ARRAY['Sector 7, Greenfield Estate','Riverside Plot 12','Hilltop Orchard, Plot 4','Phase 2, Coconut Grove'])[1 + (i % 4)],
        CASE WHEN i % 2 = 0 THEN 'scheduled' ELSE 'completed' END::public.visit_status,
        '["ID proof","Brochure","Site map","Drinking water"]'::jsonb,
        CASE WHEN i % 2 = 0 THEN '{}'::jsonb
             ELSE jsonb_build_object('feedback','Customer liked layout and asked about water rights.','next_step','Send price quote') END,
        v_owners[1 + (i % 2)]
      );
    END IF;
  END LOOP;
END $$;
