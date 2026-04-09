-- ═══════════════════════════════════════════════════════════════════════════
-- Migration 002 — Appointments + Consent Audit + Leads fix
-- Run in Supabase SQL Editor AFTER schema.sql
-- ═══════════════════════════════════════════════════════════════════════════

-- ─── Fix scan_channel enum — remove 'exit', it is operationally unrealistic ──
-- Postgres cannot drop enum values; we constrain via policy instead.
-- New scans with channel='exit' will be rejected at the app layer (types.ts).
-- No migration needed for the enum itself — just don't insert 'exit' anymore.

-- ─── Fix leads table — replace dwell_minutes with appointment_booked ────────
alter table public.leads
  add column if not exists appointment_booked boolean default false;

-- Keep dwell_minutes for backward compat with existing rows but stop writing it
-- (scoring formula no longer uses it)
comment on column public.leads.dwell_minutes is 'DEPRECATED — use appointment_booked signal instead';

-- ─── APPOINTMENTS ─────────────────────────────────────────────────────────────
do $$ begin
  create type appointment_status as enum ('pending', 'confirmed', 'attended', 'cancelled');
exception when duplicate_object then null; end $$;

create table if not exists public.appointments (
  id             uuid primary key default uuid_generate_v4(),
  student_id     uuid not null references public.users(id) on delete cascade,
  school_id      uuid not null references public.schools(id) on delete cascade,
  event_id       uuid not null references public.events(id) on delete cascade,
  slot_time      timestamptz not null,
  slot_duration  integer not null default 15,       -- minutes
  status         appointment_status not null default 'pending',
  student_notes  text,
  created_at     timestamptz default now(),
  -- One active appointment per student per school per event
  unique nulls not distinct (student_id, school_id, event_id)
);

create index if not exists idx_appointments_student_event on public.appointments(student_id, event_id);
create index if not exists idx_appointments_school_event  on public.appointments(school_id, event_id);
create index if not exists idx_appointments_slot_time     on public.appointments(slot_time);

-- RLS
alter table public.appointments enable row level security;

create policy "Students see own appointments"
  on public.appointments for select
  using (auth.uid() = student_id);

create policy "Students insert own appointments"
  on public.appointments for insert
  with check (auth.uid() = student_id);

create policy "Students update own appointments"
  on public.appointments for update
  using (auth.uid() = student_id);

-- Exhibitors need to see appointments for their school (requires custom claims)
-- Placeholder — tighten with custom JWT claim check once exhibitor auth is wired
create policy "Exhibitors see school appointments"
  on public.appointments for select
  using (
    exists (
      select 1 from public.users
      where id = auth.uid()
        and role = 'exhibitor'
    )
  );

-- ─── CONSENT AUDIT ────────────────────────────────────────────────────────────
-- Immutable append-only log — no UPDATE/DELETE policies (GDPR Art. 7 + CNIL)
create table if not exists public.consent_audit (
  id              uuid primary key default uuid_generate_v4(),
  user_id         uuid not null references public.users(id) on delete cascade,
  action          text not null check (action in ('grant', 'revoke', 'cascade_delete')),
  consent_type    text not null,   -- 'optin_letudiant' | 'optin_commercial' | 'optin_wax' | 'data_processing'
  consent_version text not null default '1.0',
  ip_hash         text,            -- hashed for privacy (SHA-256 of IP)
  user_agent_hash text,            -- hashed
  created_at      timestamptz default now()
);

create index if not exists idx_consent_audit_user on public.consent_audit(user_id, created_at desc);

alter table public.consent_audit enable row level security;

-- Users can INSERT and SELECT their own consent records; no UPDATE or DELETE
create policy "Users insert own consent"
  on public.consent_audit for insert
  with check (auth.uid() = user_id);

create policy "Users see own consent history"
  on public.consent_audit for select
  using (auth.uid() = user_id);

-- Admins can read all (for DPO audit) — needs service_role or custom claim
-- Left intentionally open at DB level; enforce at API layer with service_role key

-- ─── INDEX ADDITIONS ─────────────────────────────────────────────────────────
-- Speeds up exhibitor lead feed (already exists in analytics_schema but safe to repeat)
create index if not exists idx_leads_school_event on public.leads(school_id, event_id, score_value desc);
create index if not exists idx_leads_appointment   on public.leads(appointment_booked) where appointment_booked = true;
