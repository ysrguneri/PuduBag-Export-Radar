create extension if not exists pgcrypto;

create table if not exists public.export_companies (
  id uuid primary key default gen_random_uuid(),
  canonical_name text not null,
  country_code text,
  country_name text,
  city text,
  address text,
  website_url text,
  domain text,
  company_role text not null default 'buyer' check (company_role in ('buyer','supplier','exporter','other')),
  source_provider text not null,
  source_external_id text,
  source_url text,
  raw_summary jsonb not null default '{}'::jsonb,
  first_seen_at timestamptz not null default now(),
  last_seen_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create unique index if not exists export_companies_provider_external_uidx
  on public.export_companies(source_provider, source_external_id);
create index if not exists export_companies_name_idx on public.export_companies using gin (to_tsvector('simple', canonical_name));
create index if not exists export_companies_domain_idx on public.export_companies(domain);
create index if not exists export_companies_country_idx on public.export_companies(country_code);

create table if not exists public.trade_relationships (
  id uuid primary key default gen_random_uuid(),
  buyer_company_id uuid not null references public.export_companies(id) on delete cascade,
  supplier_company_id uuid references public.export_companies(id) on delete set null,
  product_description text,
  hs_code text,
  first_shipment_date date,
  last_shipment_date date,
  shipment_count integer not null default 0,
  total_weight_kg numeric,
  source_provider text not null,
  source_record_id text,
  raw_summary jsonb not null default '{}'::jsonb,
  observed_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);
create index if not exists trade_relationships_buyer_idx on public.trade_relationships(buyer_company_id);
create index if not exists trade_relationships_supplier_idx on public.trade_relationships(supplier_company_id);
create index if not exists trade_relationships_last_idx on public.trade_relationships(last_shipment_date desc);

create table if not exists public.trade_shipments (
  id uuid primary key default gen_random_uuid(),
  source_provider text not null,
  source_record_id text not null,
  bol_number text,
  buyer_company_id uuid references public.export_companies(id) on delete set null,
  supplier_company_id uuid references public.export_companies(id) on delete set null,
  shipment_date date,
  arrival_date date,
  product_description text,
  hs_code text,
  origin_country text,
  destination_country text,
  weight_kg numeric,
  quantity numeric,
  quantity_unit text,
  raw_payload jsonb not null default '{}'::jsonb,
  observed_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  unique(source_provider, source_record_id)
);
create index if not exists trade_shipments_buyer_idx on public.trade_shipments(buyer_company_id, shipment_date desc);
create index if not exists trade_shipments_supplier_idx on public.trade_shipments(supplier_company_id, shipment_date desc);

create table if not exists public.company_contacts (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.export_companies(id) on delete cascade,
  person_name text,
  first_name text,
  last_name text,
  job_title text,
  department text,
  email text,
  email_type text check (email_type is null or email_type in ('generic','personal','predicted')),
  email_status text check (email_status is null or email_status in ('verified','valid','accept_all','risky','invalid','unknown')),
  confidence_score numeric check (confidence_score is null or (confidence_score >= 0 and confidence_score <= 100)),
  phone text,
  linkedin_url text,
  source_provider text not null,
  source_url text,
  observed_at timestamptz not null default now(),
  verified_at timestamptz,
  raw_payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);
create unique index if not exists company_contacts_company_email_uidx
  on public.company_contacts(company_id, lower(email)) where email is not null;
create index if not exists company_contacts_company_idx on public.company_contacts(company_id);

create table if not exists public.buyer_scores (
  company_id uuid primary key references public.export_companies(id) on delete cascade,
  total_score integer not null check (total_score between 0 and 100),
  product_fit integer not null default 0 check (product_fit between 0 and 100),
  turkey_signal integer not null default 0 check (turkey_signal between 0 and 100),
  recency_score integer not null default 0 check (recency_score between 0 and 100),
  frequency_score integer not null default 0 check (frequency_score between 0 and 100),
  market_score integer not null default 0 check (market_score between 0 and 100),
  explanation jsonb not null default '{}'::jsonb,
  calculated_at timestamptz not null default now()
);

create table if not exists public.crm_leads (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.export_companies(id) on delete cascade,
  owner_user_id uuid not null default auth.uid(),
  stage text not null default 'new' check (stage in ('new','research','contact','catalog','sample','offer','negotiation','won','lost')),
  priority text not null default 'normal' check (priority in ('low','normal','high','critical')),
  next_action text,
  next_action_at timestamptz,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(owner_user_id, company_id)
);
create index if not exists crm_leads_owner_stage_idx on public.crm_leads(owner_user_id, stage);

create table if not exists public.company_watchlist (
  user_id uuid not null default auth.uid(),
  company_id uuid not null references public.export_companies(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key(user_id, company_id)
);

create table if not exists public.integration_runs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid,
  provider text not null,
  action text not null,
  input_payload jsonb not null default '{}'::jsonb,
  status text not null check (status in ('started','success','error')),
  request_cost numeric,
  credits_remaining numeric,
  result_count integer,
  error_message text,
  started_at timestamptz not null default now(),
  finished_at timestamptz,
  created_at timestamptz not null default now()
);
create index if not exists integration_runs_provider_idx on public.integration_runs(provider, created_at desc);

alter table public.export_companies enable row level security;
alter table public.trade_relationships enable row level security;
alter table public.trade_shipments enable row level security;
alter table public.company_contacts enable row level security;
alter table public.buyer_scores enable row level security;
alter table public.crm_leads enable row level security;
alter table public.company_watchlist enable row level security;
alter table public.integration_runs enable row level security;

create policy export_companies_read on public.export_companies for select to authenticated using (true);
create policy trade_relationships_read on public.trade_relationships for select to authenticated using (true);
create policy trade_shipments_read on public.trade_shipments for select to authenticated using (true);
create policy company_contacts_read on public.company_contacts for select to authenticated using (true);
create policy buyer_scores_read on public.buyer_scores for select to authenticated using (true);
create policy integration_runs_own_read on public.integration_runs for select to authenticated using (user_id = auth.uid());

create policy crm_leads_own_all on public.crm_leads for all to authenticated
  using (owner_user_id = auth.uid()) with check (owner_user_id = auth.uid());
create policy company_watchlist_own_all on public.company_watchlist for all to authenticated
  using (user_id = auth.uid()) with check (user_id = auth.uid());

revoke insert, update, delete on public.export_companies from anon, authenticated;
revoke insert, update, delete on public.trade_relationships from anon, authenticated;
revoke insert, update, delete on public.trade_shipments from anon, authenticated;
revoke insert, update, delete on public.company_contacts from anon, authenticated;
revoke insert, update, delete on public.buyer_scores from anon, authenticated;
revoke insert, update, delete on public.integration_runs from anon, authenticated;
