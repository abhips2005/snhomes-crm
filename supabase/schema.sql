create extension if not exists "pgcrypto";

create type lead_type as enum ('buyer', 'seller', 'tenant', 'landlord');
create type lead_status as enum ('New', 'Contacted', 'Qualified', 'Matching', 'Shortlisted', 'Site Visit', 'Negotiation', 'Closed', 'Lost');
create type request_status as enum ('Received', 'Reviewing', 'Matching', 'Contacted', 'Site Visit', 'Closed');
create type lead_priority as enum ('Cold', 'Warm', 'Hot');
create type property_type as enum ('house', 'villa', 'plot', 'apartment', 'commercial');
create type property_status as enum ('Draft', 'Pending', 'Verified', 'Live', 'Sold', 'Inactive');
create type visit_status as enum ('Scheduled', 'Completed', 'Cancelled');
create type followup_outcome as enum ('No Answer', 'Interested', 'Later', 'Visit Scheduled', 'Closed');

create table admins (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null unique,
  role text not null default 'Super Admin',
  created_at timestamptz not null default now()
);

create table leads (
  id uuid primary key default gen_random_uuid(),
  request_id text not null unique,
  name text not null,
  phone text not null,
  type lead_type not null,
  district text not null,
  locality text not null,
  pincode text,
  property_type property_type not null,
  budget_min numeric,
  budget_max numeric,
  source text not null default 'Website',
  status lead_status not null default 'New',
  request_status request_status not null default 'Received',
  priority lead_priority not null default 'Warm',
  notes text,
  assigned_to uuid references admins(id),
  next_followup_at timestamptz,
  archived_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table properties (
  id uuid primary key default gen_random_uuid(),
  property_id text not null unique,
  seller_lead_id uuid references leads(id) on delete set null,
  type property_type not null,
  status property_status not null default 'Draft',
  price numeric not null,
  district text not null,
  locality text not null,
  area text,
  pincode text not null,
  description text,
  bedrooms int,
  bathrooms int,
  sqft numeric,
  land_area text,
  additional_notes text,
  archived_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table property_photos (
  id uuid primary key default gen_random_uuid(),
  property_id uuid not null references properties(id) on delete cascade,
  storage_path text not null,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

create table matches (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid not null references leads(id) on delete cascade,
  property_id uuid not null references properties(id) on delete cascade,
  score int not null check (score between 0 and 100),
  status text not null default 'Saved',
  created_at timestamptz not null default now(),
  unique (lead_id, property_id)
);

create table followups (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid not null references leads(id) on delete cascade,
  due_at timestamptz not null,
  note text not null,
  outcome followup_outcome,
  completed_at timestamptz,
  created_at timestamptz not null default now()
);

create table visits (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid not null references leads(id) on delete cascade,
  property_id uuid not null references properties(id) on delete cascade,
  scheduled_at timestamptz not null,
  status visit_status not null default 'Scheduled',
  created_at timestamptz not null default now()
);

create table activities (
  id uuid primary key default gen_random_uuid(),
  action text not null,
  entity_type text not null,
  entity_id uuid,
  description text,
  created_at timestamptz not null default now()
);

create table settings (
  key text primary key,
  value jsonb not null,
  updated_at timestamptz not null default now()
);

create index leads_request_id_idx on leads(request_id);
create index leads_phone_idx on leads(phone);
create index leads_status_idx on leads(status);
create index properties_location_idx on properties(district, locality, pincode);

alter table admins enable row level security;
alter table leads enable row level security;
alter table properties enable row level security;
alter table property_photos enable row level security;
alter table matches enable row level security;
alter table followups enable row level security;
alter table visits enable row level security;
alter table activities enable row level security;
alter table settings enable row level security;

create policy "admins read own profile" on admins for select using (auth.uid() = id);
create policy "authenticated admin read leads" on leads for select using (exists (select 1 from admins where admins.id = auth.uid()));
create policy "authenticated admin read properties" on properties for select using (exists (select 1 from admins where admins.id = auth.uid()));
create policy "authenticated admin read matches" on matches for select using (exists (select 1 from admins where admins.id = auth.uid()));
create policy "authenticated admin read followups" on followups for select using (exists (select 1 from admins where admins.id = auth.uid()));
create policy "authenticated admin read visits" on visits for select using (exists (select 1 from admins where admins.id = auth.uid()));
create policy "authenticated admin read activities" on activities for select using (exists (select 1 from admins where admins.id = auth.uid()));
create policy "authenticated admin read settings" on settings for select using (exists (select 1 from admins where admins.id = auth.uid()));
create policy "authenticated admin read property_photos" on property_photos for select using (exists (select 1 from admins where admins.id = auth.uid()));
